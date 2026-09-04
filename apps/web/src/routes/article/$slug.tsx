import { createFileRoute, notFound } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { intlFormat } from 'date-fns';
import { ChevronDown, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MarkdownRenderer } from '@/components/web/markdown/Markdown';
import ScrollProgress from '@/components/web/ScrollProgress';
import SideNavArticle, { extractHeadings } from '@/components/web/SideNavArticle';
import { cn } from '@/lib/utils';

import { allPosts } from '../../../.content-collections/generated';

export const Route = createFileRoute('/article/$slug')({
  loader: ({ params }) => {
    const post = allPosts.find((p) => p.slug === params.slug);
    if (!post) {
      throw notFound();
    }
    return post;
  },
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  const headings = post?.content ? extractHeadings(post.content) : [];

  if (!post) {
    return (
      <div className="min-h-screen text-slate-50  flex flex-col">
        <nav className="sticky top-0 z-40 border-b border-slate-800 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
            <Button
              variant="ghost"
              asChild
              className=" text-muted-foreground! hover:text-foreground! hover:bg-primary/10! hover:border-primary! hover:border-r-2!"
            >
              <Link to="/article">
                <ChevronLeft className="mr-2 size-4" />
                Back to Artciles
              </Link>
            </Button>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <span className="text-2xl font-bold text-slate-400">404</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Post Not Found
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              The blog post you're looking for doesn't exist or may have been moved.
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/dashboard/blog">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-slate-50 antialiased">
      <nav className="sticky top-0 z-40 border-b border-slate-800  backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            asChild
            className=" text-muted-foreground! hover:text-foreground! hover:bg-primary/10! hover:border-primary! hover:border-r-2!"
          >
            <Link to="/article">
              <ChevronLeft className="mr-2 size-4" />
              Back to Articles
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="text-sm font-medium text-slate-500 truncate max-w-48 md:max-w-none flex gap-1 items-center group">
                <ChevronDown className={cn('size-4 group-hover:text-foreground shrink-0')} />
                <span className={cn('group-hover:text-foreground')}>{post.title}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-sm:w-48 w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>On This Page </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {headings.map((heading) => {
                  return (
                    <DropdownMenuItem>
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-xs transition-all hover:text-white
                          ${heading.level === 1 && 'pl-2'}
                          ${heading.level === 2 && 'pl-4'}
                          ${heading.level === 3 && 'pl-6'}
                          ${heading.level === 4 && 'pl-8'}
                          ${heading.level === 5 && 'pl-10'}
                          ${heading.level === 6 && 'pl-12'}

                           hover:bg-slate-500/5`}
                      >
                        {heading.text}
                      </a>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ScrollProgress
          height={2}
          styleProp={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}
        />
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          <div className="flex-1 min-w-0">
            <header className="mb-8">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 mb-8">
                <img
                  src={post.headerImage ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'}
                  alt={post.title ?? 'Blog Thumbnail'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">{post.authors.join(', ')}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      Author(s)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-400">
                  <p className="flex items-center">
                    {intlFormat(new Date(post.published), {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
                {post.title}
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed italic border-l-4 border-primary pl-4">
                {post.description}
              </p>
            </header>

            <div
              className="prose prose-invert prose-slate max-w-none
              prose-headings:scroll-mt-20
              prose-headings:font-bold
              prose-pre:bg-slate-900
              prose-pre:border prose-pre:border-slate-800 mb-25"
            >
              <MarkdownRenderer markdown={post.content || '*Nothing to preview...*'} />
            </div>
          </div>
          <SideNavArticle post={post} />
        </div>
      </main>
    </div>
  );
}
