import z from 'zod';

export const shortPostSchema = z.object({
  image: z.string().min(1, 'Image Link is required'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean({
    error: 'Published status is required',
  }),
});

export const shortPostSearchSchema = z.object({
  sortDateBy: z.enum(['ASC', 'DESC']).default('DESC'),
  postId: z.string().optional().default(''),
});
