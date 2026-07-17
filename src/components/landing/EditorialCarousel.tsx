import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

export type EditorialSlide = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
};

type EditorialCarouselProps = {
  slides: EditorialSlide[];
};

/** Apple Cards Carousel pattern rebuilt as a lightweight, scroll-snap gallery. */
export default function EditorialCarousel({ slides }: EditorialCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.min(track.clientWidth * 0.82, 520),
      behavior: "smooth",
    });
  };

  return (
    <div className="mc-editorial-carousel">
      <div className="mc-editorial-carousel-controls">
        <span>Retratos oficiais</span>
        <div>
          <button type="button" onClick={() => move(-1)} aria-label="Ver retrato anterior">
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Ver próximo retrato">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mc-editorial-carousel-track" ref={trackRef}>
        {slides.map((slide) => (
          <figure className="mc-editorial-card" key={slide.title}>
            <img src={slide.image} alt={slide.alt} loading="lazy" decoding="async" />
            <figcaption>
              <span>{slide.eyebrow}</span>
              <strong>{slide.title}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
