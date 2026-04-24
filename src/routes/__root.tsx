import { aiDevtoolsPlugin } from '@tanstack/react-ai-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { HotkeysProvider, useHotkey } from '@tanstack/react-hotkeys';
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools';
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { HeadContent, Scripts, createRootRoute, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/web/query-provider';
import { ThemeProvider } from '@/lib/theme-provider';

import appCss from '../styles.css?url';

export const Route = createRootRoute({
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
        title: `Envoy's TanStack Start Blog`,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
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
  // Hotkeys
  const router = useRouter();
  useHotkey(
    'Alt+H',
    () => {
      router.navigate({
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
      router.navigate({
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
      router.navigate({
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
      router.navigate({
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
      router.navigate({
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
      router.navigate({
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
              hotkey: { preventDefault: true },
              hotkeySequence: { timeout: 1500 },
              hotkeyRecorder: {
                onCancel: () => console.warn('Recording cancelled'),
              },
            }}
          >
            <ThemeProvider defaultTheme="dark">
              {children}
              <Toaster closeButton position="top-center" />
            </ThemeProvider>
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
