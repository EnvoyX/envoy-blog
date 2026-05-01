import { createFileRoute } from '@tanstack/react-router';
import { useParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useEffect, useRef, useTransition } from 'react';
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
  validateSearch: zodValidator(
    z.object({
      callbackUrl: z.string().optional().default('/dashboard'),
    }),
  ),
  head: () => ({
    meta: [
      { title: 'Login | Envoy Blog' },
      {
        name: 'Envoy Blog',
        content: 'Welcome to TanStack Start playground!',
      },
      { property: 'og:title', content: 'Login | Envoy Blog' },
      { property: 'og:description', content: 'Login to your account in Envoy Blog' },
      { property: 'og:image', content: 'https://tanstack.com/assets/og-C0HGjoLl.png' },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { callbackUrl } = Route.useSearch();
  const [isPending, startTransition] = useTransition();
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;

    hasInitialized.current = true;
  });
  function handleLogin(provider: 'github' | 'google') {
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
  return (
    <Card className="max-w-md w-full bg-emerald-950">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Sign in to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form
        //   onSubmit={(e) => {
        //     e.preventDefault()
        //     form.handleSubmit()
        //   }}
        >
          <FieldGroup>
            {/* <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="johndoe@gmail.com"
                        type="email"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Super secret password"
                        type="password"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              /> */}
            <Field>
              {/* <Button disabled={isPending} type="submit">
                  {isPending ? 'Logging in...' : 'Login'}
                </Button> */}
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
              </>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
