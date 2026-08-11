import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
};

/** Masonry-ish testimonial grid with quiet reveals. */
export default function TestimonialsSection({
  testimonials,
  className,
}: {
  testimonials: Testimonial[];
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("kit-testimonials", className)}>
      {testimonials.map((testimonial, index) => (
        <motion.figure
          key={testimonial.name}
          className="kit-testimonial kit-surface"
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
        >
          <blockquote>{testimonial.quote}</blockquote>
          <figcaption>
            {testimonial.avatar ? <img src={testimonial.avatar} alt="" loading="lazy" /> : null}
            <span>
              <strong>{testimonial.name}</strong>
              {testimonial.role ? <em>{testimonial.role}</em> : null}
            </span>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}
