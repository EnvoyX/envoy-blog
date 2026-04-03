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

export const fetchTaskListByIdFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(
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
  .inputValidator(taskSchema)
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
  })
export const updateTaskFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateTaskSchema)
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
  })
export const deleteTaskFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      taskId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.task.delete({
      where: {
        id: data.taskId,
      },
    })
  })
