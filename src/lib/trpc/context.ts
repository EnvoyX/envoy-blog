import { createTRPCContext } from "@trpc/tanstack-react-query";
import { AppRouter } from "./routers";
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
