import { createFileRoute } from "@tanstack/react-router";

import { ShortPostCard } from "@/components/web/post/ShortPostCard";
import { getGlobalFeedFn } from "@/data/post";
import { getUser } from "@/data/session";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFollowsByUserIdFn } from "@/data/follow";
import { usePostStore } from "@/store/post";
import { Footer } from "@/components/web/footer";
import { Navbar } from "@/components/web/navbar";

export const Route = createFileRoute("/_general-without-layout/post/")({
  component: RouteComponent,
  loader: async () => {
    const session = await getUser();
    const allPosts = await getGlobalFeedFn();
    const latestPosts = allPosts.filter(
      (post) => post.author.email === "muhamadhanifhafizhan@gmail.com" && post.published,
    );
    const publicPost = allPosts.filter((post) => post.published);
    if (session.user) {
      const userFollows = await getFollowsByUserIdFn({
        data: {
          userId: session?.user?.id as string,
        },
      });
      const followingUserIds = new Set(userFollows?.following?.map((user) => user.followingId));
      const followingPosts = allPosts.filter((post) => {
        const isFollowingPublic = followingUserIds.has(post.authorId) && post.published;
        const isPrivateShownToFollower =
          followingUserIds.has(post.authorId) && post.showPrivateToFollowers && !post.published;

        return isFollowingPublic || isPrivateShownToFollower;
      });
      return {
        publicPost,
        latestPosts,
        followingPosts,
        session,
      };
    }
    return {
      publicPost,
      latestPosts,
      session,
    };
  },
  head: () => ({
    meta: [
      { title: `Posts | Envoy Mindpalace` },
      {
        name: "Envoy Mindpalace",
        content: "Welcome to my TanStack Start playground!",
      },
      { property: "og:title", content: "Posts | Envoy Mindpalace" },
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

function RouteComponent() {
  const { publicPost, latestPosts, followingPosts, session } = Route.useLoaderData();
  const { lastViewedTab, setLastViewedTab } = usePostStore();

  return (
    <main>
      <Navbar />
      <section className="min-h-screen">
        <Tabs
          defaultValue={lastViewedTab ?? "latest-post"}
          onValueChange={(value) =>
            setLastViewedTab(value as "latest-post" | "for-you" | "following-post")
          }
          orientation="horizontal"
        >
          <header className="backdrop-blur-md mt-8 max-sm:px-12">
            <TabsList
              className="bg-transparent mx-auto flex items-center justify-start sm:justify-center max-sm:w-full overflow-x-auto scrollbar-hide whitespace-nowrap"
              variant="line"
            >
              <TabsTrigger
                className="flex items-center gap-2 after:bg-emerald-500 cursor-pointer"
                value="latest-post"
              >
                <h1 className="text-xl font-bold tracking-tight text-white pb-0.5">Latest Posts</h1>
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 after:bg-emerald-500 cursor-pointer"
                value="for-you"
              >
                <h1 className="text-xl font-bold tracking-tight text-white pb-0.5">For You</h1>
              </TabsTrigger>
              {session.user && (
                <TabsTrigger
                  className="flex items-center gap-2 after:bg-emerald-500 cursor-pointer"
                  value="following-post"
                >
                  <h1 className="text-xl font-bold tracking-tight text-white pb-0.5">Following</h1>
                </TabsTrigger>
              )}
            </TabsList>
          </header>

          <TabsContent value="latest-post">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
              {latestPosts && latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <div
                    key={post.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <ShortPostCard post={post} session={session} />
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-400 italic">No thoughts shared in the feed yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="for-you">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
              {publicPost && publicPost.length > 0 ? (
                publicPost.map((post) => (
                  <div
                    key={post.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <ShortPostCard post={post} session={session} />
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-400 italic">No thoughts shared in the feed yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {session.user && (
            <TabsContent value="following-post">
              <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                {followingPosts && followingPosts.length > 0 ? (
                  followingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      <ShortPostCard post={post} session={session} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-400 italic">You have not follow anyone yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </section>
      <Footer />
    </main>
  );
}
