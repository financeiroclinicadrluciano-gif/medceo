import { cn } from "@/lib/utils";

/** Static masked grid with a radial spotlight. Cheap: no JS, no animation. */
export function SpotlightMaskedGrid({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("kit-bg-spotlight-grid", className)} />;
}

/** Deep radial glow anchored to the top of the section. */
export function RadialDarkBackground({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("kit-bg-radial-dark", className)} />;
}

/** Layered diagonal light beams, animated with transform only. */
export function BeamsBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("kit-bg-beams", className)}>
      <span className="kit-beam kit-beam-1" />
      <span className="kit-beam kit-beam-2" />
      <span className="kit-beam kit-beam-3" />
    </div>
  );
}

/** Fine film grain / noise overlay. */
export function NoiseOverlay({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("kit-bg-noise", className)} />;
}
