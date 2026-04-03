import { db } from '@/lib/db'
import { authMiddleware } from '@/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'

export const fetchDashboardData = createServerFn({ method: 'GET' })
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

    const quranTrack = await db.quranTrack.findUnique({
      where: {
        userId: context.user.id,
      },
    })

    return {
      taksLists,
      quranTrack,
    }
  })

export const fetchDashboardTasksData = createServerFn({ method: 'GET' })
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

    const tasks = await db.task.findMany({
      where: {
        userId: context.user.id,
      },
    })

    const lowTasks = tasks.filter((task) => task.priority === 'LOW')
    const mediumTasks = tasks.filter((task) => task.priority === 'MEDIUM')
    const highTasks = tasks.filter((task) => task.priority === 'HIGH')
    const urgentTasks = tasks.filter((task) => task.priority === 'URGENT')

    const doneTasks = tasks.filter((task) => task.status === 'DONE')
    const inProgressTasks = tasks.filter(
      (task) => task.status === 'IN_PROGRESS',
    )
    const todoTasks = tasks.filter((task) => task.status === 'TODO')
    const cancelledTasks = tasks.filter((task) => task.status === 'CANCELLED')

    const totalTasks = taksLists.reduce(
      (acc, curr) => acc + curr.tasks.length,
      0,
    )

    return {
      taksLists,
      tasks,
      totalTasks,
      lowTasks,
      mediumTasks,
      highTasks,
      urgentTasks,
      doneTasks,
      todoTasks,
      inProgressTasks,
      cancelledTasks,
    }
  })
