import { useForm } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  MailboxIcon,
  MousePointer2,
  RotateCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from '@/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createAlbumFn, editAlbumFn, getAlbumByIdFn } from '@/data/album';
import { getImagesFn } from '@/data/image';
import { dashboardAlbumsOptions } from '@/data/query-options/dashboardQueryOptions';
import { cn } from '@/lib/utils';
import { albumSchema } from '@/schemas/album';
import { useAlbumStore } from '@/store/album';

export function AlbumDialog() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectedCoverImageId, setSelectedCoverImageId] = useState<Set<string>>(new Set());
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    onOpenDialogChange,
    isAlbumDialogOpen,
    toggleDialog,
    initialValues,
    setInitialValues,
    currentAlbumId,
  } = useAlbumStore();

  const { data: images, isPending } = useQuery({
    queryKey: ['all-images'],
    queryFn: async () => {
      const images = await getImagesFn();
      return images;
    },
    enabled: isAlbumDialogOpen && initialValues?.type === 'create',
  });
  const { data: coverImages, isPending: isCoverImagesPending } = useQuery({
    queryKey: ['album-gallery', currentAlbumId],
    queryFn: async () => {
      const data = await getAlbumByIdFn({
        data: { albumId: currentAlbumId },
      });
      return data?.images;
    },
    enabled: currentAlbumId && isAlbumDialogOpen && initialValues?.type === 'edit' ? true : false,
  });

  const form = useForm({
    defaultValues: {
      name: initialValues ? initialValues.name : '',
      description: initialValues ? initialValues.description : '',
      published: initialValues ? initialValues.published : false,
      coverImageUrl: initialValues
        ? initialValues.coverImageUrl
        : 'https://tanstack.com/images/logos/splash-dark.png',
      showPrivateToFollowers: initialValues ? initialValues.showPrivateToFollowers : false,
    },
    validators: {
      // @ts-ignore just type error
      onSubmit: albumSchema,
      // @ts-ignore just type error
      onChange: albumSchema,
      // @ts-ignore just type error
      onBlur: albumSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      console.log('Initial values', initialValues);
      if (initialValues?.type === 'edit') {
        await editAlbumFn({
          data: {
            albumId: currentAlbumId,
            name: value.name,
            description: value.description,
            published: value.published,
            coverImageUrl: value.coverImageUrl,
            showPrivateToFollowers: value.showPrivateToFollowers,
          },
        });
        toast.success('Album edited successfully');
        form.reset();
        void router.invalidate();
        void queryClient.invalidateQueries({
          ...dashboardAlbumsOptions(),
        });
        setInitialValues(null);
        toggleDialog('close', '');
      } else if (initialValues?.type === 'create') {
        await createAlbumFn({
          data: {
            name: value.name,
            description: value.description,
            published: value.published,
            coverImageUrl: value.coverImageUrl,
            showPrivateToFollowers: value.showPrivateToFollowers,
            imageIds: Array.from(selectedIds) ?? [],
          },
        });
        toast.success('Album created successfully');
        form.reset();
        void router.invalidate();
        void queryClient.invalidateQueries({
          ...dashboardAlbumsOptions(),
        });
        toggleDialog('close', '');
      }
    },
  });

  const photos = images;

  function toggleSelection(imgId: string, isShift: boolean = false) {
    if (form.state.isSubmitting) return;

    const currentImages = photos ?? [];
    const currentIndex = currentImages.findIndex((img) => img.id === imgId);
    const lastIndex = currentImages.findIndex((img) => img.id === lastSelectedId);

    // handle Shift + Click range selection
    if (isShift && lastSelectedId && lastIndex !== -1 && currentIndex !== -1) {
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);

      const rangeImages = currentImages.slice(start, end + 1);

      const newSelection = new Set(selectedIds);

      rangeImages.forEach((img) => {
        if (!newSelection.has(img.id)) newSelection.add(img.id);
      });

      setSelectedIds(newSelection);
      setLastSelectedId(imgId);
      return;
    }

    // handle single toggle selection
    const newSelection = new Set(selectedIds);
    if (newSelection.has(imgId)) {
      newSelection.delete(imgId);
      setLastSelectedId(null);
      if (selectedCoverImageId.has(imgId)) {
        setSelectedCoverImageId(new Set());
        form.setFieldValue('coverImageUrl', 'https://tanstack.com/images/logos/splash-dark.png');
      }
    } else {
      newSelection.add(imgId);
      setLastSelectedId(imgId);
    }
    setSelectedIds(newSelection);
  }

  function handleCoverImages() {
    if (initialValues?.type === 'create') return images?.filter((img) => selectedIds.has(img.id));
    else if (initialValues?.type === 'edit') return coverImages;
  }

  const coverImageSelections = handleCoverImages();

  function handleCoverImageSelection(imgId: string) {
    if (form.state.isSubmitting) return;
    const nextCoverImageSelection = new Set(selectedCoverImageId);
    if (nextCoverImageSelection.has(imgId)) nextCoverImageSelection.delete(imgId);
    else {
      nextCoverImageSelection.clear();
      nextCoverImageSelection.add(imgId);
    }
    form.setFieldValue(
      'coverImageUrl',
      images?.find((img) => nextCoverImageSelection.has(img.id))?.url ??
        'https://tanstack.com/images/logos/splash-dark.png',
    );
    setSelectedCoverImageId(nextCoverImageSelection);
  }

  useEffect(() => {
    if (isAlbumDialogOpen) {
      if (initialValues?.type === 'edit') {
        form.reset(initialValues);
      } else {
        form.reset();
      }
    }
  }, [initialValues, isAlbumDialogOpen, form]);
  return (
    <Dialog
      open={isAlbumDialogOpen}
      onOpenChange={(open) => {
        onOpenDialogChange('open', open);
        setInitialValues(null);
      }}
    >
      <DialogContent className="sm:max-w-6xl p-0  border-zinc-800 bg-zinc-950">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          <div className="w-full md:w-2/5 p-8 border-r border-zinc-800/50 bg-zinc-900/20 overflow-y-auto">
            <DialogHeader className="mb-8">
              <div className="bg-emerald-500/10 w-fit p-2 rounded-lg">
                <MailboxIcon className="text-emerald-500 size-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-zinc-100">
                {initialValues?.type === 'edit' ? 'Edit Album' : 'New Album'}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Configure to {initialValues?.type === 'edit' ? 'edit' : 'create'} your album and
                visibility settings.
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 transition-colors hover:border-emerald-500/30 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-zinc-200">
                        Visibility:
                        <span className={field.state.value ? 'text-emerald-400' : 'text-zinc-400'}>
                          {field.state.value ? 'Public' : 'Private'}
                        </span>
                      </Label>
                      <p className="text-xs text-zinc-500">Visible to all users in the app</p>
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
                                Show this album to follower even if private
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
              <Field>
                <Label className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Album Name
                </Label>
                <form.Field name="name">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <div className="overflow-y-auto custom-scrollbar">
                        <div className="group flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 p-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Name of your album"
                              className="bg-zinc-900! border-zinc-800 focus-visible:ring-emerald-500/50 rounded-lg h-10 transition-all"
                              value={field.state.value}
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        {isInvalid && (
                          <div className="mt-1 animate-in slide-in-from-top-1 duration-200">
                            <FieldError
                              errors={field.state.meta.errors}
                              className="text-xs text-red-400 font-medium flex items-center gap-1 before:content-['●'] before:text-[8px]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  }}
                </form.Field>
              </Field>
              <Field className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <form.Field
                  name="description"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    const charCount = field.state.value?.length || 0;
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={`${field.name}-input`}
                            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
                          >
                            Description
                          </Label>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                              charCount > 0
                                ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                                : 'text-zinc-600 border-zinc-800'
                            }`}
                          >
                            {charCount} CHARS
                          </span>
                        </div>

                        <div className="relative group">
                          <Textarea
                            id={`${field.name}-input`}
                            placeholder="Provide a story or description for the album..."
                            className={`
                              min-h-30 resize-none p-4
                              bg-zinc-900/50 border-zinc-800
                              placeholder:text-zinc-600 text-zinc-200
                              focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50
                              transition-all duration-300 rounded-xl
                              ${isInvalid ? 'border-red-500/50 focus-visible:ring-red-500/20' : 'hover:border-zinc-700'}
                            `}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />

                          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 group-focus-within:ring-emerald-500/10 transition-all" />
                        </div>

                        {isInvalid && (
                          <div className="mt-1 animate-in slide-in-from-top-1 duration-200">
                            <FieldError
                              errors={field.state.meta.errors}
                              className="text-xs text-red-400 font-medium flex items-center gap-1 before:content-['●'] before:text-[8px]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </Field>
              <Field>
                <Label className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Album Cover Image
                </Label>
                <form.Field name="coverImageUrl">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <div className="max-h-75 overflow-y-auto custom-scrollbar">
                        <div className="group flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 p-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="https://..."
                              className="bg-zinc-900! border-zinc-800 focus-visible:ring-emerald-500/50 rounded-lg h-10 transition-all"
                              value={field.state.value}
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                                setSelectedCoverImageId(new Set());
                              }}
                              onBlur={(e) => {
                                if (e.target.value.trim() === '') {
                                  field.setValue(
                                    'https://tanstack.com/images/logos/splash-dark.png',
                                  );
                                  setSelectedCoverImageId(new Set());
                                }
                              }}
                            />
                          </div>
                        </div>
                        {isInvalid && (
                          <div className="mt-1 animate-in slide-in-from-top-1 duration-200">
                            <FieldError
                              errors={field.state.meta.errors}
                              className="text-xs text-red-400 font-medium flex items-center gap-1 before:content-['●'] before:text-[8px]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  }}
                </form.Field>
              </Field>
              {((selectedIds.size > 0 && initialValues?.type === 'create') ||
                initialValues?.type === 'edit') && (
                <Field className="-mt-8">
                  <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-900 max-h-125 relative">
                    {(isPending && initialValues?.type === 'create') ||
                    (isCoverImagesPending && initialValues?.type === 'edit') ? (
                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="animate-spin size-10 text-emerald-500" />
                          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                            Loading Images...
                          </p>
                        </div>
                      </div>
                    ) : coverImageSelections?.length ? (
                      <div className="grid grid-cols-2 gap-4">
                        {coverImageSelections?.map((img) => {
                          const isSelected = selectedCoverImageId.has(img.id);
                          return (
                            <div
                              key={img.id}
                              onClick={(e) => {
                                e.preventDefault();
                                handleCoverImageSelection(img.id);
                              }}
                              className={cn(
                                'group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300',
                                isSelected
                                  ? 'ring-4 ring-emerald-500 ring-offset-4 ring-offset-zinc-950 scale-[0.98]'
                                  : 'hover:scale-[1.02] border border-zinc-800',
                                form.state.isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
                              )}
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
                            <EmptyTitle className="text-zinc-300">No images</EmptyTitle>
                            <EmptyDescription className="text-zinc-500">
                              No images available to select
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </div>
                    )}
                  </div>
                </Field>
              )}
              {initialValues?.type === 'create' && (
                <Field>
                  <Label className="text-sm font-semibold uppercase tracking-wider text-emerald-500 w-full flex justify-center items-center ">
                    Gallery Photos
                  </Label>
                  <form.Subscribe
                    selector={(state) => [state.isSubmitting]}
                    children={([isSubmitting]) => (
                      <div className="w-full flex items-center justify-center gap-2 mb-4">
                        <span
                          className={cn(
                            buttonVariants({
                              variant: 'default',
                              className:
                                'bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl w-fit font-bold shadow-lg shadow-emerald-900/20 animate-in fade-in zoom-in duration-300',
                            }),
                            {
                              'opacity-50 cursor-not-allowed': isSubmitting,
                            },
                          )}
                        >
                          {isSubmitting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          {selectedIds.size}
                        </span>
                        <Button
                          variant="default"
                          size="icon"
                          className={cn(
                            'bg-destructive/75 hover:bg-destructive/90 text-white rounded-xl font-bold shadow-lg shadow-destructive/20 animate-in fade-in zoom-in duration-300 cursor-pointer',
                            {
                              'opacity-50 cursor-not-allowed': isSubmitting,
                            },
                          )}
                          onClick={() => {
                            setSelectedIds(new Set());
                            setLastSelectedId(null);
                            form.setFieldValue(
                              'coverImageUrl',
                              'https://tanstack.com/images/logos/splash-dark.png',
                            );
                          }}
                        >
                          <RotateCw className="size-4" />
                        </Button>
                      </div>
                    )}
                  />

                  <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-900 max-h-125 relative border-t-2 border-b-2 border-emerald-400">
                    {isPending ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="animate-spin size-10 text-emerald-500" />
                          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                            Loading Images...
                          </p>
                        </div>
                      </div>
                    ) : photos?.length ? (
                      <div className="grid grid-cols-2 gap-4">
                        {photos?.map((img) => {
                          const isSelected = selectedIds.has(img.id);
                          return (
                            <div
                              key={img.id}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleSelection(img.id, e.shiftKey);
                              }}
                              className={cn(
                                'group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300',
                                isSelected
                                  ? 'ring-4 ring-emerald-500 ring-offset-4 ring-offset-zinc-950 scale-[0.98]'
                                  : 'hover:scale-[1.02] border border-zinc-800',
                                form.state.isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
                              )}
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
                            <EmptyTitle className="text-zinc-300">No images</EmptyTitle>
                            <EmptyDescription className="text-zinc-500">
                              No images available to select
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </div>
                    )}
                  </div>
                </Field>
              )}

              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      {initialValues?.type === 'edit' ? 'Edit Album' : 'Create Album'}
                    </Button>
                  )}
                />
              </div>
            </form>
          </div>

          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#09090b] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[120px] rounded-full" />

            <form.Subscribe
              selector={(state) => state.values.coverImageUrl}
              children={(image) => {
                if (!image || image.trim() === '') {
                  return (
                    <div className="relative z-10 text-center space-y-4">
                      <div className="mx-auto size-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <ImageIcon className="size-10 text-zinc-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-zinc-200 font-medium">Gallery Preview</p>
                        <p className="text-xs text-zinc-500">Your cover image will appear here</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="w-full max-w-lg px-12 relative z-10">
                    <section className="w-full">
                      <div className="relative group aspect-4/5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                        <img
                          src={image}
                          alt={`Preview image`}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 "
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/600x800?text=Invalid+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </section>
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
