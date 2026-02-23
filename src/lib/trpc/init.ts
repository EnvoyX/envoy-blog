import { getSession } from "@/data/session";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "../db";

export const createContext = async () => {
    const data = await getSession()

    return {
        session: data.session,
        user: data?.user,
        db
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create({
    transformer: superjson,
});
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.user || !ctx.session) {
        throw new TRPCError({
            message: "Unauthorized to access this resource",
            code: "UNAUTHORIZED",
        });
    }
    return next({
        ctx: {
            session: ctx.session,
            user: ctx.user,
        },
    });
});
