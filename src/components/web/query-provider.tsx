import { env } from '@/env';
import { TRPCProvider } from '@/lib/trpc/context';
import { AppRouter } from '@/lib/trpc/routers';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchStreamLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import superjson from "superjson";


function getUrl() {
    const base = (() => {
        if (typeof window !== 'undefined') return ''
        if (env.NODE_ENV === "development") return `http://localhost:${process.env.PORT ?? 3000}`
        return `${env.VITE_BASE_URL}`

    })()
    return `${base}/api/trpc`
}

export const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchStreamLink({
            transformer: superjson,
            url: getUrl(),
        }),
    ],
})



export function getContext() {
    const queryClient = new QueryClient({
        defaultOptions: {
            dehydrate: { serializeData: superjson.serialize },
            hydrate: { deserializeData: superjson.deserialize },
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 60 * 1000,
            },
        },
    })

    const serverHelpers = createTRPCOptionsProxy({
        client: trpcClient,
        queryClient: queryClient,
    })
    return {
        queryClient,
        trpc: serverHelpers,
    }
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return getContext().queryClient;
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important, so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient) browserQueryClient = getContext().queryClient;
        return browserQueryClient;
    }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()
    return (
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
            {children}
        </TRPCProvider>
    );
}
