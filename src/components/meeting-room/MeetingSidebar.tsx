import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Stack,
} from '@/components/common'
import type { TranscriptLine } from '@/app/store'

type MeetingSidebarProps = {
  transcript?: TranscriptLine[]
  summary?: string
}

function TranscriptPanel({ transcript = [] }: { transcript: TranscriptLine[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Transcript</CardTitle>
        <CardDescription>Streaming captions with speaker labels.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-52 pr-3 xl:h-80">
          {transcript.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Transcript will appear here once the meeting starts…
            </p>
          ) : (
            <Stack gap="var(--space-3)">
              {transcript.map((line, i) => (
                <p key={i} className="text-sm">
                  <Badge
                    variant={line.speaker === 'Lira AI' ? 'default' : 'outline'}
                    className="mr-2"
                  >
                    {line.speaker}
                  </Badge>
                  <span className={line.isFinal ? '' : 'opacity-60'}>{line.text}</span>
                </p>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function SummaryPanel({ summary }: { summary?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Summary</CardTitle>
        <CardDescription>AI-generated highlights update during the session.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {summary ? (
          <p>{summary}</p>
        ) : (
          <p className="italic">Summary will be generated as the meeting progresses.</p>
        )}
      </CardContent>
    </Card>
  )
}

function MeetingSidebar({ transcript = [], summary }: MeetingSidebarProps) {
  return (
    <aside className="rounded-xl border bg-background/70 p-2 backdrop-blur xl:sticky xl:top-6 xl:self-start">
      <div className="mb-2 hidden items-center justify-between rounded-lg border bg-card px-3 py-2 xl:flex">
        <p className="text-sm font-medium">Side Panel</p>
        <Badge variant="secondary">Transcript + Summary</Badge>
      </div>

      <div className="hidden gap-4 xl:grid">
        <TranscriptPanel transcript={transcript} />
        <SummaryPanel summary={summary} />
      </div>

      <Tabs defaultValue="transcript" className="xl:hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="transcript">
          <TranscriptPanel transcript={transcript} />
        </TabsContent>
        <TabsContent value="summary">
          <SummaryPanel summary={summary} />
        </TabsContent>
      </Tabs>
    </aside>
  )
}

export { MeetingSidebar, type MeetingSidebarProps }
