import { Markdown } from '@/components/web/Markdown'
import { getPost } from '@/data/blog'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/blog/$slug')({
  loader: ({params}) => getPost({data: params.slug}) ,
  component: RouteComponent,
})

function RouteComponent() {
  const post = Route.useLoaderData()

  if (!post) return <div>Post not found</div>

  return (
    <main>
      <h1>{post.title}</h1>
      <Markdown content={post.content} />
    </main>
  )
}
