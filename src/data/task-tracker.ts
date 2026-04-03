import { db } from '@/lib/db'
import { authMiddleware } from '@/middlewares/auth'
import { taskListSchema, updateTaskListSchema } from '@/schemas/task-tracker'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

export const createTaskListFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(taskListSchema)
  .handler(async ({ data, context }) => {
    await db.taskList.create({
      data: {
        userId: context.user.id,
        title: data.title,
        description: data.description,
      },
    })
  })

export const updateTaskListFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateTaskListSchema)
  .handler(async ({ data, context }) => {
    await db.taskList.update({
      where: {
        id: data.taskListId,
      },
      data: {
        userId: context.user.id,
        title: data.title,
        description: data.description,
      },
    })
  })

export const deleteTaskListFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      taskListId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.taskList.delete({
      where: {
        id: data.taskListId,
      },
    })
  })

export const fetchTaskListsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const taksLists = await db.taskList.findMany({
      where: {
        userId: context.user.id,
      },
    })

    return taksLists
  })
