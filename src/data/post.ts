import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { db } from '@/lib/db';
import { authMiddleware } from '@/middlewares/auth';

export const getShortPostsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.shortPost.findMany({
      where: { authorId: context.user.id },
      orderBy: { createdAt: 'desc' },
      include: { author: true, likes: true, comments: true, _count: true, Images: true },
    });
  });

export const deleteShortPostFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ shortPostId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db.shortPost.deleteMany({
      where: { authorId: context.user.id, id: data.shortPostId },
    });
    return true;
  });
