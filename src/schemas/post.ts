import z from 'zod';

export const shortPostSchema = z.object({
  images: z
    .array(
      z.object({
        url: z.url('Invalid URL').min(1, 'URL is required'),
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  content: z
    .string({
      error: 'Content is required',
    })
    .min(10, 'Content is must be at least 10 characters'),
  published: z.boolean({
    error: 'Published status is required',
  }),
  showPrivateToFollowers: z.boolean({
    error: 'This status is required to fill',
  }),
});

export const shortPostSearchSchema = z.object({
  sortDateBy: z.enum(['ASC', 'DESC']).default('DESC'),
  postId: z.string().optional().default(''),
});
