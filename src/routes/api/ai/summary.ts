import { db } from '@/lib/db'
import { openRouter } from '@/lib/open-router'
import { authRouteMiddleware } from '@/middlewares/auth'
import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'

export const Route = createFileRoute('/api/ai/summary')({
    server: {
        middleware: [authRouteMiddleware],
        handlers: {
            POST: async ({ request, context }) => {
                const { itemId, prompt } = await request.json()
                if (!itemId || !prompt) {
                    console.log('Missing itemId or prompt')
                    return new Response('Missing itemId or prompt', { status: 400 })
                }

                const item = await db.savedItem.findUnique({
                    where: {
                        id: itemId,
                        userId: context?.user?.id
                    }
                })
                if (!item) {
                    console.log('Item not found')
                    return new Response('Item not found', { status: 404 })
                }

                const result = streamText({
                    model: openRouter.chat("z-ai/glm-4.5-air:free"),
                    system: `You are a helpful assistant that creates concise, informative summaries of web content. Your summaries should:
                    - Be 2-3 paragraphs long.
                    - Capture the main points and key takeaways.
                    - Be written in a clear, professional tone.
                    - Be engaging and easy to read.`,
                    prompt: `Please summarize the following content:\n\n${item.content}`
                })

                // Return the stream in the format useCompletion expects
                return result.toTextStreamResponse()

            }
        }
    }
})
