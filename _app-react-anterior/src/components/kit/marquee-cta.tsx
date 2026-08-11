import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MarqueeCtaProps = {
  words: string[];
  className?: string;
  action?: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
};

/**
 * Full-width marquee headline with an optional CTA underneath.
 * Duplicated track for a seamless loop; pauses on hover and with reduced motion.
 */
export default function MarqueeCta({ words, className, action, duration = 26 }: MarqueeCtaProps) {
  const track = [...words, ...words];

  return (
    <div className={cn("kit-marquee-cta", className)}>
      <div className="kit-marquee" aria-hidden="true">
        <div className="kit-marquee-track" style={{ animationDuration: `${duration}s` }}>
          {track.map((word, index) => (
            <span key={`${word}-${index}`} className="kit-marquee-word">
              {word}
              <i className="kit-marquee-sep">/</i>
            </span>
          ))}
        </div>
      </div>
      <p className="kit-sr-only">{words.join(" — ")}</p>
      {action ? <div className="kit-marquee-action">{action}</div> : null}
    </div>
  );
}
