import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Mic, MicOff, PhoneOff, Send, AudioLines } from 'lucide-react'

import { useAuthStore } from '@/app/store'
import type { AiStatus, TranscriptLine } from '@/app/store'
import { useAudioMeeting } from '@/features/meeting/use-audio-meeting'
import { LiraLogo } from '@/components/LiraLogo'
import { cn } from '@/lib'

// ── Main Page ────────────────────────────────────────────────────────────────

function MeetingPage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const meeting = useAudioMeeting()
  const [title, setTitle] = useState('')
  const [startError, setStartError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) navigate('/', { replace: true })
  }, [token, navigate])

  const isInMeeting = meeting.phase !== 'idle' && meeting.phase !== 'error'

  async function handleStart() {
    if (!title.trim()) return
    setStartError(null)
    try {
      await meeting.startMeeting(title.trim())
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Failed to start meeting')
    }
  }

  function handleLeave() {
    meeting.endMeeting()
    navigate('/')
  }

  // ── Idle: Start screen ────────────────────────────────────────────────────

  if (!isInMeeting) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col items-center gap-3 border-b border-white/10 px-8 py-8">
              <LiraLogo size="lg" />
              <p className="text-center text-sm text-slate-400">
                AI-powered voice meeting participant
              </p>
            </div>

            <div className="space-y-4 px-8 py-6">
              <div>
                <label
                  htmlFor="meeting-title"
                  className="mb-1.5 block text-sm font-medium text-slate-200"
                >
                  Meeting title
                </label>
                <input
                  id="meeting-title"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                  placeholder="e.g. Weekly sync, Product review…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>

              {(startError || meeting.error) && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {startError || meeting.error}
                </p>
              )}

              <button
                className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
                onClick={handleStart}
                disabled={meeting.phase === 'connecting' || !title.trim()}
              >
                {meeting.phase === 'connecting' ? (
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
                  'Start Voice Meeting'
                )}
              </button>

              <button
                className="w-full rounded-xl px-4 py-2 text-sm text-slate-400 transition hover:text-white"
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

  // ── Active meeting ────────────────────────────────────────────────────────

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white">
      {/* Header */}
      <ActiveMeetingHeader
        title={meeting.meetingTitle ?? title}
        isConnected={meeting.isConnected}
        onLeave={handleLeave}
      />

      {/* Body */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Participant cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <UserCard micOn={meeting.micOn} micLevel={meeting.micLevel} />
          <AiCard status={meeting.aiStatus} />
        </div>

        {/* Transcript */}
        <TranscriptPanel transcript={meeting.transcript} />

        {/* Text input fallback */}
        <TextInput onSend={meeting.sendText} disabled={!meeting.isConnected} />
      </div>

      {/* Controls */}
      <Controls
        micOn={meeting.micOn}
        isConnected={meeting.isConnected}
        onToggleMic={meeting.toggleMic}
        onLeave={handleLeave}
      />
    </main>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────

function ActiveMeetingHeader({
  title,
  isConnected,
  onLeave,
}: {
  title: string
  isConnected: boolean
  onLeave: () => void
}) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <LiraLogo size="sm" />
        <div>
          <h1 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h1>
          <p className="text-xs text-slate-400">
            {isConnected ? 'Live — Lira AI is active' : 'Connecting…'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            isConnected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isConnected ? 'bg-emerald-400' : 'bg-amber-400'
            )}
          />
          {isConnected ? 'Live' : 'Connecting'}
        </span>

        <button
          onClick={onLeave}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
        >
          Leave
        </button>
      </div>
    </header>
  )
}

// ── User Card ────────────────────────────────────────────────────────────────

function UserCard({ micOn, micLevel }: { micOn: boolean; micLevel: number }) {
  const { userEmail, userName, userPicture } = useAuthStore()
  const displayName = userName ?? userEmail?.split('@')[0] ?? 'You'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      {/* Audio level glow */}
      {micOn && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-150"
          style={{
            opacity: Math.min(micLevel * 5, 0.6),
            boxShadow: `inset 0 0 40px rgba(139, 92, 246, ${Math.min(micLevel * 3, 0.4)})`,
          }}
        />
      )}

      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        {userPicture ? (
          <img
            src={userPicture}
            alt={displayName}
            className="h-14 w-14 rounded-full ring-2 ring-violet-500/40"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-lg font-bold ring-2 ring-violet-500/40">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{displayName}</p>
          <p className="text-xs text-slate-400">You</p>
        </div>

        {/* Mic status */}
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
            micOn ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-500/20 text-slate-400'
          )}
        >
          {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
          {micOn ? 'Speaking' : 'Muted'}
        </div>
      </div>

      {/* Audio level bar */}
      {micOn && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-75"
            style={{ width: `${Math.min(micLevel * 100 * 3, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ── AI Card ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AiStatus, { label: string; color: string; glow: string }> = {
  idle: { label: 'Ready', color: 'text-slate-400', glow: '' },
  listening: { label: 'Listening', color: 'text-sky-400', glow: 'shadow-sky-500/20' },
  thinking: { label: 'Thinking…', color: 'text-amber-400', glow: 'shadow-amber-500/20' },
  speaking: { label: 'Speaking', color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
}

function AiCard({ status }: { status: AiStatus }) {
  const cfg = STATUS_CONFIG[status]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/5 via-indigo-500/5 to-cyan-500/5 p-6 backdrop-blur transition-shadow duration-300',
        cfg.glow && `shadow-lg ${cfg.glow}`
      )}
    >
      <div className="relative flex items-center gap-4">
        {/* AI Avatar */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 ring-2 ring-sky-400/40">
          <Bot className="h-7 w-7 text-white" />
          {status === 'speaking' && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
          )}
          {status === 'thinking' && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-slate-900 bg-amber-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">Lira AI</p>
          <p className="text-xs text-slate-400">AI Meeting Participant</p>
        </div>

        {/* Status pill */}
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium',
            cfg.color
          )}
        >
          <AudioLines className={cn('h-3.5 w-3.5', status === 'speaking' && 'animate-pulse')} />
          {cfg.label}
        </div>
      </div>

      {/* Animated bar for speaking */}
      {status === 'speaking' && (
        <div className="mt-4 flex gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
              style={{
                animation: `pulse 0.8s ease-in-out ${i * 0.05}s infinite alternate`,
                opacity: 0.3 + (((i * 7 + 3) % 10) / 10) * 0.7,
              }}
            />
          ))}
        </div>
      )}

      {status === 'thinking' && (
        <div className="mt-4 flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-amber-400"
              style={{ animation: `bounce 0.6s ease-in-out ${i * 0.15}s infinite alternate` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Transcript Panel ────────────────────────────────────────────────────────

function TranscriptPanel({ transcript }: { transcript: TranscriptLine[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript])

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-200">Live Transcript</h2>
        <span className="text-xs text-slate-500">{transcript.length} messages</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
        style={{ maxHeight: '40vh' }}
      >
        {transcript.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-slate-500">
            Tap the microphone to start speaking. Transcript will appear here…
          </p>
        ) : (
          transcript.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span
                className={cn(
                  'mt-0.5 inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  line.speaker === 'Lira AI' || line.speaker === 'ai' || line.speaker === 'Lira'
                    ? 'bg-sky-500/15 text-sky-400'
                    : 'bg-violet-500/15 text-violet-400'
                )}
              >
                {line.speaker === 'Lira AI' || line.speaker === 'ai' || line.speaker === 'Lira'
                  ? 'Lira AI'
                  : 'You'}
              </span>
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  line.isFinal ? 'text-slate-200' : 'text-slate-400 italic'
                )}
              >
                {line.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Text Input (fallback) ───────────────────────────────────────────────────

function TextInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState('')

  function handleSend() {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
        placeholder="Type a message (or use your mic)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        disabled={disabled}
      />
      <button
        className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Bottom Controls ─────────────────────────────────────────────────────────

function Controls({
  micOn,
  isConnected,
  onToggleMic,
  onLeave,
}: {
  micOn: boolean
  isConnected: boolean
  onToggleMic: () => void
  onLeave: () => void
}) {
  return (
    <footer className="sticky bottom-0 border-t border-white/10 bg-black/30 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-xs items-center justify-center gap-4">
        {/* Mic toggle */}
        <button
          onClick={onToggleMic}
          disabled={!isConnected}
          className={cn(
            'relative flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-200 disabled:opacity-40',
            micOn
              ? 'bg-violet-600 shadow-lg shadow-violet-500/30 hover:bg-violet-500'
              : 'bg-slate-700 hover:bg-slate-600'
          )}
          aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          {micOn && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-slate-900 bg-red-500" />
          )}
        </button>

        {/* End meeting */}
        <button
          onClick={onLeave}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500"
          aria-label="End meeting"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>

      {/* Mic hint */}
      <p className="mt-2 text-center text-xs text-slate-500">
        {micOn
          ? 'Microphone is on — speak naturally, Lira AI is listening'
          : 'Tap the mic button to start speaking'}
      </p>
    </footer>
  )
}

export { MeetingPage }
