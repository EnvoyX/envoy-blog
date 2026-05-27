import { createFileRoute, redirect } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  //   FieldDescription,
  //   FieldError,
  FieldGroup,
  //   FieldLabel,
} from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_auth/login/')({
  beforeLoad: ({ context }) => {
    if (context?.user) throw redirect({ to: '/dashboard' });
    return;
  },
  loader: ({ context }) => {
    if (context?.user) throw redirect({ to: '/dashboard' });
    return { user: context?.user };
  },
  validateSearch: zodValidator(
    z.object({
      callbackUrl: z.string().optional().default('/dashboard'),
    }),
  ),
  head: () => ({
    meta: [
      { title: 'Login | Envoy Mindpalace' },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to TanStack Start playground!',
      },
      { property: 'og:title', content: 'Login | Envoy Mindpalace' },
      { property: 'og:description', content: 'Login to your account in Envoy Mindpalace' },
      { property: 'og:image', content: 'https://tanstack.com/assets/og-C0HGjoLl.png' },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { callbackUrl } = Route.useSearch();
  const { user } = Route.useLoaderData();
  const [isPending, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasInitialized = useRef(false);
  function handleLogin(provider: 'github' | 'google' | 'discord') {
    startTransition(async () => {
      await authClient.signIn.social({
        provider: provider,
        callbackURL: callbackUrl,
        fetchOptions: {
          onRequest() {
            toast.loading(`Logging in with ${provider.toUpperCase()}...`, {
              id: 'login-oauth',
            });
          },
          onSuccess: () => {
            toast.dismiss('login-oauth');
            toast.success(`Logged in with ${provider.toUpperCase()} successfully`);
            setIsRedirecting(true);
          },

          onError: ({ error }) => {
            toast.dismiss('login-oauth');
            toast.error(`Failed to login with ${provider.toUpperCase()}`, {
              description: error.message,
            });
          },
        },
      });
    });
  }
  useEffect(() => {
    if (hasInitialized.current) return;

    hasInitialized.current = true;
  });
  useEffect(() => {
    if (!user) {
      setIsRedirecting(false);
    }
  }, [user]);

  if (isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-transparent rounded-lg">
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>

          <div className="mt-8 space-y-3 flex flex-col items-center">
            <p className="text-lg font-semibold animate-pulse text-emerald-500">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-md w-full bg-emerald-950">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Sign in to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <>
                <Button
                  onClick={() => {
                    handleLogin('google');
                  }}
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  <p className="flex items-center  gap-1">
                    <span className="icon-[material-icon-theme--google] size-5" />
                    <span>{isPending ? 'Logging in...' : 'Continue with Google'}</span>
                  </p>
                </Button>
                <Button
                  onClick={() => {
                    handleLogin('github');
                  }}
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  <p className="flex items-center gap-1">
                    <span className="icon-[mdi--github] size-6" />
                    <span>{isPending ? 'Logging in...' : 'Continue with Github'}</span>
                  </p>
                </Button>
                <Button
                  onClick={() => {
                    handleLogin('discord');
                  }}
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                  disabled={isPending}
                >
                  <p className="flex items-center gap-1">
                    <span className="icon-[ic--baseline-discord] size-6" />
                    <span>{isPending ? 'Logging in...' : 'Continue with Discord'}</span>
                  </p>
                </Button>
              </>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
