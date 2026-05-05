import z from "zod";

export const imageSchema = z.object({
  image: z
    .array(
      z.object({
        url: z.url("Invalid URL").min(1, "URL is required"),
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .min(1, "At least one image is required"),
  published: z.boolean(),
});

export const editImageSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.url("Invalid URL"),
  published: z.boolean(),
});

export const imageSearchSchema = z.object({
  sortDateBy: z.enum(["ASC", "DESC"]).default("DESC"),
});
