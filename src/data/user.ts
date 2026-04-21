import { db } from '@/lib/db'
import { authMiddleware } from '@/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

export const getPublicProfileFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const profile = await db.user.findUnique({
      where: { id: data.userId },
      include: {
        posts: {
          where: { published: true },
          include: { _count: { select: { likes: true, comments: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    return profile
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      name: z.string().min(2),
      biodata: z.string().optional().nullable(),
      image: z.url().optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context.user.defaultImage) {
      const updatedUser = await db.user.update({
        where: { id: data.id },
        data: {
          name: data.name,
          image: data.image,
          biodata: data.biodata,
          defaultImage: context.user.image,
        },
      })
      return updatedUser
    }

    const updatedUser = await db.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        image: data.image,
        biodata: data.biodata,
      },
    })
    return updatedUser
  })
