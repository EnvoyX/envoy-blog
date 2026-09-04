import { useScroll, useTransform, motion, useSpring } from "motion/react";
import { useRef } from "react";
import { useMediaQuery } from "usehooks-ts";

import { ScrollCircle } from "../ScrollProgressCircle";

interface ProjectProps {
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  projectUrl: string;
}
function ProjectCard({ title, description, tags, imageUrl, projectUrl }: ProjectProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800 transition-colors hover:border-primary-500/50"
    >
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-col gap-3 p-6 ">
        <div className="flex flex-wrap gap-2 max-sm:hidden">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-sm text-zinc-400 line-clamp-3">{description}</p>

        <a
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary-500 cursor-pointer hover:underline"
        >
          View Project
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </motion.div>
  );
}

export function WorksSection() {
  const containerRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // "start start" = starts when top of element hits top of viewport
    // "end end" = ends when bottom of element hits bottom of viewport
    offset: ["start start", "end end"],
  });
  const projects: ProjectProps[] = [
    {
      title: "Mechanical Festival 2026",
      description:
        "An official website for registering events and competitions in annual event of Mechanical Festival, brought by HMM ITB.",
      tags: ["React", "Next.js", "TypeScript", "tRPC", "Tailwind"],
      imageUrl: "https://i.ibb.co.com/sxXHVQr/Screenshot-2026-05-15-173618.png",
      projectUrl: "https://m-fest-xi.vercel.app",
    },
    {
      title: "HMM ITB",
      description:
        "A website for HMM ITB, the student organization of the Institute of Technology Bandung, and LMS for students of HMM ITB.",
      tags: ["React", "Next.js", "TypeScript", "tRPC", "Tailwind"],
      imageUrl: "https://i.ibb.co.com/YT81f1GQ/Screenshot-2026-05-15-083113.png",
      projectUrl: "https://www.hmmitb.com/",
    },
    {
      title: "GIM ITB",
      description: "A website for GIM ITB, the student club of Game Development based in ITB.",
      tags: ["React", "Tailwind", "Next.js", "TypeScript"],
      imageUrl: "https://i.ibb.co.com/WNqB7zzm/Screenshot-2026-05-15-083053.png",
      projectUrl: "https://gimitb.com/",
    },
    {
      title: "Envoy Mindpalace",
      description: "My personal website built with various TanStack Libraries.",
      tags: ["React", "Tailwind", "TanStack Start", "TypeScript"],
      imageUrl: "https://i.ibb.co.com/nNm7tG1T/Screenshot-2026-05-15-095522.png",
      projectUrl: "https://envoy-mindpalace.vercel.app/",
    },
  ];

  const xRaw = useTransform(
    scrollYProgress,
    [0, 1],
    [
      "100vw",
      `${isMobile ? `-${250 / projects.length + 200}vw` : `-${100 / projects.length + 100}vw`}`,
    ],
  );
  const x = useSpring(xRaw, { stiffness: 50, damping: 20 });

  return (
    <section ref={containerRef} className="h-[500vh] max-sm:h-[400vh] relative">
      <main className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center gap-2 mb-12">
            <h1 className=" text-5xl font-black">My Works</h1>
            <ScrollCircle scrollYProgress={scrollYProgress} />
          </div>
          <p className="text-primary-500 font-mono text-sm uppercase tracking-widest text-center">
            Slide to view
          </p>
          <motion.div className="flex items-center gap-4 sm:gap-12 mt-8 w-max" style={{ x }}>
            {projects.map((project, index) => (
              <div key={index} className="w-[60vw] sm:w-100 shrink-0 ">
                <ProjectCard key={index} {...project} />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </section>
  );
}
