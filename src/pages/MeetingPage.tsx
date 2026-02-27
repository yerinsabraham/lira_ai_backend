import { Grid } from '@/components/common'
import {
  AiParticipantCard,
  MeetingControlsBar,
  MeetingHeader,
  MeetingSidebar,
  ParticipantTile,
  type ParticipantTileProps,
} from '@/components/meeting-room'

const participants: ParticipantTileProps[] = [
  {
    name: 'Alice Morgan',
    role: 'Host',
    activeSpeaker: true,
    speaking: true,
    pinned: true,
    avatarUrl: 'https://i.pravatar.cc/100?img=32',
  },
  {
    name: 'Ben Carter',
    role: 'Engineer',
    muted: true,
    handRaised: true,
    avatarUrl: 'https://i.pravatar.cc/100?img=14',
  },
  {
    name: 'Chloe Lin',
    role: 'Designer',
    cameraOff: true,
    avatarUrl: 'https://i.pravatar.cc/100?img=25',
  },
  {
    name: 'David Park',
    role: 'PM',
    activeSpeaker: true,
    avatarUrl: 'https://i.pravatar.cc/100?img=48',
  },
  {
    name: 'Emma Shaw',
    role: 'QA',
    muted: true,
    handRaised: true,
    avatarUrl: 'https://i.pravatar.cc/100?img=17',
  },
  {
    name: 'Lira AI',
    role: 'AI Participant',
    speaking: true,
  },
]

function MeetingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-4 p-3 sm:p-4 lg:p-6">
      <MeetingHeader />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Grid
          minColumnSize="14rem"
          gap="var(--space-3)"
          className="auto-rows-fr sm:auto-rows-[minmax(12rem,1fr)]"
        >
          {participants.map((participant, index) => {
            if (participant.role === 'AI Participant') {
              return (
                <AiParticipantCard
                  key={participant.name}
                  name={participant.name}
                  status={participant.speaking ? 'speaking' : 'idle'}
                />
              )
            }

            return (
              <ParticipantTile
                key={participant.name}
                {...participant}
                className={index === 0 ? 'sm:col-span-2 xl:col-span-2' : undefined}
              />
            )
          })}
        </Grid>

        <MeetingSidebar />
      </section>

      <MeetingControlsBar />
    </main>
  )
}

export { MeetingPage }
