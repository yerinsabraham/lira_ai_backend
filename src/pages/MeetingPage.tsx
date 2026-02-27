import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/app/store'
import { useMeeting } from '@/features/meeting'
import { Grid } from '@/components/common'
import {
  AiParticipantCard,
  MeetingControlsBar,
  MeetingHeader,
  MeetingSidebar,
  ParticipantTile,
  type ParticipantTileProps,
} from '@/components/meeting-room'

const STATIC_PARTICIPANTS: ParticipantTileProps[] = [
  {
    name: 'You',
    role: 'Host',
    activeSpeaker: false,
    pinned: true,
  },
]

function MeetingPage() {
  const navigate = useNavigate()
  const { token, apiKey } = useAuthStore()
  const { meetingId, meetingTitle, isConnected, aiStatus, transcript, startMeeting, endMeeting } =
    useMeeting()

  const [phase, setPhase] = useState<'idle' | 'starting' | 'active'>(() =>
    meetingId ? 'active' : 'idle'
  )
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Redirect if no credentials
  useEffect(() => {
    if (!token || !apiKey) {
      navigate('/', { replace: true })
    }
  }, [token, apiKey, navigate])

  async function handleStart() {
    if (!title.trim()) return
    setPhase('starting')
    setError(null)
    try {
      await startMeeting(title.trim())
      setPhase('active')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start meeting')
      setPhase('idle')
    }
  }

  function handleLeave() {
    endMeeting()
    navigate('/')
  }

  // ── Idle: show start screen ───────────────────────────────────────────────
  if (phase !== 'active') {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center p-6">
        <div className="w-full space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Start a Meeting</h1>
          <p className="text-sm text-muted-foreground">
            Lira AI will join as an active participant and provide real-time insights.
          </p>
          <input
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Meeting title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            disabled={phase === 'starting'}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            onClick={handleStart}
            disabled={phase === 'starting' || !title.trim()}
          >
            {phase === 'starting' ? 'Connecting…' : 'Start Meeting'}
          </button>
        </div>
      </main>
    )
  }

  // ── Active: full meeting room ─────────────────────────────────────────────
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-4 p-3 sm:p-4 lg:p-6">
      <MeetingHeader
        title={meetingTitle ?? title}
        isConnected={isConnected}
        participantCount={STATIC_PARTICIPANTS.length + 1}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Grid
          minColumnSize="14rem"
          gap="var(--space-3)"
          className="auto-rows-fr sm:auto-rows-[minmax(12rem,1fr)]"
        >
          {STATIC_PARTICIPANTS.map((participant, index) => (
            <ParticipantTile
              key={participant.name}
              {...participant}
              className={index === 0 ? 'sm:col-span-2 xl:col-span-2' : undefined}
            />
          ))}

          <AiParticipantCard name="Lira AI" status={aiStatus} />
        </Grid>

        <MeetingSidebar transcript={transcript} />
      </section>

      <MeetingControlsBar onLeave={handleLeave} isConnected={isConnected} />
    </main>
  )
}

export { MeetingPage }
