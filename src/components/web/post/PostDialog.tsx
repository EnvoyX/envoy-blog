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
import { Textarea } from '@/components/ui/textarea';
import { createShortPostFn } from '@/data/post';
import { postModalStore } from '@/routes/dashboard/post';
import { shortPostSchema } from '@/schemas/post';

export function PostDialog() {
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
      image: [''],
      content: '',
      published: false,
    },
    validators: {
      onSubmit: shortPostSchema,
      onChange: shortPostSchema,
      onBlur: shortPostSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      await createShortPostFn({
        data: {
          content: value.content,
          published: value.published,
          images: value.image,
        },
      });
      toast.success('Post created successfully');
      form.reset();
      void router.invalidate();
    },
  });
  const isOpen = useSelector(postModalStore, (state) => state.isOpen);
  const isCreatePostDialog = useSelector(postModalStore, (state) => state.isCreatePostDialog);

  return (
    <Dialog
      open={isOpen && isCreatePostDialog}
      onOpenChange={(open) => {
        postModalStore.setState((prev) => {
          return {
            ...prev,
            isOpen: open,
            isCreatePostDialog: !prev.isCreatePostDialog,
          };
        });
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-500 rounded-full px-6 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Plus className="size-5" />
            Create New Post
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>Fill out the form below to create a post.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <FieldGroup>
              <Field>
                <form.Field
                  name="content"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <>
                        <Label htmlFor={`${field.name}-input`}>Content</Label>
                        <Textarea
                          id={`${field.name}-input`}
                          placeholder="What's happening today?"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </>
                    );
                  }}
                />
              </Field>
              <Field>
                <form.Field
                  name="published"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <FieldContent>
                          <FieldLabel htmlFor="form-tanstack-switch-visibility">
                            Visibility ({field.state.value === true ? 'Public' : 'Private'})
                          </FieldLabel>
                          <FieldDescription>
                            Enable whether this post published to public or keep in private.
                          </FieldDescription>
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </FieldContent>
                        <Switch
                          id="form-tanstack-switch-visibility"
                          name={field.name}
                          checked={field.state.value}
                          onCheckedChange={field.handleChange}
                          aria-invalid={isInvalid}
                        />
                      </Field>
                    );
                  }}
                />
              </Field>
              <Field>
                <form.Field name="image" mode="array">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <FieldContent>
                        {field.state.value.map((_, i) => {
                          return (
                            <form.Field key={i} name={`image[${i}]`}>
                              {(subField) => {
                                return (
                                  <div className="flex flex-col gap-3">
                                    <FieldLabel htmlFor="">
                                      <Label htmlFor={`${field.name}-input`}>Image {i + 1}</Label>
                                    </FieldLabel>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Input
                                        value={subField.state.value}
                                        onChange={(e) => {
                                          subField.handleChange(e.target.value);
                                          setImageUrl(e.target.value);
                                        }}
                                      />
                                      <Button
                                        onClick={() => {
                                          field.removeValue(i);
                                          setImageUrl('');
                                        }}
                                        variant={'destructive'}
                                        type="button"
                                        size={'icon'}
                                        className="cursor-pointer"
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                          );
                        })}
                        <Button
                          onClick={() => {
                            field.pushValue(imageUrl);
                            setImageUrl('');
                          }}
                          type="button"
                          className="cursor-pointer"
                        >
                          Add Image
                        </Button>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </FieldContent>
                    );
                  }}
                </form.Field>
              </Field>
            </FieldGroup>
            <div className="flex flex-col items-center justify-center bg-zinc-900/50 rounded-lg p-6">
              <form.Subscribe
                selector={(state) => state.values.image}
                children={(images) => {
                  const validImages = images?.filter((img) => img && img.trim() !== '') || [];

                  if (validImages.length === 0) {
                    return (
                      <div className="text-center text-zinc-500">
                        <ImageIcon className="mx-auto size-12 mb-2 opacity-20" />
                        <p className="text-sm">No images added yet</p>
                      </div>
                    );
                  }

                  return (
                    <Carousel className="w-full" setApi={setApi}>
                      <CarouselContent>
                        {validImages.map((src, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <div className="relative aspect-square overflow-hidden rounded-md border">
                                <img
                                  src={src}
                                  alt={`Preview ${index + 1}`}
                                  className="object-contain w-full h-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://placehold.co/400?text=Invalid+Image';
                                  }}
                                />
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="cursor-pointer ml-3" />
                      <CarouselNext className="cursor-pointer mr-3" />
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        Image {current} of {images.length}
                      </div>
                    </Carousel>
                  );
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className=" bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save Post
                  </span>
                </Button>
              )}
            />
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
