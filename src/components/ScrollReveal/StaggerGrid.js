import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const StaggerGrid = React.forwardRef(function StaggerGrid(
  { children, className },
  forwardedRef
) {
  const localRef = useRef(null);
  const ref = forwardedRef || localRef;

  const isInView = useInView(ref, {
    once: false,
    margin: '0px 0px -100px 0px',
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
});

export function StaggerItem({ children, className }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

