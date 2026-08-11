import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  title: string;
  description?: string;
  meta?: string;
};

/**
 * Vertical timeline: the rail fills as each item reveals.
 * Every item is readable on its own; motion only sequences the reading.
 */
export default function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  const reduce = useReducedMotion();

  return (
    <ol className={cn("kit-timeline", className)}>
      {items.map((item, index) => (
        <motion.li
          key={item.title}
          className="kit-timeline-item"
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
        >
          <span aria-hidden="true" className="kit-timeline-dot" />
          <div className="kit-timeline-body">
            {item.meta ? <span className="kit-timeline-meta">{item.meta}</span> : null}
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
