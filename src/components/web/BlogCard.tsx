import { Link } from '@tanstack/react-router';
import { intlFormat, intlFormatDistance } from 'date-fns';
import { Calendar, Heart, LucideClockFading, MessageSquare } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { UserRole } from '@/generated/prisma/enums';
import { BlogPostUserPublic } from '@/lib/types';

import { Button } from '../ui/button';

export function BlogCard({
  post,
  session,
}: {
  post: BlogPostUserPublic;
  session: {
    user:
      | {
          name?: string | undefined;
          image?: string | null | undefined;
          id?: string | undefined;
          createdAt?: Date | undefined;
          updatedAt?: Date | undefined;
          role?: UserRole | undefined;
          email?: string | undefined;
          emailVerified?: boolean | undefined;
          password?: string | null | undefined;
          defaultImage?: string | null | undefined;
          biodata?: string | null | undefined;
        }
      | undefined;
  };
}) {
  const hasLiked = post.likes.find(
    (like) => like.userId === session?.user?.id && like.postId === post.id,
  );
  return (
    <Card
      key={post.id}
      className="group relative bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col hover:scale-105 max-w-xs py-0 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={post.image ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'}
          alt={post.title}
          className="object-cover w-full h-full transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
      </div>

      <CardContent className="p-6 flex-1">
        <div className="flex flex-col justify-start items-start sm:flex-row  sm:items-center">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 uppercase tracking-widest font-semibold">
            <Calendar className="size-3" />
            {intlFormat(new Date(post.createdAt), {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-0.5">
          {post.tags
            .map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/10 text-[10px] font-medium text-emerald-400 uppercase tracking-wider"
              >
                {tag.name}
              </span>
            ))
            .slice(0, 3)}
          {post.tags.length > 3 && (
            <span
              key="more"
              className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/10 text-[10px] font-medium text-emerald-400 uppercase tracking-wider"
            >
              +{post.tags.length - 3}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold leading-tight group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
          {post.title}
        </h2>

        <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{post.description}</p>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col justify-start items-start gap-1">
        <span className="absolute flex flex-col items-center gap-1 bottom-6 right-3 group">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 group-hover:border-emerald-500/30 transition-colors">
            <Heart className={`size-3.5 ${hasLiked ? 'fill-emerald-500 text-emerald-500' : ''}`} />
            <span className="text-[11px] font-bold tabular-nums">{post._count.likes}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 group-hover:border-blue-500/30 transition-colors">
            <MessageSquare className="size-3.5" />
            <span className="text-[11px] font-bold tabular-nums">{post._count.comments}</span>
          </div>
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 uppercase tracking-widest font-semibold">
          <LucideClockFading className="size-3" />
          {intlFormatDistance(new Date(post.updatedAt), new Date())}
        </div>

        <Button
          asChild
          variant="link"
          className="p-0 h-auto text-emerald-400 hover:text-emerald-300 gap-2 cursor-pointer"
        >
          <Link to="/blog/$slug" params={{ slug: post.slug }}>
            Read Full Blog →
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
