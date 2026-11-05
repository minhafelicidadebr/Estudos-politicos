/**
 * AEGIS Motion Library — reusable Framer Motion variants and transitions.
 * Centralized animations using design tokens for consistency.
 * Respects prefers-reduced-motion via CSS @media query in index.css.
 */
import type { Variants, Transition } from "framer-motion";

// === Easings (mapped to CSS custom properties) ===
export const ease = {
  default: [0.4, 0, 0.2, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  cinematic: [0.16, 1, 0.3, 1] as const,
} as const;

export const duration = {
  instant: 0.08,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  cinematic: 0.8,
} as const;

// === Common transitions ===
export const tx = {
  smooth: { duration: duration.normal, ease: ease.default } as Transition,
  snap: { duration: duration.fast, ease: ease.out } as Transition,
  spring: { type: "spring" as const, stiffness: 300, damping: 24, mass: 0.8 },
  cinematic: { duration: duration.cinematic, ease: ease.cinematic } as Transition,
};

// === Variants ===
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: tx.smooth },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: tx.cinematic },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: tx.cinematic },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: tx.cinematic },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: tx.cinematic },
};

// Stagger container — children animate sequentially
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// Card hover lift (use directly on motion.div whileHover)
export const hoverLift = {
  y: -4,
  transition: tx.snap,
};

// Page transition wrapper variants
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.cinematic } },
  exit: { opacity: 0, y: -8, transition: { duration: duration.fast, ease: ease.in } },
};
