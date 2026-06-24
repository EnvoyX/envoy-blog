import { db } from '@/lib/db'
import { authMiddleware } from '@/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

export const getUsersFn = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    const users = await db.user.findMany()
    return users
  })

export const getAccountsFn = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    const accounts = await db.account.findMany({
      include: {
        user: true,
      },
    })

    return accounts
  })

export const getSessionsFn = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    const sessions = await db.session.findMany({
      include: {
        user: true,
      },
    })
    return sessions
  })

export const deleteAccountFn = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      accountId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.account.delete({
      where: { id: data.accountId },
    })
  })

export const deleteAccountsByManyFn = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      accountIds: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    await db.account.deleteMany({
      where: {
        id: {
          in: data.accountIds,
        },
      },
    })
  })

export const deleteSessionFn = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      sessionId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.session.delete({
      where: { id: data.sessionId },
    })
  })

export const deleteSessionsByManyFn = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      sessionIds: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    await db.session.deleteMany({
      where: {
        id: {
          in: data.sessionIds,
        },
      },
    })
  })

export const updateUserRoleFn = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string(),
      role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']),
    }),
  )
  .handler(async ({ data, context }) => {
    if (context.session.user.id === data.userId) {
      throw new Error('You cannot update your own role')
    }
    await db.user.update({
      where: { id: data.userId },
      data: {
        role: data.role,
      },
    })
  })

export const updateUserRoleByManyFn = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      userIds: z.array(z.string()),
      role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']),
    }),
  )
  .handler(async ({ data, context }) => {
    if (
      context.session.user.id ===
      data.userIds.find((userId) => userId === context.session.user.id)
    ) {
      throw new Error('You cannot update your own role')
    }
    await db.user.updateMany({
      where: {
        id: {
          in: data.userIds,
        },
      },
      data: {
        role: data.role,
      },
    })
  })

export const deleteUserFn = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string(),
      role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']),
    }),
  )
  .handler(async ({ data, context }) => {
    if (data.userId === context.session.user.id) {
      throw new Error('You cannot delete yourself')
    }
    if (data.role === 'SUPERADMIN') {
      throw new Error('You cannot delete a superadmin')
    }
    if (data.role === 'ADMIN' && context.session.user.role !== 'SUPERADMIN') {
      throw new Error('You cannot delete an admin')
    }
    await db.user.delete({
      where: { id: data.userId },
    })
    await db.account.deleteMany({
      where: { userId: data.userId },
    })
    await db.session.deleteMany({
      where: { userId: data.userId },
    })
  })

export const deleteUsersByManyFn = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      userIds: z.array(z.string()),
      roles: z.array(z.enum(['USER', 'ADMIN', 'SUPERADMIN'])),
    }),
  )
  .handler(async ({ data, context }) => {
    if (data.userIds.includes(context.session.user.id as string)) {
      throw new Error('You cannot delete yourself')
    }
    if (data.roles.includes('SUPERADMIN')) {
      throw new Error('You cannot delete a superadmin')
    }
    if (
      data.roles.includes('ADMIN') &&
      context.session.user.role !== 'SUPERADMIN'
    ) {
      throw new Error('You cannot delete an admin')
    }
    await db.user.deleteMany({
      where: {
        id: {
          in: data.userIds,
        },
      },
    })
  })
