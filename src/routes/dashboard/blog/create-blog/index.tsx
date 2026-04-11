import { createFileRoute } from '@tanstack/react-router'
import { BlogEditor } from '@/components/web/dashboard/BlogEditor'

export const Route = createFileRoute('/dashboard/blog/create-blog/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BlogEditor />
}
