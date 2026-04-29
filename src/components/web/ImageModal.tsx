import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ShortPostPublic } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ImageModal({
  imageUrl,
  className,
  alt,
  post,
  imageOrder,
}: {
  post?: ShortPostPublic;
  imageUrl: string;
  className?: string;
  alt?: string;
  imageOrder?: number;
}) {
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={imageUrl ?? 'https://placehold.co/600x400?text=No+Image'}
          alt={alt ?? 'Post image content'}
          className={`${className} cursor-zoom-in`}
          loading="lazy"
          onClick={(e) => e.stopPropagation()}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=Invalid+Image';
          }}
        />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="min-h-screen min-w-screen bg-transparent border-none shadow-none p-0 flex items-center justify-center outline-none sm:rounded-none"
      >
        {imageUrl && post?.Images?.length === 1 && (
          <div className="relative group w-[90vw] h-full flex items-center justify-center">
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
            <DialogClose className="absolute top-0 right-0 p-2 rounded-full bg-slate-900/50 text-white hover:bg-slate-800 transition-colors border border-white/10 outline-none">
              <X className="size-5" />
            </DialogClose>
          </div>
        )}

        {imageUrl && post && post?.Images?.length > 1 && (
          <Carousel
            className="bg-transparent! relative group w-[90vw] h-full flex items-center justify-center  "
            onClick={(e) => {
              e.preventDefault();
            }}
            setApi={setApi}
            opts={{
              startIndex: imageOrder ?? 0,
            }}
          >
            <CarouselContent>
              {post?.Images?.map((image, index) => (
                <CarouselItem key={index} className="flex items-center justify-center">
                  <div className="relative overflow-hidden flex items-center justify-center">
                    <img
                      src={image.url}
                      className="max-w-full max-h-[90vh] object-contain object-center rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                      alt={`Preview ${index + 1}`}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="cursor-pointer ml-3 absolute top-1/2 left-0 bg-emerald-500!" />
            <CarouselNext className="cursor-pointer mr-3 absolute top-1/2 right-0 bg-emerald-500!" />
            <div className="py-2 text-center flex items-center gap-2 font-bold absolute bottom-0">
              {post?.Images.map((_, index) => {
                return (
                  <span
                    key={index}
                    className={cn('rounded-full w-2 h-2 bg-emerald-500/50', {
                      'bg-emerald-500': index + 1 === current,
                    })}
                  />
                );
              })}
            </div>
            <DialogClose className="absolute top-0 right-0 p-2 rounded-full bg-slate-900/50 text-white hover:bg-slate-800 transition-colors border border-white/10 outline-none">
              <X className="size-5" />
            </DialogClose>
          </Carousel>
        )}
      </DialogContent>
    </Dialog>
  );
}
