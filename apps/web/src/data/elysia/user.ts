import { getProfileData, getUserData } from '@/data/session'
import { Elysia } from 'elysia'

export const user = new Elysia()
    .group("/user", (app) => app.get("/profile", async () => {
        const data = await getProfileData()


        return data

    }).get("/session", async () => {
        const data = await getUserData()

        return {
            session: data.session,
            user: data.user
        }
    }))
