import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';

import { BlogDashboardEditor } from '@/components/web/dashboard/BlogDashboardEditor';
import { dashboardBlogPostSlugOptions } from '@/data/query-options/dashboardQueryOptions';
import { Post } from '@/generated/prisma/client';

export const Route = createFileRoute('/dashboard/blog/$slug/edit/')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(
      dashboardBlogPostSlugOptions(params.slug),
    );
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

type PostWithTags = Post & { tags: string[] };

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(dashboardBlogPostSlugOptions(slug));
  const blogPost = {
    id: post?.id as string,
    authorId: post?.authorId as string,
    title: post?.title as string,
    description: post?.description as string,
    image: post?.image as string,
    content: post?.content as string,
    published: post?.published as boolean,
    showPrivateToFollowers: post?.showPrivateToFollowers as boolean,
    tags: post?.tags?.map((tag) => tag.name),
    createdAt: post?.createdAt as Date,
    updatedAt: post?.updatedAt as Date,
  };
  return <BlogDashboardEditor initialData={blogPost as PostWithTags} />;
}
