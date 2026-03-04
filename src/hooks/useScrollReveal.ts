import { useEffect, useRef } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealOptions {
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const {
    direction = "up",
    delay = 0,
    duration = 0.8,
    distance = 60,
    threshold = 0.15,
    once = true,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transition = `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`;

    const transforms: Record<RevealDirection, string> = {
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`,
      left: `translateX(${distance}px)`,
      right: `translateX(-${distance}px)`,
      none: `scale(0.95)`,
    };
    el.style.transform = transforms[direction];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0) translateX(0) scale(1)";
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.style.opacity = "0";
          el.style.transform = transforms[direction];
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay, duration, distance, threshold, once]);

  return ref;
}

/**
 * Hook for staggered children reveals.
 * Returns a ref for the parent; children with [data-reveal] get staggered animations.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  options: Omit<ScrollRevealOptions, "delay"> & { stagger?: number } = {}
) {
  const {
    direction = "up",
    duration = 0.7,
    distance = 40,
    threshold = 0.1,
    once = true,
    stagger = 0.1,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = container.querySelectorAll<HTMLElement>("[data-reveal]");

    const transforms: Record<RevealDirection, string> = {
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`,
      left: `translateX(${distance}px)`,
      right: `translateX(-${distance}px)`,
      none: `scale(0.95)`,
    };

    children.forEach((child, i) => {
      child.style.opacity = "0";
      child.style.transform = transforms[direction];
      child.style.transition = `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${i * stagger}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${i * stagger}s`;
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child) => {
            child.style.opacity = "1";
            child.style.transform = "translateY(0) translateX(0) scale(1)";
          });
          if (once) observer.unobserve(container);
        } else if (!once) {
          children.forEach((child) => {
            child.style.opacity = "0";
            child.style.transform = transforms[direction];
          });
        }
      },
      { threshold }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [direction, duration, distance, threshold, once, stagger]);

  return ref;
}
