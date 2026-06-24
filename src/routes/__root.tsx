import { QueryClient } from '@tanstack/query-core';
import { aiDevtoolsPlugin } from '@tanstack/react-ai-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { HotkeysProvider, useHotkey } from '@tanstack/react-hotkeys';
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools';
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { LenisRef, ReactLenis } from 'lenis/react';
import { cancelFrame, frame } from 'motion';
import { useEffect, useRef } from 'react';

import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/web/query-provider';

import 'lenis/dist/lenis.css';
import { getSession } from '@/data/session';
import { Session, User } from '@/generated/prisma/client';


// @ts-ignore stupid css
import globalCss from '../styles.css?.url';

export interface RouterContext {
  user: User | null;
  session: Session | null;
  queryClient: QueryClient;
}
export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const data = await getSession();

    if (!data) {
      return {
        user: null,
        session: null,
      };
    }
    // whatever returned here automatically merges into the Route Context!
    return {
      user: data.user,
      session: data.session,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: `Envoy Mindpalace`,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: globalCss ?? '../styles.css?.url',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Sora:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
});
function RootDocument({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const lenisRef = useRef<LenisRef>(null);
  useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp;
      lenisRef.current?.lenis?.raf(time);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);
  // Hotkeys
  useHotkey(
    'Alt+H',
    () => {
      void router.navigate({
        to: '/',
      });
    },
    {
      meta: {
        name: 'Home Shortcut',
        description: 'Shortcut hotkeys to home page',
      },
    },
  );
  useHotkey(
    'Alt+S',
    () => {
      void router.navigate({
        to: '/dashboard',
      });
    },
    {
      meta: {
        name: 'Dashboard Shortcut',
        description: 'Shortcut hotkeys to dashboard page',
      },
    },
  );
  useHotkey(
    'Alt+1',
    () => {
      void router.navigate({
        to: '/dashboard/task-tracker',
      });
    },
    {
      meta: {
        name: 'Task Tracker Shortcut',
        description: 'Shortcut hotkeys to task tracker page',
      },
    },
  );
  useHotkey(
    'Alt+2',
    () => {
      void router.navigate({
        to: '/dashboard/quran-tracker',
      });
    },
    {
      meta: {
        name: `Qur'an Tracker Shortcut`,
        description: `Shortcut hotkeys to qur'an tracker page`,
      },
    },
  );
  useHotkey(
    'Alt+3',
    () => {
      void router.navigate({
        to: '/dashboard/blog',
      });
    },
    {
      meta: {
        name: `Dashboard Blog Shortcut`,
        description: `Shortcut hotkeys to dashboard blog page`,
      },
    },
  );
  useHotkey(
    'Alt+4',
    () => {
      void router.navigate({
        to: '/blog',
      });
    },
    {
      meta: {
        name: `Blog Shortcut`,
        description: `Shortcut hotkeys to blog page`,
      },
    },
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/*<script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                ></script>*/}
      </head>
      <body>
        <QueryProvider>
          <HotkeysProvider
            defaultOptions={{
              hotkey: {
                preventDefault: true,
              },
              hotkeySequence: {
                timeout: 1500,
              },
              hotkeyRecorder: {
                onCancel: () => console.warn('Recording cancelled'),
              },
            }}
          >
            <ReactLenis
              root
              options={{
                autoRaf: false,
                autoToggle: true,
                anchors: true,
                allowNestedScroll: true,
                naiveDimensions: true,
                stopInertiaOnNavigate: true,
              }}
              ref={lenisRef}
            />
            <Provider>
              <main className="min-h-screen bg-linear-to-b from-slate-900 to-emerald-500/40 selection:bg-emerald-500/30 bg-fixed">
                <div className="min-h-screen bg-linear-to-br from-slate-950 via-emerald-950/30 to-slate-950 antialiased">
                  {children}
                </div>
              </main>
            </Provider>
            <Toaster closeButton position="top-center" />
            <TanStackDevtools
              config={{
                position: 'bottom-right',
                defaultOpen: true,
                hideUntilHover: true,
                panelLocation: 'bottom',
              }}
              plugins={[
                {
                  name: 'TanStack Query',
                  render: <ReactQueryDevtoolsPanel />,
                  defaultOpen: true,
                },
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                  defaultOpen: true,
                },
                formDevtoolsPlugin(),
                pacerDevtoolsPlugin(),
                hotkeysDevtoolsPlugin(),
                aiDevtoolsPlugin(),
              ]}
              // this config is important to connect to the server event bus
              eventBusConfig={{
                connectToServerBus: true,
              }}
            />
            <Scripts />
          </HotkeysProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
