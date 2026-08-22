import { useScroll, useTransform, motion, useSpring } from 'motion/react';
import { useRef } from 'react';

import { ScrollCircle } from '../ScrollProgressCircle';

export function LanguagesSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // "start end" = starts when top of element hits bottom of viewport
    // "end start" = ends when bottom of element hits top of viewport
    // offset: ['start end', 'end start'],
    offset: ['start 0.9', 'end 0.9'], // trigger slightly inside the viewport
  });

  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.5], [0, 0.5, 1]);
  const x = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [1500, 0, 0]));
  const reverseX = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [-1500, 0, 0]));
  return (
    <section ref={containerRef} className="h-[400vh] relative">
      <main className="h-screen sticky top-0 overflow-auto">
        <motion.div className="flex flex-col gap-2  container mx-auto px-4 py-16">
          <div className="flex justify-center items-center gap-2 mb-12">
            <h1 className="text-5xl font-black">Skills</h1>
            <ScrollCircle scrollYProgress={scrollYProgress} />
          </div>
          <div className="flex flex-col gap-12">
            <motion.div className="flex flex-col gap-4 items-center" style={{ opacity, x }}>
              <h3 className="text-3xl font-bold">Languages</h3>
              <div className="flex items-center relative">
                <img src="https://skillicons.dev/icons?i=py,r,matlab" />
              </div>
            </motion.div>
            <motion.div
              className="flex flex-col gap-4 items-center"
              style={{ opacity, x: reverseX }}
            >
              <h3 className="text-3xl font-bold">Tools</h3>
              <div className="flex items-center relative">
                <img src="https://skillicons.dev/icons?i=git,github,vscodium,npm,pnpm,bun,postman,linux" />
              </div>
            </motion.div>
            <motion.div className="flex flex-col gap-4 items-center" style={{ opacity, x }}>
              <h3 className="text-3xl font-bold">Game Development</h3>
              <div className="flex items-center relative">
                <img src="https://skillicons.dev/icons?i=unity,godot,cs" />
              </div>
            </motion.div>
            <motion.div
              className="flex flex-col gap-4 items-center"
              style={{ opacity, x: reverseX }}
            >
              <h3 className="text-3xl font-bold">Web Development</h3>
              <div className="flex items-center relative">
                <img src="https://skillicons.dev/icons?i=html,css,js,ts,react,nextjs,tailwind,prisma,supabase" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </section>
  );
}
