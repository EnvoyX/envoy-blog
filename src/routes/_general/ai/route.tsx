import { Chat } from '@/components/ai-elements/Chat'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_general/ai')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Chat />
    </div>
  )
}
