import { cn } from "@/lib/utils";

/** Three-arc orbital loader. Announces state for screen readers. */
export default function Loader({ label = "Carregando", className }: { label?: string; className?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn("kit-loader", className)}>
      <span aria-hidden="true" className="kit-loader-ring" />
      <span aria-hidden="true" className="kit-loader-ring" />
      <span aria-hidden="true" className="kit-loader-ring" />
      <span className="kit-sr-only">{label}</span>
    </span>
  );
}
