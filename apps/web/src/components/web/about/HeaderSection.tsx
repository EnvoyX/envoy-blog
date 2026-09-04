import { useScroll, useTransform, motion, useSpring } from 'motion/react';
import { useRef } from 'react';
export function HeaderSection() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    // "start start" = starts when top of element hits top of viewport
    // "end start" = ends when bottom of element hits top of viewport
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 0.75, 0.5, 0.25, 0]);
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1500]));
  const reverseX = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1500]));
  return (
    /*  the wrapper defines the "scroll distance" (200vh = 2 screens long) */
    <section ref={targetRef} className="h-[200vh] relative">
      <header
        ref={targetRef}
        className="sticky top-0 h-screen flex flex-col justify-center items-center overflow-hidden"
      >
        <motion.h3
          style={{ opacity, x }}
          className="text-6xl max-sm:text-4xl font-bold text-zinc-400 text-center"
        >
          About
        </motion.h3>
        <motion.h1
          style={{ opacity, x: reverseX }}
          className="text-7xl max-sm:text-5xl font-black text-center"
        >
          Hanif Hafizhan
        </motion.h1>
      </header>
    </section>
  );
}
