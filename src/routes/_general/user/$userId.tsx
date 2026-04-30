import { createFileRoute, Link } from '@tanstack/react-router';
import { Loader2, UserIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogCard } from '@/components/web/BlogCard';
import { ShortPostCard } from '@/components/web/post/ShortPostCard';
import { getUser } from '@/data/session';
import { getPublicProfileFn } from '@/data/user';

export const Route = createFileRoute('/_general/user/$userId')({
  component: PublicProfileComponent,
  pendingComponent: PendingPublicProfileComponent,
  loader: async ({ params }) => {
    const user = await getPublicProfileFn({
      data: {
        userId: params.userId,
      },
    });

    const session = await getUser();

    return {
      user,
      session,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.user?.name} | Profile | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      {
        property: 'og:title',
        content: `${loaderData?.user?.name} | Profile | Envoy Mindpalace`,
      },
      {
        property: 'og:description',
        content: `${loaderData?.user?.biodata}`,
      },
      {
        property: 'og:image',
        content: `${loaderData?.user?.image}`,
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function PendingPublicProfileComponent() {
  return (
    <main className="max-w-5xl mx-auto py-12 px-6 min-h-screen text-slate-200">
      <div className="flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-emerald-500" />
      </div>
    </main>
  );
}

function PublicProfileComponent() {
  const { userId } = Route.useParams();
  const { user, session } = Route.useLoaderData();

  return (
    <main className="max-w-5xl mx-auto py-12 px-6 min-h-screen text-slate-200">
      <header className="mb-12 flex flex-col md:flex-row items-center gap-8 border-b border-slate-800 pb-12">
        <div className="size-40 rounded-3xl overflow-hidden bg-linear-to-br from-emerald-500 to-slate-600 p-1 shadow-2xl shadow-emerald-500/10">
          <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center overflow-hidden">
            {user?.image || user?.defaultImage ? (
              <Avatar className="size-40 shrink-0 after:border-none!">
                <AvatarImage
                  src={(user?.image as string) ?? (user?.defaultImage as string)}
                  alt={user?.name}
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.className = 'hidden';
                  }}
                  className="w-full h-full object-cover object-center rounded-lg"
                />

                <AvatarFallback className="w-full h-full object-cover object-center rounded-lg text-3xl">
                  {' '}
                  {(user?.name as string)
                    ? user?.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    : ''}
                </AvatarFallback>
              </Avatar>
            ) : (
              <UserIcon className="size-12 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="text-center md:text-left space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tighter text-white">{user?.name}</h1>
          <p className="text-slate-400 max-w-md italic">{user?.biodata}</p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium">
              {user?.posts.length} Posts
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
              Verified
            </span>
          </div>
        </div>
        {userId === session.user.id && (
          <div className="flex justify-end">
            <Link to="/dashboard/profile" className={buttonVariants({ variant: 'default' })}>
              Edit Profile
            </Link>
          </div>
        )}
      </header>

      <Tabs defaultValue="blogs" className="w-full">
        <TabsList className="bg-transparent border border-slate-800 p-1 mb-8 mx-auto flex items-center justify-center">
          <TabsTrigger value="blogs" className="data-[state=active]:bg-slate-800 px-8">
            Blogs
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-slate-800 px-8">
            Posts
          </TabsTrigger>
          <TabsTrigger value="images" className="data-[state=active]:bg-slate-800 px-8">
            Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs">
          {user && user?.posts?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto">
              {user.posts.map((post) => {
                return <BlogCard key={post.id} post={post} />;
              })}
            </div>
          ) : (
            <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center">
              <p className="text-slate-500">This user hasn't published any blogs yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts">
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {user?.shortPosts.length ? (
              user?.shortPosts.map((post) => {
                return <ShortPostCard key={post.id} post={post} session={session} />;
              })
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500 italic text-sm">No short posts shared yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="images">
          <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center">
            <p className="text-slate-500">No images posted yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
