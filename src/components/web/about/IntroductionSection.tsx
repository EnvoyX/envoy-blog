import { useScroll, useTransform, motion, useSpring } from 'motion/react';
import { useRef } from 'react';

export function IntroductionSection() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    // "start end" = starts when top of element hits bottom of viewport
    // "end start" = ends when bottom of element hits top of viewport
    // offset: ['start end', 'end start'],
    offset: ['start 0.9', 'end 0.9'], // trigger slightly inside the viewport
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], [0, 1, 1, 0]);
  const rotate = useSpring(useTransform(scrollYProgress, [0, 0.5, 0.75, 1], [0, 0, 180, 360]), {
    stiffness: 50,
    damping: 20,
  });
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 0.75, 1], [1, 1, 0.5, 0]), {
    stiffness: 50,
    damping: 20,
  });
  return (
    <section ref={targetRef} className="h-[300vh] relative">
      <main className="sticky top-0 h-screen overflow-auto">
        <motion.div
          ref={targetRef}
          style={{ opacity, rotate, scale }}
          className="flex flex-col gap-8 text-center justify-center items-center py-24 px-12"
        >
          <h1 className="text-5xl font-black">Hello!</h1>
          <p className="text-2xl">
            I'm a <span className="text-emerald-400 font-bold">self-taught developer</span>, and
            also a third-year student from Indonesia. I currently study in{' '}
            <span className="text-emerald-400 font-bold">Institute of Technology Bandung</span>,
            majoring in Mechanical Engineering.
          </p>
          <p className="text-2xl">
            I'd like and interested in programming and computer science stuff, mostly learning it as
            my hobby. Now i'm currently learning{' '}
            <span className="text-emerald-400 font-bold">web development</span>, and building
            projects to learn and grow as a developer. Beside web development, i'd also interested
            in learning <span className="text-emerald-400 font-bold">game development</span> in
            Unity and Godot.
          </p>
          <p className="text-2xl">
            Other than that, in my spare time, i'd like to read books, fiction or non-fiction.
            Playing videogames too of course, especially single-player games. Watching wide variety
            of animes and movies too. I will also keep post updates or anything about my hobbies and
            interest in this website!.
          </p>
        </motion.div>
      </main>
    </section>
  );
}
