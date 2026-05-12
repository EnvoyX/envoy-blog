import { createId } from '@paralleldrive/cuid2';
import { IconDownload } from '@tabler/icons-react';
import { eq, useLiveQuery } from '@tanstack/react-db';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageSquare,
  // MoreHorizontal,
  Image as ImageIcon,
  Maximize2,
  EyeOff,
  Eye,
} from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Masonry } from 'react-plock';
import { v4 as uuidv4 } from 'uuid';
import Lightbox from 'yet-another-react-lightbox';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import { ZoomRef, ThumbnailsRef, FullscreenRef } from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Share from 'yet-another-react-lightbox/plugins/share';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import { commentCollection, likeCollection } from '@/collections/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserSession } from '@/data/session';
import { Image } from '@/generated/prisma/client';
import { ShortPostPublic } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useImageStore } from '@/store/image';
import { downloadExternalFile } from '@/utils/utils';

function MasonryCollage({
  images,
  post,
  handleToggleLightBox,
}: {
  images: Image[];
  post: ShortPostPublic;
  handleToggleLightBox: (index: number, postId: string, open: boolean) => void;
}) {
  const photos = images?.map((photo, index) => ({
    ...photo,
    globalIndex: index,
  }));
  return (
    <div className="relative z-20 w-full rounded-xl overflow-hidden p-1">
      <Masonry
        items={photos}
        config={{
          columns: [2, 2, 2],
          gap: [4, 4, 4],
          media: [640, 768, 1024],
        }}
        render={(photo) => (
          <div
            key={photo.id}
            className="relative overflow-hidden rounded-lg cursor-pointer group/img"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLightBox(photo.globalIndex, post.id, true);
            }}
          >
            <img
              src={photo.url}
              alt={photo.id}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-500 group-hover/img:scale-[1.03]"
            />
          </div>
        )}
      />
    </div>
  );
}

function PostCollage({
  images,
  post,
  onExpand,
  handleToggleLightBox,
}: {
  images: Image[];
  post: ShortPostPublic;
  onExpand: () => void;
  handleToggleLightBox: (index: number, postId: string, open: boolean) => void;
}) {
  const count = images.length;

  const gridClassName = cn(
    'grid gap-1 relative z-20 w-full overflow-hidden rounded-xl bg-slate-950/40',
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
              'aspect-video': count === 1,
              'aspect-4/5 sm:aspect-square': count === 2,
              'h-full': count >= 3,
            })}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLightBox(index, post.id, true);
            }}
          >
            <img
              src={image.url}
              alt={image.id}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
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
      {count > 1 && (
        <button
          className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-xl transition-opacity cursor-pointer z-9999"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onExpand();
          }}
        >
          <Maximize2 className="size-4 text-white" />
        </button>
      )}
    </div>
  );
}

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
  const { toggleCaptions, toggleCounter, isCaptionVisible, isCounterVisible, postId, setPostId } =
    useImageStore();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isZoom, setIsZoom] = useState(false);
  const fullscreenRef = useRef<FullscreenRef>(null);
  // const slideshowRef = useRef(null);
  const thumbnailsRef = useRef<ThumbnailsRef>(null);
  const zoomRef = useRef<ZoomRef>(null);
  const photos = post.Images?.map((photo, index) => ({
    ...photo,
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
                images={post.Images}
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
                images={post.Images}
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
      <Lightbox
        open={open && postId === post.id}
        close={() => {
          setPostId('');
          setOpen(false);
        }}
        index={index}
        className="z-50!"
        toolbar={{
          buttons: [
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="yarl__button outline-none">
                  <MoreVertical className="text-emerald-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[9999]! w-48 bg-emerald-900/50 backdrop-blur-md border-white/10 text-white"
              >
                <DropdownMenuItem
                  onClick={toggleCounter}
                  className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                >
                  {isCounterVisible ? (
                    <EyeOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {isCounterVisible ? 'Hide slide counter' : 'Show slide counter'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={toggleCaptions}
                  className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                >
                  {isCaptionVisible ? (
                    <EyeOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {isCaptionVisible ? 'Hide captions' : 'Show captions'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => downloadExternalFile(photos[index].url, photos[index].id)}
                  className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>,
            'close',
          ],
        }}
        on={{
          view: ({ index: currentIndex }) => setIndex(currentIndex),
          zoom({ zoom }) {
            if (zoom > 1) {
              setIsZoom(true);
            } else if (zoom === 1) setIsZoom(false);
          },
        }}
        plugins={[Fullscreen, Share, Thumbnails, Zoom, Counter, Captions]}
        fullscreen={{ ref: fullscreenRef }}
        // slideshow={{ ref: slideshowRef }}
        thumbnails={{
          ref: thumbnailsRef,
          showToggle: true,
          hidden: true,
          vignette: false,
          borderColor: 'transparent',
        }}
        zoom={{ ref: zoomRef, maxZoomPixelRatio: 10, scrollToZoom: true }}
        counter={{
          container: {
            style: {
              top: 'unset',
              bottom: '-25px',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'oklch(69.6% 0.17 162.48)',
              display: isZoom ? 'none' : isCounterVisible ? '' : 'none',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: 'fit-content',
            },
          },
        }}
        captions={{
          descriptionTextAlign: 'start',
        }}
        styles={{
          root: {
            backgroundColor: 'transparent',
            backdropFilter: 'blur(24px)',
          },
          container: {
            backgroundColor: 'transparent',
            backdropFilter: 'blur(24px)',
          },
          button: {
            color: 'oklch(69.6% 0.17 162.48)',
          },
          thumbnailsContainer: {
            backgroundColor: 'transparent',
            backdropFilter: 'blur(24px)',
          },
          thumbnailsTrack: {
            backgroundColor: 'transparent',
          },
          thumbnail: {
            backgroundColor: 'transparent',
          },
          captionsTitle: {
            display: isZoom ? 'none' : isCaptionVisible ? '' : 'none',
            color: 'oklch(69.6% 0.17 162.48)',
            fontWeight: 700,
            fontSize: '1.125rem',
            textShadow: '0px 1px 4px rgba(0, 0, 0, 0.8)',
          },
          captionsDescription: {
            display: isZoom ? 'none' : isCaptionVisible ? '' : 'none',
            color: 'white',
            fontSize: '1rem',
            textShadow: '0px 1px 3px rgba(0, 0, 0, 0.8)',
          },
          captionsTitleContainer: {
            backgroundColor: 'transparent',
          },
          captionsDescriptionContainer: {
            backgroundColor: 'transparent',
          },
          toolbar: {
            display: isZoom ? 'none' : '',
          },
          navigationNext: {
            display: isZoom ? 'none' : '',
          },
          navigationPrev: {
            display: isZoom ? 'none' : '',
          },
        }}
        slides={photos.map((photo) => {
          return {
            src: photo.url,
            alt: photo.id,
            title: photo.title ?? '',
            description: photo.description ?? '',
          };
        })}
      />
    </div>
  );
}
