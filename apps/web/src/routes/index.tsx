import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { formatDistanceToNow, intlFormatDistance, intlFormat } from 'date-fns';
import {
  ArrowRight,
  Code2,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  ArrowUpRight,
  LucideClockFading,
  BookOpenText,
} from 'lucide-react';

import { Footer } from '@/components/web/footer';
import { Navbar } from '@/components/web/navbar';
import { authorBlogOptions, authorPostOptions } from '@/data/query-options/queryOptions';
import { User } from '@/generated/prisma/client';

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(authorPostOptions());
    context.queryClient.prefetchQuery(authorBlogOptions());
    return {
      user: context.user,
    };
  },
  head: () => ({
    meta: [
      { title: 'Home | Envoy Mindpalace' },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Home | Envoy Mindpalace' },
      {
        property: 'og:description',
        content: 'Welcome to my TanStack Start playground',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: App,
});

function App() {
  const { data: authorPosts } = useSuspenseQuery(authorPostOptions());
  const { data: authorBlogs } = useSuspenseQuery(authorBlogOptions());
  const { user } = Route.useLoaderData();
  return (
    <main className="text-slate-100 min-h-screen">
      <Navbar user={user as User} />
      <section className="relative pt-24 pb-20 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-xs font-medium text-emerald-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p>Made with TanStack Start (RC)</p>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Envoy <br /> Mindpalace
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto font-mono">
            My own TanStack Start playground to learn and experiment with. Powered by TanStack
            Router, Vite, and many other parts of TanStack's Ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/about"
              className="flex font-mono items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
            >
              About <ArrowRight size={18} />
            </Link>
            <a
              href="https://github.com/EnvoyX"
              target="_blank"
              rel="noreferrer"
              className="flex font-mono items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-8 py-4 rounded-xl font-bold transition-all"
            >
              <Code2 size={18} /> Github
            </a>
          </div>
          {user?.role !== 'USER' && (
            <div className="sm:flex gap-4 justify-center my-4">
              <Link
                to="/blogposts"
                className="flex font-mono items-center justify-center gap-2 bg-fuchsia-400 hover:bg-fuchsia-400 text-slate-950 px-16 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
              >
                <BookOpenText size={18} /> Blogposts
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-white font-mono">
              Latest Thoughts
            </h2>
            {/*<span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-900/50 rounded-md border border-slate-800">
              {authorPosts.length} Posts
            </span>*/}
            <Link
              to="/post"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors group font-mono"
            >
              View all{' '}
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>

          <div className="space-y-4">
            {authorPosts
              .map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-900/40 border border-slate-900 hover:border-emerald-500/40 p-5 rounded-2xl transition-all duration-300 cursor-pointer"
                >
                  <Link
                    to="/post/$postId"
                    params={{
                      postId: post.id,
                    }}
                  >
                    <header className="flex items-center gap-3 mb-3">
                      <img
                        src={post.author.image ?? ''}
                        alt={post.author.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {post.author.name}
                          </p>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{`@EnvoyX`}</p>
                      </div>
                    </header>

                    <article className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                      {post.content}
                    </article>

                    <footer className="flex items-center gap-6 pt-1 text-slate-500 text-xs border-t border-slate-900/60">
                      <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors group">
                        <Heart size={14} className="group-hover:scale-110 transition-transform" />
                        <span>{post.likes.length}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors group">
                        <MessageCircle
                          size={14}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span>{post.comments.length}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-sky-400 transition-colors ml-auto">
                        <Share2 size={14} />
                      </button>
                    </footer>
                  </Link>
                </div>
              ))
              .slice(0, 2)}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-white font-mono">
              Recent Articles
            </h2>
            <Link
              to="/blog"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors group font-mono"
            >
              View all{' '}
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>

          <div className="space-y-4">
            {authorBlogs.map((article) => (
              <Link
                key={article.id}
                to="/blog/$slug"
                params={{
                  slug: article.slug,
                }}
              >
                <article className="group relative bg-linear-to-b from-slate-900/60 to-slate-900/20 border border-slate-900 hover:border-emerald-500/40 p-6 rounded-2xl transition-all duration-300 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-500" />{' '}
                      {intlFormat(new Date(article.createdAt), {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1">
                      <LucideClockFading size={12} className="text-slate-500" />{' '}
                      {intlFormatDistance(new Date(article.updatedAt), new Date())}
                    </span>
                    <div className="sm:ml-auto flex flex-wrap gap-1.5">
                      {article.tags
                        .map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-medium text-emerald-400 uppercase tracking-wider"
                          >
                            {tag.name}
                          </span>
                        ))
                        .slice(0, 3)}
                      {article.tags.length > 3 && (
                        <span
                          key="more"
                          className="px-2 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-medium text-emerald-400 uppercase tracking-wider"
                        >
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-emerald-400 transition-colors mb-2 line-clamp-1">
                    <p className="focus:outline-none">{article.title}</p>
                  </h3>

                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {article.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
                    Read Article{' '}
                    <ArrowRight
                      size={14}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
