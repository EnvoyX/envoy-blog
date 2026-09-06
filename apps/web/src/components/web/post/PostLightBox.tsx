import { IconDownload } from '@tabler/icons-react';
import { Eye, EyeOff, MoreVertical } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import { ZoomRef, ThumbnailsRef, FullscreenRef } from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Share from 'yet-another-react-lightbox/plugins/share';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SourceImage } from '@/generated/prisma/client';
import { ShortPostPublic } from '@/lib/types';
import { useImageStore } from '@/store/image';
import { downloadExternalFile } from '@/utils/utils';
interface PostLightBoxProps {
  post: ShortPostPublic;
  photos: {
    globalIndex: number;
    url: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    published: boolean;
    showPrivateToFollowers: boolean;
    shortPostId: string | null;
    title: string | null;
    description: string | null;
    size: string | null;
    source: SourceImage | null;
  }[];
  triggerOpen: boolean;
  setTriggerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  targetIndex: number;
}
export function PostLightBox({
  post,
  photos,
  triggerOpen,
  setTriggerOpen,
  targetIndex,
}: PostLightBoxProps) {
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
  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
      setIndex(targetIndex);
    }
  }, [triggerOpen, targetIndex]);
  return (
    <Lightbox
      open={open && postId === post.id}
      close={() => {
        setOpen(false);
        setTriggerOpen(false);
        setPostId('');
      }}
      index={index}
      className="z-50!"
      toolbar={{
        buttons: [
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="yarl__button outline-none">
                <MoreVertical className="text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-[9999]! w-48 bg-zinc-900/90 backdrop-blur-md border-white/10 text-white"
            >
              <DropdownMenuItem
                onClick={toggleCounter}
                className="focus:bg-zinc-700/50 focus:text-foreground cursor-pointer"
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
                className="focus:bg-zinc-700/50 focus:text-foreground cursor-pointer"
              >
                {isCaptionVisible ? (
                  <EyeOff className="mr-2 h-4 w-4" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                {isCaptionVisible ? 'Hide captions' : 'Show captions'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => downloadExternalFile(photos?.[index]?.url, photos?.[index]?.id)}
                className="focus:bg-zinc-700/50 focus:text-foreground cursor-pointer"
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
      plugins={[Fullscreen, Share, Thumbnails, Zoom, Counter, Captions, Download]}
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
      slides={photos?.map((photo) => {
        return {
          src: photo.url,
          alt: photo.id,
          title: photo.title ?? '',
          description: photo.description ?? '',
          download: `${photo.url}?download`,
        };
      })}
    />
  );
}
