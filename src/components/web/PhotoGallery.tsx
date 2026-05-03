import { IconDownload } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { createStore, useSelector } from "@tanstack/react-store";
import { AlbumIcon, Eye, EyeOff, Lock, MoreVertical, Trash2, Unlock } from "lucide-react";
import { useRef, useState } from "react";
import { Masonry } from "react-plock";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
// import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Share from "yet-another-react-lightbox/plugins/share";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteImageFn, SetPrivateImageFn, SetPublicImageFn } from "@/data/image";
import { Image } from "@/generated/prisma/client";
import { useImageStore } from "@/store/image";

// custom image modal or lightbox
// import { ImageModal } from './ImageModal';

const photoGalleryStore = createStore({
  isOpen: false,
  isCounterVisible: true,
  photoId: "",
});

async function downloadExternalFile(externalUrl: string, fileName: string) {
  try {
    const response = await fetch(externalUrl, {
      method: "GET",
      mode: "cors",
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("External download failed:", error);
    window.open(externalUrl, "_blank");
  }
}

export default function PhotoGallery({
  images,
  type,
}: {
  images: Image[];
  type?: "public" | "private";
}) {
  const isOpen = useSelector(photoGalleryStore, (state) => state.isOpen);
  const isCounterVisible = useSelector(photoGalleryStore, (state) => state.isCounterVisible);
  const { toggleDialog } = useImageStore();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const fullscreenRef = useRef(null);
  // const slideshowRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const zoomRef = useRef(null);
  const router = useRouter();
  const photos = images.map((photo, index) => ({
    ...photo,
    globalIndex: index,
  }));

  async function handleAction(action: string, photoId: string) {
    console.log(`Action: ${action} for Photo: ${photoId}`);
    if (action === "public") {
      await SetPublicImageFn({
        data: {
          imageId: photoId,
        },
      });
      toast.success("Photo successfully set to public");
      void router.invalidate();
    } else if (action === "private") {
      await SetPrivateImageFn({
        data: {
          imageId: photoId,
        },
      });
      toast.success("Photo successfully set to private");
      void router.invalidate();
    } else if (action === "delete") {
      await DeleteImageFn({
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
      toast.success("Photo deleted successfully");
      void router.invalidate();
    }
  }
  if (type === "private") {
    return (
      <div className="p-4 min-h-screen">
        <Masonry
          items={photos}
          config={{
            columns: [1, 2, 3, 4], // 1 col on mobile, 2 on sm, 3 on md, 4 on lg
            gap: [16, 20, 24], // gap sizes in pixels corresponding to breakpoints
            media: [640, 768, 1024], // tailwind's default breakpoints
            useBalancedLayout: true,
          }}
          render={(photo, idx) => {
            return (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                  className="w-full h-auto display:block transition-transform duration-500 group-hover:scale-105 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                  onClick={() => {
                    setOpen(true);
                    setIndex(photo.globalIndex);
                  }}
                />

                {/*<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                              <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                              <p className="text-gray-200 text-xs">{photo.category}</p>
                            </div>*/}
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
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                variant={"destructive"}
                className="cursor-pointer"
                onClick={() => handleAction("delete", photos[index].id)}
              >
                Delete Image
              </Button>
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
                    onClick={() =>
                      photoGalleryStore.setState((prev) => ({
                        ...prev,
                        isCounterVisible: !prev.isCounterVisible,
                      }))
                    }
                    className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                  >
                    {isCounterVisible ? (
                      <EyeOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Eye className="mr-2 h-4 w-4" />
                    )}
                    {isCounterVisible ? "Hide slide counter" : "Show slide counter"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleDialog("open", photos[index].id, photos[index].url)}
                    className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                  >
                    <AlbumIcon className="mr-2 h-4 w-4" />
                    <span>Import to album</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAction("public", photos[index].id)}
                    className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    <span>Set Public</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAction("private", photos[index].id)}
                    className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Set Private</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => downloadExternalFile(photos[index].url, photos[index].id)}
                    className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                  >
                    <IconDownload className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
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
                </DropdownMenuContent>
              </DropdownMenu>,
              "close",
            ],
          }}
          on={{ view: ({ index: currentIndex }) => setIndex(currentIndex) }}
          close={() => setOpen(false)}
          plugins={[Fullscreen, Share, Thumbnails, Zoom, Counter]}
          fullscreen={{ ref: fullscreenRef }}
          // slideshow={{ ref: slideshowRef }}
          thumbnails={{
            ref: thumbnailsRef,
            showToggle: true,
            hidden: true,
            vignette: false,
            borderColor: "transparent",
          }}
          zoom={{ ref: zoomRef }}
          counter={{
            container: {
              style: {
                top: "unset",
                bottom: "-25px",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "oklch(69.6% 0.17 162.48)",
                display: isCounterVisible ? "flex" : "none",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "fit-content",
              },
            },
          }}
          styles={{
            root: {
              backgroundColor: "transparent",
              backdropFilter: "blur(24px)",
            },
            container: {
              backgroundColor: "transparent",
              backdropFilter: "blur(24px)",
            },
            button: {
              color: "oklch(69.6% 0.17 162.48)",
            },
            thumbnailsContainer: {
              backgroundColor: "transparent",
              backdropFilter: "blur(24px)",
            },
            thumbnailsTrack: {
              backgroundColor: "transparent",
            },
            thumbnail: {
              backgroundColor: "transparent",
            },
          }}
          slides={photos.map((photo) => {
            return {
              src: photo.url,
              alt: photo.id,
            };
          })}
        />
      </div>
    );
  }
  return (
    <div className="p-4 min-h-screen">
      <Masonry
        items={photos}
        config={{
          columns: [1, 2, 3, 4], // 1 col on mobile, 2 on sm, 3 on md, 4 on lg
          gap: [16, 20, 24], // gap sizes in pixels corresponding to breakpoints
          media: [640, 768, 1024], // tailwind's default breakpoints
          useBalancedLayout: true,
        }}
        render={(photo, idx) => {
          return (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                className="w-full h-auto display:block transition-transform duration-500 group-hover:scale-105 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                onClick={() => {
                  setOpen(true);
                  setIndex(photo.globalIndex);
                }}
              />

              {/*<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                              <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                              <p className="text-gray-200 text-xs">{photo.category}</p>
                            </div>*/}
            </div>
          );
        }}
      />
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
                  onClick={() =>
                    photoGalleryStore.setState((prev) => ({
                      ...prev,
                      isCounterVisible: !prev.isCounterVisible,
                    }))
                  }
                  className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer"
                >
                  {isCounterVisible ? (
                    <EyeOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {isCounterVisible ? "Hide slide counter" : "Show slide counter"}
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
            "close",
          ],
        }}
        on={{ view: ({ index: currentIndex }) => setIndex(currentIndex) }}
        close={() => setOpen(false)}
        plugins={[Fullscreen, Share, Thumbnails, Zoom, Counter]}
        fullscreen={{ ref: fullscreenRef }}
        // slideshow={{ ref: slideshowRef }}
        thumbnails={{
          ref: thumbnailsRef,
          showToggle: true,
          hidden: true,
          vignette: false,
          borderColor: "transparent",
        }}
        zoom={{ ref: zoomRef }}
        counter={{
          container: {
            style: {
              top: "unset",
              bottom: "-25px",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "oklch(69.6% 0.17 162.48)",
              display: isCounterVisible ? "flex" : "none",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "fit-content",
            },
          },
        }}
        styles={{
          root: {
            backgroundColor: "transparent",
            backdropFilter: "blur(24px)",
          },
          container: {
            backgroundColor: "transparent",
            backdropFilter: "blur(24px)",
          },
          button: {
            color: "oklch(69.6% 0.17 162.48)",
          },
          thumbnailsContainer: {
            // backgroundColor: 'transparent',
            // backdropFilter: 'blur(24px)',
          },
          thumbnail: {
            backgroundColor: "transparent",
          },
        }}
        slides={photos.map((photo) => {
          return {
            src: photo.url,
            alt: photo.id,
          };
        })}
      />
    </div>
  );
}
