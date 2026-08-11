import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Perspective "device" frame that rotates flat and scales up as it scrolls in.
 * Good for hero media (video, dashboards).
 */
export default function ContainerScroll({
  children,
  header,
  className,
}: {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 0.45], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.94, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.45], [28, 0]);

  return (
    <div ref={ref} className={cn("kit-container-scroll", className)}>
      {header ? <div className="kit-container-scroll-header">{header}</div> : null}
      <motion.div
        className="kit-container-scroll-frame"
        style={reduce ? undefined : { rotateX: rotate, scale, y: translateY }}
      >
        {children}
      </motion.div>
    </div>
  );
}
