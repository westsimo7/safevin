import { useRef } from "react";
import { useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

interface ScrollTriggerOptions {
  /** How far before the element enters the viewport to start (0 = bottom edge, 1 = top edge) */
  offset?: [string, string];
  /** Spring stiffness for smooth interpolation */
  stiffness?: number;
  /** Spring damping */
  damping?: number;
}

interface ScrollTriggerResult {
  ref: React.RefObject<HTMLDivElement>;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  x: MotionValue<number>;
  scale: MotionValue<number>;
  rotateX: MotionValue<number>;
  progress: MotionValue<number>;
}

/**
 * GSAP ScrollTrigger-style hook using Framer Motion.
 * Returns smooth, scroll-linked motion values that can be applied to motion.div.
 */
export function useScrollTrigger(opts?: ScrollTriggerOptions): ScrollTriggerResult {
  const ref = useRef<HTMLDivElement>(null!);
  const { stiffness = 100, damping = 30 } = opts || {};

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (opts?.offset as any) || ["start end", "end start"],
  });

  // Smooth the scroll progress with a spring
  const smoothProgress = useSpring(scrollYProgress, { stiffness, damping });

  // Standard transforms: element enters from below, fades in, scales up
  const opacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.7]);
  const y = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [80, 0, 0, -30]);
  const x = useTransform(smoothProgress, [0, 0.3], [0, 0]);
  const scale = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.98]);
  const rotateX = useTransform(smoothProgress, [0, 0.3], [6, 0]);

  return { ref, opacity, y, x, scale, rotateX, progress: smoothProgress };
}

/**
 * Parallax effect: element moves at a different rate than scroll.
 * speed > 0 = moves slower (background-like), speed < 0 = moves faster.
 */
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null!);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return { ref, y: smoothY };
}

/**
 * Horizontal slide-in on scroll.
 */
export function useScrollSlide(direction: "left" | "right" = "left") {
  const ref = useRef<HTMLDivElement>(null!);
  const multiplier = direction === "left" ? -1 : 1;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  const x = useTransform(smoothProgress, [0, 1], [multiplier * 120, 0]);
  const opacity = useTransform(smoothProgress, [0, 0.5, 1], [0, 0.5, 1]);

  return { ref, x, opacity };
}

/**
 * Scale-up reveal on scroll.
 */
export function useScrollScale() {
  const ref = useRef<HTMLDivElement>(null!);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  const scale = useTransform(smoothProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.4, 1], [0, 0.6, 1]);

  return { ref, scale, opacity };
}
