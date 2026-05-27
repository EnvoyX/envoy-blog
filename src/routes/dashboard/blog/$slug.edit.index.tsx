import { createFileRoute, redirect } from '@tanstack/react-router';

import { BlogDashboardEditor } from '@/components/web/dashboard/BlogDashboardEditor';
import { getPostFn } from '@/data/blog';
import { Post } from '@/generated/prisma/client';

export const Route = createFileRoute('/dashboard/blog/$slug/edit/')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const post = await getPostFn({ data: params.slug });

    if (context?.user?.id !== post?.authorId) {
      throw redirect({
        to: '/dashboard/blog',
      });
    }
    return {
      post,
      session: {
        user: context?.user,
      },
    };
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
});

function RouteComponent() {
  const { post } = Route.useLoaderData();
  return <BlogDashboardEditor initialData={post as Post} />;
}
