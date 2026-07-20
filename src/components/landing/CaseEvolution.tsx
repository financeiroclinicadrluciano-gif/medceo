import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useMemo, useRef, type CSSProperties } from "react";

import "@/case-evolution.css";

export type CaseEvolutionProps = {
  /** Full-bleed portrait used as the right-hand visual proof. */
  backgroundImage: string;
  id?: string;
  className?: string;
  caseName?: string;
  initialRevenue?: number;
  finalRevenue?: number;
  duration?: string;
  durationMetric?: string;
  focus?: string;
  totalPillars?: number;
  imagePosition?: CSSProperties["backgroundPosition"];
  disclaimer?: string;
};

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

function formatRevenue(value: number) {
  return `R$ ${numberFormatter.format(value)} mil`;
}

/**
 * A single-fold, proportionally accurate view of the Dr. Luiz case.
 * Motion adds depth, but every claim remains available in the static DOM.
 */
export default function CaseEvolution({
  backgroundImage,
  id = "prova-social",
  className = "",
  caseName = "Dr. Luiz Henrique",
  initialRevenue = 80,
  finalRevenue = 200,
  duration = "aproximadamente 3 meses",
  durationMetric = "≈ 3 meses",
  focus = "Mentalidade CEO",
  totalPillars = 6,
  imagePosition = "22% center",
  disclaimer = "Resultado individual informado pelo case. O registro não isola causalidade nem garante repetição; resultados variam conforme contexto e execução.",
}: CaseEvolutionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [-24, 24]);
  const rawLineProgress = useTransform(scrollYProgress, [0.08, 0.58], [0, 1]);
  const lineProgress = useSpring(rawLineProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  });

  const metrics = useMemo(() => {
    const safeInitial = Math.max(initialRevenue, 0);
    const safeFinal = Math.max(finalRevenue, 0);
    const delta = safeFinal - safeInitial;
    const initialRatio = safeFinal > 0 ? Math.min((safeInitial / safeFinal) * 100, 100) : 0;

    return {
      delta,
      initialRatio,
    };
  }, [finalRevenue, initialRevenue]);

  const classes = ["mc-case-evolution", className].filter(Boolean).join(" ");
  const safeTotalPillars = Math.max(Math.round(totalPillars), 1);
  const remainingPillars = Math.max(safeTotalPillars - 1, 0);
  const pillarFraction = `01/${String(safeTotalPillars).padStart(2, "0")}`;

  return (
    <section ref={sectionRef} id={id} className={classes} aria-labelledby={`${id}-title`}>
      <div className="mc-case-evolution-photo" aria-hidden="true">
        <motion.div
          className="mc-case-evolution-photo-image"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: imagePosition,
            y: prefersReducedMotion ? 0 : imageY,
          }}
        />
        <div className="mc-case-evolution-photo-wash" />
        <p className="mc-case-evolution-person">
          <span>Case MedCEO</span>
          <strong>{caseName}</strong>
        </p>
      </div>

      <div className="mc-case-evolution-inner">
        <header className="mc-case-evolution-heading">
          <p className="mc-case-evolution-eyebrow">Case individual · Dr. Luiz Henrique</p>
          <h2 id={`${id}-title`}>
            De <span>{formatRevenue(initialRevenue)}</span> para{" "}
            <strong>{formatRevenue(finalRevenue)}</strong>.
          </h2>
          <p className="mc-case-evolution-story">
            Segundo o case informado, esse avanço aconteceu em {duration}. Naquele ciclo, o trabalho
            esteve concentrado em <strong>{focus}</strong> — a base do método.
          </p>
        </header>

        <div
          className="mc-case-evolution-scale"
          role="img"
          aria-label={`${caseName} informou evolução de ${formatRevenue(initialRevenue)} para ${formatRevenue(finalRevenue)} em ${duration}, com foco em ${focus}, um dos ${safeTotalPillars} pilares do método.`}
        >
          <div className="mc-case-evolution-row is-initial">
            <div className="mc-case-evolution-row-label">
              <span>Antes</span>
              <strong>{formatRevenue(initialRevenue)}</strong>
            </div>
            <div className="mc-case-evolution-bar" aria-hidden="true">
              <span style={{ width: `${metrics.initialRatio}%` }} />
            </div>
          </div>

          <div className="mc-case-evolution-transition" aria-hidden="true">
            <motion.span
              className="mc-case-evolution-transition-line"
              style={{ scaleX: prefersReducedMotion ? 1 : lineProgress }}
            />
            <span className="mc-case-evolution-focus">
              {focus} · {pillarFraction}
            </span>
          </div>

          <div className="mc-case-evolution-row is-final">
            <div className="mc-case-evolution-row-label">
              <span>Depois</span>
              <strong>{formatRevenue(finalRevenue)}</strong>
            </div>
            <div className="mc-case-evolution-bar" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>

        <dl className="mc-case-evolution-metrics" aria-label="Indicadores da evolução">
          <div>
            <dt>Avanço informado</dt>
            <dd>
              {metrics.delta >= 0 ? "+" : "−"}
              {formatRevenue(Math.abs(metrics.delta))}
            </dd>
          </div>
          <div>
            <dt>Janela do case</dt>
            <dd>{durationMetric}</dd>
          </div>
          <div>
            <dt>Pilar em foco</dt>
            <dd>{pillarFraction}</dd>
          </div>
        </dl>

        <div className="mc-case-evolution-horizon">
          <span>O próximo horizonte</span>
          <p>
            Se este foi o patamar informado com apenas a base em foco, imagine a capacidade criada
            ao integrar os outros {remainingPillars} pilares — cada um conduzido pelo mentor
            responsável.
          </p>
        </div>

        <p className="mc-case-evolution-disclaimer">{disclaimer}</p>
      </div>
    </section>
  );
}
