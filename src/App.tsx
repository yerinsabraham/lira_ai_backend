import { Navigate, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { HomePage, MeetingPage, UiLabPage } from '@/pages'
import { env } from '@/env'

function App() {
  return (
    <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/meeting" element={<MeetingPage />} />
        <Route path="/ui-lab" element={<UiLabPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GoogleOAuthProvider>
  )
}

export default App
