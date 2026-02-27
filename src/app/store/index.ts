import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthSlice {
  token: string | null
  userEmail: string | null
  userName: string | null
  userPicture: string | null
  setCredentials: (token: string, email?: string, name?: string, picture?: string) => void
  clearCredentials: () => void
}

export const useAuthStore = create<AuthSlice>()(
  persist(
    (set) => ({
      token: null,
      userEmail: null,
      userName: null,
      userPicture: null,
      setCredentials: (token, email, name, picture) =>
        set({
          token,
          userEmail: email ?? null,
          userName: name ?? null,
          userPicture: picture ?? null,
        }),
      clearCredentials: () =>
        set({ token: null, userEmail: null, userName: null, userPicture: null }),
    }),
    { name: 'lira-auth' }
  )
)

export interface TranscriptLine {
  speaker: string
  text: string
  isFinal: boolean
  at: string
}

export type AiStatus = 'idle' | 'listening' | 'thinking' | 'speaking'

interface MeetingSlice {
  meetingId: string | null
  meetingTitle: string | null
  isConnected: boolean
  aiStatus: AiStatus
  transcript: TranscriptLine[]
  lastAiResponse: string | null
  setMeeting: (id: string, title: string) => void
  clearMeeting: () => void
  setConnected: (v: boolean) => void
  setAiStatus: (status: AiStatus) => void
  addTranscriptLine: (line: TranscriptLine) => void
  setLastAiResponse: (text: string) => void
  clearTranscript: () => void
}

export const useMeetingStore = create<MeetingSlice>()((set) => ({
  meetingId: null,
  meetingTitle: null,
  isConnected: false,
  aiStatus: 'idle',
  transcript: [],
  lastAiResponse: null,
  setMeeting: (id, title) => set({ meetingId: id, meetingTitle: title }),
  clearMeeting: () =>
    set({
      meetingId: null,
      meetingTitle: null,
      isConnected: false,
      aiStatus: 'idle',
      transcript: [],
      lastAiResponse: null,
    }),
  setConnected: (v) => set({ isConnected: v }),
  setAiStatus: (status) => set({ aiStatus: status }),
  addTranscriptLine: (line) => set((s) => ({ transcript: [...s.transcript.slice(-199), line] })),
  setLastAiResponse: (text) => set({ lastAiResponse: text }),
  clearTranscript: () => set({ transcript: [] }),
}))
