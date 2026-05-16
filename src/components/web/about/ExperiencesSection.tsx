import { useScroll, motion } from "motion/react";
import { useRef } from "react";

import { ScrollCircle } from "../ScrollProgressCircle";

export function ExperiencesSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // "start end" = starts when top of element hits bottom of viewport
    // "end start" = ends when bottom of element hits top of viewport
    // offset: ['start end', 'end start'],
    offset: ["start 0.9", "end 0.9"], // trigger slightly inside the viewport
  });

  return (
    <section ref={containerRef} className="h-[300vh] relative">
      <main className="h-screen sticky top-0 overflow-auto">
        <motion.div className="flex flex-col gap-2  container mx-auto px-4 py-16">
          <div className="flex justify-center items-center gap-2 mb-12">
            <h1 className="text-5xl font-black">Experiences</h1>
            <ScrollCircle scrollYProgress={scrollYProgress} />
          </div>
        </motion.div>
      </main>
    </section>
  );
}
