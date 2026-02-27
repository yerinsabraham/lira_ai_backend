import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/app/store'
import { credentials } from '@/services/api'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Stack,
} from '@/components/common'

// ── Credentials setup form ────────────────────────────────────────────────────

function CredentialsForm({ onSaved }: { onSaved: () => void }) {
  const { setCredentials } = useAuthStore()
  const [token, setToken] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    if (!token.trim() || !apiKey.trim()) {
      setError('Both fields are required.')
      return
    }
    setCredentials(token.trim(), apiKey.trim())
    credentials.set(token.trim(), apiKey.trim())
    onSaved()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <Badge className="w-fit">Setup Required</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Connect to Lira AI</h1>
        <CardDescription>
          Enter your Creovine credentials to get started. You can obtain these from{' '}
          <a
            href="https://api.creovine.com/docs"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            api.creovine.com/docs
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap="var(--space-3)">
          <div className="space-y-1">
            <label htmlFor="lira-token" className="text-sm font-medium">
              JWT Token
            </label>
            <input
              id="lira-token"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
              placeholder="eyJ…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="lira-api-key" className="text-sm font-medium">
              API Key
            </label>
            <input
              id="lira-api-key"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
              placeholder="lra_…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSave} className="w-full">
            Save &amp; Continue
          </Button>
        </Stack>
      </CardContent>
    </Card>
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
    <Card className="w-full">
      <CardHeader>
        <Badge className="w-fit">Lira AI</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Ready to Meet</h1>
        <CardDescription>
          {userEmail ? `Signed in as ${userEmail}` : 'Credentials configured.'} Lira AI will join
          your meeting as an active participant powered by Amazon Nova Sonic.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/meeting')}>Start a Meeting</Button>
        <Button variant="outline" onClick={handleSignOut}>
          Change Credentials
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function HomePage() {
  const { token, apiKey } = useAuthStore()
  const isConfigured = Boolean(token && apiKey)
  const [configured, setConfigured] = useState(isConfigured)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center p-6">
      {configured ? <AuthenticatedHome /> : <CredentialsForm onSaved={() => setConfigured(true)} />}
    </main>
  )
}

export { HomePage }
