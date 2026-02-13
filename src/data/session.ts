import { auth } from "@/lib/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers })
    if (!session) {
        throw redirect({ to: "/login" })
    }
    return session
})

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers })
    if (!session) {
        throw redirect({ to: "/login" })
    }
    return {
        user: session.user
    }
})

export type UserSession = Awaited<ReturnType<typeof getUser>>
