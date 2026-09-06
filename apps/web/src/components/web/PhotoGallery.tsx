import { IconDownload } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import { Effect } from 'effect';
// import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import {
  AlbumIcon,
  Eye,
  EyeOff,
  ImageIcon,
  Lock,
  MoreVertical,
  Trash2,
  Unlock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Masonry } from 'react-plock';
import { toast } from 'sonner';
import Lightbox from 'yet-another-react-lightbox';
import { ZoomRef, ThumbnailsRef, FullscreenRef } from 'yet-another-react-lightbox';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Share from 'yet-another-react-lightbox/plugins/share';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAlbumByIdFn } from '@/data/album';
import {
  deleteImageFn,
  removeImageFromAlbumFn,
  setHidePrivateImageToFollowersFn,
  setPrivateImageFn,
  setPublicImageFn,
  setShowPrivateImageToFollowersFn,
} from '@/data/image';
import {
  dashboardAlbumIdOptions,
  imageGalleryOptions,
} from '@/data/query-options/dashboardQueryOptions';
import { Image } from '@/generated/prisma/client';
import { useImageStore } from '@/store/image';
import { photoGalleryStore } from '@/store/photoGallery';
import { downloadExternalFile } from '@/utils/utils';

export default function PhotoGallery({
  images,
  type,
  albumId,
}: {
  images: Image[];
  type?: 'public' | 'private';
  albumId?: string;
}) {
  const queryClient = useQueryClient();
  const isOpen = useSelector(photoGalleryStore, (state) => state.isOpen);
  const {
    toggleDialog,
    toggleCaptions,
    toggleCounter,
    isCaptionVisible,
    isCounterVisible,
    setInitialValues,
  } = useImageStore();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isZoom, setIsZoom] = useState(false);
  const fullscreenRef = useRef<FullscreenRef>(null);
  // const slideshowRef = useRef(null);
  const thumbnailsRef = useRef<ThumbnailsRef>(null);
  const zoomRef = useRef<ZoomRef>(null);
  const router = useRouter();
  const { data: album } = useQuery({
    queryKey: ['album-gallery', albumId],
    queryFn: async () => {
      const album = await getAlbumByIdFn({
        data: {
          albumId: albumId ?? '',
        },
      });
      return album;
    },
    enabled: albumId ? true : false,
  });
  const photos = images?.map((photo, index) => ({
    ...photo,
    globalIndex: index,
  }));

  const runCleanup = Effect.sync(() => {
    void queryClient.invalidateQueries({
      queryKey: [...imageGalleryOptions().queryKey],
    });
    if (albumId)
      void queryClient.invalidateQueries({
        queryKey: [...dashboardAlbumIdOptions(albumId).queryKey],
      });
    void router.invalidate();
  });
  async function handleAction(action: string, photoId: string | undefined) {
    if (!photoId) return;
    const actionConfig = {
      public: {
        action: () =>
          Effect.tryPromise(() =>
            setPublicImageFn({
              data: {
                imageId: photoId,
              },
            }),
          ),
        msg: `Updating photo to public...`,
        success: `Photo successfully set to public`,
        failed: `Failed to set photo to public`,
      },
      private: {
        action: () =>
          Effect.tryPromise(() =>
            setPrivateImageFn({
              data: {
                imageId: photoId,
              },
            }),
          ),
        msg: `Updating photo to private...`,
        success: `Photo successfully set to private`,
        failed: `Failed to set photo to private`,
      },
      showPrivateToFollowers: {
        action: () =>
          Effect.tryPromise(() =>
            setShowPrivateImageToFollowersFn({
              data: {
                imageId: photoId,
              },
            }),
          ),
        msg: `Updating photo visibility...`,
        success: `This private photo is now visible to followers`,
        failed: `Failed to update photo visibility`,
      },
      hidePrivateToFollowers: {
        action: () =>
          Effect.tryPromise(() =>
            setHidePrivateImageToFollowersFn({
              data: {
                imageId: photoId,
              },
            }),
          ),
        msg: `Updating photo visibility...`,
        success: `This private photo is now hidden from followers`,
        failed: `Failed to update photo visibility`,
      },
      remove: {
        action: () =>
          Effect.tryPromise(() =>
            removeImageFromAlbumFn({
              data: {
                imageId: photoId,
                albumId: albumId as string,
              },
            }),
          ),
        msg: `Removing photo from album...`,
        success: `Photo removed from album successfully`,
        failed: `Failed to remove photo from album`,
      },
      delete: {
        action: () =>
          Effect.tryPromise(() =>
            deleteImageFn({
              data: {
                imageId: photoId,
              },
            }),
          ),
        msg: `Deleting photo...`,
        success: `Photo deleted successfully`,
        failed: `Failed to delete photo`,
      },
    };
    const actionMode = actionConfig[action as keyof typeof actionConfig];
    if (!actionMode) return;
    const actionWorkflow = Effect.gen(function* () {
      toast.loading(actionMode.msg, {
        id: `action-${photoId}`,
      });
      yield* actionMode.action();
      toast.success(actionMode.success, {
        id: `action-${photoId}`,
      });
      if (action === 'remove' || action === 'delete')
        photoGalleryStore.setState((prev) => {
          return {
            ...prev,
            isOpen: false,
          };
        });
    }).pipe(
      Effect.catchAll((error) =>
        Effect.sync(() => {
          toast.error(actionMode.failed, {
            id: `action-${photoId}`,
          });
          console.error(error.message);
        }),
      ),
      Effect.ensuring(runCleanup),
    );
    await Effect.runPromise(actionWorkflow);
  }
  return (
    <div className="min-h-screen">
      <Masonry
        items={photos}
        config={{
          columns: [2, 3, 4], // default: 1 col on mobile, 2 on sm, 3 on md, 4 on lg [1,2,3,4]
          gap: [4, 4, 4], // gap sizes in pixels corresponding to breakpoints [16, 20, 24, 28]
          media: [640, 768, 1024], // tailwind's default breakpoints [640, 768, 1024, 1280]
          // useBalancedLayout: true,
        }}
        render={(photo) => {
          return (
            <motion.div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer "
              onClick={() => {
                setOpen(true);
                setIndex(photo.globalIndex);
              }}
            >
              <motion.img
                initial={{ opacity: 0, filter: 'blur(16px)' }}
                whileInView={{ opacity: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }} // animation only plays the first time an element scrolls into view
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 0.95,
                  transition: {
                    duration: 0.3,
                  },
                }}
                transition={{ ease: 'easeOut', duration: 0.5 }}
                src={photo.url}
                alt={photo.id}
                className="w-full h-auto display:block"
                loading="lazy"
              />
              {(photo.title || photo.description) && (
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                  <p className="text-gray-200 text-xs">{photo.description}</p>
                </div>
              )}
            </motion.div>
          );
        }}
      />
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          photoGalleryStore.setState((prev) => {
            return {
              ...prev,
              isOpen: open,
            };
          });
        }}
      >
        <DialogContent className="sm:max-w-md z-[9999]!">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            {albumId ? (
              <DialogDescription>
                This action cannot be undone. This will permanently remove the image from album:{' '}
                <span className="text-primary font-bold">{album?.name}</span>
              </DialogDescription>
            ) : (
              <DialogDescription>
                This action cannot be undone. This will permanently delete the image and remove it
                from our servers.
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            {albumId ? (
              <Button
                type="button"
                variant={'destructive'}
                className="cursor-pointer"
                onClick={() => handleAction('remove', photos[index]?.id)}
              >
                Remove Image
              </Button>
            ) : (
              <Button
                type="button"
                variant={'destructive'}
                className="cursor-pointer"
                onClick={() => handleAction('delete', photos[index]?.id)}
              >
                Delete Image
              </Button>
            )}
            <DialogClose asChild>
              <Button type="button" className="cursor-pointer">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        className="z-50!"
        toolbar={{
          buttons: [
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="yarl__button outline-none">
                  <MoreVertical className="text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[9999]! w-48 bg-zinc-900/50 backdrop-blur-md border-white/10 text-white"
              >
                <DropdownMenuItem
                  onClick={toggleCounter}
                  className="focus:bg-primary/20 focus:text-primary cursor-pointer"
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
                  className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                >
                  {isCaptionVisible ? (
                    <EyeOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {isCaptionVisible ? 'Hide captions' : 'Show captions'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => downloadExternalFile(photos[index]?.url, photos[index]?.id)}
                  className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
                {type === 'private' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => toggleDialog('open', photos[index]?.id, photos[index]?.url)}
                      className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                    >
                      <AlbumIcon className="mr-2 h-4 w-4" />
                      <span>Import to album</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        toggleDialog('edit', photos[index]?.id, photos[index]?.url);
                        setInitialValues({
                          title: photos[index]?.title ?? '',
                          description: photos[index]?.description ?? '',
                          published: photos[index]?.published ?? false,
                          albumId: albumId ?? '',
                          showPrivateToFollowers: photos[index]?.showPrivateToFollowers ?? false,
                        });
                      }}
                      className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      <span>Edit Image</span>
                    </DropdownMenuItem>
                    {photos[index]?.published ? (
                      <DropdownMenuItem
                        onClick={() => handleAction('private', photos[index]?.id)}
                        className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Set to Private</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleAction('public', photos[index]?.id)}
                        className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                      >
                        <Unlock className="mr-2 h-4 w-4" />
                        <span>Set to Public</span>
                      </DropdownMenuItem>
                    )}
                    {!photos[index]?.published && !photos[index]?.showPrivateToFollowers && (
                      <DropdownMenuItem
                        onClick={() => handleAction('showPrivateToFollowers', photos[index]?.id)}
                        className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Show to Followers</span>
                      </DropdownMenuItem>
                    )}
                    {!photos[index]?.published && photos[index]?.showPrivateToFollowers && (
                      <DropdownMenuItem
                        onClick={() => handleAction('hidePrivateToFollowers', photos[index]?.id)}
                        className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                      >
                        <EyeOff className="mr-2 h-4 w-4" />
                        <span>Hide from Followers</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    {albumId && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          photoGalleryStore.setState(() => {
                            return {
                              photoId: photos[index]?.id || '',
                              isOpen: true,
                              albumId,
                            };
                          });
                        }}
                        className="focus:bg-red-500/20 text-red-400 focus:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Remove from album</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        photoGalleryStore.setState((prev) => {
                          return {
                            ...prev,
                            photoId: photos[index]?.id || '',
                            isOpen: true,
                          };
                        });
                      }}
                      className="focus:bg-red-500/20 text-red-400 focus:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete Image</span>
                    </DropdownMenuItem>
                  </>
                )}
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
        slides={photos.map((photo) => {
          return {
            src: photo.url,
            alt: photo.id,
            title: photo.title ?? '',
            description: photo.description ?? '',
            download: `${photo.url}?download`,
          };
        })}
      />
    </div>
  );
}
