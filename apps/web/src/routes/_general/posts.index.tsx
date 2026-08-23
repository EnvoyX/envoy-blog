import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { Search } from 'lucide-react';
import z from 'zod';

import { Input } from '@/components/ui/input';
import { payloadPostsOptions, type SerializablePost } from '@/data/query-options/queryOptions';

export const Route = createFileRoute('/_general/posts/')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(payloadPostsOptions(12, 1, false));
    return {
      user: context.user,
    };
  },
  component: PostsPageComponent,
  validateSearch: zodValidator(
    z.object({
      query: z.string().optional(),
    }),
  ),
  head: () => ({
    meta: [
      { title: `Posts | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Posts | Envoy Mindpalace' },
      {
        property: 'og:description',
        content: 'View latest posts from Payload CMS.',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function PostsPageComponent() {
  const { data } = useSuspenseQuery(payloadPostsOptions(12, 1, false));
  const { query } = Route.useSearch();

  const filteredPosts = data.docs.filter((post) => {
    const matchedQuery =
      post.title?.toLowerCase().includes(query?.toLowerCase() || '') || query === '' || !query;

    return matchedQuery;
  });

  const debouncedSearch = useDebouncedCallback(
    (searchTerm: string) => {
      window.history.pushState({}, '', `?query=${encodeURIComponent(searchTerm)}`);
    },
    {
      wait: 500,
    },
  );

  return (
    <div className="min-h-screen my-16 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Posts</h1>
            <p className="text-slate-400 mt-2">View latest posts from Payload CMS.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 z-10 left-3 flex items-center pointer-events-none">
              <Search className="size-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <Input
              type="search"
              placeholder="Search posts..."
              className="pl-10 bg-emerald-900/40 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 backdrop-blur-sm transition-all"
              defaultValue={query}
              onChange={(e) => {
                debouncedSearch(e.target.value);
              }}
            />
          </div>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No posts found. Stay tuned!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mx-auto">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post as SerializablePost} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: SerializablePost }) {
  const heroImageUrl =
    post.heroImage || post.meta?.image || 'https://tanstack.com/assets/og-C0HGjoLl.png';

  return (
    <Link to="/posts/$slug" params={{ slug: post.slug }} className="group block">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={heroImageUrl}
            alt={post.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {post.title}
          </h3>
          {post.meta?.description && (
            <p className="text-slate-400 text-sm line-clamp-3 mb-4">{post.meta.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString()}
              </time>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
