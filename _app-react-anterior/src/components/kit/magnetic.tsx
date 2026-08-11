import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

export type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Max travel in px. */
  strength?: number;
};

/**
 * Pulls the element toward the pointer while hovering, springing back on leave.
 * Pointer-only enhancement: keyboard and touch users lose nothing.
 */
export default function Magnetic({ children, className, strength = 14 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block", className)}
      style={reduce ? undefined : { x: springX, y: springY }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse") return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        x.set(Math.max(-1, Math.min(1, relX)) * strength);
        y.set(Math.max(-1, Math.min(1, relY)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
