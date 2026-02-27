import { useCallback, useEffect, useRef } from 'react'

import { buildWsUrl, createMeeting as apiCreateMeeting } from '@/services/api'
import type { MeetingSettings } from '@/services/api'
import { useAuthStore, useMeetingStore } from '@/app/store'
import { createTypedWebSocketClient } from '@/services/websocket'
import type { TypedWebSocketClient } from '@/services/websocket'

/**
 * useMeeting — manages the full lifecycle of a Lira meeting:
 *  1. Creates a meeting via REST
 *  2. Opens a typed WebSocket connection
 *  3. Sends the `join` event
 *  4. Streams transcript + AI status into the Zustand store
 */
export function useMeeting() {
  const { token } = useAuthStore()
  const store = useMeetingStore()
  const clientRef = useRef<TypedWebSocketClient | null>(null)

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      clientRef.current?.disconnect()
    }
  }, [])

  const startMeeting = useCallback(
    async (title: string, settings?: MeetingSettings) => {
      if (!token) {
        throw new Error('Missing credentials. Please sign in first.')
      }

      // 1. Create meeting via REST
      const meeting = await apiCreateMeeting(title, settings)
      store.setMeeting(meeting.session_id, meeting.title)
      store.clearTranscript()

      // 2. Build WS URL with credentials
      const wsUrl = buildWsUrl({ token })

      // 3. Create typed WS client
      const client = createTypedWebSocketClient({ url: wsUrl })
      clientRef.current = client

      // 4. Wire up event handlers
      client.onStateChange(({ current }) => {
        store.setConnected(current === 'open')
      })

      client.onTranscriptDelta((payload) => {
        store.addTranscriptLine({
          speaker: payload.speaker,
          text: payload.text,
          isFinal: payload.isFinal,
          at: payload.at ?? new Date().toISOString(),
        })
      })

      client.onAiStatus((payload) => {
        store.setAiStatus(payload.status)
      })

      client.onAiResponse((payload) => {
        store.setLastAiResponse(payload.text)
      })

      client.onInboundError((payload) => {
        console.error('[Lira WS error]', payload.message)
      })

      // 5. Connect and join
      client.connect()

      // Wait for open, then send join
      const unsub = client.onStateChange(({ current }) => {
        if (current === 'open') {
          unsub()
          client.sendJoin({
            meetingId: meeting.session_id,
            participantId: crypto.randomUUID(),
            role: 'human',
          })
        }
      })

      return meeting
    },
    [token, store]
  )

  const endMeeting = useCallback(() => {
    clientRef.current?.disconnect()
    clientRef.current = null
    store.clearMeeting()
  }, [store])

  const sendSettings = useCallback((settings: MeetingSettings) => {
    if (!clientRef.current) return
    // Map API personality to WS personality (subset)
    const personality = (settings.personality ?? 'supportive') as
      | 'supportive'
      | 'critical'
      | 'technical'
      | 'business'
    clientRef.current.sendSettingsUpdate({ personality })
  }, [])

  return {
    ...useMeetingStore(),
    startMeeting,
    endMeeting,
    sendSettings,
    isReady: Boolean(token),
  }
}

export type { MeetingSettings }
