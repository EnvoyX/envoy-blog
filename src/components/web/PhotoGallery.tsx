import { useRef, useState } from 'react';
import { Masonry } from 'react-plock';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Share from 'yet-another-react-lightbox/plugins/share';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import { Image } from '@/generated/prisma/client';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
// custom image modal or lightbox
import { ImageModal } from './ImageModal';

export default function PhotoGallery({ images }: { images: Image[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const fullscreenRef = useRef(null);
  const slideshowRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const zoomRef = useRef(null);
  const photos = images.map((photo, index) => ({
    ...photo,
    globalIndex: index,
  }));
  return (
    <div className="p-4 min-h-screen">
      <Masonry
        items={photos}
        config={{
          columns: [1, 2, 3, 4], // 1 col on mobile, 2 on sm, 3 on md, 4 on lg
          gap: [16, 20, 24], // gap sizes in pixels corresponding to breakpoints
          media: [640, 768, 1024], // tailwind's default breakpoints
        }}
        render={(photo, idx) => {
          return (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl "
            >
              {/*<ImageModal
                imageUrl={photo.url}
                className="w-full h-auto display:block transition-transform duration-500 group-hover:scale-105"
                images={images}
                imageOrder={photo.globalIndex}
              />*/}
              <img
                src={photo.url}
                alt={photo.id}
                className="w-full h-auto display:block transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                onClick={() => {
                  setOpen(true);
                  setIndex(photo.globalIndex);
                }}
              />

              {/*<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                          <p className="text-gray-200 text-xs">{photo.category}</p>
                        </div>*/}
            </div>
          );
        }}
      />
      <Lightbox
        open={open}
        index={index}
        on={{ view: ({ index: currentIndex }) => setIndex(currentIndex) }}
        close={() => setOpen(false)}
        plugins={[Counter, Download, Fullscreen, Share, Slideshow, Thumbnails, Zoom]}
        fullscreen={{ ref: fullscreenRef }}
        slideshow={{ ref: slideshowRef }}
        thumbnails={{
          ref: thumbnailsRef,
          showToggle: true,
          hidden: true,
          vignette: false,
          borderColor: 'transparent',
        }}
        zoom={{ ref: zoomRef }}
        counter={{
          container: { style: { top: 0, bottom: 'unset', color: 'oklch(69.6% 0.17 162.48)' } },
        }}
        styles={{
          root: {
            backgroundColor: 'transparent',
            backdropFilter: 'blur(24px)',
          },
          container: {
            backgroundColor: 'transparent',
            backdropFilter: 'blur(24px)',
          },
          button: {
            color: 'oklch(69.6% 0.17 162.48)',
          },
          thumbnailsContainer: {
            // backgroundColor: 'transparent',
            // backdropFilter: 'blur(24px)',
          },
          thumbnail: {
            backgroundColor: 'transparent',
          },
        }}
        slides={photos.map((photo) => {
          return {
            src: photo.url,
            alt: photo.id,
          };
        })}
      />
    </div>
  );
}
