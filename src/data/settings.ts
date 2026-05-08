import { createServerFn } from "@tanstack/react-start";

import { db } from "@/lib/db";
import { authMiddleware } from "@/middlewares/auth";
import z from "zod";

export const getUserSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userPreferences = await db.user.findUnique({
      where: {
        id: context.user.id as string,
      },
    });
    return {
      showFollowStats: userPreferences?.showFollowStats,
    };
  });

export const updateUserSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      showFollowStats: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    await db.user.update({
      where: {
        id: context.user.id as string,
      },
      data: {
        showFollowStats: data.showFollowStats,
      },
    });
  });
