import { TaskListPage } from '@/components/web/TaskList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/task-tracker/$taskListId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { taskListId } = Route.useParams()
  return <TaskListPage taskListId={taskListId} />
}
