import { Status } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { authMiddleware } from '@/middlewares/auth'
import {
  taskListSchema,
  taskSchema,
  updateTaskListSchema,
  updateTaskSchema,
} from '@/schemas/task-tracker'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

export const createTaskListFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(taskListSchema)
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
  .validator(updateTaskListSchema)
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
  .validator(
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
      include: {
        tasks: true,
      },
    })

    return taksLists
  })

export const fetchTaskListByIdFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      taskListId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const taskList = await db.taskList.findUnique({
      where: {
        id: data.taskListId,
      },
      include: {
        tasks: true,
      },
    })

    return taskList
  })

export const createTaskFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(taskSchema)
  .handler(async ({ data, context }) => {
    await db.task.create({
      data: {
        userId: context.user.id as string,
        listId: data.listId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
      },
    })
    await db.taskList.update({
      where: {
        id: data.listId,
      },
      data: {
        updatedAt: new Date(),
      },
    })
  })
export const updateTaskFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
      dueDate: z.date(),
      taskId: z.string(),
      listId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.task.update({
      where: {
        id: data.taskId,
      },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
      },
    })

    await db.taskList.update({
      where: {
        id: data.listId,
      },
      data: {
        updatedAt: new Date(),
      },
    })
  })

export const updateTaskStatusFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      taskId: z.string(),
      listId: z.string(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
    }),
  )
  .handler(async ({ data }) => {
    await db.task.update({
      where: {
        id: data.taskId,
      },
      data: {
        status: data.status,
      },
    })
    await db.taskList.update({
      where: {
        id: data.listId,
      },
      data: {
        updatedAt: new Date(),
      },
    })
  })

export const deleteTaskFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      taskId: z.string(),
      listId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.task.delete({
      where: {
        id: data.taskId,
      },
    })
    await db.taskList.update({
      where: {
        id: data.listId,
      },
      data: {
        updatedAt: new Date(),
      },
    })
  })

export const setStatusTaskListFn = createServerFn({
  method: 'POST',
})
  .middleware([authMiddleware])
  .validator(
    z.object({
      taskId: z.string(),
      status: z.enum(['ACTIVE', 'INACTIVE']),
    }),
  )
  .handler(async ({ data }) => {
    if (data.status === 'ACTIVE') {
      await db.taskList.update({
        where: {
          id: data.taskId,
        },
        data: {
          active: true,
        },
      })
    } else if (data.status === 'INACTIVE') {
      await db.taskList.update({
        where: {
          id: data.taskId,
        },
        data: {
          active: false,
        },
      })
    }
  })
