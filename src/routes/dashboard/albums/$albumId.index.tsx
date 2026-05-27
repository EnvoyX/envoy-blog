import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { intlFormat, intlFormatDistance } from 'date-fns';
import {
  ArrowLeft,
  MoreVertical,
  Share2,
  Plus,
  Pencil,
  Trash2,
  FileDown,
  Upload,
  Download,
  ImageIcon,
  PencilLine,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PhotoGallery from '@/components/web/PhotoGallery';
import { getAlbumByIdFn } from '@/data/album';
import { Image } from '@/generated/prisma/client';
import { useAlbumStore } from '@/store/album';
import { useImageStore } from '@/store/image';
import { imageUploadModalStore } from '@/store/imageUploadStore';
import { downloadAlbumClientSide } from '@/utils/utils';

export const Route = createFileRoute('/dashboard/albums/$albumId/')({
  component: AlbumPage,
  loader: async ({ params, context }) => {
    const album = await getAlbumByIdFn({ data: { albumId: params.albumId } });
    if (album && !album?.published && album?.authorId !== context.user?.id)
      throw redirect({ to: '/dashboard/albums' });
    return album;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name} | Album | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: `${loaderData?.name} | Album | Envoy Mindpalace` },
      {
        property: 'og:description',
        content: 'Create your own blog and write your thoughts!',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function AlbumPage() {
  const album = Route.useLoaderData();
  const { albumId } = Route.useParams();
  const navigate = useNavigate();
  const { toggleDialog, setInitialValues } = useAlbumStore();
  const { toggleDialog: toggleImageDialog } = useImageStore();

  const handleDownload = async () => {
    if (!album) {
      toast.error('Album are not found');
      return;
    }
    toast.loading('Downloading album as ZIP...', {
      id: 'download-zip',
    });
    await downloadAlbumClientSide(album?.name, album?.images);
    toast.dismiss('download-zip');
    toast.success('Album sucessfully downloaded!');
  };

  const handleEdit = () => {
    setInitialValues({
      name: album?.name ?? '',
      description: album?.description || '',
      published: album?.published as boolean,
      coverImageUrl: album?.coverImageUrl || '',
      type: 'edit',
      showPrivateToFollowers: album?.showPrivateToFollowers as boolean,
    });
    toggleDialog('open', album?.id);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-transparent backdrop-blur-xl">
        <div className="mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10 cursor-pointer"
              onClick={() => {
                void navigate({
                  to: '/dashboard/albums',
                });
              }}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight line-clamp-1">{album?.name}</h1>
              <p className="text-xs text-emerald-400">{album?._count?.images || 0} photos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-2 rounded-full hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer"
              onClick={() => {
                setInitialValues({
                  name: album?.name ?? '',
                  description: album?.description || '',
                  published: album?.published as boolean,
                  coverImageUrl: album?.coverImageUrl || '',
                  type: 'edit',
                  addPhotos: true,
                  showPrivateToFollowers: album?.showPrivateToFollowers as boolean,
                });
                toggleDialog('bulk-add', albumId);
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
                  onClick={() => toggleDialog('import', albumId)}
                  className="cursor-pointer"
                >
                  <FileDown className="mr-2 size-4" /> Import Photos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setInitialValues({
                      name: album?.name ?? '',
                      description: album?.description || '',
                      published: album?.published as boolean,
                      coverImageUrl: album?.coverImageUrl || '',
                      type: 'edit',
                      addPhotos: true,
                      showPrivateToFollowers: album?.showPrivateToFollowers as boolean,
                    });
                    toggleDialog('bulk-add', albumId);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 size-4" /> Add Photos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    imageUploadModalStore.setState((prev) => ({
                      ...prev,
                      isDialogOpen: true,
                      albumId,
                    }))
                  }
                  className="cursor-pointer"
                >
                  <Upload className="mr-2 size-4" /> Upload Photo
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setInitialValues({
                      name: album?.name ?? '',
                      description: album?.description || '',
                      published: album?.published as boolean,
                      coverImageUrl: album?.coverImageUrl || '',
                      type: 'edit',
                      showPrivateToFollowers: album?.showPrivateToFollowers as boolean,
                    });
                    toggleDialog('albumCover', albumId);
                  }}
                >
                  <ImageIcon className="mr-2 size-4" /> Set album cover
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleDownload}>
                  <Download className="mr-2 size-4" /> Download as ZIP
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                  <Pencil className="mr-2 size-4" /> Edit Album
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toggleImageDialog('bulk-edit', '', '', albumId);
                  }}
                  className="cursor-pointer"
                >
                  <PencilLine className="mr-2 size-4" /> Edit Images
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setInitialValues({
                      name: album?.name ?? '',
                      description: album?.description || '',
                      published: album?.published as boolean,
                      coverImageUrl: album?.coverImageUrl || '',
                      type: 'edit',
                      addPhotos: false,
                      showPrivateToFollowers: album?.showPrivateToFollowers as boolean,
                    });
                    toggleDialog('bulk-remove', albumId);
                  }}
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <Trash2 className="mr-2 size-4" /> Remove photos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setInitialValues({
                      name: album?.name ?? '',
                      description: album?.description || '',
                      published: album?.published as boolean,
                      coverImageUrl: album?.coverImageUrl || '',
                      type: 'edit',
                      addPhotos: false,
                      showPrivateToFollowers: album?.showPrivateToFollowers as boolean,
                    });
                    toggleDialog('bulk-delete', albumId);
                  }}
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <Trash2 className="mr-2 size-4" /> Delete photos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleDialog('delete', album?.id)}
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <Trash2 className="mr-2 size-4" /> Delete album
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="w-full p-1">
        {album?.description && (
          <p className="mb-1 text-base text-emerald-500 px-4">{album.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm px-4">
          <div className="flex flex-row items-center gap-2 sm:gap-4 text-slate-400 ">
            <p className="flex items-center">
              {intlFormat(new Date(album?.createdAt as Date), {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <span className="inline text-slate-700">•</span>
            <span className="text-slate-500 italic">
              Updated {intlFormatDistance(new Date(album?.updatedAt as Date), new Date())}
            </span>
          </div>
        </div>
        {album?.images.length === 0 && (
          <main className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">
              No images found on this album. import your first image!
            </p>
          </main>
        )}
        {album && album?.images?.length > 0 && (
          <PhotoGallery images={album?.images as Image[]} type="private" albumId={albumId} />
        )}
      </main>
    </div>
  );
}
