import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TextShimmerProps = {
  children: ReactNode;
  className?: string;
  /** Loop duration in seconds. */
  duration?: number;
  /** Highlight colour of the travelling band. */
  shine?: string;
};

/**
 * A light band travels across the text using a masked background gradient.
 * Pattern: background-clip:text + animated background-position.
 */
export default function TextShimmer({
  children,
  className,
  duration = 2.6,
  shine = "rgba(255,255,255,0.92)",
}: TextShimmerProps) {
  return (
    <span
      className={cn("kit-text-shimmer", className)}
      style={
        {
          "--kit-shimmer-duration": `${duration}s`,
          "--kit-shimmer-shine": shine,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
