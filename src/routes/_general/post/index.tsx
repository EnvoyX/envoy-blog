import { createFileRoute } from '@tanstack/react-router';
import { Sparkles, Loader2 } from 'lucide-react';

import { ShortPostCard } from '@/components/web/post/ShortPostCard';
import { getGlobalFeedFn } from '@/data/post';
import { getUser } from '@/data/session';

export const Route = createFileRoute('/_general/post/')({
  component: RouteComponent,
  loader: async () => {
    const posts = await getGlobalFeedFn();
    const session = await getUser();
    return {
      posts,
      session,
    };
  },
});

function RouteComponent() {
  const { posts, session } = Route.useLoaderData();

  return (
    <main className="min-h-screen">
      <header className="backdrop-blur-md border-b border-slate-900">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/*<Sparkles className="size-5 text-emerald-500" />*/}
            <h1 className="text-xl font-bold tracking-tight text-white border-b border-emerald-500 pb-0.5">
              Latest Posts
            </h1>
          </div>
          {/*<nav className="flex gap-4 text-sm font-medium text-slate-500">
            <button className="text-white border-b-2 border-emerald-500 pb-5 translate-y-0.5">
              Latest
            </button>
            <button className="hover:text-slate-300 pb-5 transition-colors">Trending</button>
          </nav>*/}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ShortPostCard post={post} session={session} />
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-400 italic">No thoughts shared in the feed yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
