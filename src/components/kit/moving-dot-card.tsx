import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import BorderBeam from "./border-beam";

export type MovingDotCardProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
};

/** Card surface with a dot orbiting its border. */
export default function MovingDotCard({ children, className, duration = 10, delay = 0 }: MovingDotCardProps) {
  return (
    <div className={cn("kit-surface relative overflow-hidden", className)}>
      <BorderBeam duration={duration} delay={delay} size={110} />
      {children}
    </div>
  );
}
