import { useDebouncedCallback } from "@tanstack/react-pacer";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { zodValidator } from "@tanstack/zod-adapter";
import { intlFormat, intlFormatDistance } from "date-fns";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  LucideClockFading,
  ListXIcon,
  Loader2,
  Search,
  Heart,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deletePostFn } from "@/data/blog";
import { postPublishedSearchSchema } from "@/schemas/blog";
import { modalStore } from "@/store/blogStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import { blogOptions } from "@/data/query-options/queryOptions";

export const Route = createFileRoute("/_general/blog/")({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(blogOptions());
    return {
      user: context.user,
    };
  },
  component: BlogPageComponent,
  validateSearch: zodValidator(postPublishedSearchSchema),
  head: () => ({
    meta: [
      { title: `Blogs | Envoy Mindpalace` },
      {
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      { property: "og:title", content: "Blogs | Envoy Mindpalace" },
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

function BlogPageComponent() {
  const { user } = Route.useLoaderData();
  const { data } = useSuspenseQuery(blogOptions());
  const posts = data.allPosts.filter(
    (post) => post.author.email === "muhamadhanifhafizhan@gmail.com",
  );

  const { query } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const router = useRouter();
  const isOpen = useSelector(modalStore, (state) => state.isOpen);
  const isLoading = useSelector(modalStore, (state) => state.isLoading);

  const filteredPosts = posts.filter((post) => {
    const matchedQuery =
      post.title?.toLowerCase().includes(query.toLowerCase()) ||
      post.description?.toLowerCase().includes(query.toLowerCase()) ||
      query === "";

    return matchedQuery;
  });

  const debouncedSearch = useDebouncedCallback(
    (searchTerm: string) => {
      void navigate({
        search: (prev) => ({ ...prev, query: searchTerm }),
      });
    },
    {
      wait: 500, // Wait 500ms after last keystroke
    },
  );

  //   const { unsubscribe } = modalStore.subscribe(() => {
  //     console.log('The state is now:', modalStore.state)
  //   })

  return (
    <div className="min-h-screen my-16 p-4">
      <div className="max-w-7xl mx-auto max-sm:flex max-sm:flex-col ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Blog Posts</h1>
            <p className="text-slate-400 mt-2">View latest blog posts.</p>
          </div>
          {user && (
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 rounded-full px-6 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Link to="/dashboard/blog/create-blog" className="gap-2">
                <Plus className="size-5" />
                Create New Blog
              </Link>
            </Button>
          )}
        </div>

        <div className="flex max-sm:flex-col items-center max-sm:justify-center gap-4 mb-8">
          <div className="relative w-full  group">
            <div className="absolute inset-y-0 z-10 left-3 flex items-center  pointer-events-none">
              <Search className="size-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <Input
              type="search"
              placeholder="Search blogs..."
              className="pl-10 bg-emerald-900/40  focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 backdrop-blur-sm transition-all"
              onChange={(e) => {
                debouncedSearch(e.target.value);
              }}
            />
          </div>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No latest blogs found. Stay tuned!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mx-auto">
          {filteredPosts.map((post) => {
            const hasLiked = post.likes.find(
              (like) => like.userId === user?.id && like.postId === post.id,
            );
            return (
              <Card
                key={post.id}
                className="group relative bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col hover:scale-105 max-w-xs py-0 animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={post.image ?? "https://tanstack.com/assets/og-C0HGjoLl.png"}
                    alt={post.title}
                    className="object-cover w-full h-full transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

                  {post.authorId === user?.id && (
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
                          className="w-40 bg-slate-900 border-slate-800 text-slate-200"
                        >
                          <DropdownMenuItem asChild className="cursor-pointer gap-2">
                            <Link to="/dashboard/blog/$slug" params={{ slug: post.slug }}>
                              <ExternalLink className="size-4" /> View Blog
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <Link
                              to="/dashboard/blog/$slug/edit"
                              params={{ slug: post.slug }}
                              className="flex gap-1"
                            >
                              <Pencil className="size-4" /> Edit Blog
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              modalStore.setState((prev) => {
                                return {
                                  ...prev,
                                  isOpen: !prev.isOpen,
                                  dialogId: post.id,
                                };
                              });
                            }}
                            className="cursor-pointer gap-2 text-red-400 focus:text-red-400 focus:bg-red-400/10"
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                <CardContent className="p-6 flex-1">
                  <div className="flex flex-col justify-start items-start sm:flex-row  sm:items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 uppercase tracking-widest font-semibold">
                      <Calendar className="size-3" />
                      {intlFormat(new Date(post.createdAt), {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold leading-tight group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                </CardContent>

                <CardFooter className="p-6 pt-0 flex flex-col justify-start items-start gap-1">
                  <span className="absolute flex flex-col items-center gap-1 bottom-6 right-3 group">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 group-hover:border-emerald-500/30 transition-colors">
                      <Heart
                        className={`size-3.5 ${hasLiked ? "fill-emerald-500 text-emerald-500" : ""}`}
                      />
                      <span className="text-[11px] font-bold tabular-nums">
                        {post._count.likes}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 group-hover:border-blue-500/30 transition-colors">
                      <MessageSquare className="size-3.5" />
                      <span className="text-[11px] font-bold tabular-nums">
                        {post._count.comments}
                      </span>
                    </div>
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 uppercase tracking-widest font-semibold">
                    <LucideClockFading className="size-3" />
                    {intlFormatDistance(new Date(post.updatedAt), new Date())}
                  </div>

                  <Button
                    asChild
                    variant="link"
                    className="p-0 h-auto text-emerald-400 hover:text-emerald-300 gap-2 cursor-pointer"
                  >
                    <Link to="/blog/$slug" params={{ slug: post.slug }}>
                      Read Full Blog →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            modalStore.setState((prev) => {
              return {
                ...prev,
                isOpen: open,
              };
            });
          }}
        >
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <form
              onSubmit={async (e) => {
                modalStore.setState((prev) => {
                  return {
                    ...prev,
                    isLoading: true,
                  };
                });
                e.preventDefault();
                await deletePostFn({
                  data: {
                    postId: modalStore.state.dialogId,
                  },
                });
                toast.success("Blog deleted");
                void router.invalidate();
                modalStore.setState((prev) => {
                  return {
                    ...prev,
                    isLoading: false,
                    dialogId: "",
                    isOpen: false,
                  };
                });
              }}
            >
              <DialogHeader className="mb-6">
                <DialogTitle>Delete Task List</DialogTitle>
                <DialogDescription>
                  Are you sure to delete this task list? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button variant="outline" className="cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading} className="cursor-pointer">
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <ListXIcon className="size-4" />
                      Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
