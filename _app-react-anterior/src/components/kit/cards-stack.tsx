import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type CardStackItem = {
  id: string;
  content: ReactNode;
};

/**
 * Sticky stack: each card pins and the next one slides over it,
 * with the outgoing card scaling down slightly.
 */
export default function CardsStack({ items, className }: { items: CardStackItem[]; className?: string }) {
  return (
    <div className={cn("kit-stack", className)}>
      {items.map((item, index) => (
        <StackCard key={item.id} index={index} total={items.length}>
          {item.content}
        </StackCard>
      ))}
    </div>
  );
}

function StackCard({ children, index, total }: { children: ReactNode; index: number; total: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 12%", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.55]);

  return (
    <div ref={ref} className="kit-stack-slot" style={{ top: `calc(88px + ${index * 14}px)`, zIndex: total - index }}>
      <motion.div className="kit-stack-card kit-surface" style={reduce ? undefined : { scale, opacity }}>
        {children}
      </motion.div>
    </div>
  );
}
