import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

interface AnimatedContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Lightweight reveal-on-scroll wrapper. Uses IntersectionObserver so it's
 * SSR-safe and doesn't require gsap/ScrollTrigger.
 */
export default function AnimatedContent({
  children,
  distance = 36,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  delay = 0,
  threshold = 0.12,
  className = "",
  style,
  ...props
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const axis = direction === "horizontal" ? "X" : "Y";
    const offset = reverse ? -distance : distance;

    if (reduce) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = `translate${axis}(${offset}px)`;
    el.style.transition = `opacity ${duration}s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform ${duration}s cubic-bezier(0.16,1,0.3,1) ${delay}s`;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translate(0,0)";
            io.disconnect();
          }
        });
      },
      { threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [distance, direction, reverse, duration, delay, threshold]);

  return (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  );
}
