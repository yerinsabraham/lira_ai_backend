import { Link } from 'react-router-dom'

import { Badge, Button, Cluster } from '@/components/common'
import { LiraLogo } from '@/components/LiraLogo'

type MeetingHeaderProps = {
  title?: string
  isConnected?: boolean
  participantCount?: number
}

function MeetingHeader({ title, isConnected, participantCount }: MeetingHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <LiraLogo size="sm" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title ?? 'Meeting Room'}</h1>
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'Live — Lira AI is active' : 'Waiting for connection…'}
          </p>
        </div>
      </div>

      <Cluster>
        {participantCount != null && (
          <Badge variant="secondary">{participantCount} Participants</Badge>
        )}
        <Badge variant={isConnected ? 'default' : 'outline'}>
          {isConnected ? '● Live' : '○ Disconnected'}
        </Badge>
        <Button variant="outline" asChild size="sm">
          <Link to="/">Leave</Link>
        </Button>
      </Cluster>
    </header>
  )
}

export { MeetingHeader, type MeetingHeaderProps }
