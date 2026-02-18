// Global Middleware
import { createStart, createMiddleware } from '@tanstack/react-start'
import { authGlobalMiddleware } from './middlewares/auth'
import { getRequestHeaders } from '@tanstack/react-start/server';

export const loggingGlobalMiddleware = createMiddleware({ type: "request" }).server(({ next, request }) => {
    const url = new URL(request.url)
    const headers = getRequestHeaders();
    console.log(`[${request.method}] ${url.pathname}`)

    return next({
        context: {
            headers: headers,
            req: request,
        }
    })
})

export const startInstance = createStart(() => {
    return {
        requestMiddleware: [loggingGlobalMiddleware, authGlobalMiddleware],
    }
})
