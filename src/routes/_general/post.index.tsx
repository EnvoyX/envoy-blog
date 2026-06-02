import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShortPostCard } from '@/components/web/post/ShortPostCard';
import { shortPostOptions } from '@/data/query-options/queryOptions';
import { User } from '@/generated/prisma/client';
import { postPageSearchParamsSchema } from '@/schemas/searchSchemas';

import { RouterContext } from '../__root';

export const Route = createFileRoute('/_general/post/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(shortPostOptions({ context: context as RouterContext }));
  },
  validateSearch: zodValidator(postPageSearchParamsSchema),
  head: () => ({
    meta: [
      { title: `Post | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Post | Envoy Mindpalace' },
      {
        property: 'og:description',
        content: 'Create your own blog and write your thoughts!',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function RouteComponent() {
  const { currentTab } = Route.useSearch();
  const context = Route.useRouteContext();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data } = useSuspenseQuery(shortPostOptions({ context: context as RouterContext }));
  const { latestPosts, publicPost, followingPosts, user } = data;
  return (
    <main className="min-h-screen">
      <Tabs
        defaultValue={currentTab}
        onValueChange={(value) => {
          navigate({
            search: () => ({
              currentTab: value as 'latest-post' | 'for-you' | 'following-post',
            }),
          });
        }}
        orientation="horizontal"
      >
        <header className="backdrop-blur-md mt-8 max-sm:px-12">
          <TabsList
            className="bg-transparent mx-auto flex items-center justify-start sm:justify-center max-sm:w-full overflow-x-auto scrollbar-hide whitespace-nowrap"
            variant="line"
          >
            <TabsTrigger
              className="flex items-center gap-2 after:bg-emerald-500 cursor-pointer"
              value="latest-post"
            >
              <h1 className="text-xl font-bold tracking-tight text-white pb-0.5">Latest Posts</h1>
            </TabsTrigger>
            <TabsTrigger
              className="flex items-center gap-2 after:bg-emerald-500 cursor-pointer"
              value="for-you"
            >
              <h1 className="text-xl font-bold tracking-tight text-white pb-0.5">For You</h1>
            </TabsTrigger>
            {user && (
              <TabsTrigger
                className="flex items-center gap-2 after:bg-emerald-500 cursor-pointer"
                value="following-post"
              >
                <h1 className="text-xl font-bold tracking-tight text-white pb-0.5">Following</h1>
              </TabsTrigger>
            )}
          </TabsList>
        </header>

        <TabsContent value="latest-post">
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
            {latestPosts && latestPosts.length > 0 ? (
              latestPosts.map((post) => (
                <div
                  key={post.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <ShortPostCard post={post} user={user as User} />
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-400 italic">No posts shared in the latest feed yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="for-you">
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
            {publicPost && publicPost.length > 0 ? (
              publicPost.map((post) => (
                <div
                  key={post.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <ShortPostCard post={post} user={user as User} />
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-400 italic">No thoughts shared in the feed yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {user && (
          <TabsContent value="following-post">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
              {followingPosts && followingPosts.length > 0 ? (
                followingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <ShortPostCard post={post} user={user as User} />
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-400 italic">You have not follow anyone yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </main>
  );
}
