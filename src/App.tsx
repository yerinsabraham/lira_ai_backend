import { Navigate, Route, Routes } from 'react-router-dom'

import { HomePage, MeetingPage, UiLabPage } from '@/pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/meeting" element={<MeetingPage />} />
      <Route path="/ui-lab" element={<UiLabPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
