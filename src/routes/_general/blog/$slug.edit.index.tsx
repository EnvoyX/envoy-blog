import { BlogEditor } from '@/components/web/BlogEditor'
import { getPostFn } from '@/data/blog'
import { getUser } from '@/data/session'
import { Post } from '@/generated/prisma/client'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_general/blog/$slug/edit/')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const post = await getPostFn({ data: params.slug })
    const session = await getUser()

    if (session.user.id !== post?.authorId) {
      throw redirect({
        to: '/blog',
      })
    }
    return {
      post,
      session,
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Edit Blog | ${loaderData?.post?.slug} | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      {
        property: 'og:title',
        content: `${loaderData?.post?.title} | Envoy Blog`,
      },
      {
        property: 'og:description',
        content: `${loaderData?.post?.description}`,
      },
      {
        property: 'og:image',
        content: `${loaderData?.post?.image}`,
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
})

function RouteComponent() {
  const { post } = Route.useLoaderData()
  return <BlogEditor initialData={post as Post} />
}
