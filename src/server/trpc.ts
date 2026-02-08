import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { initTRPC, TRPCError } from '@trpc/server';


export async function createTRPCContext(opts: {
    headers: Headers;
    req: Request;
}) {
    const session = await auth.api.getSession({
        headers: opts.headers,
    });

    return {
        session,
        db,
        ...opts,
    };
}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createTRPCContext>().create();
export const createCallerFactory = t.createCallerFactory;

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({
            message: "Unauthorized to access this resource",
            code: "UNAUTHORIZED",
        });
    }
    return next({
        ctx: {
            session: { ...ctx.session, user: ctx.session.user },
        },
    });
});
