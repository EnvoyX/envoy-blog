import { createId } from '@paralleldrive/cuid2';
import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import z from 'zod';

import { Chat } from '@/components/ai-elements/Chat';
import { MODEL_CONFIG } from '@/lib/constants';

export const Route = createFileRoute('/_chat/chat/_chatbox/$adapter/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      model: z.string().optional(),
    }),
  ),
  head: ({ params }) => ({
    meta: [
      {
        title: `Chat | ${params.adapter.charAt(0).toUpperCase() + params.adapter.slice(1)} | Envoy Mindpalace`,
      },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      {
        property: 'og:title',
        content: `Chat | ${params.adapter.charAt(0).toUpperCase() + params.adapter.slice(1)} | Envoy Mindpalace`,
      },
      {
        property: 'og:description',
        content: 'Create your own blog and write your thoughts!',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function RouteComponent() {
  const { adapter } = Route.useParams();
  const { model } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const chatId = createId();
  return (
    <div>
      <Chat
        apiRoute={`/api/chat`}
        providerAdapter={`${adapter as keyof typeof MODEL_CONFIG}`} // provider e.g gemini, openrouter, groq
        chatId={chatId}
        selectedModel={model}
        navigate={navigate}
      />
    </div>
  );
}
