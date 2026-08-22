import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import { zodValidator } from '@tanstack/zod-adapter';
import { Plus, ListXIcon, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BlogCard } from '@/components/web/BlogCard';
import { deletePostFn } from '@/data/blog';
import { blogOptions } from '@/data/query-options/queryOptions';
import { UserSession } from '@/data/session';
import { postPublishedSearchSchema } from '@/schemas/blog';
import { modalStore } from '@/store/blogStore';

export const Route = createFileRoute('/_general/blog/')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(blogOptions());
    return {
      user: context.user,
      session: {
        user: context.user,
      },
    };
  },
  component: BlogPageComponent,
  validateSearch: zodValidator(postPublishedSearchSchema),
  head: () => ({
    meta: [
      { title: `Blog | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Blog | Envoy Mindpalace' },
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
  const { user, session } = Route.useLoaderData();
  const { data } = useSuspenseQuery(blogOptions());
  const posts = data.allPosts.filter(
    (post) => post.author.email === 'muhamadhanifhafizhan@gmail.com',
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
      query === '';

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
  return (
    <div className="min-h-screen my-16 p-4">
      <div className="max-w-7xl mx-auto max-sm:flex max-sm:flex-col ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Blog Post</h1>
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
            return <BlogCard key={post.id} post={post} session={session as UserSession} />;
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
