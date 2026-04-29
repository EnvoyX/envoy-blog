import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GetUserType } from '@/data/session';
import { ShortPostPublic } from '@/lib/types';
import { cn } from '@/lib/utils';

import { ImageModal } from '../ImageModal';
import { ShortPostCard } from './ShortPostCard';

export function ShortPostModal({
  post,
  session,
  handleToggleLike,
  handleAddComment,
}: {
  post: ShortPostPublic;
  session: GetUserType;
  handleToggleLike: () => void;
  handleAddComment: () => void;
}) {
  const firstImage = post.Images?.[0]?.url;
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
  const hasLiked = post.likes.find((like) => like.userId === session.user.id);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full text-left outline-none">
          <ShortPostCard post={post} session={session} />
        </button>
      </DialogTrigger>

      <DialogContent className="xl:max-w-7xl! lg:max-w-6xl! md:max-w-5xl! sm:max-w-4xl! max-w-xs! p-0 overflow-hidden bg-slate-950 border-slate-800 h-[90vh] sm:h-[80vh] flex flex-col sm:flex-row">
        {firstImage && post.Images?.length === 1 && (
          <div
            className="w-full sm:w-3/5 bg-transparent flex items-center justify-center border-r border-slate-800"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <ImageModal
              imageUrl={firstImage}
              className="max-h-full max-w-full object-contain cursor-pointer"
              post={post}
            />
          </div>
        )}

        {firstImage && post.Images?.length > 1 && (
          <Carousel
            className="relative w-full sm:w-3/5 bg-transparent flex items-center justify-center border-r border-slate-800"
            onClick={(e) => {
              e.preventDefault();
            }}
            setApi={setApi}
          >
            <CarouselContent>
              {post.Images?.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square overflow-hidden rounded-md border flex items-center justify-center">
                    <ImageModal
                      imageUrl={image.url}
                      className="max-h-full max-w-full object-contain object-center cursor-pointer"
                      alt={`Preview ${index + 1}`}
                      post={post}
                      imageOrder={index}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="cursor-pointer ml-3 absolute top-1/2 left-0 bg-emerald-500!" />
            <CarouselNext className="cursor-pointer mr-3 absolute top-1/2 right-0 bg-emerald-500!" />
            <div className="py-2 text-center flex items-center gap-2 font-bold absolute bottom-0">
              {post.Images.map((_, index) => {
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

        <div className={`flex flex-col flex-1 h-full ${!firstImage && 'max-w-2xl mx-auto w-full'}`}>
          <div className="p-4 border-b border-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-slate-800">
                  <AvatarImage src={post.author.image as string} />
                  <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-none">
                    {post.author.name}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {/* <button className="text-slate-500 hover:text-white">
                <MoreHorizontal className="size-4" />
              </button> */}
            </div>

            {post.content && (
              <div className="mt-4 text-sm text-slate-300 leading-relaxed max-h-[150px] overflow-y-auto scrollbar-hide">
                {post.content}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-slate-900">
                    <AvatarImage src={comment.user.image ?? ''} />
                    <AvatarFallback>
                      {comment.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
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
                  className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
                >
                  <Heart className={`size-5 ${hasLiked && 'fill-current'}`} />
                  <span className="text-xs font-bold">{post.likes.length}</span>
                </button>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MessageSquare className="size-5" />
                  <span className="text-xs font-bold">{post.comments.length}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <textarea
                placeholder="Write a comment..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none pr-12"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 font-bold text-xs"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
