import { createFileRoute } from '@tanstack/react-router'
import { BlogEditor } from '@/components/web/BlogEditor'

export const Route = createFileRoute('/_general/blog/create-blog/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BlogEditor />
}
