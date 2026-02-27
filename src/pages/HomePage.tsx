import { Link } from 'react-router-dom'

import { Badge, Button, Card, CardContent, CardDescription, CardHeader } from '@/components/common'

function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <Badge className="w-fit">Lira Frontend</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Frontend Workspace</h1>
          <CardDescription>
            Core foundations are set up. Open the component showcase to explore reusable UI
            primitives and state patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/meeting">Open Meeting Layout</Link>
          </Button>
          <Button asChild>
            <Link to="/ui-lab">Open UI Lab</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

export { HomePage }
