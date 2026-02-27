import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/app/store'
import { login as apiLogin, credentials } from '@/services/api'
import { LiraLogo } from '@/components/LiraLogo'
import { Button } from '@/components/common'

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const { setCredentials } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await apiLogin(email.trim(), password.trim())
      setCredentials(res.token, res.user.email)
      credentials.set(res.token)
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
          placeholder="you@creovine.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading || !email.trim() || !password.trim()}
        className="w-full rounded-xl py-2.5"
      >
        {loading ? (
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
            Signing in…
          </span>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}

// ── Authenticated home ────────────────────────────────────────────────────────

function AuthenticatedHome() {
  const navigate = useNavigate()
  const { userEmail, clearCredentials } = useAuthStore()

  function handleSignOut() {
    clearCredentials()
    credentials.clear()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
          <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9" aria-hidden="true">
            <rect x="5" y="13" width="2.5" height="6" rx="1.25" fill="white" opacity="0.65" />
            <rect x="9" y="10" width="2.5" height="12" rx="1.25" fill="white" />
            <rect x="13" y="7" width="2.5" height="18" rx="1.25" fill="white" />
            <rect x="17" y="10" width="2.5" height="12" rx="1.25" fill="white" />
            <rect x="21" y="13" width="2.5" height="6" rx="1.25" fill="white" opacity="0.65" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Ready to meet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {userEmail ? (
            <>
              Signed in as <span className="font-medium text-foreground">{userEmail}</span>
            </>
          ) : (
            'Lira AI is ready to join your meeting.'
          )}
        </p>
      </div>

      <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
        Lira joins your meeting as an active participant — transcribing, surfacing insights, and
        responding in real-time, powered by{' '}
        <span className="font-medium text-foreground">Amazon Nova Sonic</span>.
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => navigate('/meeting')}
          className="w-full rounded-xl py-2.5 font-medium"
        >
          Start a Meeting
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full rounded-xl py-2.5 text-muted-foreground"
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Stage = 'login' | 'home'

function HomePage() {
  const { token } = useAuthStore()

  const [stage, setStage] = useState<Stage>(() => (token ? 'home' : 'login'))

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-violet-50/30 p-4 dark:to-violet-950/20">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-card shadow-xl shadow-black/5">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 border-b px-8 py-8">
            <LiraLogo size="lg" />
            <p className="text-center text-sm text-muted-foreground">
              {stage === 'login'
                ? 'Sign in with your Creovine account'
                : 'AI-powered meeting participant'}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {stage === 'login' && <LoginForm onLogin={() => setStage('home')} />}
            {stage === 'home' && <AuthenticatedHome />}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Powered by{' '}
          <a
            href="https://creovine.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline-offset-2 hover:underline"
          >
            Creovine
          </a>
        </p>
      </div>
    </main>
  )
}

export { HomePage }
