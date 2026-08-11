import { motion, useReducedMotion } from "motion/react";

import type { JourneyStep } from "@/lib/site-content";

export default function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  const reduce = useReducedMotion();

  return (
    <ol className="mc-journey">
      {steps.map((step, index) => (
        <motion.li
          key={step.step}
          className="mc-journey-item"
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="mc-journey-marker" aria-hidden="true">
            <span>{step.step}</span>
          </div>
          <div className="mc-journey-body">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <span className="mc-journey-outcome">{step.outcome}</span>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
