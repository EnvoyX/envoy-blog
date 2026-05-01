import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { db } from '@/lib/db';
import { authMiddleware } from '@/middlewares/auth';

export const getImagesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db.image.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
    });
  });

export const getPublicImagesFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.image.findMany({
    where: { shortPost: { published: true } },
    orderBy: { createdAt: 'desc' },
  });
});

export const getImagesByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    return await db.image.findMany({
      where: { userId: data.userId },
      orderBy: { createdAt: 'desc' },
    });
  });
