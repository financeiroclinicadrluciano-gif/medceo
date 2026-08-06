import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type AnimatedTextProps = {
  text: string;
  className?: string;
  /** Words that receive the accent gradient treatment. */
  highlight?: string[];
  as?: "h1" | "h2" | "h3" | "p";
};

/**
 * Headline reveal with a mask-up motion per word and optional accent words.
 * Pattern: overflow-hidden wrapper + translateY(100%) inner span.
 */
export default function AnimatedText({ text, className, highlight = [], as = "h2" }: AnimatedTextProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");
  const normalized = highlight.map((word) => word.toLowerCase());

  return (
    <Tag
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.055 } } }}
    >
      {words.map((word, index) => {
        const isAccent = normalized.includes(word.toLowerCase().replace(/[.,;:!?]/g, ""));
        return (
          <span key={`${word}-${index}`} className="overflow-hidden pb-[0.08em] pr-[0.28em]">
            <motion.span
              className={cn("inline-block", isAccent && "kit-accent-text")}
              variants={{
                hidden: reduce ? { opacity: 1 } : { y: "110%", opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: reduce ? 0 : 0.75, ease: [0.65, 0.01, 0.05, 0.99] } },
              }}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
