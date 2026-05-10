import { createFileRoute, redirect } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { intlFormat, intlFormatDistance } from 'date-fns';
import { ArrowLeft, Download, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Footer } from '@/components/web/footer';
import PhotoGallery from '@/components/web/PhotoGallery';
import { UserAvatar } from '@/components/web/user-profile';
import { getAlbumByIdFn } from '@/data/album';
import { getUser } from '@/data/session';
import { Image } from '@/generated/prisma/client';
import { downloadAlbumClientSide } from '@/utils/utils';
export const Route = createFileRoute('/_general-without-layout/album/$albumId/')({
  component: AlbumPage,
  loader: async ({ params }) => {
    const album = await getAlbumByIdFn({ data: { albumId: params.albumId } });
    const session = await getUser();
    const isOwner = session?.user?.id === album?.authorId;
    const isPrivateShownToFollower =
      session &&
      album?.author.followers.some((follow) => follow.follower.id === session?.user?.id) &&
      album.showPrivateToFollowers &&
      !album.published;
    if (!album?.published && !isOwner && !isPrivateShownToFollower) {
      throw redirect({ to: '/dashboard/albums' });
    }
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

  return (
    <main>
      <div className="min-h-screen bg-transparent text-white">
        <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-transparent backdrop-blur-xl">
          <div className="mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  window.history.back();
                }}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{album?.name}</h1>
                <p className="text-xs text-emerald-400">{album?._count?.images || 0} photos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 pr-4">
                <Link
                  to="/user/$userId"
                  params={{
                    userId: album?.authorId as string,
                  }}
                  target="_blank"
                >
                  <UserAvatar
                    src={album?.author.image as string}
                    alt={album?.author.name as string}
                    className="h-9 w-9"
                  />
                </Link>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-200">{album?.author.name}</span>
                  <span className="text-xs text-emerald-500 uppercase tracking-wider">Author</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2 rounded-full hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer"
                onClick={handleDownload}
              >
                <Download className="size-4" /> Download as ZIP
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-white/10 cursor-pointer sm:hidden"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-slate-900/90 backdrop-blur-lg border-white/10"
                >
                  <DropdownMenuItem className="cursor-pointer" onClick={handleDownload}>
                    <Download className="mr-2 size-4" /> Download as ZIP
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <section className="w-full p-4">
          {album?.description && (
            <p className="text-base text-emerald-500 px-4 mb-1">{album.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm px-4">
            <div className="flex flex-row items-center gap-2 sm:gap-4 text-slate-400">
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
          <PhotoGallery images={album?.images as Image[]} type="public" albumId={albumId} />
        </section>
      </div>
      <Footer />
    </main>
  );
}
