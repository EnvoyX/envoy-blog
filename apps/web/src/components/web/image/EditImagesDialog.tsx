import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Effect } from "effect";
import { CheckCircle2, Loader2, MailboxIcon, MousePointer2, RotateCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { editImagesFn, getImagesWithAlbumFn } from "@/data/image";
import {
  dashboardAlbumIdOptions,
  imageGalleryOptions,
} from "@/data/query-options/dashboardQueryOptions";
import { cn } from "@/lib/utils";
import { editImagesSchema } from "@/schemas/image";
import { useImageStore } from "@/store/image";

export function EditImagesDialog() {
  const { isBulkEditDialogOpen, onOpenChangeDialog, toggleDialog, albumId } = useImageStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const { data: images, isPending } = useQuery({
    queryKey: ["edit-images"],
    queryFn: async () => {
      const images = await getImagesWithAlbumFn();
      return images;
    },
    enabled: isBulkEditDialogOpen,
  });

  const editImagesEffect = (
    published: boolean,
    showPrivateToFollowers: boolean,
    images: {
      id: string;
      url: string;
      title: string;
      description: string;
    }[],
  ) =>
    Effect.tryPromise(() =>
      editImagesFn({
        data: {
          images,
          published,
          showPrivateToFollowers,
        },
      }),
    );
  const runCleanup = Effect.sync(() => {
    form.reset();
    void queryClient.invalidateQueries({
      queryKey: [...imageGalleryOptions().queryKey],
    });
    if (albumId)
      void queryClient.invalidateQueries({
        queryKey: [...dashboardAlbumIdOptions(albumId).queryKey],
      });
    void router.invalidate();
    toggleDialog("close");
  });
  const form = useForm({
    defaultValues: {
      images: [] as { id: string; url: string; title: string; description: string }[],
      published: false,
      showPrivateToFollowers: false,
    },
    validators: {
      // @ts-ignore just type error
      onSubmit: editImagesSchema,
      // @ts-ignore just type error
      onChange: editImagesSchema,
      // @ts-ignore just type error
      onBlur: editImagesSchema,
    },
    onSubmit: async ({ value }) => {
      const workflow = Effect.gen(function* () {
        toast.loading(`Updating ${value.images.length} images...`, {
          id: "edit-images",
        });
        yield* editImagesEffect(value.published, value.showPrivateToFollowers, value.images);
        toast.success(`Updated ${value.images.length} images successfully`, {
          id: "edit-images",
        });
      }).pipe(
        Effect.catchAll((error) =>
          Effect.sync(() => {
            toast.error(`Failed to update images`, {
              id: "edit-images",
            });
            console.error(error.message);
          }),
        ),
        Effect.ensuring(runCleanup),
      );

      await Effect.runPromise(workflow);
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
            title: img.title ?? "",
            description: img.description ?? "",
          });
        }
      });

      if (imagesToAppend.length > 0) {
        form.setFieldValue("images", (prev) => [...prev, ...imagesToAppend]);
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
      form.setFieldValue("images", (prev) => prev.filter((prevImg) => prevImg.id !== imgId));
      setLastSelectedId(null);
    } else {
      newSelection.add(imgId);
      form.setFieldValue("images", (prev) => [
        ...prev,
        {
          id: selectedImage?.id ?? "",
          url: selectedImage?.url ?? "",
          title: selectedImage?.title ?? "",
          description: selectedImage?.description ?? "",
        },
      ]);
      setLastSelectedId(imgId);
    }
    setSelectedIds(newSelection);
  }
  function handlePhotos() {
    if (albumId) {
      const photos = images?.filter((img) => {
        return img.albums?.some((album) => album.id === albumId);
      });
      return photos;
    } else return images;
  }
  const photos = handlePhotos();
  useEffect(() => {
    if (isBulkEditDialogOpen) {
      form.reset();
      setSelectedIds(new Set());
    }
  }, [isBulkEditDialogOpen, form]);
  return (
    <Dialog
      open={isBulkEditDialogOpen}
      onOpenChange={(open) => {
        onOpenChangeDialog("bulk-edit", open);
      }}
    >
      <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-zinc-800 bg-zinc-950">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          <div className="w-full md:w-2/5 p-8 border-r border-zinc-800/50 bg-zinc-900/20 overflow-y-auto">
            <DialogHeader className="mb-8">
              <div className="bg-primary/10 w-fit p-2 rounded-lg mb-4">
                <MailboxIcon className="text-primary size-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-zinc-100">Edit Images</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Edit your photos and visibility settings.
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 transition-colors hover:border-primary/30">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-zinc-200">
                        Visibility:{" "}
                        <span className={field.state.value ? "text-primary" : "text-zinc-400"}>
                          {field.state.value ? "Public" : "Private"}
                        </span>
                      </Label>
                      <p className="text-xs text-zinc-500">
                        {field.state.value
                          ? "images are visible to all users"
                          : "images are hidden to all users"}
                      </p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked);
                        if (checked === true) form.setFieldValue("showPrivateToFollowers", false);
                      }}
                      className="data-[state=checked]:bg-primary"
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
                          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 transition-colors hover:border-primary/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium text-zinc-200">
                                Show Private:{" "}
                                <span
                                  className={field.state.value ? "text-primary" : "text-zinc-400"}
                                >
                                  {field.state.value ? "Show" : ` Hidden`}
                                </span>
                              </Label>
                              <p className="text-xs text-zinc-500">
                                {field.state.value
                                  ? "images are visible to followers"
                                  : "images are hidden to followers"}
                              </p>
                            </div>
                            <Switch
                              checked={field.state.value}
                              onCheckedChange={field.handleChange}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        )}
                      />
                    );
                }}
              />

              {/* image picker on mobile */}
              <div className="flex flex-1 flex-col bg-[#09090b] relative overflow-hidden sm:hidden ">
                <div className="flex max-sm:flex-col max-sm:gap-4 items-center sm:justify-between border-b border-zinc-800/50 bg-zinc-950/25 backdrop-blur-md z-20 mb-4">
                  <div className="max-sm:text-center">
                    <p className="text-lg text-zinc-500">Select images to edit</p>
                  </div>
                  {selectedIds.size > 0 && (
                    <form.Subscribe
                      selector={(state) => [state.isSubmitting]}
                      children={([isSubmitting]) => (
                        <div className="w-fit items-center flex gap-2 mb-4">
                          <span
                            className={cn(
                              buttonVariants({
                                variant: "default",
                                className:
                                  "bg-primary hover:bg-primary text-white rounded-xl font-bold shadow-lg shadow-zinc-900/20 animate-in fade-in zoom-in duration-300",
                              }),
                              {
                                "opacity-50 cursor-not-allowed": isSubmitting,
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
                              "bg-destructive/75 hover:bg-destructive/90 text-white rounded-xl font-bold shadow-lg shadow-destructive/20 animate-in fade-in zoom-in duration-300 cursor-pointer",
                              {
                                "opacity-50 cursor-not-allowed": isSubmitting,
                              },
                            )}
                            onClick={() => {
                              setSelectedIds(new Set());
                              setLastSelectedId(null);
                              form.setFieldValue("images", []);
                            }}
                          >
                            <RotateCw className="size-4" />
                          </Button>
                        </div>
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-zinc-900 max-h-125 relative border-t-2 border-b-2 border-primary">
                  {match({ isPending, hasImages: !!images?.length })
                    .with({ isPending: true }, () => (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="animate-spin size-10 text-primary" />
                          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                            Loading Images...
                          </p>
                        </div>
                      </div>
                    ))
                    .with({ isPending: false, hasImages: true }, () => (
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {photos?.map((img) => {
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
                                    ? "ring-4 ring-primary ring-offset-4 ring-offset-zinc-950 scale-[0.98]"
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
                                className={`absolute inset-0 transition-colors duration-300 ${isSelected ? "bg-primary/10" : "bg-transparent group-hover:bg-black/20"}`}
                              />

                              {/* status icon */}
                              <div
                                className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-300 ${isSelected ? "bg-primary scale-100 shadow-lg" : "bg-zinc-900/80 opacity-0 group-hover:opacity-100 scale-50"}`}
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
                            <EmptyTitle className="text-zinc-300">No Images</EmptyTitle>
                            <EmptyDescription className="text-zinc-500">
                              No images available to edit
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </div>
                    ))
                    .exhaustive()}
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Images
                </Label>
                <form.Field name="images" mode="array">
                  {(field) => {
                    return (
                      <>
                        <div className="space-y-3 max-h-100 pr-2 overflow-y-auto scrollbar-hide pl-2 py-2">
                          {field.state.value.map((_, i) => (
                            <form.Field key={i} name={`images[${i}]`}>
                              {(subField) => {
                                const isInvalid =
                                  subField.state.meta.isTouched && !subField.state.meta.isValid;
                                return (
                                  <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 animate-in fade-in slide-in-from-left-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
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
                                        placeholder="Image Id"
                                        className="bg-zinc-950! border-zinc-800 focus-visible:ring-primary/50 h-9 text-sm"
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
                                        placeholder="Image URL (https://...)"
                                        className="bg-zinc-950! border-zinc-800 focus-visible:ring-primary/50 h-9 text-sm"
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
                                        className="bg-zinc-950! border-zinc-800 focus-visible:ring-primary/50 h-9 text-sm"
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
                                        className="bg-zinc-950! border-zinc-800 focus-visible:ring-primary/50 h-9 text-sm"
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
                      className="w-full bg-primary hover:bg-primary text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-zinc-900/20 cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Edit Images
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
          <div className="flex flex-1 flex-col bg-[#09090b] relative overflow-hidden max-sm:hidden ">
            <div className="flex max-sm:flex-col max-sm:gap-4 items-center sm:justify-between px-8 py-6 border-b border-zinc-800/50 bg-zinc-950/25 backdrop-blur-md z-20">
              <div className="max-sm:text-center max-sm:hidden">
                <h3 className="text-lg max-sm:text-2xl font-bold text-zinc-100">Edit Photos</h3>
                <p className="text-xs text-zinc-500">Select images to edit</p>
              </div>
              {selectedIds.size > 0 && (
                <form.Subscribe
                  selector={(state) => [state.isSubmitting]}
                  children={([isSubmitting]) => (
                    <div className="w-fit items-center flex gap-2 mb-4">
                      <span
                        className={cn(
                          buttonVariants({
                            variant: "default",
                            className:
                              "bg-primary hover:bg-primary text-white rounded-xl font-bold shadow-lg shadow-zinc-900/20 animate-in fade-in zoom-in duration-300",
                          }),
                          {
                            "opacity-50 cursor-not-allowed": isSubmitting,
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
                          "bg-destructive/75 hover:bg-destructive/90 text-white rounded-xl font-bold shadow-lg shadow-destructive/20 animate-in fade-in zoom-in duration-300 cursor-pointer",
                          {
                            "opacity-50 cursor-not-allowed": isSubmitting,
                          },
                        )}
                        onClick={() => {
                          setSelectedIds(new Set());
                          setLastSelectedId(null);
                          form.setFieldValue("images", []);
                        }}
                      >
                        <RotateCw className="size-4" />
                      </Button>
                    </div>
                  )}
                />
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
              {match({ isPending, hasImages: !!images?.length })
                .with({ isPending: true }, () => (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin size-10 text-primary" />
                      <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                        Loading Images...
                      </p>
                    </div>
                  </div>
                ))
                .with({ isPending: false, hasImages: true }, () => (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {photos?.map((img) => {
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
                                ? "ring-4 ring-primary ring-offset-4 ring-offset-zinc-950 scale-[0.98]"
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
                            className={`absolute inset-0 transition-colors duration-300 ${isSelected ? "bg-primary/10" : "bg-transparent group-hover:bg-black/20"}`}
                          />

                          {/* status icon */}
                          <div
                            className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-300 ${isSelected ? "bg-primary scale-100 shadow-lg" : "bg-zinc-900/80 opacity-0 group-hover:opacity-100 scale-50"}`}
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
                        <EmptyTitle className="text-zinc-300">No Images</EmptyTitle>
                        <EmptyDescription className="text-zinc-500">
                          No images available to edit
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
