import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
    const queryClient = new QueryClient()
    const router = createRouter({
        routeTree,
        // optionally expose the QueryClient via router context
        context: { queryClient },
        scrollRestoration: true,
        defaultPreload: 'intent',
        defaultPreloadStaleTime: 0,
    })
    setupRouterSsrQueryIntegration({
        router,
        queryClient,
        // optional:
        // handleRedirects: true,
        // wrapQueryClient: true,
    })

    return router
}
