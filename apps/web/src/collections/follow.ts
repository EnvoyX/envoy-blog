import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";

import { getQueryClient } from "@/components/web/query-provider";
import { getAllFollowsFn, toggleFollowFn } from "@/data/follow";

const queryClient = getQueryClient();

export const followColection = createCollection(
  queryCollectionOptions({
    queryKey: ["followsData"],
    queryFn: async () => {
      const follows = await getAllFollowsFn();
      return follows;
    },
    queryClient: queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];
      await toggleFollowFn({
        data: { id: modified.id, targetUserId: modified.followingId ?? "" },
      });
    },
    onDelete: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];
      await toggleFollowFn({
        data: { id: modified.id, targetUserId: modified.followingId ?? "" },
      });
    },
  }),
);
