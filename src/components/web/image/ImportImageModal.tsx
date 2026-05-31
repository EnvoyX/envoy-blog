import { useForm } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Effect } from 'effect';
import { ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getAlbumByIdFn, ImportImagesToAlbumFn } from '@/data/album';
import { ImportImagesFn } from '@/data/image';
import {
  dashboardAlbumIdOptions,
  imageGalleryOptions,
} from '@/data/query-options/dashboardQueryOptions';
import { imageSchema } from '@/schemas/image';
import { useAlbumStore } from '@/store/album';

export function ImportImageModal() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isImageImportDialogOpen, onOpenDialogChange, toggleDialog, currentAlbumId } =
    useAlbumStore();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { data: album } = useQuery({
    queryKey: ['album-gallery', currentAlbumId],
    queryFn: async () => {
      const album = await getAlbumByIdFn({
        data: {
          albumId: currentAlbumId,
        },
      });
      return album;
    },
    enabled: isImageImportDialogOpen && currentAlbumId ? true : false,
  });
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const importImageToAlbumEffect = (
    albumId: string,
    images: { url: string; title: string; description: string }[],
    published: boolean,
    showPrivateToFollowers: boolean,
  ) =>
    Effect.tryPromise(() =>
      ImportImagesToAlbumFn({
        data: {
          albumId,
          published,
          showPrivateToFollowers,
          image: images,
        },
      }),
    );

  const importImageEffect = (
    images: { url: string; title: string; description: string }[],
    published: boolean,
    showPrivateToFollowers: boolean,
  ) =>
    Effect.tryPromise(() =>
      ImportImagesFn({
        data: {
          image: images,
          published,
          showPrivateToFollowers,
        },
      }),
    );

  const runCleanup = Effect.sync(() => {
    void queryClient.invalidateQueries({
      queryKey: [...imageGalleryOptions().queryKey],
    });
    if (currentAlbumId) {
      void queryClient.invalidateQueries({ queryKey: ['available-images', currentAlbumId] });
      void queryClient.invalidateQueries({
        queryKey: [...dashboardAlbumIdOptions(currentAlbumId).queryKey],
      });
    }
    void router.invalidate();
    form.reset();
    toggleDialog('close', '');
  });

  const form = useForm({
    defaultValues: {
      image: [] as { url: string; title: string; description: string }[],
      published: false,
      showPrivateToFollowers: false,
    },
    validators: {
      onSubmit: imageSchema,
      onChange: imageSchema,
      onBlur: imageSchema,
    },
    onSubmit: async ({ value }) => {
      const { published, showPrivateToFollowers, image } = value;
      const images = image;
      const modeConfig = {
        importImage: {
          action: () => importImageEffect(images, published, showPrivateToFollowers),
          msg: `Importing ${images.length} images...`,
          success: `Images imported successfully`,
        },
        importToAlbum: {
          action: () =>
            importImageToAlbumEffect(currentAlbumId, images, published, showPrivateToFollowers),
          msg: `Importing ${images.length} images to ${album?.name}...`,
          success: `Images imported successfully to ${album?.name}`,
        },
      };
      const currentMode = currentAlbumId
        ? modeConfig['importToAlbum' as keyof typeof modeConfig]
        : modeConfig['importImage' as keyof typeof modeConfig];
      if (!currentMode) return;
      const importWorkflow = Effect.gen(function* () {
        toast.loading(currentMode.msg, {
          id: 'import-images',
        });
        yield* currentMode.action();

        toast.success(currentMode.success, {
          id: 'import-images',
        });
      }).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            toast.error(`Failed to import images`, {
              id: 'import-images',
            });
            console.error(error.message);
          }),
        ),
        Effect.ensuring(runCleanup),
      );

      await Effect.runPromise(importWorkflow);
    },
  });
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
  return (
    <Dialog
      open={isImageImportDialogOpen}
      onOpenChange={(open) => {
        onOpenDialogChange('import', open);
      }}
    >
      <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-zinc-800 bg-zinc-950">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          <div className="w-full md:w-2/5 p-8 border-r border-zinc-800/50 bg-zinc-900/20 overflow-y-auto">
            <DialogHeader className="mb-8">
              <header className="flex max-sm:flex-col sm:justify-between items-center">
                <div className="bg-emerald-500/10 w-fit p-2 rounded-lg mb-4">
                  <ImageIcon className="text-emerald-500 size-6" />
                </div>
                {album?.coverImageUrl && (
                  <div className="max-sm:hidden size-16 relative group aspect-square overflow-hidden rounded-2xl border shadow-2xl">
                    <img
                      src={
                        album?.coverImageUrl ?? 'https://placehold.co/600x800?text=Invalid+Image'
                      }
                      alt={album?.name}
                      className="object-cover transition-transform duration-500 group-hover:scale-105 "
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/600x800?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </header>
              <DialogTitle className="text-2xl font-bold text-zinc-100">Image Import</DialogTitle>

              <DialogDescription className="flex flex-col  text-zinc-400">
                Configure your batch upload and visibility settings.
                {currentAlbumId && (
                  <p>
                    Import to <span className="font-bold text-emerald-500">{album?.name}</span>
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
              className="space-y-8"
            >
              <form.Field
                name="published"
                children={(field) => (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 transition-colors hover:border-emerald-500/30">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-zinc-200">
                        Visibility:{' '}
                        <span className={field.state.value ? 'text-emerald-400' : 'text-zinc-400'}>
                          {field.state.value ? 'Public' : 'Private'}
                        </span>
                      </Label>
                      <p className="text-xs text-zinc-500">Visible to all users in the gallery</p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked);
                        if (checked === true) form.setFieldValue('showPrivateToFollowers', false);
                      }}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                )}
              />
              <form.Subscribe
                selector={(state) => state.values}
                children={({ published }) => {
                  if (!published)
                    return (
                      <form.Field
                        name="showPrivateToFollowers"
                        children={(field) => (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 transition-colors hover:border-emerald-500/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium text-zinc-200">
                                Show Private:{' '}
                                <span
                                  className={
                                    field.state.value ? 'text-emerald-400' : 'text-zinc-400'
                                  }
                                >
                                  {field.state.value ? 'Show' : ` Hidden`}
                                </span>
                              </Label>
                              <p className="text-xs text-zinc-500">
                                Show this images to follower even if private
                              </p>
                            </div>
                            <Switch
                              checked={field.state.value}
                              onCheckedChange={field.handleChange}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </div>
                        )}
                      />
                    );
                }}
              />
              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Image Sources
                </Label>
                <form.Field name="image" mode="array">
                  {(field) => {
                    return (
                      <>
                        <div className="space-y-3 max-h-75 pr-2 overflow-y-auto scrollbar-hide pl-2 py-2">
                          {field.state.value.map((_, i) => (
                            <form.Field key={i} name={`image[${i}]`}>
                              {(subField) => (
                                <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 animate-in fade-in slide-in-from-left-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
                                      Image {i + 1}
                                    </span>
                                    <Button
                                      onClick={(e) => {
                                        field.removeValue(i);
                                        e.preventDefault();
                                      }}
                                      variant="ghost"
                                      size="icon"
                                      className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 h-6 w-6"
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  </div>

                                  <div className="space-y-1">
                                    <Input
                                      ref={(el) => {
                                        if (el) {
                                          inputRefs.current[i] = el;
                                        } else {
                                          delete inputRefs.current[i];
                                        }
                                      }}
                                      placeholder="Image URL (https://...)"
                                      className="bg-zinc-950! border-zinc-800 focus-visible:ring-emerald-500/50 h-9 text-sm"
                                      value={subField.state.value.url}
                                      onChange={(e) =>
                                        subField.handleChange({
                                          ...subField.state.value,
                                          url: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      placeholder="Title"
                                      className="bg-zinc-950! border-zinc-800 focus-visible:ring-emerald-500/50 h-9 text-sm"
                                      value={subField.state.value.title}
                                      onChange={(e) =>
                                        subField.handleChange({
                                          ...subField.state.value,
                                          title: e.target.value,
                                        })
                                      }
                                    />
                                    <Input
                                      placeholder="Description"
                                      className="bg-zinc-950! border-zinc-800 focus-visible:ring-emerald-500/50 h-9 text-sm"
                                      value={subField.state.value.description}
                                      onChange={(e) =>
                                        subField.handleChange({
                                          ...subField.state.value,
                                          description: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            </form.Field>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-zinc-400 hover:text-emerald-400 py-6 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            field.pushValue({
                              url: '',
                              title: '',
                              description: '',
                            });
                            setTimeout(() => {
                              const lastIndex = field.state.value.length - 1;
                              const targetInput = inputRefs.current[lastIndex];
                              if (targetInput) {
                                targetInput.focus();
                                targetInput.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'nearest',
                                });
                              }
                            }, 100);
                          }}
                        >
                          <Plus className="mr-2 size-4" /> Add URL
                        </Button>
                      </>
                    );
                  }}
                </form.Field>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Confirm Import
                    </Button>
                  )}
                />
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
                  >
                    Dismiss
                  </Button>
                </DialogClose>
              </div>
            </form>
          </div>

          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#09090b] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[120px] rounded-full" />

            <form.Subscribe
              selector={(state) => state.values.image}
              children={(images) => {
                const validImages = images?.filter((img) => img.url && img.url.trim() !== '') || [];

                if (validImages.length === 0) {
                  return (
                    <div className="relative z-10 text-center space-y-4">
                      <div className="mx-auto size-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <ImageIcon className="size-10 text-zinc-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-zinc-200 font-medium">Gallery Preview</p>
                        <p className="text-xs text-zinc-500">Your images will appear here</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="w-full max-w-lg px-12 relative z-10">
                    <Carousel className="w-full" setApi={setApi}>
                      <CarouselContent>
                        {validImages.map((src, index) => (
                          <CarouselItem key={index}>
                            <div className="relative group aspect-4/5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                              <img
                                src={src.url}
                                alt={`Preview ${index + 1}`}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 "
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://placehold.co/600x800?text=Invalid+Image';
                                }}
                              />
                              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="-left-10  border-emerald-600! text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer" />
                      <CarouselNext className="-right-10  border-emerald-600! text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer" />
                      <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 tracking-widest">
                          IMAGE {current} // {images.length}
                        </span>
                      </div>
                    </Carousel>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
