import { prismaAdapter } from 'better-auth/adapters/prisma';
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal';
import { customSession } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

import { env } from '@/env';

import { db } from './db';

const options = {
  appName: 'Envoy Blog',
  basePath: '/api/auth',
  database: prismaAdapter(db, {
    provider: 'postgresql', // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
      //   strategy: "compact"  // compact is the default stratergy in better-auth
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: ['http://localhost:3000'],
  rateLimit: {
    // in development is disabled by default
    // this is the default rate limit configuration
    enabled: env.NODE_ENV === 'development' ? false : true,
    window: 60, // time window in seconds
    max: 100, // max requests in the window
  },
  plugins: [
    //...plugins
    tanstackStartCookies(),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const userData = await db.user.findUnique({
        where: { id: user.id },
      });
      return {
        user: {
          ...userData,
        },
        session,
      };
    }, options),
  ],
});

export type Session = typeof auth.$Infer.Session;
