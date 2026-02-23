
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from './init';
const userRouter = {
    getUserData: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db.user.findUnique({
            where: {
                id: ctx.user.id
            },
            include: {
                accounts: true,
                sessions: true
            }

        })
        return user
    })
};
export const trpcRouter = createTRPCRouter({
    user: userRouter,
});


export type AppRouter = typeof trpcRouter;
