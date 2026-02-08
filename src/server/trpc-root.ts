import { dashboardRouter } from "./routers/dashboard";
import { createCallerFactory, router } from "./trpc";

export const appRouter = router({
    dashboard: dashboardRouter,
});

export const createCaller = createCallerFactory(appRouter);

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
