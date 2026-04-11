import { BlogEditor } from '@/components/web/dashboard/BlogEditor'
import { getPostFn } from '@/data/blog'
import { Post } from '@/generated/prisma/client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/blog/$slug/edit')({
  component: RouteComponent,
  loader: ({ params }) => getPostFn({ data: params.slug }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `Edit Blog | ${loaderData?.slug} | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: `${loaderData?.title} | Envoy Blog` },
      {
        property: 'og:description',
        content: `${loaderData?.description}`,
      },
      {
        property: 'og:image',
        content: `${loaderData?.image}`,
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
})

function RouteComponent() {
  const post = Route.useLoaderData()
  return <BlogEditor initialData={post as Post} />
}
