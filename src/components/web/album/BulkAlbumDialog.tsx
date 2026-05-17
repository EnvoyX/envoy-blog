import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { CheckCircle2, ImageIcon, Loader2, MousePointer2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from '@/components/ui/dialog';
import {
  Empty,
  //   EmptyContent,
  EmptyDescription,
  EmptyHeader,
  //   EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { addExistingImagesToAlbumFn, removeExistingImagesToAlbumFn } from '@/data/album';
import { deleteImagesFn, getImagesWithAlbumsFn } from '@/data/image';
import { cn } from '@/lib/utils';
import { useAlbumStore } from '@/store/album';

export function BulkAlbumDialog() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isBulkDialogImportOpen, onOpenDialogChange, initialValues, currentAlbumId, bulkMode } =
    useAlbumStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const { data: images, isPending } = useQuery({
    queryKey: ['available-images', currentAlbumId],
    queryFn: async () => {
      const images = await getImagesWithAlbumsFn();
      return images;
    },
    enabled: isBulkDialogImportOpen,
  });
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  async function handleBulkImport() {
    setIsImporting(true);
    const idsArray = Array.from(selectedIds);

    try {
      if (bulkMode === 'add' && currentAlbumId) {
        toast.loading(`Importing ${idsArray.length} images...`, { id: 'bulk-import' });
        await addExistingImagesToAlbumFn({
          data: {
            albumId: currentAlbumId,
            imageIds: idsArray,
          },
        });

        toast.success(`Images added successfully to ${initialValues?.name}`, {
          id: 'bulk-import',
        });
        setSelectedIds(new Set());
        onOpenDialogChange('bulk', false);
        void queryClient.invalidateQueries({ queryKey: ['available-images', currentAlbumId] });
        void router.invalidate();
      } else if (bulkMode === 'remove' && currentAlbumId) {
        toast.loading(`Deleting ${idsArray.length} images...`, { id: 'bulk-import' });
        await removeExistingImagesToAlbumFn({
          data: {
            albumId: currentAlbumId,
            imageIds: idsArray,
          },
        });
        toast.success(`Images removed successfully from ${initialValues?.name}`, {
          id: 'bulk-import',
        });
        setSelectedIds(new Set());
        onOpenDialogChange('bulk', false);
        void queryClient.invalidateQueries({ queryKey: ['available-images', currentAlbumId] });
        void router.invalidate();
      } else if (bulkMode === 'delete' && currentAlbumId) {
        toast.loading(`Deleting ${idsArray.length} images...`, { id: 'bulk-import' });
        await deleteImagesFn({
          data: {
            imageIds: idsArray,
          },
        });
        toast.success(`Images deleted successfully from ${initialValues?.name}`, {
          id: 'bulk-import',
        });
        setSelectedIds(new Set());
        onOpenDialogChange('bulk', false);
        void queryClient.invalidateQueries({ queryKey: ['available-images', currentAlbumId] });
        void router.invalidate();
      }
    } catch (error) {
      toast.error('Failed to import images', { id: 'bulk-import' });
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  }

  function handlePhotos() {
    const imagesInAlbum = images?.filter((image) => {
      return image?.albums?.some((album) => album.id === currentAlbumId);
    });
    if (!initialValues?.addPhotos && (bulkMode === 'remove' || bulkMode === 'delete'))
      return imagesInAlbum;
    const imagesNotInAlbum = images?.filter((image) => {
      const existingImages = new Set(imagesInAlbum?.map((image) => image.id));
      return !existingImages.has(image.id);
    });

    return imagesNotInAlbum;
  }

  const targetImages = handlePhotos();

  useEffect(() => {
    setSelectedIds(new Set());
  }, [initialValues?.addPhotos]);
  return (
    <Dialog open={isBulkDialogImportOpen} onOpenChange={(open) => onOpenDialogChange('bulk', open)}>
      <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-zinc-800  shadow-2xl">
        <div className="flex flex-col md:flex-row h-[85vh] ">
          <div className="w-full md:w-1/3 max-md:hidden p-8 border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col">
            <DialogHeader className="mb-8">
              <div className="bg-emerald-500/10 w-fit p-3 rounded-2xl mb-4 shadow-inner">
                <ImageIcon className="text-emerald-500 size-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-zinc-100 tracking-tight">
                {bulkMode === 'add'
                  ? 'Add Photos'
                  : bulkMode === 'remove'
                    ? 'Remove Photos'
                    : 'Delete Photos'}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {bulkMode === 'add' ? (
                  <>
                    Adding to{' '}
                    <span className="text-emerald-400 font-semibold">{initialValues?.name}</span>
                  </>
                ) : bulkMode === 'remove' ? (
                  <>
                    Remove from{' '}
                    <span className="text-emerald-400 font-semibold">{initialValues?.name}</span>
                  </>
                ) : (
                  <>
                    Delete from{' '}
                    <span className="text-emerald-400 font-semibold">{initialValues?.name}</span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="relative group aspect-square w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2">
              <img
                src={initialValues?.coverImageUrl}
                alt="Album Cover"
                className="object-cover w-full h-full rounded-xl opacity-60 transition-all duration-700"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-zinc-950/40">
                <p className="text-xs font-mono text-emerald-400 uppercase tracking-[0.2em] mb-2">
                  Album
                </p>
                <h4 className="text-lg font-bold text-white leading-tight">
                  {initialValues?.name}
                </h4>
              </div>
            </div>

            <div className="mt-auto pt-6 space-y-4">
              <div
                className={cn('p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10', {
                  'bg-destructive/5 border-destructive/10': !initialValues?.addPhotos,
                })}
              >
                <p
                  className={cn(
                    'text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1 text-center',
                    {
                      'text-destructive/70': !initialValues?.addPhotos,
                    },
                  )}
                >
                  Selection Status
                </p>
                <p className="text-3xl font-black text-white text-center">{selectedIds.size}</p>
                <p className="text-[10px] text-zinc-500 text-center uppercase">Images Picked</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col bg-[#09090b] relative overflow-hidden">
            <div className="flex max-sm:flex-col max-sm:gap-4 items-center sm:justify-between px-8 py-6 border-b border-zinc-800/50 bg-zinc-950/25 backdrop-blur-md z-20">
              <div className="max-sm:text-center">
                <h3 className="text-lg max-sm:text-2xl font-bold text-zinc-100">
                  {' '}
                  {bulkMode === 'add'
                    ? 'Add Photos'
                    : bulkMode === 'remove'
                      ? 'Remove Photos'
                      : 'Delete Photos'}
                </h3>
                <DialogHeader className="md:hidden">
                  <DialogDescription className="text-zinc-400">
                    {bulkMode === 'add' ? (
                      <>
                        Adding to{' '}
                        <span className="text-emerald-400 font-semibold">
                          {initialValues?.name}
                        </span>
                      </>
                    ) : bulkMode === 'remove' ? (
                      <>
                        Remove from{' '}
                        <span className="text-emerald-400 font-semibold">
                          {initialValues?.name}
                        </span>
                      </>
                    ) : (
                      <>
                        Delete from{' '}
                        <span className="text-emerald-400 font-semibold">
                          {initialValues?.name}
                        </span>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <p className="text-xs text-zinc-500">
                  Select images to{' '}
                  {bulkMode === 'add'
                    ? 'add to'
                    : bulkMode === 'remove'
                      ? 'remove from'
                      : 'delete from'}{' '}
                  this album
                </p>
              </div>
              {selectedIds.size > 0 && (
                <Button
                  onClick={handleBulkImport}
                  disabled={isImporting}
                  className={cn(
                    'bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 font-bold shadow-lg shadow-emerald-900/20 animate-in fade-in zoom-in duration-300 cursor-pointer',
                    {
                      'bg-destructive hover:bg-destructive/80 shadow-destructive/20':
                        !initialValues?.addPhotos,
                    },
                  )}
                >
                  {isImporting ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="size-4 mr-2" />
                  )}
                  {bulkMode === 'add' ? (
                    <>Confirm Import ({selectedIds.size})</>
                  ) : bulkMode === 'remove' ? (
                    <>Confirm Remove ({selectedIds.size})</>
                  ) : (
                    <>Confirm Delete ({selectedIds.size})</>
                  )}
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
              {isPending ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin size-10 text-emerald-500" />
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                      Loading Images...
                    </p>
                  </div>
                </div>
              ) : images?.length ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {targetImages?.map((img) => {
                    const isSelected = selectedIds.has(img.id);
                    return (
                      <div
                        key={img.id}
                        onClick={() => toggleSelection(img.id)}
                        className={`
                          group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                          ${
                            isSelected
                              ? 'ring-4 ring-emerald-500 ring-offset-4 ring-offset-zinc-950 scale-[0.98]'
                              : 'hover:scale-[1.02] border border-zinc-800'
                          }
                        `}
                      >
                        <img
                          src={img.url}
                          alt="Asset"
                          className={`w-full h-full object-cover transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                        />

                        {/* selection overlay */}
                        <div
                          className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-emerald-500/10' : 'bg-transparent group-hover:bg-black/20'}`}
                        />

                        {/* status icon */}
                        <div
                          className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-300 ${isSelected ? 'bg-emerald-500 scale-100 shadow-lg' : 'bg-zinc-900/80 opacity-0 group-hover:opacity-100 scale-50'}`}
                        >
                          <CheckCircle2 className="size-4 text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Empty className="border border-dashed border-zinc-800 bg-zinc-900/20 p-12 rounded-3xl">
                    <EmptyHeader>
                      <div className="mx-auto bg-zinc-800/50 p-4 rounded-full mb-4">
                        <MousePointer2 className="size-8 text-zinc-600" />
                      </div>
                      <EmptyTitle className="text-zinc-300">No images available</EmptyTitle>
                      <EmptyDescription className="text-zinc-500">
                        {bulkMode === 'add'
                          ? 'All your library images are already in this album.'
                          : bulkMode === 'remove'
                            ? 'No images available to remove from this album'
                            : 'No images available to delete from this album'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
