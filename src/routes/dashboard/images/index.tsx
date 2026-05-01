import { createFileRoute } from '@tanstack/react-router';

import PhotoGallery from '@/components/web/PhotoGallery';
import { getImagesFn } from '@/data/image';

export const Route = createFileRoute('/dashboard/images/')({
  component: RouteComponent,
  loader: async () => {
    const images = await getImagesFn();
    return {
      images,
    };
  },
  head: () => ({
    meta: [
      { title: `Images | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      {
        property: 'og:title',
        content: `Images | Envoy Mindpalace`,
      },
      {
        property: 'og:description',
        content: `Manage and edit your images here.`,
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function RouteComponent() {
  const { images } = Route.useLoaderData();
  return (
    <div className="min-h-screen  text-slate-50">
      <div className="max-w-7xl mx-auto max-sm:flex max-sm:flex-col ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Images
            </h1>
            <p className="text-slate-400 mt-2">Manage and edit your images here.</p>
          </div>
        </div>
        {images.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No images found. Create your first post!</p>
          </div>
        )}
        <div className="container mx-auto p-4">
          <PhotoGallery images={images} />
        </div>
      </div>
    </div>
  );
}
