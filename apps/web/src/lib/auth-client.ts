import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import { auth } from "./auth";
import { env } from "../env"

export const authClient = createAuthClient({
    baseURL: env.VITE_BASE_URL,
    plugins: [customSessionClient<typeof auth>()],
});
