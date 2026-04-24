import { createId } from '@paralleldrive/cuid2';
import { useLiveQuery, eq } from '@tanstack/react-db';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { intlFormat, intlFormatDistance } from 'date-fns';
import { ChevronDown, ChevronLeft, Heart, ListIcon, MessagesSquareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { commentCollection, likeCollection } from '@/collections/blog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import CommentInput from '@/components/web/CommentInput';
import { CommentItem } from '@/components/web/CommentItem';
import { MarkdownRenderer } from '@/components/web/markdown/Markdown';
import { UserAvatar } from '@/components/web/user-profile';
import { getPostFn } from '@/data/blog';
import { getUser } from '@/data/session';
import { User } from '@/generated/prisma/browser';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/blog/$slug/')({
  component: PostComponent,
  loader: async ({ params }) => {
    const post = await getPostFn({ data: params.slug });
    const session = await getUser();
    if (!post?.published && session.user.id !== post?.authorId) {
      throw redirect({
        to: '/dashboard/blog',
      });
    }
    return {
      post,
      session,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.title} | Blog | Envoy Mindpalace` },
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

function extractHeadings(markdown: string) {
  // use a regex to find everything between ``` and ``` and replace it with an empty string before looking for headings.
  const cleanMarkdown = markdown
    .replace(/```[\s\S]*?```/g, '') // remove code blocks within ```
    .replace(/`.*?`/g, ''); // remove inline code (i.e. comments)

  const lines = cleanMarkdown.split('\n');
  const headings: { text: string; id: string; level: number }[] = [];

  lines.forEach((line) => {
    // adjust the # match: i.e. {2,3} or {1,6} to match 1 to 6 '#' symbols
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

      headings.push({ text, id, level });
    }
  });
  return headings;
}

function PostComponent() {
  const { post, session } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const headings = post?.content ? extractHeadings(post.content) : [];
  const navigate = useNavigate();
  const { data: likes } = useLiveQuery((q) =>
    q.from({ like: likeCollection }).where(({ like }) => eq(like.postId, post?.id)),
  );
  const { data: comments } = useLiveQuery((q) =>
    q
      .from({ comment: commentCollection })
      .where(({ comment }) => eq(comment.postId, post?.id))
      .orderBy(({ comment }) => comment.createdAt, 'desc'),
  );

  const hasLiked = likes.find((like) => like.userId === session.user.id);

  function handleToggleLike() {
    const existingLike = likes.find((like) => like.userId === session.user.id);

    if (!existingLike) {
      // optimistic Insert like
      likeCollection.insert({
        id: createId(),
        post_slug: post?.slug as string,
        postId: post?.id as string,
        shortPostId: uuidv4(),
        userId: session.user.id as string,
        createdAt: new Date(),
      });
    } else {
      // optimistic delete like
      likeCollection.delete(existingLike.id);
    }
  }

  function handleAddComment(commentText: string) {
    if (!commentText.trim()) return;

    // optimistic Insert comment
    commentCollection.insert({
      id: createId(),
      content: commentText,
      postId: post?.id as string,
      shortPostId: uuidv4(),
      post_slug: post?.slug as string,
      userId: session.user.id as string,
      createdAt: new Date(),
      user: session.user as User,
      parentId: createId(),
      updatedAt: new Date(),
    });
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          let next = [...prev];

          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // add heading id if it's not already there (within viewport)
              if (!next.includes(entry.target.id)) {
                next.push(entry.target.id);
              }
            } else {
              // remove id of the heading when it leaves the viewport
              next = next.filter((id) => id !== entry.target.id);
            }
          });
          return next;
        });
      },
      // rootMargin: -top -right -bottom -left
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }, // adjusts when the link triggers
    );

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen  text-slate-50 antialiased flex flex-col">
        <nav className="sticky top-0 z-40 border-b border-slate-800 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
            <Button
              variant="ghost"
              asChild
              className=" text-emerald-500! hover:text-emerald-400! hover:bg-primary/10! hover:border-primary! hover:border-r-2!"
            >
              <Link to="/dashboard/blog">
                <ChevronLeft className="mr-2 size-4" />
                Back to Blog
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
    <div className="min-h-screen text-slate-50 antialiased">
      <nav className="sticky top-0 z-40 border-b border-slate-800  backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            asChild
            className=" text-emerald-500! hover:text-emerald-400! hover:bg-primary/10! hover:border-primary! hover:border-r-2!"
          >
            <Link to="/dashboard/blog">
              <ChevronLeft className="mr-2 size-4" />
              Back to Blog
            </Link>
          </Button>
          <DropdownMenu
            open={dropdownOpen}
            onOpenChange={(open) => {
              setDropdownOpen(open);
            }}
          >
            <DropdownMenuTrigger asChild>
              <div className="text-sm font-medium text-slate-500 truncate md:max-w-none flex gap-1 items-center group">
                <ChevronDown
                  className={cn('size-4 group-hover:text-emerald-500 shrink-0', {
                    'rotate-180 transition-all text-emerald-500': dropdownOpen,
                  })}
                />
                <span
                  className={cn('group-hover:text-emerald-500', {
                    'text-emerald-500': dropdownOpen,
                  })}
                >
                  {post.title}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-sm:w-48 w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>On This Page </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {headings.map((heading) => {
                  const isActive = visibleIds.includes(heading.id);
                  return (
                    <DropdownMenuItem>
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-xs transition-all hover:text-white
                          ${isActive ? 'text-emerald-500 border-emerald-500 font-medium border-l-2' : 'text-slate-400 '}
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
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          <div className="flex-1 min-w-0">
            <header className="mb-8">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 mb-8">
                <img
                  src={post.image ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'}
                  alt={post.title ?? 'Blog Thumbnail'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
                  <Link
                    to="/user/$userId"
                    params={{
                      userId: post.authorId,
                    }}
                    target="_blank"
                  >
                    <UserAvatar
                      src={post.author.image as string}
                      alt={post.author.name as string}
                      className="h-9 w-9"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">{post.author.name}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Author</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-400">
                  <p className="flex items-center">
                    {intlFormat(new Date(post.createdAt), {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <span className="text-slate-500 italic">
                    Updated {intlFormatDistance(new Date(post.updatedAt), new Date())}
                  </span>
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

              <div className="mt-16 pt-8 border-t border-slate-800 space-y-12">
                <section className="flex items-center justify-between max-sm:flex-col max-sm:justify-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white  max-sm:text-center">
                      Enjoyed this post?
                    </h3>
                    <p className="text-sm text-slate-400  max-sm:text-center">
                      Let the author know by giving a like.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-300">{likes.length} likes</span>
                    <button
                      onClick={() => handleToggleLike()}
                      className={`p-3 rounded-full transition-all border cursor-pointer ${
                        hasLiked
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`size-6 ${hasLiked && 'fill-current'}`} />
                    </button>
                  </div>
                </section>

                <section className="space-y-8">
                  <div className="flex gap-4">
                    <span className="flex items-center justify-center">
                      <MessagesSquareIcon className="size-8 text-emerald-500" />
                    </span>
                    <h3 className="text-xl font-bold text-white flex items-center justify-center">
                      <span>Comments ({comments.length})</span>
                    </h3>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      to="/user/$userId"
                      params={{
                        userId: session.user.id as string,
                      }}
                      target="_blank"
                    >
                      <Avatar className="h-10 w-10 shrink-0 items-center justify-center">
                        <AvatarImage src={session.user.image as string} />
                        <AvatarFallback>
                          {' '}
                          {(session.user.name as string)
                            ? (session.user.name as string)
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                            : ''}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <CommentInput handleAddComment={handleAddComment} />
                  </div>

                  <div className="space-y-6 pt-4">
                    {comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        session={session}
                        commentCollection={commentCollection}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4 h-[calc(100vh-(--spacing(24)))] overflow-y-auto scrollbar-hide pr-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                <ListIcon className="size-4" />
                On this page
              </div>

              <nav className="space-y-1 border-l border-slate-800">
                {headings.map((heading) => {
                  const isActive = visibleIds.includes(heading.id);
                  return (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`block py-1.5 pr-4 text-sm transition-all border-l-3 -ml-0.5 hover:text-white
                      ${isActive ? ' bg-emerald-500/10 text-emerald-500 border-emerald-500 font-medium' : 'text-slate-400'}
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
                  );
                })}
              </nav>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-8 text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                Back to top ↑
              </button>
              {session.user.id === post.authorId && (
                <button
                  onClick={() =>
                    navigate({
                      to: '/dashboard/blog/$slug/edit',
                      params: {
                        slug,
                      },
                    })
                  }
                  className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Edit this blog
                </button>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
