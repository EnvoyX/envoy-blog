import { createFileRoute } from '@tanstack/react-router';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import PhotoGallery from '@/components/web/PhotoGallery';
import { getImagesFn } from '@/data/image';
import { useAlbumStore } from '@/store/album';
import { useImageStore } from '@/store/image';
import { imageUploadModalStore } from '@/store/imageUploadStore';

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
  const { toggleDialog } = useAlbumStore();
  const { toggleDialog: toggleImageDialog } = useImageStore();
  return (
    <div className="min-h-screen p-1">
      <div className="w-full max-sm:flex max-sm:flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-8">
          <div className="max-sm:text-center">
            <h1 className="text-4xl font-black tracking-tight text-white">Images</h1>
            <p className="text-slate-400 mt-2">Manage and edit your images here.</p>
          </div>
          <div className="flex items-center max-sm:mx-auto gap-2">
            <Button
              size="icon-lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/40 group active:scale-95 cursor-pointer"
              onClick={() => toggleDialog('import', '')}
            >
              <div className="flex items-center gap-2">
                <Plus className="size-5 group-hover:rotate-90 transition-transform duration-300" />
              </div>
            </Button>
            <Button
              size="icon-lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/40 group active:scale-95 cursor-pointer"
              onClick={() => toggleImageDialog('bulk-edit')}
            >
              <div className="flex items-center gap-2">
                <Pencil className="size-5" />
              </div>
            </Button>
            <Button
              size="icon-lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/40 group active:scale-95 cursor-pointer"
              onClick={() =>
                imageUploadModalStore.setState((prev) => ({
                  ...prev,
                  isDialogOpen: true,
                }))
              }
            >
              <div className="flex items-center gap-2">
                <Upload className="size-5" />
              </div>
            </Button>
            <Button
              size="icon-lg"
              className="bg-destructive/90 hover:bg-destructive text-white rounded-xl px-6 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-destructive/40 group active:scale-95 cursor-pointer"
              onClick={() => toggleImageDialog('bulk-delete', '', '')}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="size-5" />
              </div>
            </Button>
          </div>
        </div>
        {images.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No images found. Add or import your first image!</p>
          </div>
        ) : (
          <div className="w-full">
            <PhotoGallery images={images} type="private" />
          </div>
        )}
      </div>
    </div>
  );
}
