import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/app/store'
import { useMeeting } from '@/features/meeting'
import { Grid } from '@/components/common'
import { LiraLogo } from '@/components/LiraLogo'
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
  const { token } = useAuthStore()
  const { meetingId, meetingTitle, isConnected, aiStatus, transcript, startMeeting, endMeeting } =
    useMeeting()

  const [phase, setPhase] = useState<'idle' | 'starting' | 'active'>(() =>
    meetingId ? 'active' : 'idle'
  )
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Redirect if no credentials
  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true })
    }
  }, [token, navigate])

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
      <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-violet-50/30 p-4 dark:to-violet-950/20">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border bg-card shadow-xl shadow-black/5">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 border-b px-8 py-8">
              <LiraLogo size="lg" />
              <p className="text-center text-sm text-muted-foreground">
                AI-powered meeting participant
              </p>
            </div>

            {/* Body */}
            <div className="space-y-4 px-8 py-6">
              <div>
                <label
                  htmlFor="meeting-title"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Meeting title
                </label>
                <input
                  id="meeting-title"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
                  placeholder="e.g. Weekly sync, Product review…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  disabled={phase === 'starting'}
                />
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                onClick={handleStart}
                disabled={phase === 'starting' || !title.trim()}
              >
                {phase === 'starting' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Connecting…
                  </span>
                ) : (
                  'Start Meeting'
                )}
              </button>

              <button
                className="w-full rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                onClick={() => navigate('/')}
              >
                ← Back
              </button>
            </div>
          </div>
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
