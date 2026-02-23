import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createFileRoute } from '@tanstack/react-router'
import { trpcRouter } from '@/lib/trpc/routers'
import { createContext } from '@/lib/trpc/init'

function handler({ request }: { request: Request }) {
    return fetchRequestHandler({
        req: request,
        router: trpcRouter,
        endpoint: '/api/trpc',
        createContext: () => createContext()
    })
}

export const Route = createFileRoute('/api/trpc/$')({
    server: {
        handlers: {
            GET: handler,
            POST: handler,
        },
    },
})
