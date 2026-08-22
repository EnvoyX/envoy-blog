import { createFileRoute, redirect } from '@tanstack/react-router';

import { getUser } from '@/data/session';
export const Route = createFileRoute('/dashboard/')({
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) {
      throw redirect({ to: '/login' });
    } else {
      throw redirect({ to: '/dashboard/profile' });
    }
  },
  head: () => ({
    meta: [
      { title: 'Dashboard | Envoy Mindpalace' },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to TanStack Start playground!',
      },
      { property: 'og:title', content: 'Dashboard | Envoy Mindpalace' },
      {
        property: 'og:description',
        content: 'Dashboard Overview | Envoy Mindpalace',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="p-6 space-y-8  min-h-screen text-zinc-100"></div>;
}
