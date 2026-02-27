import { z } from 'zod'

const transcriptDeltaPayloadSchema = z.object({
  speaker: z.string().min(1),
  text: z.string(),
  isFinal: z.boolean().default(false),
  at: z.string().datetime().optional(),
})

const aiStatusPayloadSchema = z.object({
  status: z.enum(['idle', 'listening', 'thinking', 'speaking']),
  at: z.string().datetime().optional(),
})

const aiResponsePayloadSchema = z.object({
  text: z.string(),
  at: z.string().datetime().optional(),
})

const errorPayloadSchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  retryable: z.boolean().optional(),
})

const pongPayloadSchema = z.object({
  at: z.string().datetime().optional(),
})

const joinPayloadSchema = z.object({
  meetingId: z.string().min(1),
  participantId: z.string().min(1),
  role: z.enum(['human', 'ai']).default('human'),
})

const settingsUpdatePayloadSchema = z.object({
  personality: z.enum(['supportive', 'critical', 'technical', 'business']).optional(),
  responseStyle: z.enum(['concise', 'detailed']).optional(),
  interruptionPolicy: z.enum(['allow', 'prevent']).optional(),
})

const pingPayloadSchema = z.object({
  at: z.string().datetime().optional(),
})

const audioChunkMetaPayloadSchema = z.object({
  chunkId: z.string().min(1),
  durationMs: z.number().int().positive(),
  codec: z.string().optional(),
  sampleRate: z.number().int().positive().optional(),
})

const inboundEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('transcript_delta'), payload: transcriptDeltaPayloadSchema }),
  z.object({ type: z.literal('ai_status'), payload: aiStatusPayloadSchema }),
  z.object({ type: z.literal('ai_response'), payload: aiResponsePayloadSchema }),
  z.object({ type: z.literal('error'), payload: errorPayloadSchema }),
  z.object({ type: z.literal('pong'), payload: pongPayloadSchema }),
])

const outboundEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('join'), payload: joinPayloadSchema }),
  z.object({ type: z.literal('settings_update'), payload: settingsUpdatePayloadSchema }),
  z.object({ type: z.literal('ping'), payload: pingPayloadSchema }),
  z.object({ type: z.literal('audio_chunk_meta'), payload: audioChunkMetaPayloadSchema }),
])

type InboundEvent = z.infer<typeof inboundEventSchema>
type OutboundEvent = z.infer<typeof outboundEventSchema>

export { inboundEventSchema, outboundEventSchema, type InboundEvent, type OutboundEvent }
