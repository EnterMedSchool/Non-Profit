"use client";

import { useRef, useEffect, useState } from "react";
import {
  m,
  useReducedMotion,
  useInView,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";

type AnimationType =
  | "fadeUp"
  | "fadeIn"
  | "scaleIn"
  | "slideLeft"
  | "slideRight"
  | "blurIn"
  | "rotateIn"
  | "popIn";

const variants: Record<
  AnimationType,
  { initial: TargetAndTransition; animate: TargetAndTransition }
> = {
  fadeUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  slideLeft: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
  },
  slideRight: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
  },
  blurIn: {
    initial: { opacity: 0, filter: "blur(12px)", scale: 0.95 },
    animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  },
  rotateIn: {
    initial: { opacity: 0, rotateX: -8, y: 30 },
    animate: { opacity: 1, rotateX: 0, y: 0 },
  },
  popIn: {
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
  },
};

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  spring?: boolean;
}

export default function AnimatedSection({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 0.6,
  className = "",
  once = true,
  spring = false,
}: AnimatedSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Detect viewport intersection with a generous bottom margin so elements
  // start animating 150px before they scroll into view.
  const isInView = useInView(ref, { once, margin: "0px 0px 150px 0px" });

  // Track whether the IntersectionObserver has had time to report.
  // Until it does, we keep every element visible to prevent the
  // "flash of invisible content" that occurs when above-the-fold
  // elements are initially rendered at opacity 0.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // A short delay gives the IntersectionObserver time to fire for
    // elements that are already inside the viewport on mount.
    const timer = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(timer);
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const { initial, animate: animateTarget } = variants[animation];

  const userTransition: Transition = spring
    ? { type: "spring", stiffness: 100, damping: 15, delay }
    : { duration, delay, ease: [0.4, 0, 0.2, 1] };

  const style =
    animation === "rotateIn" ? { perspective: "800px" } : undefined;

  // Before the observer is ready we treat every element as "visible"
  // so nothing flashes invisible on first paint.
  // After ready, we follow the observer: visible → animate in,
  // not visible → stay hidden until scrolled into view.
  const shouldShow = !ready || isInView;

  return (
    <m.div
      ref={ref}
      animate={shouldShow ? animateTarget : initial}
      transition={shouldShow && ready ? userTransition : { duration: 0 }}
      className={className}
      style={style}
    >
      {children}
    </m.div>
  );
}
