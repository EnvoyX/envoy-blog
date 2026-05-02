import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import { ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImportImagesFn } from '@/data/image';
import { imageModalStore } from '@/routes/dashboard/images';
import { imageSchema } from '@/schemas/image';

export function ImportImageModal() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
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
  const form = useForm({
    defaultValues: {
      image: [] as string[],
      published: false,
    },
    validators: {
      onSubmit: imageSchema,
      onChange: imageSchema,
      onBlur: imageSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      await ImportImagesFn({
        data: {
          images: value.image,
          published: value.published,
        },
      });
      toast.success('Images imported successfully');
      form.reset();
      void router.invalidate();
    },
  });
  const isOpen = useSelector(imageModalStore, (state) => state.isOpen);
  const isImportDialog = useSelector(imageModalStore, (state) => state.isImportDialog);

  return (
    <Dialog
      open={isOpen && isImportDialog}
      onOpenChange={(open) => {
        imageModalStore.setState((prev) => ({
          ...prev,
          isOpen: open,
          isImportDialog: !prev.isImportDialog,
        }));
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/40 group active:scale-95 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Plus className="size-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold tracking-tight">Import Images</span>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-zinc-800 bg-zinc-950">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          <div className="w-full md:w-2/5 p-8 border-r border-zinc-800/50 bg-zinc-900/20">
            <DialogHeader className="mb-8">
              <div className="bg-emerald-500/10 w-fit p-2 rounded-lg mb-4">
                <ImageIcon className="text-emerald-500 size-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-zinc-100">Image Import</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Configure your batch upload and visibility settings.
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
                      onCheckedChange={field.handleChange}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                )}
              />

              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Image Sources
                </Label>
                <form.Field name="image" mode="array">
                  {(field) => (
                    <div className="space-y-3 max-h-75 pr-2 overflow-y-auto custom-scrollbar pl-2 py-2">
                      {field.state.value.map((_, i) => (
                        <form.Field key={i} name={`image[${i}]`}>
                          {(subField) => (
                            <div className="group flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                              <div className="relative flex-1">
                                <Input
                                  placeholder="https://..."
                                  className="bg-zinc-900! border-zinc-800 focus-visible:ring-emerald-500/50 rounded-lg h-10 transition-all"
                                  value={subField.state.value}
                                  onChange={(e) => {
                                    subField.handleChange(e.target.value);
                                    setImageUrl(e.target.value);
                                  }}
                                />
                              </div>
                              <Button
                                onClick={(e) => {
                                  field.removeValue(i);
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                variant="ghost"
                                size="icon"
                                className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          )}
                        </form.Field>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-zinc-400 hover:text-emerald-400 py-6 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          field.pushValue(imageUrl);
                          setImageUrl('');
                        }}
                      >
                        <Plus className="mr-2 size-4" /> Add Another URL
                      </Button>
                    </div>
                  )}
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
                const validImages = images?.filter((img) => img && img.trim() !== '') || [];

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
                                src={src}
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
                      <CarouselPrevious className="-left-4 bg-zinc-900/80 border-zinc-700 text-white hover:bg-emerald-600 transition-colors" />
                      <CarouselNext className="-right-4 bg-zinc-900/80 border-zinc-700 text-white hover:bg-emerald-600 transition-colors" />
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
