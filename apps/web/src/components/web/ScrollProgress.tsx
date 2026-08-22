import { motion, MotionStyle, useScroll } from 'motion/react';

export default function ScrollProgress({
  height,
  styleProp,
}: {
  height?: number;
  styleProp?: MotionStyle;
}) {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      id="scroll-indicator"
      className="bg-primary"
      style={{
        scaleX: scrollYProgress,
        originX: 0,
        height: height,
        ...styleProp,
      }}
    />
  );
}
