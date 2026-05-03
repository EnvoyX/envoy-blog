import z from "zod";

export const albumSchema = z.object({
  coverImageUrl: z
    .url({
      error: "Invalid URL",
    })
    .optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  published: z.boolean({
    error: "Published status is required",
  }),
});
