import { createId } from '@paralleldrive/cuid2';
import { eq, useLiveQuery } from '@tanstack/react-db';
import { createFileRoute } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { commentCollection, likeCollection } from '@/collections/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ImageModal } from '@/components/web/ImageModal';
import CommentInput from '@/components/web/post/CommentInput';
import { getShortPostByIdFn } from '@/data/post';
import { getUser } from '@/data/session';
import { User } from '@/generated/prisma/client';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_general/post/$postId/')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const post = await getShortPostByIdFn({
      data: {
        shortPostId: params.postId,
      },
    });
    const session = await getUser();
    return {
      post,
      session,
    };
  },
});

function RouteComponent() {
  const { post, session } = Route.useLoaderData();
  const firstImage = post?.Images?.[0]?.url;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!api) {
      return;
    }
    // setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  const { data: likes } = useLiveQuery((q) =>
    q.from({ like: likeCollection }).where(({ like }) => eq(like.shortPostId, post?.id)),
  );
  const { data: comments } = useLiveQuery((q) =>
    q
      .from({ comment: commentCollection })
      .where(({ comment }) => eq(comment.shortPostId, post?.id))
      .orderBy(({ comment }) => comment.createdAt, 'desc'),
  );
  const hasLiked = likes.find((like) => like.userId === session.user.id);

  function handleToggleLike() {
    const existingLike = likes.find((like) => like.userId === session.user.id);

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

  function handleAddComment(commentText: string) {
    if (!commentText.trim()) return;

    // optimistic Insert comment
    commentCollection.insert({
      id: createId(),
      content: commentText,
      postId: uuidv4(),
      shortPostId: post?.id as string,
      post_slug: post?.authorId as string,
      userId: session.user.id as string,
      createdAt: new Date(),
      user: session.user as User,
      parentId: createId(),
      updatedAt: new Date(),
    });
  }
  return (
    <section
      className={cn(
        'w-full p-0 overflow-hidden bg-slate-950 border-slate-800 h-[90vh] flex flex-col sm:flex-row',
        {
          'max-sm:h-full': firstImage,
        },
      )}
    >
      {firstImage && post?.Images?.length === 1 && (
        <div
          className="w-full sm:w-3/5 bg-transparent flex items-center justify-center border-r border-slate-800"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <ImageModal
            imageUrl={firstImage}
            className="max-h-full max-w-full object-contain cursor-pointer"
            images={post.Images}
          />
        </div>
      )}

      {firstImage && post?.Images?.length > 1 && (
        <Carousel
          className="relative w-full sm:w-3/5 bg-transparent flex items-center justify-center border-r border-slate-800"
          onClick={(e) => {
            e.preventDefault();
          }}
          setApi={setApi}
        >
          <CarouselContent>
            {post?.Images?.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-square overflow-hidden rounded-md border flex items-center justify-center">
                  <ImageModal
                    imageUrl={image.url}
                    className="max-h-full max-w-full object-contain object-center cursor-pointer"
                    alt={`Preview ${index + 1}`}
                    images={post.Images}
                    imageOrder={index}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="cursor-pointer ml-3 absolute top-1/2 left-0 bg-emerald-500! text-slate-900!" />
          <CarouselNext className="cursor-pointer mr-3 absolute top-1/2 right-0 bg-emerald-500! text-slate-900!" />
          <div className="py-2 text-center flex items-center gap-2 font-bold absolute bottom-0">
            {post?.Images.map((_, index) => {
              return (
                <span
                  key={index}
                  className={cn('rounded-full w-2 h-2 bg-emerald-500/50', {
                    'bg-emerald-500': index + 1 === current,
                  })}
                />
              );
            })}
          </div>
        </Carousel>
      )}

      <div
        className={`flex flex-col flex-1 h-full ${!firstImage && 'max-w-3xl mx-auto w-full shadow-2xl'}`}
      >
        <div className="p-4 border-b border-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-slate-800">
                <AvatarImage src={post?.author.image as string} />
                <AvatarFallback>{post?.author.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-none">
                  {post?.author.name}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">
                  {formatDistanceToNow(new Date(post?.createdAt as Date), { addSuffix: true })}
                </span>
              </div>
            </div>
            {/* <button className="text-slate-500 hover:text-white">
                <MoreHorizontal className="size-4" />
              </button> */}
          </div>

          {post?.content && (
            <div className="mt-4 text-sm text-slate-300 leading-relaxed max-h-37.5 overflow-y-auto scrollbar-hide">
              {post?.content}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 border border-slate-900">
                  <AvatarImage src={comment.user?.image ?? ''} />
                  <AvatarFallback>
                    {comment.user?.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex max-sm:flex-col sm:items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{comment.user.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
              <MessageSquare className="size-10 mb-2" />
              <p className="text-xs">No comments yet</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-900 bg-slate-950">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${hasLiked ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
              >
                <Heart className={`size-5 ${hasLiked && 'fill-current'}`} />
                <span className="text-xs font-bold">{likes.length}</span>
              </button>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MessageSquare className="size-5" />
                <span className="text-xs font-bold">{comments.length}</span>
              </div>
            </div>
          </div>

          <CommentInput handleAddComment={handleAddComment} />
        </div>
      </div>
    </section>
  );
}
