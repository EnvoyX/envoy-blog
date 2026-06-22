import { createFileRoute } from '@tanstack/react-router';
import { motion, useScroll } from 'motion/react';

import ExperiencesSection from '@/components/web/about/ExperiencesSection';
import { HeaderSection } from '@/components/web/about/HeaderSection';
import { IntroductionSection } from '@/components/web/about/IntroductionSection';
import { LanguagesSection } from '@/components/web/about/LanguagesSection';
import { WorksSection } from '@/components/web/about/WorksSection';

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
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen p-4 font-mono">
      <motion.div
        style={{ scaleX: scrollYProgress, originX: 0 }}
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-50"
      />
      <main className="w-full">
        <HeaderSection />
        <section className="flex flex-col gap-4">
          <IntroductionSection />
          <WorksSection />
          <LanguagesSection />
          <ExperiencesSection />
        </section>
      </main>
    </div>
  );
}
