"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

type AnimatedQuestionStepProps = {
  questionKey: string;
  direction: number;
  children: ReactNode;
};

export function AnimatedQuestionStep({
  questionKey,
  direction,
  children,
}: AnimatedQuestionStepProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={questionKey}
        custom={direction}
        variants={reduceMotion ? fadeVariants : slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={
          reduceMotion
            ? { duration: 0.15 }
            : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
