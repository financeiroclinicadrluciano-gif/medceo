import { useEffect, useRef, useState, type ElementType } from "react";

type SplitTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  textAlign?: "left" | "center" | "right";
};

/**
 * React Bits-inspired line reveal, rebuilt for TanStack SSR.
 * It keeps semantic text in the DOM, avoids layout-measuring plugins and
 * becomes fully static when reduced motion is requested.
 */
export default function SplitText({
  text,
  as: Tag = "p",
  className = "",
  delay = 70,
  duration = 560,
  threshold = 0.15,
  textAlign = "left",
}: SplitTextProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const lines = text.split("\n");

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={rootRef}
      className={`rb-split-text ${isVisible ? "is-visible" : ""} ${className}`}
      aria-label={text.replaceAll("\n", " ")}
      style={{ textAlign }}
    >
      {lines.map((line, index) => (
        <span className="rb-split-line" aria-hidden="true" key={`${line}-${index}`}>
          <span
            className="rb-split-line-inner"
            style={{
              transitionDelay: `${index * delay}ms`,
              transitionDuration: `${duration}ms`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
