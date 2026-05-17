import { ReturnType } from '@sinclair/typebox';
// import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import z from 'zod';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  // if (!session) {
  //   throw redirect({ to: "/login" });
  // }
  return session;
});

export const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  // if (!session) {
  //   throw redirect({ to: "/login" });
  // }
  return {
    user: session?.user,
  };
});

export type UserSession = Awaited<ReturnType<typeof getUser>>;

export const getUserSessionDataFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    return await db.user.findUnique({
      where: { id: data.userId },
      include: {
        followers: true,
        following: true,
        likes: true,
        comments: true,
      },
    });
  });

export const getProfileData = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  // if (!session) {
  //   throw redirect({ to: "/login" });
  // }
  const user = await db.user.findUnique({
    where: {
      id: session?.user.id,
    },
    include: {
      accounts: true,
      sessions: true,
      posts: {
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
          imagesOnShortPosts: {
            include: {
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      images: {
        orderBy: { createdAt: 'desc' },
      },
      albums: {
        include: {
          author: true,
          images: true,
          _count: { select: { images: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      followers: {
        include: {
          follower: true,
        },
      },
      following: {
        include: {
          following: true,
        },
      },
    },
  });

  return {
    user,
  };
});

export type ProfileData = Awaited<ReturnType<typeof getProfileData>>;

export const getUserData = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return {
    session: session?.session,
    user: session?.user,
  };
});
