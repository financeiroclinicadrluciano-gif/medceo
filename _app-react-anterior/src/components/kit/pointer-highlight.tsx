import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type PointerHighlightProps = {
  children: ReactNode;
  className?: string;
  rectClassName?: string;
  pointerClassName?: string;
};

/**
 * Draws a rectangle around the content and slides a cursor into the corner
 * when the element enters the viewport. Purely decorative.
 */
export default function PointerHighlight({
  children,
  className,
  rectClassName,
  pointerClassName,
}: PointerHighlightProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (reduce) {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <span ref={ref} className={cn("relative inline-block", className)}>
      {children}
      <motion.span
        aria-hidden="true"
        className={cn("kit-pointer-rect", rectClassName)}
        initial={false}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
        transition={{ duration: reduce ? 0 : 0.45, ease: [0.23, 1, 0.32, 1] }}
      />
      <motion.span
        aria-hidden="true"
        className={cn("kit-pointer-cursor", pointerClassName)}
        initial={false}
        animate={active ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -14, y: -14 }}
        transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.15 }}
      />
    </span>
  );
}
