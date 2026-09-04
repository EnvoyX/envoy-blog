import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Effect } from "effect";
import { CheckCircle2, ImageIcon, Loader2, MousePointer2, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";

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
  //   EmptyContent,
  EmptyDescription,
  EmptyHeader,
  //   EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { deleteImagesFn, getImagesFn } from "@/data/image";
import { imageGalleryOptions } from "@/data/query-options/dashboardQueryOptions";
import { cn } from "@/lib/utils";
import { useImageStore } from "@/store/image";

export function BulkImageDialog() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isBulkImageDialogOpen, onOpenChangeDialog, bulkMode } = useImageStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { data: images, isPending } = useQuery({
    queryKey: ["all-images"],
    queryFn: async () => {
      const images = await getImagesFn();
      return images;
    },
    enabled: isBulkImageDialogOpen,
  });
  const toggleSelection = (id: string, isShift: boolean = false) => {
    const currentImages = images ?? [];
    const currentIndex = currentImages.findIndex((img) => img.id === id);
    const lastIndex = currentImages.findIndex((img) => img.id === lastSelectedId);
    // handle shift + click for range selection
    if (isShift && lastSelectedId && lastIndex !== -1 && currentIndex !== -1) {
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);

      const rangedImages = currentImages.slice(start, end + 1);
      const newSelection = new Set(selectedIds);
      rangedImages.forEach((image) => {
        if (!newSelection.has(image.id)) newSelection.add(image.id);
      });

      setLastSelectedId(id);
      setSelectedIds(newSelection);
      return;
    }

    // handle single toggle selection
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
      setLastSelectedId(null);
    } else {
      newSelection.add(id);
      setLastSelectedId(id);
    }
    setSelectedIds(newSelection);
  };

  const deleteImagesEffect = (imageIds: string[]) =>
    Effect.tryPromise(() => deleteImagesFn({ data: { imageIds } }));

  const runCleanup = Effect.sync(() => {
    void queryClient.invalidateQueries({ queryKey: ["all-images"] });
    void queryClient.invalidateQueries({
      queryKey: [...imageGalleryOptions().queryKey],
    });
    void router.invalidate();
    setIsImporting(false);
  });
  async function handleBulkImport() {
    setIsImporting(true);
    const idsArray = Array.from(selectedIds);

    const modeConfig = {
      delete: {
        action: () => deleteImagesEffect(idsArray),
        msg: `Deleting ${idsArray.length} images...`,
        success: `Images deleted successfully`,
        failed: "Failed to delete images",
      },
    };
    const currentMode = modeConfig[bulkMode as keyof typeof modeConfig];
    if (!currentMode) return;
    const importWorkflow = Effect.gen(function* () {
      toast.loading(currentMode.msg, { id: "bulk-import" });

      yield* currentMode.action();

      // success side effects
      toast.success(currentMode.success, { id: "bulk-import" });
      setSelectedIds(new Set());
      onOpenChangeDialog("bulk-delete", false);
    }).pipe(
      Effect.catchAll((error) =>
        Effect.sync(() => {
          toast.error(currentMode.failed, { id: "bulk-import" });
          console.error(error.message);
        }),
      ),
      Effect.ensuring(runCleanup),
    );
    await Effect.runPromise(importWorkflow);
  }

  useEffect(() => {
    setSelectedIds(new Set());
  }, []);
  return (
    <Dialog
      open={isBulkImageDialogOpen}
      onOpenChange={(open) => onOpenChangeDialog("bulk-delete", open)}
    >
      <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-zinc-800  shadow-2xl">
        <div className="flex flex-col md:flex-row h-[85vh] ">
          <div className="flex flex-1 flex-col bg-[#09090b] relative overflow-hidden">
            <div className="flex max-sm:flex-col max-sm:gap-4 items-center sm:justify-between px-8 py-6 border-b-2 border-zinc-500/50 backdrop-blur-md z-20">
              <div className="flex items-center gap-2">
                <div className="bg-primary-500/10 w-fit p-3 rounded-2xl mb-4 shadow-inner">
                  <ImageIcon className="text-primary-500 size-6" />
                </div>
                <DialogHeader className="flex flex-col">
                  <DialogTitle className="text-2xl font-bold text-zinc-100 tracking-tight">
                    {match(bulkMode)
                      .with("add", () => "Add Photos")
                      .with("remove", () => "Remove Photos")
                      .with("delete", () => "Delete Photos")
                      .with("edit", () => "Edit Photos")
                      .with(null, () => "Bulk Image Dialog")
                      .otherwise(() => "Bulk Image Dialog")}
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    {match(bulkMode)
                      .with("add", () => (
                        <>
                          Add <span className="text-primary-400 font-semibold">Images</span>
                        </>
                      ))
                      .with("delete", () => (
                        <>
                          Delete <span className="text-primary-400 font-semibold">Images</span>
                        </>
                      ))
                      .with("remove", () => (
                        <>
                          Remove <span className="text-primary-400 font-semibold">Images</span>
                        </>
                      ))
                      .with("edit", () => (
                        <>
                          Edit <span className="text-primary-400 font-semibold">Images</span>
                        </>
                      ))
                      .with(null, () => (
                        <>
                          Bulk Import <span className="text-primary-400 font-semibold">Images</span>
                        </>
                      ))
                      .otherwise(() => (
                        <>
                          Bulk Import <span className="text-primary-400 font-semibold">Images</span>
                        </>
                      ))}
                  </DialogDescription>
                </DialogHeader>
              </div>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleBulkImport}
                    disabled={isImporting}
                    className={cn(
                      "bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-2 font-bold shadow-lg shadow-primary-900/20 animate-in fade-in zoom-in duration-300 cursor-pointer",
                      {
                        "bg-destructive hover:bg-destructive/80 shadow-destructive/20":
                          bulkMode === "delete" || bulkMode === "remove",
                      },
                    )}
                  >
                    {match(isImporting)
                      .with(true, () => <Loader2 className="size-4 animate-spin" />)
                      .with(false, () => <CheckCircle2 className="size-4" />)
                      .exhaustive()}
                    {match(bulkMode)
                      .with("add", () => <>Import ({selectedIds.size})</>)
                      .with("remove", () => <>Remove ({selectedIds.size})</>)
                      .with("delete", () => <>Delete ({selectedIds.size})</>)
                      .with("edit", () => <>Edit ({selectedIds.size})</>)
                      .with(null, () => null)
                      .otherwise(() => null)}
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className={cn(
                      "bg-destructive/75 hover:bg-destructive/90 text-white rounded-xl font-bold shadow-lg shadow-destructive/20 animate-in fade-in zoom-in duration-300 cursor-pointer",
                    )}
                    onClick={() => {
                      setSelectedIds(new Set());
                      setLastSelectedId(null);
                    }}
                  >
                    <RotateCw className="size-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide relative">
              {match({ isPending, hasImages: !!images?.length })
                .with({ isPending: true }, () => (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin size-10 text-primary-500" />
                      <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                        Loading Images...
                      </p>
                    </div>
                  </div>
                ))
                .with({ isPending: false, hasImages: true }, () => (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {images?.map((img) => {
                      const isSelected = selectedIds.has(img.id);
                      return (
                        <div
                          key={img.id}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleSelection(img.id, e.shiftKey);
                          }}
                          className={`
                            group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                            ${
                              isSelected
                                ? "ring-4 ring-primary-500 ring-offset-4 ring-offset-zinc-950 scale-[0.98]"
                                : "hover:scale-[1.02] border border-zinc-800"
                            }
                          `}
                        >
                          <img
                            src={img.url}
                            alt="Asset"
                            className={`w-full h-full object-cover transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
                          />

                          {/* selection overlay */}
                          <div
                            className={`absolute inset-0 transition-colors duration-300 ${isSelected ? "bg-primary-500/10" : "bg-transparent group-hover:bg-black/20"}`}
                          />

                          {/* status icon */}
                          <div
                            className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-300 ${isSelected ? "bg-primary-500 scale-100 shadow-lg" : "bg-zinc-900/80 opacity-0 group-hover:opacity-100 scale-50"}`}
                          >
                            <CheckCircle2 className="size-4 text-white" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
                .with({ isPending: false, hasImages: false }, () => (
                  <div className="h-full flex items-center justify-center">
                    <Empty className="border border-dashed border-zinc-800 bg-zinc-900/20 p-12 rounded-3xl">
                      <EmptyHeader>
                        <div className="mx-auto bg-zinc-800/50 p-4 rounded-full mb-4">
                          <MousePointer2 className="size-8 text-zinc-600" />
                        </div>
                        <EmptyTitle className="text-zinc-300">No images</EmptyTitle>
                        <EmptyDescription className="text-zinc-500">
                          No images available to select
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                ))
                .exhaustive()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
