import { Elysia } from 'elysia'

import { createFileRoute } from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import { treaty } from '@elysiajs/eden'

const app = new Elysia({
    prefix: '/api'
}).get('/', 'Hello Elysia!')

const handle = ({ request }: { request: Request }) => app.fetch(request)

export const Route = createFileRoute('/api/$')({
    server: {
        handlers: {
            GET: handle,
            POST: handle
        }
    }
})

export const getTreaty = createIsomorphicFn()
    .server(() => treaty(app).api)
    .client(() => treaty<typeof app>(`${process.env.NODE_ENV === "development" ? "localhost:3000" : "envoy-mindpalace.vercel.app"}`).api)
