import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MoreVertical, Share2, Plus, Pencil, Trash2, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import PhotoGallery from "@/components/web/PhotoGallery";
import { getAlbumByIdFn } from "@/data/album";
import { useAlbumStore } from "@/store/album";
import { Image } from "@/generated/prisma/client";

export const Route = createFileRoute("/dashboard/albums/$albumId/")({
  component: AlbumPage,
  loader: async ({ params }) => {
    const album = await getAlbumByIdFn({ data: { albumId: params.albumId } });
    return album;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name} | Album | Envoy Mindpalace` },
      {
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      { property: "og:title", content: `${loaderData?.name} | Album | Envoy Mindpalace` },
      {
        property: "og:description",
        content: "Create your own blog and write your thoughts!",
      },
      {
        property: "og:image",
        content: "https://tanstack.com/assets/og-C0HGjoLl.png",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

export default function AlbumPage() {
  const album = Route.useLoaderData();
  const { albumId } = Route.useParams();
  const navigate = useNavigate();
  const { toggleDialog, setInitialValues } = useAlbumStore();

  const handleEdit = () => {
    setInitialValues({
      name: album?.name ?? "",
      description: album?.description || "",
      published: album?.published as boolean,
      coverImageUrl: album?.coverImageUrl || "",
      type: "edit",
    });
    toggleDialog("open", album?.id);
  };

  return (
    <div className="min-h-screen bg-transparent text-white">
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-transparent backdrop-blur-xl">
        <div className="mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10 cursor-pointer"
              onClick={() => {
                void navigate({
                  to: "/dashboard/albums",
                });
              }}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{album?.name}</h1>
              <p className="text-xs text-slate-400">{album?._count?.images || 0} photos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-2 rounded-full hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer"
              onClick={() => toggleDialog("import", albumId)}
            >
              <FileDown className="size-4" /> Import Photos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-2 rounded-full hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer"
              onClick={() => {
                setInitialValues({
                  name: album?.name ?? "",
                  description: album?.description || "",
                  published: album?.published as boolean,
                  coverImageUrl: album?.coverImageUrl || "",
                  type: "edit",
                });
                toggleDialog("bulk", albumId);
              }}
            >
              <Plus className="size-4" /> Add Photos
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
              <Share2 className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-slate-900/90 backdrop-blur-lg border-white/10"
              >
                <DropdownMenuItem
                  onClick={() => toggleDialog("import", albumId)}
                  className="cursor-pointer sm:hidden"
                >
                  <FileDown className="mr-2 size-4" /> Import Photos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setInitialValues({
                      name: album?.name ?? "",
                      description: album?.description || "",
                      published: album?.published as boolean,
                      coverImageUrl: album?.coverImageUrl || "",
                      type: "edit",
                    });
                    toggleDialog("bulk", albumId);
                  }}
                  className="cursor-pointer sm:hidden"
                >
                  <Plus className="mr-2 size-4" /> Add Photos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                  <Pencil className="mr-2 size-4" /> Edit details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleDialog("delete", album?.id)}
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <Trash2 className="mr-2 size-4" /> Delete album
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {album?.images.length === 0 && (
        <main className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
          <p className="text-slate-500">No images found on this album. import your first image!</p>
        </main>
      )}
      <main className="container mx-auto p-4">
        {album?.description && (
          <p className="mb-8 text-lg text-slate-400 px-4">{album.description}</p>
        )}
        <PhotoGallery images={album?.images as Image[]} type="private" />
      </main>
    </div>
  );
}
