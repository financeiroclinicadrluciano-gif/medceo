import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
  icon?: ReactNode;
};

/** Numbered steps in a connected grid — the classic "how it works" band. */
export default function HowItWorks({
  steps,
  className,
}: {
  steps: HowItWorksStep[];
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("kit-how-grid", className)}>
      {steps.map((step, index) => (
        <motion.article
          key={step.step}
          className="kit-how-card kit-surface"
          initial={reduce ? undefined : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="kit-how-step">{step.step}</span>
          {step.icon ? <span className="kit-how-icon">{step.icon}</span> : null}
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </motion.article>
      ))}
    </div>
  );
}
