import { ImageIcon, Maximize2 } from 'lucide-react';

import { Image } from '@/generated/prisma/client';
import { ShortPostPublic } from '@/lib/types';
import { cn } from '@/lib/utils';
export default function PostCollage({
  images,
  post,
  onExpand,
  handleToggleLightBox,
}: {
  images: Image[];
  post: ShortPostPublic;
  onExpand: () => void;
  handleToggleLightBox: (index: number, postId: string, open: boolean) => void;
}) {
  const count = images.length;

  const gridClassName = cn(
    'grid gap-1 relative z-20 w-full overflow-hidden rounded-xl bg-slate-950/40',
    {
      'grid-cols-1': count === 1,
      'grid-cols-2': count === 2,
      'grid-cols-2 grid-rows-2 h-[300px]': count >= 3,
    },
  );

  return (
    <div className={gridClassName}>
      {images.slice(0, 4).map((image, index) => {
        const isLarge = count === 3 && index === 0;
        return (
          <div
            key={image.id}
            className={cn('relative overflow-hidden cursor-pointer', {
              'row-span-2 h-75': isLarge,
              'aspect-video': count === 1,
              'aspect-4/5 sm:aspect-square': count === 2,
              'h-full': count >= 3,
            })}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLightBox(index, post.id, true);
            }}
          >
            <img
              src={image.url}
              alt={image.id}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
            {index === 3 && count > 4 && (
              <div className="absolute inset-0 bg-black/25 gap-1 flex items-center justify-center pointer-events-none">
                <ImageIcon className="size-5" />
                <span className="text-xl font-bold text-white">+{count - 4}</span>
              </div>
            )}
          </div>
        );
      })}
      {count > 1 && (
        <button
          className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-xl transition-opacity cursor-pointer z-9999"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onExpand();
          }}
        >
          <Maximize2 className="size-4 text-white" />
        </button>
      )}
    </div>
  );
}
