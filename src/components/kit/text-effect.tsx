import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

export type TextEffectPreset = "fade" | "slide" | "scale" | "blur";
export type TextEffectProps = {
  children: string;
  per?: "word" | "char" | "line";
  preset?: TextEffectPreset;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

const presets: Record<TextEffectPreset, Variants> = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: "0.4em" }, visible: { opacity: 1, y: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.86 }, visible: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: "blur(10px)" }, visible: { opacity: 1, filter: "blur(0px)" } },
};

/**
 * Composable reveal for text: split per char / word / line, then apply a preset.
 */
export default function TextEffect({
  children,
  per = "word",
  preset = "blur",
  className,
  delay = 0,
  stagger = 0.045,
  as = "p",
}: TextEffectProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const parts =
    per === "char" ? children.split("") : per === "line" ? children.split("\n") : children.split(" ");
  const variants = presets[preset];

  return (
    <Tag
      className={cn(per === "line" && "flex flex-col", className)}
      aria-label={children.replaceAll("\n", " ")}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{ visible: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } } }}
    >
      {parts.map((part, index) => (
        <motion.span
          key={`${part}-${index}`}
          aria-hidden="true"
          className={cn(per !== "line" && "inline-block")}
          variants={reduce ? presets.fade : variants}
          transition={{ duration: reduce ? 0 : 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {part}
          {per === "word" && index < parts.length - 1 ? "\u00A0" : null}
        </motion.span>
      ))}
    </Tag>
  );
}
