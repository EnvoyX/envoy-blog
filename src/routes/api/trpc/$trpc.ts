import { createTRPCContext } from '@/server/trpc';
import { appRouter } from '@/server/trpc-root';
import { createFileRoute } from '@tanstack/react-router'
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const prerender = false


const createContext = async (req: Request) => {
    return createTRPCContext({ headers: req.headers, req });
};

export const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: () => createContext(req),
    });

export const Route = createFileRoute('/api/trpc/$trpc')({
    server: {
        handlers: {
            GET: async ({ request: req }: { request: Request }) => {
                return handler(req)
            },
            POST: async ({ request: req }: { request: Request }) => {
                return handler(req)
            },
        },
    },
})
