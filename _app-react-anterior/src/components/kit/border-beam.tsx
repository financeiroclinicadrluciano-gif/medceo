import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type BorderBeamProps = {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  color?: string;
};

/**
 * A light dot travelling along the border of the nearest positioned ancestor.
 * Drop it inside a `relative` container.
 */
export default function BorderBeam({
  className,
  size = 150,
  duration = 9,
  delay = 0,
  color = "rgba(240,217,138,0.9)",
}: BorderBeamProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("kit-border-beam", className)}
      style={
        {
          "--kit-beam-size": `${size}px`,
          "--kit-beam-duration": `${duration}s`,
          "--kit-beam-delay": `${delay}s`,
          "--kit-beam-color": color,
        } as CSSProperties
      }
    />
  );
}
