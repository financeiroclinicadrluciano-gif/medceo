export type CaseSlide = {
  label: string;
  metric: string;
  title: string;
  description: string;
};

type AnimatedCaseStudyProps = {
  slides: CaseSlide[];
};

/** Compact, static case narrative that keeps every milestone visible. */
export default function AnimatedCaseStudy({ slides }: AnimatedCaseStudyProps) {
  if (slides.length === 0) return null;

  return (
    <section className="mc-case-story-static" aria-label="Evolução do case do Dr. Luiz Henrique">
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
    </section>
  );
}
