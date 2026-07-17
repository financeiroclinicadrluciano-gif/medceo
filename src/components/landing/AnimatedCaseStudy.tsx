import { AnimatePresence, motion } from "motion/react";

export type CaseSlide = {
  label: string;
  metric: string;
  title: string;
  description: string;
};

type AnimatedCaseStudyProps = {
  slides: CaseSlide[];
  activeIndex: number;
};

/** Scroll-driven case narrative with a static fallback for mobile and reduced motion. */
export default function AnimatedCaseStudy({ slides, activeIndex }: AnimatedCaseStudyProps) {
  const safeIndex = Math.min(Math.max(activeIndex, 0), Math.max(slides.length - 1, 0));
  const active = slides[safeIndex];

  if (!active) return null;

  return (
    <>
      <div className="mc-case-story">
        <div className="mc-case-story-topline">
          <span>{active.label}</span>
          <span>
            {String(safeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        <div className="mc-case-story-stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            >
              <strong>{active.metric}</strong>
              <h3>{active.title}</h3>
              <p>{active.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mc-case-story-progress" aria-hidden="true">
          <span>Role para acompanhar o case</span>
          <div className="mc-case-story-dots">
            {slides.map((slide, index) => (
              <span className={index === safeIndex ? "is-active" : ""} key={slide.label} />
            ))}
          </div>
        </div>
      </div>

      <div className="mc-case-story-static" aria-label="Evolução do case do Dr. Luiz Henrique">
        {slides.map((slide, index) => (
          <article key={slide.label}>
            <div className="mc-case-story-topline">
              <span>{slide.label}</span>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <strong>{slide.metric}</strong>
            <h3>{slide.title}</h3>
            <p>{slide.description}</p>
          </article>
        ))}
      </div>
    </>
  );
}
