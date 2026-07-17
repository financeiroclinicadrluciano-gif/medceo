import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export type CaseSlide = {
  label: string;
  metric: string;
  title: string;
  description: string;
};

type AnimatedCaseStudyProps = {
  slides: CaseSlide[];
};

/** Animated Testimonials pattern adapted to a documented case without invented quotes. */
export default function AnimatedCaseStudy({ slides }: AnimatedCaseStudyProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[activeIndex];

  const changeSlide = (direction: number) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  if (!active) return null;

  return (
    <div className="mc-case-story" aria-live="polite">
      <div className="mc-case-story-topline">
        <span>{active.label}</span>
        <span>
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
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

      <div className="mc-case-story-controls">
        <button type="button" onClick={() => changeSlide(-1)} aria-label="Etapa anterior do case">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div className="mc-case-story-dots" aria-hidden="true">
          {slides.map((slide, index) => (
            <span className={index === activeIndex ? "is-active" : ""} key={slide.label} />
          ))}
        </div>
        <button type="button" onClick={() => changeSlide(1)} aria-label="Próxima etapa do case">
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
