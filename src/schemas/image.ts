import z from 'zod';

export const imageSchema = z.object({
  image: z.array(z.string()).min(1, 'At least one image is required'),
  published: z.boolean({
    error: 'Published status is required',
  }),
});

export const imageSearchSchema = z.object({
  sortDateBy: z.enum(['ASC', 'DESC']).default('DESC'),
});
