import { useForm } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  MailboxIcon,
  MousePointer2,
  Plus,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getImagesFn } from '@/data/image';
import { createShortPostFn, editShortPostFn } from '@/data/post';
import { dashboardShortPostsOptions } from '@/data/query-options/dashboardQueryOptions';
import { cn } from '@/lib/utils';
import { shortPostSchema } from '@/schemas/post';
import { usePostStore } from '@/store/post';

export function PostDialog() {
  const {
    currentPostId,
    isDeletePostDialog,
    isOpen,
    toggleDialog,
    onOpenDialogChange,
    initialValues,
  } = usePostStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { data: images, isPending } = useQuery({
    queryKey: ['all-images'],
    queryFn: async () => {
      const images = await getImagesFn();
      return images;
    },
    enabled: isOpen,
  });
  const form = useForm({
    defaultValues: {
      images:
        initialValues?.images ??
        ([] as { id?: string; url: string; title: string; description: string }[]),
      content: initialValues?.content ?? '',
      published: initialValues?.published ?? false,
      showPrivateToFollowers: initialValues?.showPrivateToFollowers ?? false,
    },
    validators: {
      // @ts-ignore just type error
      onSubmit: shortPostSchema,
      // @ts-ignore just type error
      onChange: shortPostSchema,
      // @ts-ignore just type error
      onBlur: shortPostSchema,
    },
    onSubmit: async ({ value }) => {
      // console.log(value);
      if (initialValues?.mode === 'edit') {
        await editShortPostFn({
          data: {
            postId: currentPostId,
            content: value.content,
            published: value.published,
            images: value.images,
            showPrivateToFollowers: value.showPrivateToFollowers,
          },
        });
        toast.success('Post edited successfully');
        toggleDialog('close', '');
        form.reset();
        void router.invalidate();
        void queryClient.invalidateQueries({
          queryKey: [...dashboardShortPostsOptions().queryKey],
        });
      } else {
        await createShortPostFn({
          data: {
            content: value.content,
            published: value.published,
            images: value.images,
            showPrivateToFollowers: value.showPrivateToFollowers,
          },
        });
        toast.success('Post created successfully');
        toggleDialog('close', '');
        form.reset();
        void router.invalidate();
        void queryClient.invalidateQueries({
          queryKey: [...dashboardShortPostsOptions().queryKey],
        });
      }
    },
  });
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
      const imagesToAppend: typeof form.state.values.images = [];

      rangeImages.forEach((img) => {
        if (!newSelection.has(img.id)) {
          newSelection.add(img.id);
          imagesToAppend.push({
            id: img.id,
            url: img.url,
            title: img.title ?? '',
            description: img.description ?? '',
          });
        }
      });

      if (imagesToAppend.length > 0) {
        form.setFieldValue('images', (prev) => [...prev, ...imagesToAppend]);
        setSelectedIds(newSelection);
      }

      setLastSelectedId(imgId);
      return;
    }

    const selectedImage = currentImages.find((img) => img.id === imgId);
    const newSelection = new Set(selectedIds);

    // handle single toggle selection
    if (newSelection.has(imgId)) {
      newSelection.delete(imgId);
      form.setFieldValue('images', (prev) => prev.filter((prevImg) => prevImg.id !== imgId));
      setLastSelectedId(null);
    } else {
      newSelection.add(imgId);
      form.setFieldValue('images', (prev) => [
        ...prev,
        {
          id: selectedImage?.id ?? '',
          url: selectedImage?.url ?? '',
          title: selectedImage?.title ?? '',
          description: selectedImage?.description ?? '',
        },
      ]);
      setLastSelectedId(imgId);
    }
    setSelectedIds(newSelection);
  }
  function handlePhotos() {
    if (!initialValues?.images) return images;
    else {
      const photos = images;
      return photos;
    }
  }
  const photos = handlePhotos();

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
  useEffect(() => {
    const validImages = initialValues?.images?.filter((img) => {
      return img.id !== undefined || img.id !== '';
    });
    setSelectedIds(new Set(validImages?.map((img) => img.id as string) ?? []));
  }, [initialValues?.images]);

  useEffect(() => {
    if (isOpen) {
      if (initialValues?.mode === 'edit') {
        form.reset({
          content: initialValues.content,
          images: initialValues.images ?? [],
          published: initialValues.published,
          showPrivateToFollowers: initialValues.showPrivateToFollowers,
        });
      } else {
        form.reset();
      }
    }
  }, [initialValues, isOpen, form]);
  return (
    <Dialog
      open={isOpen && !isDeletePostDialog}
      onOpenChange={(open) => {
        onOpenDialogChange('open', open);
      }}
    >
      <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-zinc-800 bg-zinc-950">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          <div className="w-full md:w-2/5 p-8 border-r border-zinc-800/50 bg-zinc-900/20 overflow-y-auto">
            <DialogHeader className="mb-8">
              <div className="bg-emerald-500/10 w-fit p-2 rounded-lg mb-4">
                <MailboxIcon className="text-emerald-500 size-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-zinc-100">
                {initialValues?.mode === 'create' ? 'Create Post' : 'Edit Post'}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Configure your post and visibility settings.
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
                                Show this private post and related content to follower
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
              <Field className="space-y-3">
                <form.Field
                  name="content"
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
                            Content
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
                            placeholder="Provide a story or description for the post..."
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
              <Tabs defaultValue="import-images" className="w-full">
                <TabsList className="mx-auto mb-2 bg-transparent">
                  <TabsTrigger value="import-images" className="text-primary! cursor-pointer">
                    Import
                  </TabsTrigger>
                  <TabsTrigger value="add-gallery" className="text-primary! cursor-pointer">
                    Add from Gallery
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="import-images">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Image Sources
                    </Label>
                    <form.Field name="images" mode="array">
                      {(field) => {
                        return (
                          <>
                            <div className="space-y-3 max-h-75 pr-2 overflow-y-auto scrollbar-hide pl-2 py-2">
                              {field.state.value.map((_, i) => (
                                <form.Field key={i} name={`images[${i}]`}>
                                  {(subField) => {
                                    const isInvalid =
                                      subField.state.meta.isTouched && !subField.state.meta.isValid;
                                    return (
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
                                            className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 h-6 w-6 cursor-pointer"
                                          >
                                            <Trash2 className="size-3" />
                                          </Button>
                                        </div>
                                        <div className="space-y-1">
                                          <Input
                                            placeholder="Image Id (Empty if new import)"
                                            className="bg-zinc-950! border-zinc-800 focus-visible:ring-emerald-500/50 h-9 text-sm"
                                            value={subField.state.value.id}
                                            disabled
                                            readOnly
                                            onChange={(e) =>
                                              subField.handleChange({
                                                ...subField.state.value,
                                                id: e.target.value,
                                              })
                                            }
                                          />
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
                                        {isInvalid && (
                                          <div className="mt-1 animate-in slide-in-from-top-1 duration-200">
                                            <FieldError
                                              errors={subField.state.meta.errors}
                                              className="text-xs text-red-400 font-medium flex items-center gap-1 before:content-['●'] before:text-[8px]"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }}
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
                                  id: '',
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
                </TabsContent>
                <TabsContent value="add-gallery">
                  {selectedIds.size > 0 && (
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
                              form.setFieldValue('images', []);
                            }}
                          >
                            <RotateCw className="size-4" />
                          </Button>
                        </div>
                      )}
                    />
                  )}
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
                </TabsContent>
              </Tabs>

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
                      {initialValues?.mode === 'edit' ? 'Edit' : 'Create'}
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
              selector={(state) => state.values.images}
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
                            <div className="relative group h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                              <img
                                src={src.url}
                                alt={`Preview ${index + 1}`}
                                className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105 "
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
                          IMAGE {current} // {validImages.length}
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
