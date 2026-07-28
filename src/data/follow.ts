import { createServerFn } from '@tanstack/react-start';
import z from 'zod';

import { db } from '@/lib/db';
import { authMiddleware } from '@/middlewares/auth';

export const getAllFollowsFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.follow.findMany();
});

export const getFollowsByUserIdFn = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const followsData = await db.user.findUnique({
      where: {
        id: data.userId,
      },
      select: {
        followers: {
          include: {
            follower: true,
            following: true,
          },
        },
        following: {
          include: {
            following: true,
            follower: true,
          },
        },
      },
    });

    const followers = followsData?.followers;
    const following = followsData?.following;

    return {
      followers,
      following,
    };
  });

export const toggleFollowFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), targetUserId: z.string() }))
  .handler(async ({ data, context }) => {
    const userId = context.user.id;

    const isFollowingData = await db.follow.findFirst({
      where: {
        id: data.id,
        followerId: userId,
        followingId: data.targetUserId,
      },
    });

    if (isFollowingData) {
      await db.follow.delete({
        where: { id: isFollowingData.id },
      });
      return { followed: false };
    }

    await db.follow.create({
      data: {
        id: data.id,
        followerId: userId as string,
        followingId: data.targetUserId,
      },
    });

    return { followed: true };
  });

export const removeFollowerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ followId: z.string(), followerId: z.string() }))
  .handler(async ({ data, context }) => {
    await db.follow.delete({
      where: {
        id: data.followId,
        followerId_followingId: {
          followerId: data.followerId,
          followingId: context.user.id as string, // session's user Id
        },
      },
    });
  });
