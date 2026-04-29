import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
  createCommentFn,
  deleteCommentFn,
  getAllComments,
  getAllLikes,
  toggleLikeFn,
  updateCommentFn,
} from "@/data/post";
import { getQueryClient } from "@/components/web/query-provider";

const queryClient = getQueryClient();

export const likeCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["likes"],
    queryFn: async () => {
      const likes = await getAllLikes();
      return likes;
    },
    queryClient: queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];
      await toggleLikeFn({
        data: { id: modified.id, shortPostId: modified.shortPostId ?? "" },
      });
    },
    onDelete: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];
      await toggleLikeFn({
        data: { id: modified.id, shortPostId: modified.shortPostId ?? "" },
      });
    },
  }),
);

export const commentCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["comments"],
    queryFn: async () => {
      const comments = await getAllComments();
      return comments;
    },
    queryClient: queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];
      const newRecord = await createCommentFn({
        data: {
          id: modified.id,
          shortPostId: modified.shortPostId as string,
          content: modified.content as string,
        },
      });
      return newRecord;
    },
    onUpdate: async ({ transaction }) => {
      const { original, modified } = transaction.mutations[0];
      const updatedCommentFn = await updateCommentFn({
        data: {
          commentId: original.id,
          content: modified.content as string,
        },
      });
      return updatedCommentFn;
    },

    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      await deleteCommentFn({
        data: {
          commentId: original.id as string,
        },
      });
    },
  }),
);

export type LikeCollection = typeof likeCollection;
export type CommentCollection = typeof commentCollection;
