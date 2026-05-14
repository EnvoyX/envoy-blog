import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Code2 } from 'lucide-react';

import { Footer } from '@/components/web/footer';
import { Navbar } from '@/components/web/navbar';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Home | Envoy Mindpalace' },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Home | Envoy Mindpalace' },
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
  component: App,
});

function App() {
  return (
    <main>
      <Navbar />
      <section className="relative pt-20 pb-32 px-8 min-h-screen overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900  text-xs font-medium text-emerald-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Now in RC: TanStack Start
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Envoy <br /> Mindpalace
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            This is my own TanStack Start playground to learn and experiment with. Powered by
            TanStack Router, Vite, and with many other TanStack's Ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/about"
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
            >
              About <ArrowRight size={18} />
            </Link>
            <a
              href="https://github.com/EnvoyX"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-8 py-4 rounded-xl font-bold transition-all"
            >
              <Code2 size={18} /> Github
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
