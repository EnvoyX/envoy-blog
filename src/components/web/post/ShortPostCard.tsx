import { createId } from '@paralleldrive/cuid2';
import { eq, useLiveQuery } from '@tanstack/react-db';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { Masonry } from 'react-plock';
import { v4 as uuidv4 } from 'uuid';

import { commentCollection, likeCollection } from '@/collections/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserSession } from '@/data/session';
import { Image } from '@/generated/prisma/client';
import { ShortPostPublic } from '@/lib/types';
import { cn } from '@/lib/utils';

import { ImageModal } from '../ImageModal';

function MasonryCollage({ images, post }: { images: Image[]; post: ShortPostPublic }) {
  return (
    <div className="relative z-20 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/40 p-1">
      <Masonry
        items={images}
        config={{
          columns: [1, 2, 2],
          gap: [4, 4, 4],
          media: [640, 768, 1024],
        }}
        render={(image, index) => (
          <div
            key={image.id}
            className="relative overflow-hidden rounded-lg cursor-pointer group/img"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageModal
              imageUrl={image.url}
              images={images}
              imageOrder={index + 1}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover/img:scale-[1.03]"
            />
          </div>
        )}
      />
    </div>
  );
}

function PostCollage({ images, post }: { images: Image[]; post: ShortPostPublic }) {
  const count = images.length;

  const gridClassName = cn(
    'grid gap-1 relative z-20 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900',
    {
      'grid-cols-1': count === 1,
      'grid-cols-2': count === 2,
      'grid-cols-2 grid-rows-2 h-[300px]': count >= 3,
    },
  );

  return (
    <div className={gridClassName}>
      {images.slice(0, 4).map((image, index) => {
        const isLarge = count === 3 && index === 0;
        return (
          <div
            key={image.id}
            className={cn('relative overflow-hidden cursor-pointer', {
              'row-span-2 h-75': isLarge,
              'aspect-square sm:aspect-video': count === 1,
              'aspect-4/5 sm:aspect-square': count === 2,
              'h-full': count >= 3,
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <ImageModal
              imageUrl={image.url}
              images={images}
              imageOrder={index}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            {index === 3 && count > 4 && (
              <div className="absolute inset-0 bg-black/25 gap-1 flex items-center justify-center pointer-events-none">
                <ImageIcon className="size-5" />
                <span className="text-xl font-bold text-white">+{count - 4}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ShortPostCard({ post, session }: { post: ShortPostPublic; session: UserSession }) {
  const { data: likes } = useLiveQuery((q) =>
    q.from({ like: likeCollection }).where(({ like }) => eq(like.shortPostId, post?.id)),
  );
  const hasLiked = likes.find((like) => like.userId === session?.user?.id);
  const { data: comments } = useLiveQuery((q) =>
    q
      .from({ comment: commentCollection })
      .where(({ comment }) => eq(comment.shortPostId, post?.id))
      .orderBy(({ comment }) => comment.createdAt, 'desc'),
  );
  function handleToggleLike() {
    if (!session.user) return;
    const existingLike = likes.find((like) => like.userId === session?.user?.id);

    if (!existingLike) {
      // optimistic Insert like
      likeCollection.insert({
        id: createId(),
        post_slug: post?.authorId as string,
        postId: uuidv4(),
        shortPostId: post?.id as string,
        userId: session.user.id as string,
        createdAt: new Date(),
      });
    } else {
      // optimistic delete like
      likeCollection.delete(existingLike.id);
    }
  }
  return (
    <div className="group relative p-5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
      <Link
        to="/post/$postId"
        params={{ postId: post.id }}
        className="absolute inset-0 z-0 rounded-2xl aria-label='View post details'"
      />
      <div className="relative z-10 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <Link
            to="/user/$userId"
            params={{ userId: post.author.id }}
            className="flex items-center gap-3"
          >
            <figure className="cursor-pointer">
              <Avatar className="h-10 w-10 border border-slate-800">
                <AvatarImage src={post.author.image ?? ''} />
                <AvatarFallback>
                  {post.author.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </figure>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-none">{post.author.name}</span>
              <span className="text-[11px] text-slate-500 tracking-tighter mt-1">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </Link>
          {/* <button className="p-2 text-slate-600 hover:text-white transition-colors">
            <MoreHorizontal className="size-4" />
          </button> */}
        </div>
      </div>
      {post.content && (
        <div className="relative z-10 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pointer-events-none">
          {post.content}
        </div>
      )}
      {/*{firstImage && (
        <div
          className="relative z-20 aspect-square sm:aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <ImageModal
            imageUrl={firstImage}
            images={post.Images}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {post.Images.length > 1 && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-bold text-white flex items-center gap-1.5">
              <ImageIcon className="size-3" />+{post.Images.length - 1}
            </div>
          )}
        </div>
      )}*/}

      {post.Images && post.Images.length > 0 && <PostCollage images={post.Images} post={post} />}
      {/*{post.Images && post.Images.length > 1 && <MasonryCollage images={post.Images} post={post} />}*/}

      <div className="relative z-20 flex items-center gap-6 pt-2 border-t border-slate-900">
        <button
          className={`flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors group/stat ${session.user ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          onClick={(e) => {
            handleToggleLike();
            e.stopPropagation();
          }}
        >
          <div className="p-1.5 rounded-full group-hover/stat:bg-emerald-500/10">
            <Heart className={`size-4 ${hasLiked && 'fill-current text-emerald-500'}`} />
          </div>
          <span className="text-xs font-semibold tabular-nums">{likes.length}</span>
        </button>

        <Link
          to="/post/$postId"
          params={{ postId: post.id }}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors group/stat cursor-pointer"
        >
          <div className="p-1.5 rounded-full group-hover/stat:bg-blue-500/10">
            <MessageSquare className="size-4" />
          </div>
          <span className="text-xs font-semibold tabular-nums">{comments.length}</span>
        </Link>
      </div>
    </div>
  );
}
