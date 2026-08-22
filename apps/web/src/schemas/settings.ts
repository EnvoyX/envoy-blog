import { z } from "zod";

export const settingsSchema = z.object({
  showFollowStats: z.boolean(),
});
