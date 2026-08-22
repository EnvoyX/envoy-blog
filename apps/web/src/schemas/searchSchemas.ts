import z from 'zod';

export const postPageSearchParamsSchema = z.object({
  currentTab: z.enum(['latest-post', 'for-you', 'following-post']).default('latest-post'),
});

export const profilePageSearchParamsSchema = z.object({
  currentTab: z.enum(['blogs', 'posts', 'images', 'albums']).default('posts'),
});
