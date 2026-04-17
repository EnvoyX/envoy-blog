import { Chat } from '@/components/ai-elements/Chat'
import { createId } from '@paralleldrive/cuid2'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_chat/chat/_chatbox/$adapter/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { adapter } = Route.useParams()
  const chatId = createId()
  return (
    <div>
      <Chat
        apiRoute={`/api/chat-${adapter}`}
        model={`${adapter}`}
        chatId={chatId}
      />
    </div>
  )
}
