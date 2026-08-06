import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type MotionBlurTextProps = {
  text: string;
  className?: string;
  /** Delay between each word, in seconds. */
  stagger?: number;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

/**
 * Words enter from below with a blur-to-focus pass.
 * Pattern: blur(12px) + y offset -> 0, staggered per word.
 */
export default function MotionBlurText({
  text,
  className,
  stagger = 0.06,
  delay = 0,
  as = "p",
}: MotionBlurTextProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");

  return (
    <Tag
      className={cn("inline-block", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ visible: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } } }}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block will-change-[transform,filter]"
          variants={{
            hidden: reduce ? { opacity: 1 } : { opacity: 0, y: "0.35em", filter: "blur(12px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: reduce ? 0 : 0.7, ease: [0.23, 1, 0.32, 1] },
            },
          }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : null}
        </motion.span>
      ))}
    </Tag>
  );
}
