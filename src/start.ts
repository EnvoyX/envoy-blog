// Global Middleware
import { createStart, createMiddleware } from '@tanstack/react-start'
import { authGlobalMiddleware } from './middlewares/auth'

export const loggingGlobalMiddleware = createMiddleware({ type: "request" }).server(({ next, request }) => {
    const url = new URL(request.url)
    console.log(`[${request.method}] ${url.pathname}`)

    return next()
})

export const startInstance = createStart(() => {
    return {
        requestMiddleware: [loggingGlobalMiddleware, authGlobalMiddleware],
    }
})
