import { createFileRoute } from "@tanstack/react-router";

import PhotoGallery from "@/components/web/PhotoGallery";
import { getImagesFn } from "@/data/image";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useAlbumStore } from "@/store/album";
import { imageUploadModalStore } from "@/store/imageUploadStore";

export const Route = createFileRoute("/dashboard/images/")({
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
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      {
        property: "og:title",
        content: `Images | Envoy Mindpalace`,
      },
      {
        property: "og:description",
        content: `Manage and edit your images here.`,
      },
      {
        property: "og:image",
        content: "https://tanstack.com/assets/og-C0HGjoLl.png",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function RouteComponent() {
  const { images } = Route.useLoaderData();
  const { toggleDialog } = useAlbumStore();
  return (
    <div className="min-h-screen  text-slate-50 p-8">
      <div className="max-w-7xl mx-auto max-sm:flex max-sm:flex-col ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Images</h1>
            <p className="text-slate-400 mt-2">Manage and edit your images here.</p>
          </div>
          <div className="flex items-center max-sm:flex-col gap-2">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/40 group active:scale-95 cursor-pointer"
              onClick={() => toggleDialog("import", "")}
            >
              <div className="flex items-center gap-2">
                <Plus className="size-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold tracking-tight">Import Images</span>
              </div>
            </Button>
            <Button
              size="lg"
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
                <span className="font-semibold tracking-tight">Upload Images</span>
              </div>
            </Button>
          </div>
        </div>
        {images.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No images found. Create your first post!</p>
          </div>
        )}
        <div className="container mx-auto p-4">
          <PhotoGallery images={images} type="private" />
        </div>
      </div>
    </div>
  );
}
