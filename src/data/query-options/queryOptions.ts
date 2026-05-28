import { getFollowsByUserIdFn } from "@/data/follow";
import { getGlobalFeedFn, getShortPostByIdFn } from "@/data/post";
import { RouterContext } from "@/routes/__root";
import { queryOptions } from "@tanstack/react-query";
import { getPostFn, getPostsFn } from "../blog";
import { getPublicProfileFn } from "../user";
import { redirect } from "@tanstack/react-router";
import { getAlbumByIdFn } from "../album";

export function shortPostOptions({ context }: { context: RouterContext }) {
  return queryOptions({
    queryKey: ["short-posts"],
    queryFn: async () => {
      const allPosts = await getGlobalFeedFn();
      const latestPosts = allPosts.filter(
        (post) => post.author.email === "muhamadhanifhafizhan@gmail.com" && post.published,
      );
      const publicPost = allPosts.filter((post) => post.published);
      if (context.user) {
        const userFollows = await getFollowsByUserIdFn({
          data: {
            userId: context?.user?.id as string,
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
          user: context.user,
        };
      }
      return {
        publicPost,
        latestPosts,
        user: context.user,
      };
    },
  });
}

export function blogOptions() {
  return queryOptions({
    queryKey: ["blogs-public"],
    queryFn: async () => {
      const allPosts = await getPostsFn();
      return {
        allPosts,
      };
    },
  });
}

export function userProfileOptions(userId: string) {
  return queryOptions({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const user = await getPublicProfileFn({
        data: {
          userId: userId,
        },
      });
      return user;
    },
  });
}

export function blogPostOptions(slug: string) {
  return queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const post = await getPostFn({ data: slug });
      return post;
    },
  });
}

export function shortPostIdOptions(shortPostId: string) {
  return queryOptions({
    queryKey: ["short-post", shortPostId],
    queryFn: async () => {
      const post = await getShortPostByIdFn({
        data: {
          shortPostId: shortPostId,
        },
      });
      if (!post) {
        throw redirect({ to: "/post" });
      }
      return post;
    },
  });
}

export function albumIdOptions(albumId: string) {
  return queryOptions({
    queryKey: ["album-gallery", albumId],
    queryFn: async () => {
      const album = await getAlbumByIdFn({
        data: {
          albumId: albumId,
        },
      });
      if (!album) {
        throw redirect({ to: "/dashboard/albums" });
      }
      return album;
    },
  });
}
