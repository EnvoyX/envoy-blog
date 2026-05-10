import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, ImagesIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogCard } from "@/components/web/BlogCard";
import PhotoGallery from "@/components/web/PhotoGallery";
import { ShortPostCard } from "@/components/web/post/ShortPostCard";
import { getUser } from "@/data/session";
import { getPublicProfileFn } from "@/data/user";
import { useLiveQuery } from "@tanstack/react-db";
import { followColection } from "@/collections/follow";
import { createId } from "@paralleldrive/cuid2";
import { UserFollowDialog } from "@/components/web/UserFollowDialog";
import { followDialogStore, useProfileStore } from "@/store/profile";
import { useQueryClient } from "@tanstack/react-query";
import { AlbumCard } from "@/components/web/album/AlbumCard";

export const Route = createFileRoute("/_general/user/$userId")({
  component: PublicProfileComponent,
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
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      {
        property: "og:title",
        content: `${loaderData?.user?.name} | Profile | Envoy Mindpalace`,
      },
      {
        property: "og:description",
        content: `${loaderData?.user?.biodata}`,
      },
      {
        property: "og:image",
        content: `${loaderData?.user?.image}`,
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function PublicProfileComponent() {
  const { userId } = Route.useParams();
  const { user, session } = Route.useLoaderData();
  const { data: follows } = useLiveQuery((q) => q.from({ follow: followColection }));
  const { viewPrivate, toggleViewPrivate, lastViewedTab, setLastViewedTab } = useProfileStore();
  const queryClient = useQueryClient();
  const isOwnProfile = userId === session?.user?.id;
  const followerUserIds = new Set(
    user?.followers.map((follow) => follow.follower).map((follower) => follower.id),
  );

  // filter datas
  const userBlogs = user?.posts.filter((post) => {
    if (isOwnProfile && viewPrivate) return post;
    else if (isOwnProfile && !viewPrivate) return post.published;
    const isPublic = post.published;

    return isPublic;
  });
  const userPosts = user?.shortPosts.filter((post) => {
    if (isOwnProfile && viewPrivate) return post;
    else if (isOwnProfile && !viewPrivate) return post.published;
    const isPublic = post.published;
    const isPrivateShownToFollower =
      session &&
      followerUserIds.has(session?.user?.id as string) &&
      post.showPrivateToFollowers &&
      !post.published;

    return isPublic || isPrivateShownToFollower;
  });

  const userImages = user?.images.filter((image) => {
    if (isOwnProfile && viewPrivate) return image;
    else if (isOwnProfile && !viewPrivate) return image.published;
    const isPublic = image.published;
    const isPrivateShownToFollower =
      session &&
      followerUserIds.has(session?.user?.id as string) &&
      image.showPrivateToFollowers &&
      !image.published;

    return isPublic || isPrivateShownToFollower;
  });

  const userAlbums = user?.albums.filter((album) => {
    if (isOwnProfile && viewPrivate) return album;
    else if (isOwnProfile && !viewPrivate) return album.published;
    const isPublic = album.published;
    const isPrivateShownToFollower =
      session &&
      followerUserIds.has(session?.user?.id as string) &&
      album.showPrivateToFollowers &&
      !album.published;

    return isPublic || isPrivateShownToFollower;
  });

  const hasFollowed = follows.find(
    (follow) => follow.followerId === session?.user?.id && follow.followingId === userId,
  );

  function handleToggleFollow() {
    if (!session.user) return;
    const existingFollow = follows.find(
      (follow) => follow.followerId === session?.user?.id && follow.followingId === userId,
    );
    if (!existingFollow) {
      // optimistic Insert follow
      followColection.insert({
        id: createId(),
        createdAt: new Date(),
        followingId: userId,
        followerId: session?.user.id as string,
      });
      queryClient.invalidateQueries({
        queryKey: ["user-following-followers", userId],
      });
    } else {
      // optimistic delete follow
      followColection.delete(existingFollow.id);
      queryClient.invalidateQueries({
        queryKey: ["user-following-followers", userId],
      });
    }
  }

  return (
    <main className="max-w-5xl mx-auto py-12 px-6 min-h-screen text-slate-200">
      <header className="mb-12 flex flex-col md:flex-row items-center gap-8 border-b border-slate-800 pb-12 ">
        <div className="size-40 rounded-3xl overflow-hidden bg-linear-to-br from-emerald-500 to-slate-600 p-1 shadow-2xl shadow-emerald-500/10 shrink-0">
          <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center overflow-hidden">
            {user?.image || user?.defaultImage ? (
              <Avatar className="size-40 shrink-0 after:border-none!">
                <AvatarImage
                  src={(user?.image as string) ?? (user?.defaultImage as string)}
                  alt={user?.name}
                  onError={(e) => {
                    e.currentTarget.src = "";
                    e.currentTarget.className = "hidden";
                  }}
                  className="w-full h-full object-cover object-center rounded-lg"
                />

                <AvatarFallback className="w-full h-full object-cover object-center rounded-lg text-3xl">
                  {" "}
                  {(user?.name as string)
                    ? user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : ""}
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
          {(user?.showFollowStats || session?.user?.id === userId) && (
            <div className="text-slate-400 max-w-md flex max-sm:justify-center items-center gap-2">
              <p
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  followDialogStore.setState(() => ({
                    isOpen: true,
                    currentUserId: userId,
                    initialTab: "followers",
                  }));
                }}
              >
                <span className="font-bold text-primary">
                  {follows.filter((follow) => follow.followingId === userId).length}
                </span>
                Followers
              </p>
              <p
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  followDialogStore.setState(() => ({
                    isOpen: true,
                    currentUserId: userId,
                    initialTab: "following",
                  }));
                }}
              >
                <span className="font-bold text-primary">
                  {follows.filter((follow) => follow.followerId === userId).length}
                </span>
                Following
              </p>
              {!user?.showFollowStats && <span className="text-slate-400">(Hidden)</span>}
            </div>
          )}
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
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
              Verified
            </span>
          </div>
        </div>
        {userId === session?.user?.id && (
          <div className="flex items-center gap-2 sm:justify-end sm:ml-auto sm:mb-auto max-md:mx-auto">
            <Link to="/dashboard/profile" className={buttonVariants({ variant: "default" })}>
              Edit Profile
            </Link>
            <Button className="cursor-pointer" onClick={toggleViewPrivate}>
              {viewPrivate ? "View Public Only" : "View All"}
            </Button>
          </div>
        )}
        {session.user && userId !== session?.user?.id && (
          <div className="flex sm:justify-end sm:ml-auto sm:mb-auto">
            {hasFollowed ? (
              <Button className="cursor-pointer" onClick={handleToggleFollow}>
                Unfollow
              </Button>
            ) : (
              <Button className="cursor-pointer" onClick={handleToggleFollow}>
                Follow
              </Button>
            )}
          </div>
        )}
      </header>

      <Tabs defaultValue={lastViewedTab ?? "posts"} className="w-full" orientation="horizontal">
        <TabsList className="bg-transparent border border-slate-800 mb-8 mx-auto flex items-center justify-start sm:justify-center max-sm:w-full overflow-x-auto scrollbar-hide whitespace-nowrap">
          <TabsTrigger
            value="blogs"
            className="data-[state=active]:bg-slate-800 px-8 shrink-0 cursor-pointer"
            onClick={() => setLastViewedTab("blogs")}
          >
            Blogs
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-slate-800 px-8 shrink-0 cursor-pointer"
            onClick={() => setLastViewedTab("posts")}
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="data-[state=active]:bg-slate-800 px-8 shrink-0 cursor-pointer"
            onClick={() => setLastViewedTab("images")}
          >
            Images
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            className="data-[state=active]:bg-slate-800 px-8 shrink-0 cursor-pointer"
            onClick={() => setLastViewedTab("albums")}
          >
            Albums
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="mx-auto">
          {userBlogs && userBlogs?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userBlogs?.map((post) => {
                return <BlogCard key={post.id} post={post} session={session} />;
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
            {userPosts?.length ? (
              userPosts?.map((post) => {
                return <ShortPostCard key={post.id} post={post} session={session} />;
              })
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500 italic text-sm">No posts shared yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="images">
          {userImages?.length ? (
            <div className="container mx-auto p-4">
              <PhotoGallery images={userImages} type="public" />
            </div>
          ) : (
            <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center">
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
            <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center">
              <p className="text-slate-500">This user hasn't published any albums yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <UserFollowDialog follows={follows} session={session} />
    </main>
  );
}
