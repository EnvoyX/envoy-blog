import { IconLogout2 } from '@tabler/icons-react';
import { useLiveQuery } from '@tanstack/react-db';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import {
  Calendar,
  CheckCheck,
  Eye,
  HeartPulse,
  ImageIcon,
  ImagesIcon,
  Mail,
  ShieldCheck,
  User,
  UserIcon,
  Users,
} from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { followColection } from '@/collections/follow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlbumCard } from '@/components/web/album/AlbumCard';
import { BlogCard } from '@/components/web/BlogCard';
import ConfirmDialog from '@/components/web/ConfirmDialog';
import { EditProfileDialog } from '@/components/web/EditProfileDialog';
import PhotoGallery from '@/components/web/PhotoGallery';
import { ShortPostCard } from '@/components/web/post/ShortPostCard';
import { UploadThingModal } from '@/components/web/uplooadthing/UploadThingModal';
import { UserFollowDialog } from '@/components/web/UserFollowDialog';
import { profileOptions } from '@/data/query-options/dashboardQueryOptions';
import { UserSession } from '@/data/session';
import { User as UserType } from '@/generated/prisma/client';
import { authClient } from '@/lib/auth-client';
import { profilePageSearchParamsSchema } from '@/schemas/searchSchemas';
import { imageUploadModalStore } from '@/store/imageUploadStore';
import { followDialogStore, useProfileStore } from '@/store/profile';

export const Route = createFileRoute('/dashboard/profile')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(profileOptions());
    return {
      session: {
        user: context?.user,
      },
    };
  },
  validateSearch: zodValidator(profilePageSearchParamsSchema),
  head: () => ({
    meta: [
      { title: 'Profile | Envoy Mindpalace' },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to TanStack Start playground!',
      },
      { property: 'og:title', content: 'Profile | Envoy Mindpalace' },
      {
        property: 'og:description',
        content: 'View your profile information and settings',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useLoaderData();
  const { currentTab } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [isTransition, startTransition] = useTransition();
  const { data: user } = useSuspenseQuery(profileOptions());
  const { data: follows } = useLiveQuery((q) => q.from({ follow: followColection }));
  const { viewMode, toggleViewMode } = useProfileStore();
  const viewAll = viewMode === 'all';
  const viewPublic = viewMode === 'public';
  const viewOnlyFollowers = viewMode === 'showToFollowers';

  // filter datas
  const userBlogs = user?.posts.filter((blog) => {
    const isPublic = blog.published;
    const isPrivateShownToFollower = blog.showPrivateToFollowers && !blog.published;
    if (viewAll) return blog;
    else if (viewPublic) return blog.published;
    else if (viewOnlyFollowers) {
      return isPublic || isPrivateShownToFollower;
    }
  });
  const userPosts = user?.shortPosts.filter((post) => {
    const isPublic = post.published;
    const isPrivateShownToFollower = post.showPrivateToFollowers && !post.published;
    if (viewAll) return post;
    else if (viewPublic) return post.published;
    else if (viewOnlyFollowers) {
      return isPublic || isPrivateShownToFollower;
    }
  });
  const userImages = user?.images.filter((image) => {
    const isPublic = image.published;
    const isPrivateShownToFollower = image.showPrivateToFollowers && !image.published;
    if (viewAll) return image;
    else if (viewPublic) return image.published;
    else if (viewOnlyFollowers) {
      return isPublic || isPrivateShownToFollower;
    }
  });
  const userAlbums = user?.albums.filter((album) => {
    const isPublic = album.published;
    const isPrivateShownToFollower = album.showPrivateToFollowers && !album.published;
    if (viewAll) return album;
    else if (viewPublic) return album.published;
    else if (viewOnlyFollowers) {
      return isPublic || isPrivateShownToFollower;
    }
  });

  const handleLogout = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            toast.loading('Logging out...', {
              id: 'logout',
            });
          },
          onError: ({ error }) => {
            toast.dismiss('logout');
            toast.error('Failed to log out', {
              description: error.message,
            });
          },
          onSuccess: () => {
            toast.dismiss('logout');
            toast.success('Logged out successfully');
            void navigate({
              to: '/login',
              reloadDocument: true,
            });
          },
        },
      });
    });
  };

  return (
    <main className="w-full max-w-7xl mx-auto py-12 px-6">
      <header className="mb-10 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <div className="size-40 rounded-2xl overflow-hidden bg-linear-to-br from-emerald-500 to-slate-600 p-1">
            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center overflow-hidden">
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
                      ? user.name
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
          {/*<button className="absolute -bottom-2 -right-2 p-2 bg-surface border border-border rounded-full shadow-lg hover:text-emerald-500 transition-colors">
            <Camera className="size-4" />
          </button>*/}
        </div>

        <div className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{user?.name || 'Anonymous User'}</h1>
          <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
            <Mail className="size-4" /> {user?.email}
          </p>
          <p className="text-slate-400 italic">{user?.biodata}</p>
          <div className="text-slate-400 max-w-md flex max-sm:justify-center items-center gap-2">
            <p
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                followDialogStore.setState((prev) => ({
                  ...prev,
                  isOpen: true,
                  currentUserId: user?.id as string,
                  initialTab: 'followers',
                }));
              }}
            >
              <span className="font-bold text-primary">
                {follows.filter((follow) => follow.followingId === user?.id).length}
              </span>
              Followers
            </p>
            <p
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                followDialogStore.setState((prev) => ({
                  ...prev,
                  isOpen: true,
                  currentUserId: user?.id as string,
                  initialTab: 'following',
                }));
              }}
            >
              <span className="font-bold text-primary">
                {follows.filter((follow) => follow.followerId === user?.id).length}
              </span>
              Following
            </p>
            {!user?.showFollowStats && <span className="text-slate-400">(Hidden)</span>}
          </div>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium">
              {userBlogs?.length} Blogs
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium">
              {userPosts?.length} Posts
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium flex items-center gap-1">
              <ImagesIcon className="size-4" />
              <p>{userImages?.length} Images</p>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium flex items-center gap-1">
              <ImageIcon className="size-4" />
              <p>{userAlbums?.length} Albums</p>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:justify-end sm:ml-auto max-md:mx-auto">
          <div className="grid grid-cols-1 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4">
                Account Details
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <ShieldCheck className="size-4 shrink-0" /> <span>Status</span>
                  </p>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${user?.emailVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-500/10 text-emerald-500'}`}
                  >
                    {user?.emailVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Calendar className="size-4 shrink-0" /> <span>Joined</span>
                  </p>
                  <span className="text-sm font-medium">
                    {user?.createdAt ? new Date(user?.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <User className="size-4 shrink-0" /> User ID
                  </p>
                  <code className="text-xs truncate">{user?.id}</code>
                </div>
                <Separator />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4">
                  System Details
                </h2>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <HeartPulse className="size-4 shrink-0" />{' '}
                    <span className="text-muted-foreground">System Uptime</span>
                  </p>
                  <iframe
                    src="https://envoy-mindpalace.betteruptime.com/badge?theme=dark"
                    width="250"
                    height="30"
                    style={{ colorScheme: 'normal' }}
                  ></iframe>
                </div>
                {/*<div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Users className="size-4" />
                    </span>
                    <span className="text-muted-foreground">Linked Accounts</span>
                  </p>
                  <span className="font-medium truncate">
                    {user?.accounts.map((account) => account.providerId.toUpperCase()).join(' | ')}
                  </span>
                </div>*/}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 mb-12 pb-6 border-b border-border flex max-sm:flex-col overflow-auto gap-4 scrollbar-thin scrollbar-thumb-emerald-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="cursor-pointer flex items-center">
              {viewPublic ? 'View Public Only' : viewAll ? 'View All' : 'Followers Only'}
              {viewPublic ? (
                <Eye className="size-4" />
              ) : viewAll ? (
                <CheckCheck className="size-4" />
              ) : (
                <Users className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32 bg-transparent! backdrop-blur-lg!">
            <DropdownMenuGroup>
              <DropdownMenuLabel>View Mode</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={viewMode}
                onValueChange={(value) => {
                  toggleViewMode(value as 'all' | 'public' | 'showToFollowers');
                }}
              >
                <DropdownMenuRadioItem value="all" className="cursor-pointer">
                  View All
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="public" className="cursor-pointer">
                  Public Only
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="showToFollowers" className="cursor-pointer">
                  Followers Only
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          to="/user/$userId"
          className={buttonVariants({ variant: 'default' })}
          params={{
            userId: user?.id as string,
          }}
        >
          View on Public
        </Link>
        <EditProfileDialog user={user} />
        <Button
          variant={'outline'}
          onClick={() =>
            imageUploadModalStore.setState((prev) => ({
              ...prev,
              type: 'profile-picture',
              isUploadThingDialogOpen: true,
            }))
          }
          className="px-5 py-2.5 bg-background border border-border font-medium rounded-lg hover:bg-muted transition-colors text-emerald-500 cursor-pointer"
        >
          <User />
          Upload Profile Image
        </Button>
        <Button
          variant={'outline'}
          onClick={handleLogout}
          disabled={isTransition}
          className="px-5 py-2.5 bg-background border border-border font-medium rounded-lg hover:bg-muted transition-colors text-destructive cursor-pointer"
        >
          <IconLogout2 />
          Logout
        </Button>
      </div>
      <Tabs
        defaultValue={currentTab}
        onValueChange={(value) => {
          navigate({
            search: () => ({
              currentTab: value as 'blogs' | 'posts' | 'images' | 'albums',
            }),
          });
        }}
        className="w-full"
        orientation="horizontal"
      >
        <TabsList className="bg-transparent mb-8 mx-auto flex items-center justify-start sm:justify-center max-sm:w-full overflow-x-auto scrollbar-hide whitespace-nowrap">
          <TabsTrigger
            value="blogs"
            className="data-[state=active]:bg-slate-800 px-8 shrink-0 cursor-pointer"
          >
            Blogs
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-slate-800 px-8 shrink-0 cursor-pointer"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="data-[state=active]:bg-slate-800 px-8 shrink-0 cursor-pointer"
          >
            Images
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            className="data-[state=active]:bg-slate-800 px-8 shrink-0 cursor-pointer"
          >
            Albums
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="mx-auto">
          {userBlogs && userBlogs?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userBlogs?.map((post) => {
                return <BlogCard key={post.id} post={post} session={session as UserSession} />;
              })}
            </div>
          ) : (
            <div className="p-12 rounded-3xl text-center">
              <p className="text-slate-500">This user hasn't published any blogs yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts">
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {userPosts?.length ? (
              userPosts?.map((post) => {
                return <ShortPostCard key={post.id} post={post} user={session?.user as UserType} />;
              })
            ) : (
              <div className="py-20 text-center rounded-3xl">
                <p className="text-slate-500 italic text-sm">No posts shared yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="images">
          {userImages?.length ? (
            <div className="container mx-auto">
              <PhotoGallery images={userImages} type="public" />
            </div>
          ) : (
            <div className="p-12 rounded-3xl text-center">
              <p className="text-slate-500">No images posted yet.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="albums" className="mx-auto">
          {userAlbums && userAlbums?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
              {userAlbums?.map((album) => (
                <AlbumCard key={album.id} album={album} inDashboard={false} />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl text-center">
              <p className="text-slate-500">This user hasn't published any albums yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <UserFollowDialog follows={follows} session={session as UserSession} />
      <UploadThingModal />
      <ConfirmDialog />
    </main>
  );
}
