import { Chat } from '@/components/ai-elements/Chat'
import { createId } from '@paralleldrive/cuid2'
import { createFileRoute } from '@tanstack/react-router'
import { MODEL_CONFIG } from '@/lib/constants'
import z from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'

export const Route = createFileRoute('/_chat/chat/_chatbox/$adapter/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      model: z.string().optional(),
    }),
  ),
})

function RouteComponent() {
  const { adapter } = Route.useParams()
  const { model } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const chatId = createId()
  return (
    <div>
      <Chat
        apiRoute={`/api/chat-${adapter}`}
        model={`${adapter as keyof typeof MODEL_CONFIG}`}
        chatId={chatId}
        selectedModel={model}
        navigate={navigate}
      />
    </div>
  )
}
