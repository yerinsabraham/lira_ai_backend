import { Hand, MessageSquare, Mic, PhoneOff, ScreenShare, Video } from 'lucide-react'

import { Button, Cluster } from '@/components/common'

function MeetingControlsBar() {
  return (
    <footer className="sticky bottom-3 z-20">
      <div className="mx-auto w-fit rounded-2xl border bg-background/95 p-2 shadow-lg backdrop-blur">
        <Cluster gap="var(--space-2)" wrap={false}>
          <Button variant="secondary" size="icon" aria-label="Toggle microphone">
            <Mic />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Toggle camera">
            <Video />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Share screen">
            <ScreenShare />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Open chat">
            <MessageSquare />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Raise hand">
            <Hand />
          </Button>
          <Button variant="destructive" size="icon" aria-label="Leave meeting">
            <PhoneOff />
          </Button>
        </Cluster>
      </div>
    </footer>
  )
}

export { MeetingControlsBar }
