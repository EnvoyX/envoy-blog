import { Markdown } from '@/components/web/Markdown'
import { getDiary } from '@/data/diaries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/diaries/$slug')({
  loader: ({ params }) => getDiary({ data: params.slug }),
  component: RouteComponent,
})

function RouteComponent() {
  const diary = Route.useLoaderData()

  if (!diary) return <div>Diary not found</div>

  return (
    <main>
      <h1>{diary.title}</h1>
      <Markdown content={diary.content} />
    </main>
  )
}
