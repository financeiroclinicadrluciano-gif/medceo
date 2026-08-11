import { Pause, Play } from "lucide-react";
import { useState } from "react";

export type MethodPillar = {
  number: string;
  name: string;
  role: string;
  description: string;
  image: string;
  imagePosition?: string;
};

type MethodPillarsMarqueeProps = {
  items: MethodPillar[];
};

type PillarPortraitProps = {
  item: MethodPillar;
  decorative?: boolean;
};

function PillarPortrait({ item, decorative = false }: PillarPortraitProps) {
  return (
    <article className="mc-method-pillar" role={decorative ? undefined : "listitem"}>
      <div className="mc-method-pillar-portrait">
        <img
          src={item.image}
          alt={decorative ? "" : `Retrato profissional de ${item.name}`}
          width={1200}
          height={1600}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 720px) 82vw, (max-width: 1200px) 38vw, 430px"
          style={{ objectPosition: item.imagePosition }}
        />
        <span className="mc-method-pillar-index" aria-hidden="true">
          {item.number}
        </span>
      </div>

      <div className="mc-method-pillar-copy">
        <p>{item.role}</p>
        <h3>{item.name}</h3>
        <span>{item.description}</span>
      </div>
    </article>
  );
}

/**
 * A continuous editorial portrait sequence on desktop, with a manual
 * scroll-snap fallback for touch and reduced-motion users.
 */
export default function MethodPillarsMarquee({ items }: MethodPillarsMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className={`mc-method-pillars-marquee${isPaused ? " is-paused" : ""}`}>
      <div className="mc-method-pillars-toolbar">
        <span>
          <span className="mc-method-pillars-toolbar-desktop">Seis disciplinas em movimento</span>
          <span className="mc-method-pillars-toolbar-touch">Arraste para conhecer cada pilar</span>
        </span>
        <button
          type="button"
          className="mc-method-pillars-motion-toggle"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-pressed={isPaused}
          aria-label={isPaused ? "Retomar movimento dos retratos" : "Pausar movimento dos retratos"}
        >
          {isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          <span>{isPaused ? "Retomar" : "Pausar"}</span>
        </button>
      </div>

      <div className="mc-method-pillars-viewport">
        <div className="mc-method-pillars-track">
          <div
            className="mc-method-pillars-group"
            role="list"
            aria-label="Pilares do Método MedCEO"
          >
            {items.map((item) => (
              <PillarPortrait item={item} key={item.number} />
            ))}
          </div>

          <div className="mc-method-pillars-group" aria-hidden="true" inert>
            {items.map((item) => (
              <PillarPortrait item={item} decorative key={`duplicate-${item.number}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
