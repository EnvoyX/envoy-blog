import { ReturnType } from "@sinclair/typebox";
// import { redirect } from '@tanstack/react-router';
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  // if (!session) {
  //   throw redirect({ to: "/login" });
  // }
  return session;
});

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
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

export const getProfileData = createServerFn({ method: "GET" }).handler(async () => {
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
    },
  });

  return {
    user,
  };
});

export type ProfileData = Awaited<ReturnType<typeof getProfileData>>;

export const getUserData = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return {
    session: session?.session,
    user: session?.user,
  };
});
