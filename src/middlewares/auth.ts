import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth';

export const authMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw redirect({ to: '/login' });
  }

  return next({
    context: {
      user: session.user,
      session: session,
    },
  });
});

export const authRouteMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
      throw redirect({ to: '/login' });
    }

    return next({
      context: {
        user: session.user,
        session: session,
      },
    });
  },
);

export const authGlobalMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    // Public route access
    const url = new URL(request.url);
    if (!url.pathname.includes('/dashboard')) {
      return next();
    }

    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
      throw redirect({ to: '/login' });
    }

    return next({
      context: {
        user: session.user,
        session: session,
      },
    });
  },
);
