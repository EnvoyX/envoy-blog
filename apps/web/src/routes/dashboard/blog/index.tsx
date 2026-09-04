import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import { zodValidator } from '@tanstack/zod-adapter';
import { intlFormat, intlFormatDistance } from 'date-fns';
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
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deletePostFn } from '@/data/blog';
import { dashboardBlogPostsOptions } from '@/data/query-options/dashboardQueryOptions';
import { BlogStatus } from '@/lib/constants';
import { postSearchSchema } from '@/schemas/blog';
import { modalStore } from '@/store/blogStore';

export const Route = createFileRoute('/dashboard/blog/')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery({
      ...dashboardBlogPostsOptions(),
    });
    return {
      session: {
        user: context?.user,
      },
    };
  },
  component: BlogPageComponent,
  validateSearch: zodValidator(postSearchSchema),
  head: () => ({
    meta: [
      { title: `My Blog | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'My Blog | Envoy Mindpalace' },
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

function BlogPageComponent() {
  const { session } = Route.useLoaderData();
  const { queryClient } = Route.useRouteContext();
  const { data: allPosts } = useSuspenseQuery({
    ...dashboardBlogPostsOptions(),
  });
  const { visibility, query } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const router = useRouter();
  const isOpen = useSelector(modalStore, (state) => state.isOpen);
  const isLoading = useSelector(modalStore, (state) => state.isLoading);

  const filteredPosts = allPosts.filter((post) => {
    const matchedQuery =
      post.title?.toLowerCase().includes(query.toLowerCase()) ||
      post.description?.toLowerCase().includes(query.toLowerCase()) ||
      query === '';
    const matchedStatus =
      visibility === 'PUBLIC' ? post.published : visibility === 'PRIVATE' ? !post.published : null;
    if (matchedStatus === null) return matchedQuery;

    return matchedQuery && matchedStatus;
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

  return (
    <div className="min-h-screen text-slate-50 p-8">
      <div className="max-w-7xl mx-auto max-sm:flex max-sm:flex-col ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">My Blog</h1>
            <p className="text-slate-400 mt-2">Manage and curate your digital thoughts.</p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-sm cursor-pointer"
          >
            <Link to="/dashboard/blog/create-blog" className="gap-2">
              <Plus className="size-5" />
              Create Blog
            </Link>
          </Button>
        </div>

        <div className="flex max-sm:flex-col items-center max-sm:justify-center gap-4 mb-8">
          <div className="relative w-full  group">
            <div className="absolute inset-y-0 z-10 left-3 flex items-center  pointer-events-none">
              <Search className="size-4 text-zinc-500 group-focus-within:text-zinc-200 transition-colors" />
            </div>
            <Input
              type="search"
              placeholder="Search blogs..."
              className="pl-10 bg-zinc-900/40 border border-zinc-800 focus-visible:ring-zinc-600 focus-visible:border-zinc-600 backdrop-blur-sm transition-all"
              onChange={(e) => {
                debouncedSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg">
            <h3 className="text-muted-foreground">Visibility</h3>
            <Select
              value={visibility}
              onValueChange={(value) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    visibility: value as BlogStatus,
                  }),
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BlogStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">No posts found. Create your first blog post!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mx-auto ">
          {filteredPosts.map((post) => {
            const hasLiked = post.likes.find(
              (like) => like.userId === session?.user?.id && like.postId === post.id,
            );
            return (
              <Card
                key={post.id}
                className="group relative bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 overflow-hidden flex flex-col hover:scale-105 max-w-xs py-0 animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={post.image ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'}
                    alt={post.title}
                    className="object-cover w-full h-full transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />

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
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <span>
                    {post.published ? (
                      <Badge variant={'default'}>Public</Badge>
                    ) : (
                      <Badge className="bg-white/20!" variant={'outline'}>
                        Private
                      </Badge>
                    )}
                  </span>
                  <h2 className="text-xl font-bold leading-tight group-hover:text-white transition-colors mb-2 mt-2 line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {post.tags
                      .map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 rounded-md bg-zinc-800/60 border border-zinc-700/60 text-[10px] font-medium text-zinc-300 uppercase tracking-wider"
                        >
                          {tag.name}
                        </span>
                      ))
                      .slice(0, 3)}
                    {post.tags.length > 3 && (
                      <span
                        key="more"
                        className="px-2 py-0.5 rounded-md bg-zinc-800/60 border border-zinc-700/60 text-[10px] font-medium text-zinc-300 uppercase tracking-wider"
                      >
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 flex flex-col justify-start items-start gap-1">
                  <span className="absolute flex flex-col items-end gap-3 bottom-6 right-3">
                    <div className="flex flex-col items-center gap-1 group">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 group-hover:border-zinc-700 transition-colors">
                        <Heart
                          className={`size-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                        <span className="text-[11px] font-bold tabular-nums">
                          {post._count.likes}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 group-hover:border-zinc-700 transition-colors">
                        <MessageSquare className="size-3.5" />
                        <span className="text-[11px] font-bold tabular-nums">
                          {post._count.comments}
                        </span>
                      </div>
                    </div>
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                    <LucideClockFading className="size-3" />
                    {intlFormatDistance(new Date(post.updatedAt), new Date())}
                  </div>

                  <Button
                    asChild
                    variant="link"
                    className="p-0 h-auto text-foreground hover:text-muted-foreground gap-2 cursor-pointer mt-3.5"
                  >
                    <Link to="/dashboard/blog/$slug" params={{ slug: post.slug }}>
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
                toast.success('Blog deleted');
                void router.invalidate();
                void queryClient.invalidateQueries({
                  ...dashboardBlogPostsOptions(),
                });
                modalStore.setState((prev) => {
                  return {
                    ...prev,
                    isLoading: false,
                    dialogId: '',
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
