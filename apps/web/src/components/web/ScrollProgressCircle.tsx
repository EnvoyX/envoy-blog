import { useSpring, motion, MotionValue } from 'motion/react';

export function ScrollCircle({
  className,
  scrollYProgress,
}: {
  className?: string;
  scrollYProgress: MotionValue<number>;
}) {
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className={className}>
      <svg width="55" height="55" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="30" fill="none" strokeWidth="8" className="stroke-transparent" />
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary"
          style={{ pathLength: scaleX }}
        />
      </svg>
    </div>
  );
}
