import { createServerFn } from '@tanstack/react-start';
import z from 'zod';

import { db } from '@/lib/db';
import { authMiddleware } from '@/middlewares/auth';

export const getPublicProfileFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const profile = await db.user.findUnique({
      where: { id: data.userId },
      include: {
        posts: {
          where: { published: true },
          include: {
            author: true,
            likes: true,
            comments: {
              include: {
                user: true,
              },
            },
            _count: { select: { likes: true, comments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        shortPosts: {
          where: { published: true },
          include: {
            _count: { select: { likes: true, comments: true } },
            likes: {
              include: {
                user: true,
              },
            },
            comments: {
              include: {
                user: true,
              },
            },
            author: true,
            Images: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        images: { where: { shortPost: { published: true } } },
      },
    });
    return profile;
  });

export const updateProfile = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      name: z.string().min(2),
      biodata: z.string().optional().nullable(),
      image: z.url().optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context.user.defaultImage) {
      const updatedUser = await db.user.update({
        where: { id: data.id },
        data: {
          name: data.name,
          image: data.image,
          biodata: data.biodata,
          defaultImage: context.user.image,
        },
      });
      return updatedUser;
    }

    const updatedUser = await db.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        image: data.image,
        biodata: data.biodata,
      },
    });
    return updatedUser;
  });
