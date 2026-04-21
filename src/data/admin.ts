import { db } from "@/lib/db";
import { authMiddleware } from "@/middlewares/auth";
import { createServerFn } from "@tanstack/react-start";

export const getUsersFn = createServerFn().middleware([authMiddleware]).handler(async () => {
    const users = await db.user.findMany();
    return users;
})

export const getAccountsFn = createServerFn().middleware([authMiddleware]).handler(async () => {
    const accounts = await db.account.findMany({
        include: {
            user: true,
        },
    })

    return accounts;
})

export const getSessionsFn = createServerFn().middleware([authMiddleware]).handler(async () => {
    const sessions = await db.session.findMany({
        include: {
            user: true,
        },
    });
    return sessions;
})
