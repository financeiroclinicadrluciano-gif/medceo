import { useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HoverBorderGradientProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  as?: ElementType;
} & Record<string, unknown>;

/**
 * Button/pill whose gradient border rotates on hover.
 * The border lives in a wrapper so the label stays crisp.
 */
export default function HoverBorderGradient({
  children,
  className,
  containerClassName,
  as: Tag = "button",
  ...rest
}: HoverBorderGradientProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Tag
      className={cn("kit-hbg", hovered && "is-hovered", containerClassName)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      <span aria-hidden="true" className="kit-hbg-ring" />
      <span className={cn("kit-hbg-content", className)}>{children}</span>
    </Tag>
  );
}
