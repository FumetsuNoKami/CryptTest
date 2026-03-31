import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";

// ——————————————————————————————————————————————
// FadeIn
// ——————————————————————————————————————————————

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ delay = 0, duration = 0.3, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay, duration, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
FadeIn.displayName = "FadeIn";

// ——————————————————————————————————————————————
// SlideUp
// ——————————————————————————————————————————————

interface SlideUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  distance?: number;
}

export const SlideUp = forwardRef<HTMLDivElement, SlideUpProps>(
  ({ delay = 0, duration = 0.4, distance = 16, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: distance }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
SlideUp.displayName = "SlideUp";

// ——————————————————————————————————————————————
// ScaleIn
// ——————————————————————————————————————————————

interface ScaleInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
}

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ delay = 0, duration = 0.35, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
ScaleIn.displayName = "ScaleIn";

// ——————————————————————————————————————————————
// Stagger — list animation with staggered children
// ——————————————————————————————————————————————

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const EASE = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ease: EASE, duration: 0.35 },
  },
};

interface StaggerProps extends HTMLMotionProps<"div"> {}

export const StaggerParent = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      {...props}
    >
      {children}
    </motion.div>
  ),
);
StaggerParent.displayName = "StaggerParent";

export const StaggerChild = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={staggerItem} {...props}>
      {children}
    </motion.div>
  ),
);
StaggerChild.displayName = "StaggerChild";

// ——————————————————————————————————————————————
// HoverScale — subtle scale on hover for cards
// ——————————————————————————————————————————————

interface HoverScaleProps extends HTMLMotionProps<"div"> {
  scale?: number;
}

export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ scale = 1.02, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
HoverScale.displayName = "HoverScale";
