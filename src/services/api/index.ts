import { env } from '@/env'

// ── Types (mirror backend lira.models.ts) ────────────────────────────────────

export interface MeetingSettings {
  personality?: 'supportive' | 'challenger' | 'facilitator' | 'technical' | 'business'
  participation_level?: number // 0.0 – 1.0
  wake_word_enabled?: boolean
  proactive_suggest?: boolean
  voice_id?: string
  language?: string
}

export interface Message {
  id: string
  speaker: string
  text: string
  timestamp: string
  is_ai: boolean
  sentiment?: string
}

export interface Meeting {
  session_id: string
  title: string
  user_id: string
  created_at: string
  updated_at: string
  status?: string
  settings: MeetingSettings
  messages: Message[]
  participants: string[]
  audio_url?: string
}

export interface MeetingSummary {
  session_id: string
  summary: string
  key_points?: string[]
  action_items?: string[]
  generated_at: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    tenantId: string
    role: string
  }
}

// ── Credentials helpers ───────────────────────────────────────────────────────

const TOKEN_KEY = 'lira_token'
const API_KEY_KEY = 'lira_api_key'

export const credentials = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getApiKey: () => localStorage.getItem(API_KEY_KEY),
  set: (token: string, apiKey: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(API_KEY_KEY, apiKey)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(API_KEY_KEY)
  },
  isConfigured: () => Boolean(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(API_KEY_KEY)),
}

// ── Fetch wrapper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = credentials.getToken()
  // API key: prefer stored value, fall back to build-time env var
  const apiKey = credentials.getApiKey() || env.VITE_API_KEY || undefined

  const res = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    let errBody: Record<string, string> = {}
    try {
      errBody = (await res.json()) as Record<string, string>
    } catch {
      // ignore
    }
    const msg = errBody['message'] ?? errBody['error'] ?? res.statusText
    throw new Error(`${res.status}: ${msg}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Platform login — does not require X-API-Key header. Returns { accessToken, user }. */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${env.VITE_API_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    let body: Record<string, string> = {}
    try {
      body = await res.json()
    } catch {
      /* ignore */
    }
    throw new Error(body['error'] ?? body['message'] ?? 'Login failed')
  }
  const data = (await res.json()) as { accessToken: string; user: LoginResponse['user'] }
  // Normalise: backend returns `accessToken`, our type uses `token`
  return { token: data.accessToken, user: data.user }
}

// ── Meetings ──────────────────────────────────────────────────────────────────

export async function createMeeting(title: string, settings?: MeetingSettings): Promise<Meeting> {
  return apiFetch<Meeting>('/lira/v1/meetings', {
    method: 'POST',
    body: JSON.stringify({ title, settings }),
  })
}

export async function listMeetings(): Promise<Meeting[]> {
  type Resp = { meetings: Meeting[] } | Meeting[]
  const data = await apiFetch<Resp>('/lira/v1/meetings')
  return Array.isArray(data) ? data : (data.meetings ?? [])
}

export async function getMeeting(id: string): Promise<Meeting> {
  return apiFetch<Meeting>(`/lira/v1/meetings/${id}`)
}

export async function getMeetingSummary(id: string): Promise<MeetingSummary> {
  return apiFetch<MeetingSummary>(`/lira/v1/meetings/${id}/summary`)
}

export async function updateMeetingSettings(
  id: string,
  settings: MeetingSettings
): Promise<Meeting> {
  return apiFetch<Meeting>(`/lira/v1/meetings/${id}/settings`, {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  })
}

export async function deleteMeeting(id: string): Promise<void> {
  return apiFetch<void>(`/lira/v1/meetings/${id}`, { method: 'DELETE' })
}

// ── WebSocket URL builder ─────────────────────────────────────────────────────

export function buildWsUrl(overrides?: { apiKey?: string; token?: string }): string {
  const apiKey = overrides?.apiKey ?? credentials.getApiKey() ?? env.VITE_API_KEY ?? ''
  const token = overrides?.token ?? credentials.getToken() ?? ''
  const url = new URL(env.VITE_WS_URL)
  url.searchParams.set('apiKey', apiKey)
  url.searchParams.set('token', token)
  return url.toString()
}
