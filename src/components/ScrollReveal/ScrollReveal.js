import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 30,
  once = false,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    margin: '0px 0px -80px 0px',
  });

  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const initial = {
    opacity: 0,
    ...directions[direction],
  };

  const animate = isInView
    ? { opacity: 1, x: 0, y: 0 }
    : { opacity: 0, ...directions[direction] };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}

