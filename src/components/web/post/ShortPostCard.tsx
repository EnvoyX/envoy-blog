import { createId } from '@paralleldrive/cuid2';
import { eq, useLiveQuery } from '@tanstack/react-db';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageSquare,
  // MoreHorizontal,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { commentCollection, likeCollection } from '@/collections/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserSession } from '@/data/session';
import { ShortPostPublic } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useImageStore } from '@/store/image';

import MasonryCollage from './MasonryCollage';
import PostCollage from './PostCollage';
import { PostLightBox } from './PostLightBox';

export function ShortPostCard({ post, session }: { post: ShortPostPublic; session: UserSession }) {
  const [expanded, setExpanded] = useState(false);
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

  // lightbox states & variables
  const { setPostId } = useImageStore();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const photos = post.imagesOnShortPosts?.map((data, index) => ({
    ...data.image,
    globalIndex: index,
  }));
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
  function handleToggleLightBox(index: number, postId: string, open: boolean) {
    setIndex(index);
    setOpen(open);
    setPostId(postId);
  }
  return (
    <div
      className={cn(
        'group relative p-5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all space-y-4',
      )}
    >
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
      <div className="relative">
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PostCollage
                images={photos}
                post={post}
                onExpand={() => setExpanded(true)}
                handleToggleLightBox={handleToggleLightBox}
              />
            </motion.div>
          ) : (
            <motion.div
              key="masonry"
              initial={{ opacity: 0, height: 'auto' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="flex justify-end items-center mb-2 px-1">
                {/*<span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  Full Gallery View
                </span>*/}
                <button
                  onClick={() => setExpanded(false)}
                  className="text-[10px] font-bold text-emerald-500  hover:text-slate-500 transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Collapse ↑
                </button>
              </div>
              <MasonryCollage
                images={photos}
                post={post}
                handleToggleLightBox={handleToggleLightBox}
              />
              <div className="flex justify-end items-center mt-2 px-1">
                <button
                  onClick={() => setExpanded(false)}
                  className="text-[10px] font-bold text-emerald-500  hover:text-slate-500 transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Collapse ↑
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-20 flex items-center gap-6 pt-2">
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
      <PostLightBox
        photos={photos}
        post={post}
        triggerOpen={open}
        setTriggerOpen={setOpen}
        targetIndex={index}
      />
    </div>
  );
}
