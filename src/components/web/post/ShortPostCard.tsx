import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, MoreHorizontal, Image as ImageIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GetUserType } from '@/data/session';
import { ShortPostPublic } from '@/lib/types';

import { ImageModal } from '../ImageModal';

export function ShortPostCard({ post, session }: { post: ShortPostPublic; session: GetUserType }) {
  const firstImage = post.Images?.[0]?.url;
  const hasLiked = post.likes.find((like) => like.userId === session.user.id);
  return (
    <div className="group p-5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-slate-800">
            <AvatarImage src={post.author.image ?? ''} />
            <AvatarFallback>
              {post.author.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-none">{post.author.name}</span>
            <span className="text-[11px] text-slate-500 tracking-tighter mt-1">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <button className="p-2 text-slate-600 hover:text-white transition-colors">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {post.content && (
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      )}

      {firstImage && (
        <div
          className="relative aspect-square sm:aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <ImageModal
            imageUrl={firstImage}
            post={post}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {post.Images.length > 1 && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-bold text-white flex items-center gap-1.5">
              <ImageIcon className="size-3" />+{post.Images.length - 1}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 pt-2 border-t border-slate-900">
        <button
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors group/stat cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="p-1.5 rounded-full group-hover/stat:bg-emerald-500/10">
            <Heart className="size-4" />
          </div>
          <span className="text-xs font-semibold tabular-nums">{post._count.likes}</span>
        </button>

        <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors group/stat cursor-pointer">
          <div className="p-1.5 rounded-full group-hover/stat:bg-blue-500/10">
            <MessageSquare className="size-4" />
          </div>
          <span className="text-xs font-semibold tabular-nums">{post._count.comments}</span>
        </button>
      </div>
    </div>
  );
}
