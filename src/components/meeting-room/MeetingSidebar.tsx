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

function TranscriptPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Transcript</CardTitle>
        <CardDescription>Streaming captions with speaker labels.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-52 pr-3 xl:h-80">
          <Stack gap="var(--space-3)">
            <p className="text-sm">
              <Badge variant="outline" className="mr-2">
                Alice
              </Badge>
              We should finalize the mobile layout for the controls before QA.
            </p>
            <p className="text-sm">
              <Badge variant="outline" className="mr-2">
                AI
              </Badge>
              I can generate a compact tablet-specific layout proposal.
            </p>
            <p className="text-sm">
              <Badge variant="outline" className="mr-2">
                Ben
              </Badge>
              Let&apos;s lock desktop breakpoints at 1280 and above.
            </p>
          </Stack>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function SummaryPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Summary</CardTitle>
        <CardDescription>AI-generated highlights update during the session.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>- Responsive layout baseline is complete for mobile/tablet/desktop.</p>
        <p>
          - UI Lab route is available at <code>/ui-lab</code> for reusable patterns.
        </p>
        <p>- Next step: connect real media streams and speaking indicators.</p>
      </CardContent>
    </Card>
  )
}

function MeetingSidebar() {
  return (
    <aside className="rounded-xl border bg-background/70 p-2 backdrop-blur xl:sticky xl:top-6 xl:self-start">
      <div className="mb-2 hidden items-center justify-between rounded-lg border bg-card px-3 py-2 xl:flex">
        <p className="text-sm font-medium">Side Panel</p>
        <Badge variant="secondary">Transcript + Summary</Badge>
      </div>

      <div className="hidden gap-4 xl:grid">
        <TranscriptPanel />
        <SummaryPanel />
      </div>

      <Tabs defaultValue="transcript" className="xl:hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="transcript">
          <TranscriptPanel />
        </TabsContent>
        <TabsContent value="summary">
          <SummaryPanel />
        </TabsContent>
      </Tabs>
    </aside>
  )
}

export { MeetingSidebar }
