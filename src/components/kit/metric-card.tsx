import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import ShineBorder from "./shine-border";

export type MetricCardProps = {
  label: string;
  value: ReactNode;
  delta?: string;
  caption?: string;
  className?: string;
};

/** Large-number metric card ("yield card") with an optional delta chip. */
export default function MetricCard({ label, value, delta, caption, className }: MetricCardProps) {
  return (
    <ShineBorder className={cn("kit-metric", className)}>
      <div className="kit-metric-inner">
        <p className="kit-metric-label">{label}</p>
        <p className="kit-metric-value">{value}</p>
        {delta ? <span className="kit-metric-delta">{delta}</span> : null}
        {caption ? <p className="kit-metric-caption">{caption}</p> : null}
      </div>
    </ShineBorder>
  );
}
