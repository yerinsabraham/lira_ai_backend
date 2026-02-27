import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Cluster,
  EmptyState,
  ErrorState,
  Grid,
  HoverTooltip,
  LoadingState,
  Modal,
  Stack,
} from '@/components/common'

function UiLabPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">UI Lab</h1>
          <p className="text-sm text-muted-foreground">
            Storybook-like internal showcase for base components and reusable UI patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/meeting">Open Meeting Layout</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Back Home</Link>
          </Button>
        </div>
      </header>

      <Grid minColumnSize="18rem" gap="var(--space-6)">
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Default, outline, and destructive button variants.</CardDescription>
          </CardHeader>
          <CardContent>
            <Cluster>
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
            </Cluster>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status and label indicators.</CardDescription>
          </CardHeader>
          <CardContent>
            <Cluster>
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="outline">Outline</Badge>
            </Cluster>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Participant avatar with image and fallback initials.</CardDescription>
          </CardHeader>
          <CardContent>
            <Cluster>
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/100?img=12" alt="User avatar" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Cluster>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tooltip</CardTitle>
            <CardDescription>Inline helper copy for dense UI controls.</CardDescription>
          </CardHeader>
          <CardContent>
            <HoverTooltip content="Invites participants to the current meeting">
              <Button variant="outline">Invite</Button>
            </HoverTooltip>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>
              Re-usable modal wrapper for dialogs and confirmations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Modal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              trigger={<Button>Open Modal</Button>}
              title="Change AI Style"
              description="Apply a personality profile for the current meeting."
              footer={
                <>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>Apply</Button>
                </>
              }
            >
              <Stack gap="var(--space-3)">
                <p className="text-sm text-muted-foreground">
                  This modal demonstrates a standard structure with header, content, and footer.
                </p>
              </Stack>
            </Modal>
          </CardContent>
        </Card>
      </Grid>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">UI States</h2>
        <Grid minColumnSize="20rem" gap="var(--space-4)">
          <LoadingState description="Fetching participant roster and current meeting metadata." />
          <EmptyState
            title="No Transcript Yet"
            description="Transcript items will appear here once participants begin speaking."
            action={<Button size="sm">Refresh</Button>}
          />
          <ErrorState
            description="Unable to connect to the transcript stream."
            onRetry={() => undefined}
          />
        </Grid>
      </section>
    </main>
  )
}

export { UiLabPage }
