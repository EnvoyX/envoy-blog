import { protectedProcedure, router } from "../trpc";

export const dashboardRouter = router({
    getUserData: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user
        return user
    })
})
