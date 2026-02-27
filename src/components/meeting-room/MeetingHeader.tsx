import { Link } from 'react-router-dom'

import { Badge, Button, Cluster } from '@/components/common'

type MeetingHeaderProps = {
  title?: string
  isConnected?: boolean
  participantCount?: number
}

function MeetingHeader({ title, isConnected, participantCount }: MeetingHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title ?? 'Meeting Room'}</h1>
        <p className="text-sm text-muted-foreground">
          {isConnected ? 'Live — connected to Lira AI' : 'Waiting for connection…'}
        </p>
      </div>

      <Cluster>
        {participantCount != null && (
          <Badge variant="secondary">{participantCount} Participants</Badge>
        )}
        <Badge variant={isConnected ? 'default' : 'outline'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
        <Button variant="outline" asChild>
          <Link to="/">Home</Link>
        </Button>
      </Cluster>
    </header>
  )
}

export { MeetingHeader, type MeetingHeaderProps }
