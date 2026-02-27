import {
  inboundEventSchema,
  outboundEventSchema,
  type InboundEvent,
  type OutboundEvent,
} from '@/types/events'

type ConnectionState = 'connecting' | 'open' | 'retrying' | 'closed'

type StateChange = {
  previous: ConnectionState
  current: ConnectionState
  reason?: string
}

type BackoffOptions = {
  baseDelayMs: number
  maxDelayMs: number
  factor: number
  jitterRatio: number
  maxRetries: number
}

type HeartbeatOptions = {
  enabled: boolean
  pingIntervalMs: number
  pongTimeoutMs: number
}

type WebSocketClientOptions = {
  url: string
  protocols?: string | string[]
  autoReconnect?: boolean
  maxQueueSize?: number
  backoff?: Partial<BackoffOptions>
  heartbeat?: Partial<HeartbeatOptions>
  webSocketFactory?: (url: string, protocols?: string | string[]) => WebSocket
  logger?: Pick<Console, 'info' | 'warn' | 'error'>
}

type Unsubscribe = () => void
type OutboundPayload<TType extends OutboundEvent['type']> = Extract<
  OutboundEvent,
  { type: TType }
>['payload']
type InboundPayload<TType extends InboundEvent['type']> = Extract<
  InboundEvent,
  { type: TType }
>['payload']

const DEFAULT_BACKOFF: BackoffOptions = {
  baseDelayMs: 500,
  maxDelayMs: 10_000,
  factor: 2,
  jitterRatio: 0.2,
  maxRetries: Infinity,
}

const DEFAULT_HEARTBEAT: HeartbeatOptions = {
  enabled: true,
  pingIntervalMs: 15_000,
  pongTimeoutMs: 8_000,
}

const CLOSE_CODE_STALE_CONNECTION = 4001
const DEFAULT_MAX_QUEUE_SIZE = 100

class TypedWebSocketClient {
  private socket: WebSocket | null = null
  private state: ConnectionState = 'closed'
  private manualClose = false
  private reconnectAttempts = 0
  private reconnectTimerId: number | undefined
  private pingIntervalId: number | undefined
  private pongTimeoutId: number | undefined
  private readonly queuedEvents: OutboundEvent[] = []
  private readonly eventHandlers = new Set<(event: InboundEvent) => void>()
  private readonly stateHandlers = new Set<(change: StateChange) => void>()
  private readonly errorHandlers = new Set<(error: unknown) => void>()
  private readonly options: Required<
    Pick<WebSocketClientOptions, 'url' | 'autoReconnect' | 'maxQueueSize' | 'logger'>
  > &
    Omit<WebSocketClientOptions, 'url' | 'autoReconnect' | 'maxQueueSize' | 'logger'> & {
      backoff: BackoffOptions
      heartbeat: HeartbeatOptions
    }

  constructor(options: WebSocketClientOptions) {
    if (!options.url || options.url.trim().length === 0) {
      throw new Error('WebSocket URL is required')
    }

    this.options = {
      ...options,
      url: options.url,
      autoReconnect: options.autoReconnect ?? true,
      maxQueueSize: options.maxQueueSize ?? DEFAULT_MAX_QUEUE_SIZE,
      logger: options.logger ?? console,
      backoff: {
        ...DEFAULT_BACKOFF,
        ...options.backoff,
      },
      heartbeat: {
        ...DEFAULT_HEARTBEAT,
        ...options.heartbeat,
      },
    }
  }

  getState(): ConnectionState {
    return this.state
  }

  connect(): void {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      return
    }

    this.manualClose = false
    this.transitionState('connecting')
    this.openSocket()
  }

  disconnect(code = 1000, reason = 'client_disconnect'): void {
    this.manualClose = true
    this.clearReconnectTimer()
    this.stopHeartbeat()

    if (this.socket) {
      this.socket.close(code, reason)
      this.socket = null
    }

    this.transitionState('closed', reason)
  }

  send(event: OutboundEvent): boolean {
    const parsed = outboundEventSchema.safeParse(event)
    if (!parsed.success) {
      this.options.logger.warn('Dropped invalid outbound WebSocket event', parsed.error.flatten())
      return false
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendRaw(parsed.data)
      return true
    }

    this.enqueueEvent(parsed.data)
    return true
  }

  sendJoin(payload: OutboundPayload<'join'>): boolean {
    return this.send({
      type: 'join',
      payload,
    })
  }

  sendAudioChunkMeta(payload: OutboundPayload<'audio_chunk_meta'>): boolean {
    return this.send({
      type: 'audio_chunk_meta',
      payload,
    })
  }

  sendSettingsUpdate(payload: OutboundPayload<'settings_update'>): boolean {
    return this.send({
      type: 'settings_update',
      payload,
    })
  }

  onEvent(handler: (event: InboundEvent) => void): Unsubscribe {
    this.eventHandlers.add(handler)
    return () => {
      this.eventHandlers.delete(handler)
    }
  }

  onStateChange(handler: (change: StateChange) => void): Unsubscribe {
    this.stateHandlers.add(handler)
    return () => {
      this.stateHandlers.delete(handler)
    }
  }

  onError(handler: (error: unknown) => void): Unsubscribe {
    this.errorHandlers.add(handler)
    return () => {
      this.errorHandlers.delete(handler)
    }
  }

  onTranscriptDelta(handler: (payload: InboundPayload<'transcript_delta'>) => void): Unsubscribe {
    return this.onEvent((event) => {
      if (event.type === 'transcript_delta') {
        handler(event.payload)
      }
    })
  }

  onAiStatus(handler: (payload: InboundPayload<'ai_status'>) => void): Unsubscribe {
    return this.onEvent((event) => {
      if (event.type === 'ai_status') {
        handler(event.payload)
      }
    })
  }

  onAiResponse(handler: (payload: InboundPayload<'ai_response'>) => void): Unsubscribe {
    return this.onEvent((event) => {
      if (event.type === 'ai_response') {
        handler(event.payload)
      }
    })
  }

  onInboundError(handler: (payload: InboundPayload<'error'>) => void): Unsubscribe {
    return this.onEvent((event) => {
      if (event.type === 'error') {
        handler(event.payload)
      }
    })
  }

  private openSocket(): void {
    const socket = this.options.webSocketFactory
      ? this.options.webSocketFactory(this.options.url, this.options.protocols)
      : new WebSocket(this.options.url, this.options.protocols)

    this.socket = socket

    socket.onopen = () => {
      if (socket !== this.socket) {
        return
      }

      this.reconnectAttempts = 0
      this.transitionState('open')
      this.flushQueue()
      this.startHeartbeat()
    }

    socket.onmessage = (messageEvent) => {
      if (socket !== this.socket) {
        return
      }

      void this.handleIncomingData(messageEvent.data)
    }

    socket.onerror = (errorEvent) => {
      this.options.logger.error('WebSocket error', errorEvent)
      this.emitError(errorEvent)
    }

    socket.onclose = (closeEvent) => {
      if (socket !== this.socket) {
        return
      }

      this.socket = null
      this.stopHeartbeat()

      if (this.manualClose) {
        this.transitionState('closed', `manual_close:${closeEvent.code}`)
        return
      }

      if (!this.options.autoReconnect) {
        this.transitionState('closed', `socket_closed:${closeEvent.code}`)
        return
      }

      this.scheduleReconnect(closeEvent.code)
    }
  }

  private async handleIncomingData(data: unknown): Promise<void> {
    if (typeof data === 'string') {
      this.processIncomingJson(data)
      return
    }

    if (data instanceof Blob) {
      try {
        const text = await data.text()
        this.processIncomingJson(text)
      } catch (error) {
        this.options.logger.warn('Failed to decode WebSocket Blob message', error)
        this.emitError(error)
      }
      return
    }

    this.options.logger.warn('Unsupported WebSocket payload type', { type: typeof data })
  }

  private processIncomingJson(rawJson: string): void {
    let unknownPayload: unknown
    try {
      unknownPayload = JSON.parse(rawJson)
    } catch (error) {
      this.options.logger.warn('Dropped non-JSON WebSocket message', { rawJson })
      this.emitError(error)
      return
    }

    const parsed = inboundEventSchema.safeParse(unknownPayload)
    if (!parsed.success) {
      this.options.logger.warn('Dropped invalid inbound WebSocket event', parsed.error.flatten())
      return
    }

    if (parsed.data.type === 'pong') {
      this.onPong()
    }

    for (const handler of this.eventHandlers) {
      handler(parsed.data)
    }
  }

  private sendRaw(event: OutboundEvent): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.enqueueEvent(event)
      return
    }

    this.socket.send(JSON.stringify(event))

    if (event.type === 'ping') {
      this.armPongTimeout()
    }
  }

  private enqueueEvent(event: OutboundEvent): void {
    if (this.queuedEvents.length >= this.options.maxQueueSize) {
      this.queuedEvents.shift()
    }

    this.queuedEvents.push(event)
  }

  private flushQueue(): void {
    while (this.queuedEvents.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const nextEvent = this.queuedEvents.shift()
      if (!nextEvent) {
        return
      }

      this.sendRaw(nextEvent)
    }
  }

  private startHeartbeat(): void {
    if (!this.options.heartbeat.enabled) {
      return
    }

    this.stopHeartbeat()

    this.pingIntervalId = window.setInterval(() => {
      const sent = this.send({
        type: 'ping',
        payload: {
          at: new Date().toISOString(),
        },
      })

      if (!sent) {
        this.options.logger.warn('Heartbeat ping was not sent')
      }
    }, this.options.heartbeat.pingIntervalMs)
  }

  private stopHeartbeat(): void {
    if (this.pingIntervalId !== undefined) {
      window.clearInterval(this.pingIntervalId)
      this.pingIntervalId = undefined
    }

    if (this.pongTimeoutId !== undefined) {
      window.clearTimeout(this.pongTimeoutId)
      this.pongTimeoutId = undefined
    }
  }

  private armPongTimeout(): void {
    if (this.pongTimeoutId !== undefined) {
      window.clearTimeout(this.pongTimeoutId)
    }

    this.pongTimeoutId = window.setTimeout(() => {
      if (this.socket?.readyState !== WebSocket.OPEN) {
        return
      }

      this.options.logger.warn('Pong timeout reached, closing stale connection')
      this.socket.close(CLOSE_CODE_STALE_CONNECTION, 'stale_connection')
    }, this.options.heartbeat.pongTimeoutMs)
  }

  private onPong(): void {
    if (this.pongTimeoutId !== undefined) {
      window.clearTimeout(this.pongTimeoutId)
      this.pongTimeoutId = undefined
    }
  }

  private scheduleReconnect(closeCode: number): void {
    this.reconnectAttempts += 1

    if (this.reconnectAttempts > this.options.backoff.maxRetries) {
      this.transitionState('closed', `max_retries_exceeded:${closeCode}`)
      return
    }

    const delayMs = this.computeReconnectDelay(this.reconnectAttempts)
    this.transitionState('retrying', `attempt:${this.reconnectAttempts}`)
    this.options.logger.info('Scheduling WebSocket reconnect', {
      attempt: this.reconnectAttempts,
      closeCode,
      delayMs,
    })

    this.clearReconnectTimer()
    this.reconnectTimerId = window.setTimeout(() => {
      if (this.manualClose) {
        return
      }

      this.transitionState('connecting', `retry_attempt:${this.reconnectAttempts}`)
      this.openSocket()
    }, delayMs)
  }

  private computeReconnectDelay(attempt: number): number {
    const { baseDelayMs, maxDelayMs, factor, jitterRatio } = this.options.backoff
    const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * factor ** (attempt - 1))
    const jitterWindow = exponentialDelay * jitterRatio
    const jitterOffset = (Math.random() * 2 - 1) * jitterWindow

    return Math.max(0, Math.floor(exponentialDelay + jitterOffset))
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimerId !== undefined) {
      window.clearTimeout(this.reconnectTimerId)
      this.reconnectTimerId = undefined
    }
  }

  private transitionState(next: ConnectionState, reason?: string): void {
    const previous = this.state
    this.state = next

    for (const handler of this.stateHandlers) {
      handler({ previous, current: next, reason })
    }
  }

  private emitError(error: unknown): void {
    for (const handler of this.errorHandlers) {
      handler(error)
    }
  }
}

function createTypedWebSocketClient(
  options?: Partial<WebSocketClientOptions>
): TypedWebSocketClient {
  const envUrl = import.meta.env.VITE_WS_URL
  const url = options?.url ?? envUrl

  if (!url) {
    throw new Error('WebSocket URL is missing. Set VITE_WS_URL or pass options.url')
  }

  return new TypedWebSocketClient({
    ...options,
    url,
  })
}

export {
  TypedWebSocketClient,
  createTypedWebSocketClient,
  type BackoffOptions,
  type ConnectionState,
  type HeartbeatOptions,
  type StateChange,
  type Unsubscribe,
  type WebSocketClientOptions,
}
