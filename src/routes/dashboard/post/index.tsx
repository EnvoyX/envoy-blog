import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { createStore, useSelector } from '@tanstack/react-store';
import { zodValidator } from '@tanstack/zod-adapter';
import { intlFormat, intlFormatDistance } from 'date-fns';
import { compareAsc, compareDesc } from 'date-fns';
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
import { useState } from 'react';
import { toast } from 'sonner';

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
import { deleteShortPostFn, getShortPostsFn } from '@/data/post';
import { getUser } from '@/data/session';
import { SortedByStatus } from '@/lib/constants';
import { shortPostSearchSchema } from '@/schemas/post';

export const Route = createFileRoute('/dashboard/post/')({
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
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'My Posts | Envoy Mindpalace' },
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

function PostPageComponent() {
  const { allPosts, session } = Route.useLoaderData();
  const { sortDateBy } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const router = useRouter();
  const [modalStore] = useState(() =>
    createStore({
      dialogId: '',
      isOpen: false,
      isLoading: false,
      isEditing: false,
      currentPostId: '',
    }),
  );

  const currentPostId = useSelector(modalStore, (state) => state.currentPostId);
  const isOpen = useSelector(modalStore, (state) => state.isOpen);
  const isLoading = useSelector(modalStore, (state) => state.isLoading);
  const isEditing = useSelector(modalStore, (state) => state.isEditing);

  const sortedPosts = [...allPosts].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    if (sortDateBy === 'ASC') {
      return compareAsc(dateA, dateB);
    } else {
      return compareDesc(dateA, dateB);
    }
  });
  return (
    <div className="min-h-screen  text-slate-50">
      <div className="max-w-7xl mx-auto max-sm:flex max-sm:flex-col ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-white to-slate-500 bg-clip-text text-transparent">
              My Posts
            </h1>
            <p className="text-slate-400 mt-2">Create and edit your posts here.</p>
          </div>
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 rounded-full px-6 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <>
              <Plus className="size-5" />
              Create New Post
            </>
          </Button>
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
            return (
              <Card
                key={post.id}
                className="group relative bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col hover:scale-105 max-w-xs py-0"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={post.Images[0]?.url ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'}
                    alt={post.id}
                    className="object-cover w-full h-full transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

                  {post.authorId === session.user.id && (
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
                            <ExternalLink className="size-4" /> View Post
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <Pencil className="size-4" /> Edit Post
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
                await deleteShortPostFn({
                  data: {
                    shortPostId: modalStore.state.dialogId,
                  },
                });
                toast.success('Post deleted');
                router.invalidate();
                modalStore.setState((prev) => {
                  return {
                    ...prev,
                    isLoading: false,
                    dialogId: '',
                  };
                });
                // unsubscribe()
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
