import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { createStore, useSelector } from "@tanstack/react-store";
import { zodValidator } from "@tanstack/zod-adapter";
import { compareAsc, compareDesc } from "date-fns";
import { MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditPostDialog } from "@/components/web/post/EditPostDialog";
import { PostDialog } from "@/components/web/post/PostDialog";
import { deleteShortPostFn, getShortPostsFn } from "@/data/post";
import { getUser } from "@/data/session";
import { SortedByStatus } from "@/lib/constants";
import { shortPostSearchSchema } from "@/schemas/post";

export const postModalStore = createStore({
  dialogId: "",
  isOpen: false,
  isCreatePostDialog: false,
  isEditPostDialog: false,
  isDeletePostDialog: false,
  isLoading: false,
  currentPostId: "",
});

export const Route = createFileRoute("/dashboard/post/")({
  loader: async () => {
    const allPosts = await getShortPostsFn();
    const session = await getUser();
    return {
      allPosts,
      session,
    };
  },
  component: PostPageComponent,
  validateSearch: zodValidator(shortPostSearchSchema),
  head: () => ({
    meta: [
      { title: `My Posts | Envoy Mindpalace` },
      {
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      { property: "og:title", content: "My Posts | Envoy Mindpalace" },
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

function PostPageComponent() {
  const { allPosts, session } = Route.useLoaderData();
  const { sortDateBy } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const router = useRouter();
  const sortedPosts = [...allPosts].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    if (sortDateBy === "ASC") {
      return compareAsc(dateA, dateB);
    } else {
      return compareDesc(dateA, dateB);
    }
  });

  const isDeletePostDialog = useSelector(postModalStore, (state) => state.isDeletePostDialog);
  const isOpen = useSelector(postModalStore, (state) => state.isOpen);
  const currentPostId = useSelector(postModalStore, (state) => state.currentPostId);

  async function handleDeletePost() {
    await deleteShortPostFn({
      data: {
        shortPostId: currentPostId,
      },
    });
    postModalStore.setState((prev) => ({
      ...prev,
      isOpen: false,
      isDeletePostDialog: false,
    }));
    toast.success("Post deleted successfully");
    void router.invalidate();
  }

  return (
    <div className="min-h-screen text-slate-50 p-8">
      <div className="max-w-7xl mx-auto max-sm:flex max-sm:flex-col ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">My Posts</h1>
            <p className="text-slate-400 mt-2">Create and edit your posts here.</p>
          </div>
          <PostDialog />
        </div>

        <div className="flex max-sm:flex-col items-center max-sm:justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 rounded-lg">
            <h3 className="text-muted-foreground">Sort By:</h3>
            <Select
              value={sortDateBy}
              onValueChange={(value) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    sortDateBy: value as SortedByStatus,
                  }),
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort By Date" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SortedByStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {sortedPosts.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No posts found. Create your first post!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mx-auto">
          {sortedPosts.map((post) => {
            const imgs = post.Images.map((img) => img.url);
            const firstImageUrl = imgs[0];
            return (
              <Card
                key={post.id}
                className="group relative bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col hover:scale-105 max-w-xs py-0"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={
                      firstImageUrl
                        ? firstImageUrl
                        : "https://tanstack.com/images/logos/logo-color-600.png"
                    }
                    alt={post.id}
                    className="object-cover w-full h-full transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

                  {post.authorId === session?.user?.id && (
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="size-8 rounded-full bg-slate-950/50 backdrop-blur-md border-slate-700 hover:bg-slate-800 cursor-pointer"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 bg-transparent backdrop-blur-lg border-slate-800 text-slate-200"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                            asChild
                          >
                            <EditPostDialog
                              initialValues={{
                                images: imgs.length > 0 ? imgs : [""],
                                content: post.content ?? "",
                                published: post.published,
                                currentPostId: post.id,
                              }}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              postModalStore.setState((prev) => {
                                return {
                                  ...prev,
                                  isOpen: true,
                                  isDeletePostDialog: true,
                                  currentPostId: post.id,
                                };
                              });
                            }}
                            className="focus:bg-red-500/20 text-red-400 focus:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Post</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <Dialog
        open={isOpen && isDeletePostDialog}
        onOpenChange={(open) => {
          postModalStore.setState((prev) => {
            return {
              ...prev,
              isOpen: open,
              isDeletePostDialog: open,
            };
          });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant={"destructive"}
              className="cursor-pointer"
              onClick={handleDeletePost}
            >
              Delete Post
            </Button>
            <DialogClose asChild>
              <Button type="button" className="cursor-pointer">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
