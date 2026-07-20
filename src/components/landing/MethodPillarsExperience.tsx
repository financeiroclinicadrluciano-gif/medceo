import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import "@/pillars-experience.css";

export type MethodPillarExperienceItem = {
  number: string;
  name: string;
  role: string;
  thesis: string;
  topics: string[];
  image: string;
  imagePosition?: string;
};

type MethodPillarsExperienceProps = {
  pillars: MethodPillarExperienceItem[];
};

type ExperienceStyle = CSSProperties & {
  "--mpx-stage-height": string;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

/**
 * A single editorial atlas for the six MedCEO disciplines.
 *
 * Desktop progressively enhances into one sticky, scroll-linked rail. Mobile
 * uses the same vertical-scroll idea card by card. Reduced-motion and
 * no-JavaScript contexts retain every pillar as readable static content.
 */
export default function MethodPillarsExperience({ pillars }: MethodPillarsExperienceProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const setActivePillar = useCallback(
    (index: number) => {
      const nextIndex = clamp(index, 0, Math.max(pillars.length - 1, 0));

      if (activeIndexRef.current === nextIndex) return;

      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    },
    [pillars.length],
  );

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const rail = railRef.current;

    if (!root || !stage || !viewport || !rail || pillars.length === 0) return;
    const cards = cardRefs.current;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scrollFrame = 0;
    let horizontalFrame = 0;
    let enhanced = false;
    let mobileEnhanced = false;

    const updateScrollExperience = () => {
      scrollFrame = 0;
      if (mobileEnhanced) {
        const viewportHeight = Math.max(window.innerHeight, 1);
        const focusLine = viewportHeight * 0.52;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
          if (!card) return;

          const bounds = card.getBoundingClientRect();
          const entry = clamp(
            (viewportHeight - bounds.top) / Math.max(viewportHeight * 0.58, 1),
            0,
            1,
          );
          const exit = clamp(
            (viewportHeight * 0.2 - bounds.bottom) / Math.max(viewportHeight * 0.28, 1),
            0,
            1,
          );
          const rise = 56 * (1 - entry) - 18 * exit;
          const scale = 0.982 + entry * 0.018 - exit * 0.012;
          const opacity = 0.58 + entry * 0.42 - exit * 0.18;
          const distance = Math.abs(bounds.top + bounds.height * 0.42 - focusLine);

          card.style.setProperty("--mpx-card-rise", `${rise.toFixed(2)}px`);
          card.style.setProperty("--mpx-card-scale", scale.toFixed(4));
          card.style.setProperty("--mpx-card-opacity", opacity.toFixed(4));

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        root.style.setProperty(
          "--mpx-progress",
          `${(closestIndex + 1) / Math.max(pillars.length, 1)}`,
        );
        setActivePillar(closestIndex);
        return;
      }

      if (!enhanced) return;

      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const scrollRange = Math.max(stage.offsetHeight - window.innerHeight, 1);
      const progress = clamp((window.scrollY - stageTop) / scrollRange, 0, 1);
      const maximumShift = Math.max(rail.scrollWidth - viewport.clientWidth, 0);
      const pillarProgress = progress * Math.max(pillars.length - 1, 0);

      root.style.setProperty("--mpx-shift", `${(-maximumShift * progress).toFixed(2)}px`);
      root.style.setProperty("--mpx-progress", progress.toFixed(4));

      // Motion intent: each intelligence climbs into decision focus as the rail advances.
      cards.forEach((card, index) => {
        if (!card) return;

        const distanceFromFocus = index - pillarProgress;
        const enteringDistance = clamp(distanceFromFocus, 0, 1);
        const exitingDistance = clamp(-distanceFromFocus, 0, 1);
        const proximity = clamp(1 - Math.abs(distanceFromFocus), 0, 1);
        const rise = enteringDistance * 84 - exitingDistance * 24;
        const scale = 0.965 + proximity * 0.035;
        const opacity = 0.55 + proximity * 0.45;

        card.style.setProperty("--mpx-card-rise", `${rise.toFixed(2)}px`);
        card.style.setProperty("--mpx-card-scale", scale.toFixed(4));
        card.style.setProperty("--mpx-card-opacity", opacity.toFixed(4));
      });

      setActivePillar(Math.round(pillarProgress));
    };

    const requestScrollUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollExperience);
    };

    const updateHorizontalSelection = () => {
      horizontalFrame = 0;
      if (enhanced || mobileEnhanced) return;

      const viewportCenter = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        if (!card) return;
        const cardBounds = card.getBoundingClientRect();
        const distance = Math.abs(cardBounds.left + cardBounds.width / 2 - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      root.style.setProperty(
        "--mpx-progress",
        `${(closestIndex + 1) / Math.max(pillars.length, 1)}`,
      );
      setActivePillar(closestIndex);
    };

    const requestHorizontalUpdate = () => {
      if (horizontalFrame) return;
      horizontalFrame = window.requestAnimationFrame(updateHorizontalSelection);
    };

    const configureExperience = () => {
      enhanced = desktopQuery.matches && !reducedMotionQuery.matches && pillars.length > 1;
      mobileEnhanced = mobileQuery.matches && !reducedMotionQuery.matches && pillars.length > 1;
      root.classList.toggle("is-scroll-enhanced", enhanced);
      root.classList.toggle("is-mobile-scroll-enhanced", mobileEnhanced);

      if (!enhanced && !mobileEnhanced) {
        root.style.setProperty("--mpx-shift", "0px");
        root.style.setProperty(
          "--mpx-progress",
          `${(activeIndexRef.current + 1) / Math.max(pillars.length, 1)}`,
        );
        cards.forEach((card) => {
          if (!card) return;
          card.style.removeProperty("--mpx-card-rise");
          card.style.removeProperty("--mpx-card-scale");
          card.style.removeProperty("--mpx-card-opacity");
        });
      }

      requestScrollUpdate();
      requestHorizontalUpdate();
    };

    const resizeObserver = new ResizeObserver(configureExperience);
    resizeObserver.observe(viewport);
    resizeObserver.observe(rail);

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    viewport.addEventListener("scroll", requestHorizontalUpdate, { passive: true });
    desktopQuery.addEventListener("change", configureExperience);
    mobileQuery.addEventListener("change", configureExperience);
    reducedMotionQuery.addEventListener("change", configureExperience);
    configureExperience();

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(horizontalFrame);
      window.removeEventListener("scroll", requestScrollUpdate);
      viewport.removeEventListener("scroll", requestHorizontalUpdate);
      desktopQuery.removeEventListener("change", configureExperience);
      mobileQuery.removeEventListener("change", configureExperience);
      reducedMotionQuery.removeEventListener("change", configureExperience);
      resizeObserver.disconnect();
      root.classList.remove("is-scroll-enhanced");
      root.classList.remove("is-mobile-scroll-enhanced");
      cards.forEach((card) => {
        if (!card) return;
        card.style.removeProperty("--mpx-card-rise");
        card.style.removeProperty("--mpx-card-scale");
        card.style.removeProperty("--mpx-card-opacity");
      });
    };
  }, [pillars.length, setActivePillar]);

  const moveToPillar = (index: number) => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const card = cardRefs.current[index];

    if (!root || !stage || !viewport || !card) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
    setActivePillar(index);

    if (root.classList.contains("is-scroll-enhanced")) {
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const scrollRange = Math.max(stage.offsetHeight - window.innerHeight, 0);
      const progress = pillars.length > 1 ? index / (pillars.length - 1) : 0;

      window.scrollTo({ top: stageTop + scrollRange * progress, behavior });
      card.focus({ preventScroll: true });
      return;
    }

    if (root.classList.contains("is-mobile-scroll-enhanced")) {
      const navigationOffset = 138;
      const cardTop = card.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(cardTop - navigationOffset, 0), behavior });
      card.focus({ preventScroll: true });
      return;
    }

    const targetLeft = card.offsetLeft - Math.max((viewport.clientWidth - card.clientWidth) / 2, 0);
    viewport.scrollTo({ left: targetLeft, behavior });
    card.focus({ preventScroll: true });
  };

  if (pillars.length === 0) return null;

  const experienceStyle: ExperienceStyle = {
    "--mpx-stage-height": `${Math.max(260, pillars.length * 54)}svh`,
  };
  const activePillar = pillars[activeIndex] ?? pillars[0];

  return (
    <div className="mpx-root" ref={rootRef} style={experienceStyle}>
      <header className="mpx-intro">
        <div className="mpx-intro-kicker">
          <span aria-hidden="true">[ 06 inteligências integradas ]</span>
          <span>Arquitetura do Método MedCEO</span>
        </div>

        <div className="mpx-intro-grid">
          <h2>
            A clínica muda quando o médico deixa de acumular tarefas e começa a construir
            <em> capacidade empresarial.</em>
          </h2>
          <div className="mpx-intro-copy">
            <strong>Mentalidade CEO é a base.</strong>
            <p>
              Os outros cinco pilares transformam direção em visibilidade, venda, cultura, execução
              e conteúdo. Não são aulas isoladas — formam um sistema de decisão.
            </p>
          </div>
        </div>
      </header>

      <div className="mpx-stage" ref={stageRef}>
        <div className="mpx-sticky-frame">
          <div className="mpx-status" aria-hidden="true">
            <span>Explore os pilares</span>
            <span className="mpx-status-current">
              {activePillar.number} / {String(pillars.length).padStart(2, "0")}
            </span>
          </div>

          <div
            className="mpx-viewport"
            ref={viewportRef}
            role="region"
            aria-label="Pilares do Método MedCEO"
            tabIndex={0}
          >
            <div className="mpx-rail" ref={railRef}>
              {pillars.map((pillar, index) => {
                const isFoundation = index === 0;

                return (
                  <article
                    className={`mpx-card${isFoundation ? " is-foundation" : ""}${
                      activeIndex === index ? " is-active" : ""
                    }`}
                    id={`metodo-pilar-${pillar.number}`}
                    key={`${pillar.number}-${pillar.role}`}
                    ref={(node) => {
                      cardRefs.current[index] = node;
                    }}
                    tabIndex={-1}
                    aria-labelledby={`metodo-pilar-titulo-${pillar.number}`}
                  >
                    <div className="mpx-portrait">
                      <img
                        src={pillar.image}
                        alt={`Retrato de ${pillar.name}, responsável por ${pillar.role}`}
                        width={1200}
                        height={1600}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 767px) 86vw, (max-width: 1023px) 76vw, 42vw"
                        style={{ objectPosition: pillar.imagePosition }}
                      />
                      <span className="mpx-portrait-number" aria-hidden="true">
                        {pillar.number}
                      </span>
                      <span className="mpx-portrait-owner">Com {pillar.name}</span>
                    </div>

                    <div className="mpx-card-content">
                      <div className="mpx-card-heading">
                        <p>
                          {isFoundation ? "A base de todo o método" : "Pilar de desenvolvimento"}
                        </p>
                        <h3 id={`metodo-pilar-titulo-${pillar.number}`}>{pillar.role}</h3>
                      </div>

                      <p className="mpx-thesis">{pillar.thesis}</p>

                      <div className="mpx-curriculum">
                        <span>O que você desenvolve</span>
                        <ul>
                          {pillar.topics.map((topic, topicIndex) => (
                            <li key={`${pillar.number}-${topic}`}>
                              <span aria-hidden="true">
                                {String(topicIndex + 1).padStart(2, "0")}
                              </span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <nav className="mpx-navigation" aria-label="Navegar pelos pilares do método">
            <div className="mpx-progress" aria-hidden="true">
              <span />
            </div>
            <ol>
              {pillars.map((pillar, index) => (
                <li key={`navigation-${pillar.number}`}>
                  <button
                    type="button"
                    aria-controls={`metodo-pilar-${pillar.number}`}
                    aria-current={activeIndex === index ? "step" : undefined}
                    onClick={() => moveToPillar(index)}
                  >
                    <span>{pillar.number}</span>
                    <strong>{pillar.role}</strong>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <p className="mpx-announcement" aria-live="polite" aria-atomic="true">
            Pilar em destaque: {activePillar.role}, com {activePillar.name}.
          </p>
        </div>
      </div>
    </div>
  );
}
