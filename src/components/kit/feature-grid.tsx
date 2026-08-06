import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type FeatureItem = {
  title: string;
  description: string;
  icon?: ReactNode;
};

/** Feature/service grid with hairline dividers and hover lift. */
export default function FeatureGrid({ features, className }: { features: FeatureItem[]; className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("kit-feature-grid", className)}>
      {features.map((feature, index) => (
        <motion.article
          key={feature.title}
          className="kit-feature-cell"
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
        >
          {feature.icon ? <span className="kit-feature-icon">{feature.icon}</span> : null}
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </motion.article>
      ))}
    </div>
  );
}
