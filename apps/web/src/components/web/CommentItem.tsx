import { VirtualOrigin } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { intlFormatDistance } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { CommentCollection } from "@/collections/blog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  //   DropdownMenuGroup,
  DropdownMenuItem,
  //   DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/generated/prisma/enums";
import { BlogPostPublic } from "@/lib/types";

import { Button } from "../ui/button";

interface ChatItemProps {
  comment: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    content: string;
    postId: string | null;
    post_slug: string | null;
    shortPostId: string | null;
    parentId: string | null;
    readonly $synced: boolean;
    readonly $origin: VirtualOrigin;
    readonly $key: string;
    readonly $collectionId: string;
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image: string | null;
      password: string | null;
    };
  };
  user:
    | {
        id?: string | undefined;
        name?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        email?: string | undefined;
        emailVerified?: boolean | undefined;
        image?: string | null | undefined;
        password?: string | null | undefined;
        defaultImage?: string | null | undefined;
        biodata?: string | null | undefined;
        role?: UserRole | undefined;
      }
    | undefined;
  post: BlogPostPublic;
  commentCollection: CommentCollection;
}

export function CommentItem({ comment, user, commentCollection, post }: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleUpdate = () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }
    // optimistic update
    commentCollection.update(comment.id, (draft) => {
      draft.content = editContent;
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    // optimistic delete
    commentCollection.delete(comment.id);
  };

  const isOwner = user?.id === post.authorId;
  const isCommentOwner = user?.id === comment.user.id;

  return (
    <div className="group flex gap-4 p-4 rounded-2xl transition-all hover:bg-slate-900/40 border-l border-primary-600">
      <Link
        to="/user/$userId"
        params={{
          userId: comment.user.id,
        }}
        target="_blank"
      >
        <Avatar className="h-10 w-10 shrink-0 items-center justify-center">
          <AvatarImage src={comment.user.image as string} />
          <AvatarFallback>
            {comment.user.name
              ? comment.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : ""}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{comment.user.name}</span>
            <span className="text-xs text-slate-500">
              {intlFormatDistance(new Date(comment.createdAt), new Date())}
            </span>
          </div>

          {isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md text-slate-500 hover:bg-slate-800 hover:text-white transition-all cursor-pointer">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-900/50 border-slate-800 text-slate-300"
              >
                {isCommentOwner && (
                  <DropdownMenuItem
                    onClick={() => setIsEditing(true)}
                    className="gap-2 focus:bg-slate-800 focus:text-white cursor-pointer"
                  >
                    <Pencil className="size-3.5" /> Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="gap-2 text-rose-500 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!isOwner && isCommentOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md text-slate-500 hover:bg-slate-800 hover:text-white transition-all cursor-pointer">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-900/50 border-slate-800 text-slate-300"
              >
                <DropdownMenuItem
                  onClick={() => setIsEditing(true)}
                  className="gap-2 focus:bg-slate-800 focus:text-white cursor-pointer"
                >
                  <Pencil className="size-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="gap-2 text-rose-500 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3 mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-primary-500/50 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none text-sm text-slate-200 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                className="bg-primary-600 hover:bg-primary-500 cursor-pointer"
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}
