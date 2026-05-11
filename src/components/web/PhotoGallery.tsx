import { IconDownload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
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
import { useRef, useState } from 'react';
import { Masonry } from 'react-plock';
import { toast } from 'sonner';
import Lightbox from 'yet-another-react-lightbox';
import { ZoomRef, ThumbnailsRef, FullscreenRef } from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
// import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import Counter from 'yet-another-react-lightbox/plugins/counter';
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
import { Image } from '@/generated/prisma/client';
import { useImageStore } from '@/store/image';
import { photoGalleryStore } from '@/store/photoGallery';

async function downloadExternalFile(externalUrl: string, fileName: string) {
  try {
    const response = await fetch(externalUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('External download failed:', error);
    window.open(externalUrl, '_blank');
  }
}

export default function PhotoGallery({
  images,
  type,
  albumId,
}: {
  images: Image[];
  type?: 'public' | 'private';
  albumId?: string;
}) {
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
    queryKey: ['album', albumId],
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

  async function handleAction(action: string, photoId: string) {
    console.log(`Action: ${action} for Photo: ${photoId}`);
    if (action === 'public') {
      toast.loading('Updating...', {
        id: 'action',
      });
      await setPublicImageFn({
        data: {
          imageId: photoId,
        },
      });
      toast.dismiss('action');
      toast.success('Photo successfully set to public');
      void router.invalidate();
    } else if (action === 'private') {
      toast.loading('Updating...', {
        id: 'action',
      });
      await setPrivateImageFn({
        data: {
          imageId: photoId,
        },
      });
      toast.dismiss('action');
      toast.success('Photo successfully set to private');
      void router.invalidate();
    } else if (action === 'show-private-to-followers') {
      toast.loading('Updating...', {
        id: 'action',
      });
      await setShowPrivateImageToFollowersFn({
        data: {
          imageId: photoId,
        },
      });
      toast.dismiss('action');
      toast.success('This private photo is now visible to followers');
      void router.invalidate();
    } else if (action === 'hide-private-to-followers') {
      toast.loading('Updating...', {
        id: 'action',
      });
      await setHidePrivateImageToFollowersFn({
        data: {
          imageId: photoId,
        },
      });
      toast.dismiss('action');
      toast.success('This private photo is now hidden to followers');
      void router.invalidate();
    } else if (action === 'remove-image' && albumId) {
      toast.loading('Updating...', {
        id: 'action',
      });
      await removeImageFromAlbumFn({
        data: {
          imageId: photoId,
          albumId: albumId,
        },
      });
      photoGalleryStore.setState((prev) => {
        return {
          ...prev,
          isOpen: false,
        };
      });
      toast.dismiss('action');
      toast.success('Photo remove from album successfully');
      void router.invalidate();
    } else if (action === 'delete') {
      toast.loading('Updating...', {
        id: 'action',
      });
      await deleteImageFn({
        data: {
          imageId: photoId,
        },
      });
      photoGalleryStore.setState((prev) => {
        return {
          ...prev,
          isOpen: false,
        };
      });
      toast.dismiss('action');
      toast.success('Photo deleted successfully');
      void router.invalidate();
    }
  }

  return (
    <div className="p-4 min-h-screen">
      <Masonry
        items={photos}
        config={{
          columns: [1, 2, 3, 4], // 1 col on mobile, 2 on sm, 3 on md, 4 on lg
          gap: [16, 20, 24], // gap sizes in pixels corresponding to breakpoints
          media: [640, 768, 1024], // tailwind's default breakpoints
          // useBalancedLayout: true,
        }}
        render={(photo, idx) => {
          return (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer "
              onClick={() => {
                setOpen(true);
                setIndex(photo.globalIndex);
              }}
            >
              {/*<ImageModal
                    imageUrl={photo.url}
                    className="w-full h-auto display:block transition-transform duration-500 group-hover:scale-105"
                    images={images}
                    imageOrder={photo.globalIndex}
                  />*/}
              <img
                src={photo.url}
                alt={photo.id}
                className="w-full h-auto display:block transition-transform duration-500 group-hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                loading="lazy"
              />
              {(photo.title || photo.description) && (
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                  <p className="text-gray-200 text-xs">{photo.description}</p>
                </div>
              )}
            </div>
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
                <span className="text-emerald-500 font-bold">{album?.name}</span>
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
                onClick={() => handleAction('remove-image', photos[index].id)}
              >
                Remove Image
              </Button>
            ) : (
              <Button
                type="button"
                variant={'destructive'}
                className="cursor-pointer"
                onClick={() => handleAction('delete', photos[index].id)}
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
                {type === 'private' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => toggleDialog('open', photos[index].id, photos[index].url)}
                      className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                    >
                      <AlbumIcon className="mr-2 h-4 w-4" />
                      <span>Import to album</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        toggleDialog('edit', photos[index].id, photos[index].url);
                        setInitialValues({
                          title: photos[index].title ?? '',
                          description: photos[index].description ?? '',
                          published: photos[index].published ?? false,
                          albumId: albumId ?? '',
                          showPrivateToFollowers: photos[index].showPrivateToFollowers ?? false,
                        });
                      }}
                      className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      <span>Edit Image</span>
                    </DropdownMenuItem>
                    {photos[index].published ? (
                      <DropdownMenuItem
                        onClick={() => handleAction('private', photos[index].id)}
                        className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Set to Private</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleAction('public', photos[index].id)}
                        className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                      >
                        <Unlock className="mr-2 h-4 w-4" />
                        <span>Set to Public</span>
                      </DropdownMenuItem>
                    )}
                    {!photos[index].published && !photos[index].showPrivateToFollowers && (
                      <DropdownMenuItem
                        onClick={() => handleAction('show-private-to-followers', photos[index].id)}
                        className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Show to Followers</span>
                      </DropdownMenuItem>
                    )}
                    {!photos[index].published && photos[index].showPrivateToFollowers && (
                      <DropdownMenuItem
                        onClick={() => handleAction('hide-private-to-followers', photos[index].id)}
                        className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
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
                              photoId: photos[index].id,
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
                            photoId: photos[index].id,
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
        close={() => setOpen(false)}
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
