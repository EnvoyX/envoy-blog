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
      <main className="sticky top-0 h-screen overflow-auto scrollbar-hide">
        <motion.div
          ref={targetRef}
          style={{ opacity, rotate, scale }}
          className="flex flex-col gap-4 text-center justify-center items-center py-24 px-4"
        >
          <h1 className="max-sm:text-2xl text-5xl font-black">Hello!</h1>
          <p className="max-sm:text-base text-2xl">
            I am a third year{' '}
            <span className="text-white font-bold underline underline-offset-4 decoration-zinc-700">Mechanical Engineering</span> student at{' '}
            <span className="text-white font-bold underline underline-offset-4 decoration-zinc-700">Institute of Technology Bandung</span> with
            a strong focus on integrating industrial maintenance systems with information
            technology.
          </p>
          <p className="max-sm:text-base text-2xl">
            I work across engineering and software to deliver data-driven solutions using tools like
            Next.js, Python, and Typescript, while managing multidisciplinary projects with clear
            execution.
          </p>
          <p className="max-sm:text-base text-2xl">
            I'd pique my curiosity and interest in programming and computer science stuff, mostly
            learning it as my hobby. Now i'm currently learning{' '}
            <span className="text-white font-bold underline underline-offset-4 decoration-zinc-700">web development</span>, and building
            projects to learn and grow as a developer. Beside web development, i'd also learning{' '}
            <span className="text-white font-bold underline underline-offset-4 decoration-zinc-700">game development</span> in Unity and Godot.
          </p>
          <p className="max-sm:text-base text-2xl">
            Other than that, in my spare time, i'd like to read books, fiction or non-fiction.
            Playing videogames too of course, especially single-player games. Watching wide variety
            of animes and movies too. I will also keep post updates or anything about my hobbies and
            interest in this website. Photos of my photography works will also be posted here!
          </p>
        </motion.div>
      </main>
    </section>
  );
}
