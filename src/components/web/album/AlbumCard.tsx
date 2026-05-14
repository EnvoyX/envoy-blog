import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { FolderIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlbumPrisma } from '@/lib/types';
import { useAlbumStore } from '@/store/album';

export function AlbumCard({ album, inDashboard }: { album: AlbumPrisma; inDashboard: boolean }) {
  const coverImage = album.coverImageUrl || album.images?.[0]?.url;
  const { toggleDialog, setInitialValues } = useAlbumStore();

  return (
    <Link
      to={inDashboard ? '/dashboard/albums/$albumId' : '/album/$albumId'}
      params={{ albumId: album.id }}
      className="group flex flex-col gap-3 outline-none"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-all group-hover:shadow-2xl group-hover:shadow-emerald-500/10 group-focus:ring-2 group-focus:ring-emerald-500">
        {coverImage ? (
          <img
            src={coverImage}
            alt={album.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-950">
            <FolderIcon className="size-12 text-slate-800" />
          </div>
        )}

        {inDashboard && (
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-8 rounded-full opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-black/40 backdrop-blur-xl border-white/10 text-white hover:bg-black/60 hover:scale-110"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-48 bg-slate-950/80 backdrop-blur-xl border-white/10 text-slate-200 shadow-2xl shadow-black/50"
              >
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Album Options
                </div>

                <DropdownMenuItem
                  className="cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setInitialValues({
                      name: album?.name ?? '',
                      description: album?.description || '',
                      published: album?.published as boolean,
                      coverImageUrl: album?.coverImageUrl || '',
                      type: 'edit',
                      showPrivateToFollowers: album?.showPrivateToFollowers as boolean,
                    });
                    toggleDialog('open', album?.id);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit Album</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-red-500/10 text-red-400 focus:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleDialog('delete', album.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Album</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex flex-col px-1">
        <h3 className="truncate text-sm font-bold text-slate-200 transition-colors group-hover:text-emerald-400">
          {album.name}
        </h3>
        <p className="text-[10px] max-sm:text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-0.5">
          {album._count?.images || 0} items
        </p>
        <p className="text-[11px] max-sm:text-[7px] font-medium text-slate-300 uppercase tracking-widest mt-0.5">
          Updated {formatDistanceToNow(new Date(album.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
}
