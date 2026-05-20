import { createId } from '@paralleldrive/cuid2';
import { eq, useLiveQuery } from '@tanstack/react-db';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ChevronsRight, Heart, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { commentCollection, likeCollection } from '@/collections/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
// import { ImageModal } from '@/components/web/ImageModal';
import CommentInput from '@/components/web/post/CommentInput';
import MasonryCollage from '@/components/web/post/MasonryCollage';
import PostCollage from '@/components/web/post/PostCollage';
import { PostLightBox } from '@/components/web/post/PostLightBox';
import { getShortPostByIdFn } from '@/data/post';
import { getUser } from '@/data/session';
import { User } from '@/generated/prisma/client';
import { cn } from '@/lib/utils';
import { useImageStore } from '@/store/image';

export const Route = createFileRoute('/post/$postId/')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const post = await getShortPostByIdFn({
      data: {
        shortPostId: params.postId,
      },
    });
    if (!post) throw redirect({ to: '/post' });
    const session = await getUser();
    const isOwner = session?.user?.id === post?.authorId;
    const isPrivateShownToFollower =
      session &&
      post?.author.followers.some((follow) => follow.follower.id === session?.user?.id) &&
      post.showPrivateToFollowers &&
      !post.published;

    if (!post?.published && !isOwner && !isPrivateShownToFollower) {
      throw redirect({ to: '/post' });
    }

    return {
      post,
      session,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.author.name} | Post | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      {
        property: 'og:title',
        content: `${loaderData?.post?.author.name} | Post | Envoy Mindpalace`,
      },
      {
        property: 'og:description',
        content: `${loaderData?.post?.content}`,
      },
      {
        property: 'og:image',
        content: `${loaderData?.post?.author.image}`,
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function RouteComponent() {
  const { post, session } = Route.useLoaderData();
  const photos = post?.imagesOnShortPosts?.map((photo, index) => ({
    ...photo.image,
    globalIndex: index,
  }));
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { data: likes } = useLiveQuery((q) =>
    q.from({ like: likeCollection }).where(({ like }) => eq(like.shortPostId, post?.id)),
  );
  const { data: comments } = useLiveQuery((q) =>
    q
      .from({ comment: commentCollection })
      .where(({ comment }) => eq(comment.shortPostId, post?.id))
      .orderBy(({ comment }) => comment.createdAt, 'desc'),
  );
  const hasLiked = likes.find((like) => like.userId === session?.user?.id);

  // lightbox states & variables
  const { setPostId } = useImageStore();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

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
  function handleAddComment(commentText: string) {
    if (!session.user) return;

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
  function handleToggleLightBox(index: number, postId: string, open: boolean) {
    setIndex(index);
    setOpen(open);
    setPostId(postId);
  }
  useEffect(() => {
    if (!api) {
      return;
    }
    // setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    setIndex(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setIndex(api.selectedScrollSnap());
    });
  }, [api]);
  useEffect(() => {
    if (isMobile) setHidden(false);
    else if (!isMobile) {
      setCurrent(1);
    }
  }, [isMobile]);
  return (
    <section
      className={cn(
        'w-full p-0 overflow-hidden bg-slate-950 border-slate-800 h-[90vh] flex flex-col sm:flex-row min-h-screen',
        {
          'max-sm:h-full': photos.length!,
        },
      )}
    >
      {photos?.length >= 1 && (
        <Carousel
          className={cn(
            'relative w-full bg-transparent flex items-center justify-center border-r border-slate-800',
            {
              hidden: isMobile,
            },
          )}
          onClick={(e) => {
            e.preventDefault();
          }}
          setApi={setApi}
        >
          <div className="absolute top-1 left-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => {
                window.history.back();
              }}
            >
              <ArrowLeft className="size-6 text-primary" />
            </Button>
          </div>
          <div className="absolute top-1 right-2 z-10 max-sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => {
                setHidden((prev) => !prev);
              }}
            >
              <ChevronsRight
                className={cn('size-6 text-primary', {
                  'rotate-180': hidden,
                })}
              />
            </Button>
          </div>
          <CarouselContent>
            {photos?.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-square rounded-md flex items-center justify-center">
                  {/*<ImageModal
                    imageUrl={image.url}
                    className="max-h-[90vh] max-w-full object-contain object-center cursor-pointer rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                    alt={`Preview ${index + 1}`}
                    images={post.Images}
                    imageOrder={index}
                        />*/}
                  <img
                    src={image.url}
                    alt={`Preview ${index + 1}`}
                    className="max-h-[90vh] max-w-full object-contain object-center cursor-pointer rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                    loading="lazy"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleLightBox(index, post?.id as string, true);
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            className={cn(
              'cursor-pointer ml-3 absolute top-1/2 left-0 bg-emerald-500! text-slate-900!',
              {
                hidden: photos.length === 1,
              },
            )}
          />
          <CarouselNext
            className={cn(
              'cursor-pointer mr-3 absolute top-1/2 right-0 bg-emerald-500! text-slate-900!',
              {
                hidden: photos.length === 1,
              },
            )}
          />
          <div className="py-2 text-center flex items-center gap-2 font-bold absolute bottom-0">
            {/*{photos?.map((_, index) => {
              return (
                <span
                  key={index}
                  className={cn('rounded-full w-2 h-2 bg-emerald-500/50', {
                    'bg-emerald-500': index + 1 === current,
                  })
                />
              );
            })}*/}
            <span key={current} className="text-emerald-600 font-normal text-shadow-lg">
              {current}/{photos?.length}
            </span>
          </div>
        </Carousel>
      )}

      <motion.div
        className={cn(`flex flex-col h-full max-sm:flex-1 sm:min-w-xs sm:max-w-xs`, {
          'max-w-3xl mx-auto w-full shadow-2xl': !photos.length,
        })}
        animate={{
          opacity: hidden ? 0 : 1,
          display: hidden ? 'none' : 'flex',
          translateX: hidden ? '100%' : '0',
          transition: {
            ease: 'easeInOut',
            duration: 0.2,
          },
        }}
      >
        <div className="p-4 border-b border-slate-900 relative">
          <header className="sm:hidden w-full border-b h-8 flex items-center py-6 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => {
                window.history.back();
              }}
            >
              <ArrowLeft className="size-5 text-primary" />
            </Button>
            <span className="text-lg font-bold text-emerald-400 leading-none ml-2">Post</span>
          </header>
          <div className="flex items-center justify-between">
            <Link
              to="/user/$userId"
              params={{ userId: post?.author.id as string }}
              className="flex items-center gap-3"
            >
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
            </Link>
            {/* <button className="text-slate-500 hover:text-white">
                <MoreHorizontal className="size-4" />
              </button> */}
          </div>
          {post?.content && (
            <div className="mt-4 text-sm text-slate-300 leading-relaxed h-fit sm:max-h-37.5 overflow-y-auto scrollbar-hide">
              {post?.content}
            </div>
          )}
          <div className="relative my-2 sm:hidden">
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
        </div>

        <div className="p-4 border-t border-slate-900 bg-slate-950">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 transition-colors ${session.user ? 'cursor-pointer' : 'cursor-not-allowed'} ${hasLiked ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
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

          {session.user ? (
            <CommentInput handleAddComment={handleAddComment} />
          ) : (
            <div className="relative flex items-center gap-3">
              <div className="w-full flex items-center justify-center px-4 py-3 text-sm resize-none pr-12">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500 rounded-full px-6 cursor-pointer font-bold text-xs"
                  onClick={() => {
                    void navigate({
                      to: '/login',
                    });
                  }}
                >
                  Login to comment
                </Button>
              </div>
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
      </motion.div>
      <PostLightBox
        photos={photos}
        post={post}
        triggerOpen={open}
        setTriggerOpen={setOpen}
        targetIndex={index}
      />
    </section>
  );
}
