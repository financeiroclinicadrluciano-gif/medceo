import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * SVG paths drawn with an animated dash offset — a slow, quiet background.
 */
export default function FloatingPaths({ className, position = 1 }: { className?: string; position?: number }) {
  const reduce = useReducedMotion();
  const paths = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    d: `M-${380 - index * 6 * position} -${180 + index * 7}C-${380 - index * 6 * position} -${
      180 + index * 7
    } -${300 - index * 6 * position} ${220 - index * 6} ${160 - index * 6 * position} ${340 - index * 6}C${
      620 - index * 6 * position
    } ${460 - index * 6} ${700 - index * 6 * position} ${820 - index * 6} ${700 - index * 6 * position} ${
      820 - index * 6
    }`,
    width: 0.4 + index * 0.03,
  }));

  return (
    <div aria-hidden="true" className={cn("kit-bg-paths", className)}>
      <svg viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.06 + path.id * 0.012}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
            animate={
              reduce
                ? { pathLength: 1, opacity: 0.5 }
                : { pathLength: 1, opacity: [0.25, 0.55, 0.25], pathOffset: [0, 1, 0] }
            }
            transition={{ duration: 22 + path.id * 0.4, repeat: reduce ? 0 : Infinity, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  );
}
