import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_general/about/')({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: 'About | Envoy Mindpalace' },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'About | Envoy Mindpalace' },
      {
        property: 'og:description',
        content: 'Welcome to my TanStack Start playground',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function RouteComponent() {
  return (
    <div className="min-h-screen p-4">
      <section className="container mx-auto">
        <header>
          <h3 className="text-lg font-bold text-emerald-500">About</h3>
          <h1 className="text-5xl max-sm:text-3xl font-black">Hanif Hafizhan</h1>
        </header>
        <main className="flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <figure>
              <img src="" alt="" />
            </figure>
            <p></p>
          </div>
        </main>
      </section>
    </div>
  );
}
