import { createFileRoute } from '@tanstack/react-router'
import { BlogDashboardEditor } from '@/components/web/dashboard/BlogDashboardEditor'

export const Route = createFileRoute('/dashboard/blog/create-blog/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BlogDashboardEditor />
}
