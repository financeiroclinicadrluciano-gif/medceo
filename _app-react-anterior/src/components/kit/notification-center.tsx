import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
};

/** Stacked notification list with enter/exit transitions. */
export default function NotificationCenter({
  items,
  className,
  onDismiss,
}: {
  items: NotificationItem[];
  className?: string;
  onDismiss?: (id: string) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <ul className={cn("kit-notifications", className)}>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout={!reduce}
            className={cn("kit-notification kit-surface", item.unread && "is-unread")}
            initial={reduce ? undefined : { opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: 22 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            <div>
              <p className="kit-notification-title">{item.title}</p>
              {item.description ? <p className="kit-notification-desc">{item.description}</p> : null}
            </div>
            <div className="kit-notification-side">
              {item.time ? <span>{item.time}</span> : null}
              {onDismiss ? (
                <button type="button" onClick={() => onDismiss(item.id)} aria-label={`Dispensar ${item.title}`}>
                  ×
                </button>
              ) : null}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
