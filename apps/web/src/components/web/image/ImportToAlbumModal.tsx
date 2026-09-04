import { IconAlbumOff } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Effect } from "effect";
import { FolderIcon, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAlbumsFn } from "@/data/album";
import { ImportImageToAlbumFn } from "@/data/image";
import {
  dashboardAlbumIdOptions,
  imageGalleryOptions,
} from "@/data/query-options/dashboardQueryOptions";
import { useImageStore } from "@/store/image";

export function ImportToAlbumModal() {
  const queryClient = useQueryClient();
  const { isImportToAlbumModalOpen, onOpenChangeDialog, imageId, imageUrl, toggleDialog } =
    useImageStore();
  const router = useRouter();
  const navigate = useNavigate();
  const { data: albums, isPending } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const albums = await getAlbumsFn();
      return albums;
    },
    enabled: imageId && imageUrl && isImportToAlbumModalOpen ? true : false,
  });

  async function handleImportToAlbum(albumId: string) {
    const importFlow = Effect.gen(function* () {
      toast.loading("Adding image to ablum...", {
        description: `Album | ${albums?.find((album) => album.id === albumId)?.name}`,
        id: "add-album",
      });
      yield* Effect.tryPromise(() =>
        ImportImageToAlbumFn({
          data: {
            albumId,
            imageId,
            imageUrl,
          },
        }),
      );
      toast.success("Image added to album successfully", {
        id: "add-album",
        description: `Album | ${albums?.find((album) => album.id === albumId)?.name}`,
      });
    }).pipe(
      Effect.catchAll((error) =>
        Effect.sync(() => {
          toast.error("Failed to add image to album", {
            id: "add-album",
          });
          console.error(error.message);
        }),
      ),
      Effect.ensuring(
        Effect.sync(() => {
          toggleDialog("close");
          void router.invalidate();
          void queryClient.invalidateQueries({
            queryKey: ["albums"],
          });
          void queryClient.invalidateQueries({
            queryKey: [...imageGalleryOptions().queryKey],
          });
          void queryClient.invalidateQueries({
            queryKey: [...dashboardAlbumIdOptions(albumId).queryKey],
          });
        }),
      ),
    );
    await Effect.runPromise(importFlow);
  }

  const albumsNotOwnThisImage = albums?.filter((album) => {
    const hasImage = album.images.some((image) => image.id === imageId);
    return !hasImage;
  });

  return (
    <Dialog
      open={isImportToAlbumModalOpen}
      onOpenChange={(open) => {
        onOpenChangeDialog("open", open);
      }}
    >
      <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-zinc-800 bg-zinc-950">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          <div className="w-full max-md:hidden md:w-2/5 p-8 border-r border-zinc-800/50 bg-zinc-900/20">
            <DialogHeader className="mb-8">
              <div className="bg-primary/10 w-fit p-2 rounded-lg mb-4">
                <ImageIcon className="text-primary size-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-zinc-100">Image Import</DialogTitle>

              <DialogDescription className="text-zinc-400">
                Import this image to the existing album.
              </DialogDescription>
            </DialogHeader>
            <div className="relative group max-md:aspect-square max-md:max-w-xs sm:aspect-4/5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl mx-auto">
              <img
                src={imageUrl}
                alt={imageId}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 "
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x800?text=Invalid+Image";
                }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex flex-1 flex-col items-start justify-start bg-[#09090b] relative overflow-y-auto my-4">
            <div className="w-full px-12 relative z-10">
              <h3 className="text-center text-xl font-black">Your Albums</h3>
              <p className="text-xs font-medium text-slate-500  tracking-widest  text-center">
                Select an album to save.
              </p>
              {!albumsNotOwnThisImage?.length && !isPending && (
                <Empty className="border border-dashed w-full mx-auto mt-3">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconAlbumOff />
                    </EmptyMedia>
                    <EmptyTitle>Every album has the Image</EmptyTitle>
                    <EmptyDescription>
                      You save this image on all available albums!
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        void navigate({
                          to: "/dashboard/albums",
                        });
                      }}
                    >
                      Create Album
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
              {isPending ? (
                <section className="w-full h-full flex justify-center items-center">
                  <Loader2 className="animate-spin size-8 text-primary" />
                </section>
              ) : (
                <section className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:gird-cols-5 gap-4 mt-3">
                  {albumsNotOwnThisImage?.map((album) => {
                    const coverImage = album.coverImageUrl || album.images?.[0]?.url;
                    return (
                      <figure
                        className="group flex flex-col gap-3 outline-none cursor-pointer max-sm:mx-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          void handleImportToAlbum(album.id);
                        }}
                      >
                        <div className="relative aspect-square w-full  overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-all group-hover:shadow-2xl group-hover:shadow-primary/10 group-focus:ring-2 group-focus:ring-primary">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={album.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-950">
                              <FolderIcon className="size-12 text-slate-800" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col px-1 max-sm:text-center">
                          <h3 className="truncate text-sm font-bold text-slate-200 transition-colors group-hover:text-primary-400">
                            {album.name}
                          </h3>
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
                            {album._count?.images || 0} items
                          </p>
                        </div>
                      </figure>
                    );
                  })}
                </section>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
