import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getImagesFn } from "@/data/image";
import PhotoGallery from "@/components/web/PhotoGallery";
import { imageUploadModalStore } from "@/store/imageUploadStore";
import { ImageUploader } from "@/components/web/ImageUploader";

export const Route = createFileRoute("/dashboard/image-upload/")({
  component: PageUpload,
  loader: async () => {
    const images = await getImagesFn();
    return {
      images,
    };
  },
});

function PageUpload() {
  const { images } = Route.useLoaderData();
  const uploadedImages = images.filter((image) => image.source === "IMGBB");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-emerald-950/30 to-slate-950 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-400 drop-shadow-[0_0_16px_rgba(52,211,153,0.4)]">
            Image Upload
          </h1>
          <p className="text-slate-400 text-sm">Crop, rotate, preview — then publish to ImgBB</p>
        </div>

        <div
          className="relative border-2 border-dashed border-emerald-700 rounded-2xl p-14 text-center cursor-pointer
                     hover:border-emerald-400 hover:bg-emerald-950/30 transition-all duration-300 group"
          onClick={() => {
            imageUploadModalStore.setState((prev) => ({
              ...prev,
              isDialogOpen: true,
            }));
          }}
        >
          <div className="flex flex-col items-center gap-3 pointer-events-none select-none">
            <div
              className="w-16 h-16 rounded-2xl bg-emerald-900/60 flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-300 ring-1 ring-emerald-700"
            >
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold">Upload an image here</p>
              <p className="text-slate-500 text-sm mt-1">or click to start upload</p>
            </div>
          </div>
        </div>

        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-emerald-300 font-semibold text-sm uppercase tracking-widest">
                Uploaded
              </h2>
              <Separator className="flex-1 bg-emerald-900/60" />
              <Badge variant="outline" className="border-emerald-700 text-emerald-400 text-xs">
                {uploadedImages.length}
              </Badge>
            </div>
            <PhotoGallery images={uploadedImages} type="private" />
          </div>
        )}
      </div>
      <ImageUploader />
    </div>
  );
}
