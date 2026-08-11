import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

export type CountUpProps = {
  /** Final numeric value. */
  value: number;
  /** Formats the visible number. Defaults to pt-BR integers. */
  format?: (value: number) => string;
  /** Total animation time in ms. */
  duration?: number;
  className?: string;
};

const defaultFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/**
 * Counts once when the number enters the viewport.
 * The final value stays in the accessibility tree, so no information depends on motion.
 */
export default function CountUp({
  value,
  format = (current) => defaultFormatter.format(current),
  duration = 1100,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(() => (prefersReducedMotion ? value : 0));

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }
    if (!isInView) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, isInView, prefersReducedMotion, value]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{format(display)}</span>
      <span className="mc-sr-only">{format(value)}</span>
    </span>
  );
}
