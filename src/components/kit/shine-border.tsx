import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ShineBorderProps = {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  duration?: number;
  colors?: string[];
  radius?: string;
};

/**
 * Animated conic gradient border rendered in a masked pseudo element,
 * so the content keeps a normal, readable background.
 */
export default function ShineBorder({
  children,
  className,
  borderWidth = 1,
  duration = 12,
  colors = ["rgba(205,174,88,0.05)", "rgba(240,217,138,0.85)", "rgba(205,174,88,0.05)"],
  radius = "14px",
}: ShineBorderProps) {
  return (
    <div
      className={cn("kit-shine-border", className)}
      style={
        {
          "--kit-shine-width": `${borderWidth}px`,
          "--kit-shine-duration": `${duration}s`,
          "--kit-shine-radius": radius,
          "--kit-shine-gradient": `conic-gradient(from var(--kit-shine-angle), ${colors.join(", ")})`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
