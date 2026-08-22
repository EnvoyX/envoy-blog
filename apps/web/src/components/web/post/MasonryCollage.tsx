import { Masonry } from 'react-plock';

import { Image } from '@/generated/prisma/client';
import { ShortPostPublic } from '@/lib/types';
export default function MasonryCollage({
  images,
  post,
  handleToggleLightBox,
}: {
  images: Image[];
  post: ShortPostPublic;
  handleToggleLightBox: (index: number, postId: string, open: boolean) => void;
}) {
  const photos = images?.map((photo, index) => ({
    ...photo,
    globalIndex: index,
  }));
  return (
    <div className="relative z-20 w-full rounded-xl overflow-hidden p-1">
      <Masonry
        items={photos}
        config={{
          columns: [2, 2, 2],
          gap: [4, 4, 4],
          media: [640, 768, 1024],
          // useBalancedLayout: true,
        }}
        render={(photo) => (
          <div
            key={photo.id}
            className="relative overflow-hidden rounded-lg cursor-pointer group/img"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLightBox(photo.globalIndex, post.id, true);
            }}
          >
            <img
              src={photo.url}
              alt={photo.id}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-500 animate-in fade-in slide-in-from-bottom-4 group-hover/img:scale-[1.05]"
            />
          </div>
        )}
      />
    </div>
  );
}
