import { Link } from 'react-router-dom'

import { Badge, Button, Cluster } from '@/components/common'

function MeetingHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meeting Room</h1>
        <p className="text-sm text-muted-foreground">
          Responsive layout baseline for collaboration sessions.
        </p>
      </div>

      <Cluster>
        <Badge variant="secondary">6 Participants</Badge>
        <Badge>Connected</Badge>
        <Button variant="outline" asChild>
          <Link to="/ui-lab">Open UI Lab</Link>
        </Button>
      </Cluster>
    </header>
  )
}

export { MeetingHeader }
