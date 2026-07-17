import { createFileRoute } from "@tanstack/react-router";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowDownRight, ArrowRight, Check, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEventHandler, type ReactNode } from "react";

import AnimatedContent from "@/components/AnimatedContent";
import DiagnosticModal from "@/components/DiagnosticModal";
import AnimatedCaseStudy, { type CaseSlide } from "@/components/landing/AnimatedCaseStudy";
import CanvasText from "@/components/landing/CanvasText";
import ChromaGrid, { type ChromaPillar } from "@/components/landing/ChromaGrid";
import DottedGlowBackground from "@/components/landing/DottedGlowBackground";
import EditorialCarousel, { type EditorialSlide } from "@/components/landing/EditorialCarousel";
import { SpotlightSurface, TiltSurface } from "@/components/landing/InteractiveSurfaces";
import SplitText from "@/components/landing/SplitText";

import drLucianoPortrait from "@/assets/dr-luciano.jpg";
import drLucianoCutoutAvif from "@/assets/medceo/dr-luciano-cutout.avif";
import drLucianoCutoutMobileAvif from "@/assets/medceo/dr-luciano-cutout-mobile.avif";
import drLucianoCutout from "@/assets/medceo/dr-luciano-cutout.png";
import drLucianoCutoutMobile from "@/assets/medceo/dr-luciano-cutout-mobile.png";
import drEditorial from "@/assets/medceo/dr-luciano-editorial.jpg";
import heroBackground from "@/assets/medceo/medceo-hero-background.jpg";
import drHero from "@/assets/medceo/dr-luciano-hero.jpg";
import drLucianoSectionBackground from "@/assets/medceo/dr-luciano-section-background.jpg";
import drLuizProfile from "@/assets/medceo/dr-luiz-profile-proof.png";
import drLuizSectionBackground from "@/assets/medceo/dr-luiz-section-background.jpg";

const TITLE = "MedCEO — Diagnóstico de Maturidade Empresarial para Clínicas";
const DESCRIPTION =
  "Descubra o nível de maturidade da sua clínica, o gargalo prioritário da operação e os próximos passos em 20 perguntas.";

// PENDENTE: quando o número internacional for definido, os CTAs comerciais
// podem apontar para WhatsApp. O único CTA que abre o diagnóstico fica no final.

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "preload", href: heroBackground, as: "image" }],
  }),
  component: Index,
});

const diagnosisFor = [
  "Médicos donos de clínica com pacientes, equipe e faturamento em andamento.",
  "Operações que recebem demanda, mas perdem oportunidades no comercial.",
  "Clínicas em que agenda, margem, equipe e decisões ainda voltam para o dono.",
  "Médicos que querem estrutura antes de investir em uma nova frente de crescimento.",
];

const diagnosisNotFor = [
  "Quem ainda não tem uma clínica minimamente ativa para diagnosticar.",
  "Quem procura promessa de faturamento rápido ou fórmula pronta de marketing.",
  "Quem quer apenas mais pacientes sem olhar margem, equipe e operação.",
  "Quem não está disposto a responder com clareza sobre gargalos reais.",
];

const deliverables = [
  {
    number: "01",
    title: "Mapa do nível atual",
    description:
      "Uma leitura clara da dependência do dono e da maturidade empresarial da operação.",
    accent: "Onde sua clínica realmente está.",
  },
  {
    number: "02",
    title: "Gargalo prioritário",
    description: "O pilar que mais limita o próximo nível — antes de uma nova iniciativa.",
    accent: "O problema certo para resolver primeiro.",
  },
  {
    number: "03",
    title: "Prioridade de gestão",
    description: "A decisão que merece atenção agora, traduzida em uma direção objetiva.",
    accent: "Menos dispersão. Mais critério.",
  },
  {
    number: "04",
    title: "Três próximos passos",
    description: "Ações coerentes com o estágio identificado, sem fórmula genérica.",
    accent: "Uma sequência possível de executar.",
  },
];

const pillars: ChromaPillar[] = [
  {
    number: "01",
    title: "Diagnóstico",
    description: "Clareza estratégica e dependência real do dono.",
  },
  { number: "02", title: "Margem", description: "Lucro, previsibilidade e qualidade financeira." },
  {
    number: "03",
    title: "Comercial",
    description: "Conversão, cadência e aproveitamento da demanda.",
  },
  {
    number: "04",
    title: "Operação",
    description: "Processos, autonomia e consistência da entrega.",
  },
  { number: "05", title: "Escala", description: "Estrutura para crescer sem ampliar o caos." },
];

const caseSlides: CaseSlide[] = [
  {
    label: "Patamar inicial",
    metric: "R$ 80 mil",
    title: "O faturamento antes da intervenção.",
    description:
      "O case começou com uma clínica em operação e um gargalo específico a ser trabalhado.",
  },
  {
    label: "Foco aplicado",
    metric: "01 pilar",
    title: "Uma mudança concentrada, não uma coleção de iniciativas.",
    description:
      "O trabalho foi direcionado a um único pilar do MedCEO antes de avançar sobre as outras frentes.",
  },
  {
    label: "Novo patamar",
    metric: "R$ 200 mil",
    title: "Em aproximadamente três meses.",
    description: "Um avanço de R$ 120 mil: crescimento de 150% e 2,5 vezes o patamar anterior.",
  },
];

const editorialSlides: EditorialSlide[] = [
  {
    image: drEditorial,
    alt: "Retrato editorial em preto e branco do Dr. Luciano Alves",
    eyebrow: "Leitura",
    title: "Critério antes de iniciativa",
  },
  {
    image: drHero,
    alt: "Retrato profissional do Dr. Luciano Alves",
    eyebrow: "Experiência",
    title: "Operação médica real",
  },
  {
    image: drLucianoPortrait,
    alt: "Dr. Luciano Alves em retrato profissional",
    eyebrow: "Direção",
    title: "Gestão traduzida em decisão",
  },
];

type DiagnosticButtonProps = {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

function DiagnosticButton({ children, onClick }: DiagnosticButtonProps) {
  return (
    <button type="button" onClick={onClick} className="mc-button mc-button-primary mc-final-button">
      <span>{children}</span>
      <ArrowRight aria-hidden="true" />
    </button>
  );
}

function Index() {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [headerCondensed, setHeaderCondensed] = useState(false);
  const [caseActiveIndex, setCaseActiveIndex] = useState(0);
  const diagnosticReturnFocusRef = useRef<HTMLElement | null>(null);
  const proofScrollRef = useRef<HTMLElement | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const { scrollYProgress: caseScrollProgress } = useScroll({
    target: proofScrollRef,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, "change", (latest) => setHeaderCondensed(latest > 48));
  useMotionValueEvent(caseScrollProgress, "change", (latest) => {
    const nextIndex = Math.max(
      0,
      Math.min(caseSlides.length - 1, Math.floor(latest * caseSlides.length)),
    );
    setCaseActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    if (isDiagnosticOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDiagnosticOpen]);

  const openDiagnostic: MouseEventHandler<HTMLButtonElement> = (event) => {
    diagnosticReturnFocusRef.current = event.currentTarget;
    setIsDiagnosticOpen(true);
  };

  return (
    <div className="medceo-page">
      <motion.div className="mc-scroll-progress" style={{ scaleX }} aria-hidden="true" />

      <header className={`mc-header ${headerCondensed ? "is-condensed" : ""}`}>
        <nav className="mc-nav" aria-label="Navegação principal">
          <a href="#top" className="mc-brand" aria-label="MedCEO — voltar ao início">
            <img src="/logo.png" alt="MedCEO" />
          </a>

          <div className="mc-nav-links">
            <a href="#filtro">Filtro</a>
            <a href="#entregas">Diagnóstico</a>
            <a href="#prova-social">Case</a>
            <a href="#autoridade">Dr. Luciano</a>
          </div>

          <a className="mc-nav-action" href="#diagnostico">
            Ver próximo passo
            <ArrowDownRight aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="mc-hero" aria-labelledby="hero-title">
          <div
            className="mc-hero-background"
            style={{ backgroundImage: `url(${heroBackground})` }}
            aria-hidden="true"
          />
          <picture>
            <source
              type="image/avif"
              srcSet={`${drLucianoCutoutMobileAvif} 800w, ${drLucianoCutoutAvif} 1200w`}
              sizes="(max-width: 720px) 72vw, 48vw"
            />
            <img
              className="mc-hero-person"
              src={drLucianoCutout}
              srcSet={`${drLucianoCutoutMobile} 800w, ${drLucianoCutout} 1200w`}
              sizes="(max-width: 720px) 72vw, 48vw"
              alt=""
              width={1200}
              height={1800}
              fetchPriority="high"
              aria-hidden="true"
            />
          </picture>
          <div className="mc-hero-wash" aria-hidden="true" />

          <div className="mc-container mc-hero-layout">
            <div className="mc-hero-copy">
              <p className="mc-eyebrow">Diagnóstico de maturidade empresarial médica</p>
              <SplitText
                as="h1"
                text={"Se você saísse 30 dias,\nsua clínica continuaria\ncrescendo?"}
                className="mc-hero-title"
                threshold={0.01}
              />
              <p className="mc-hero-lead">
                Descubra o gargalo que mais limita sua operação e qual decisão merece prioridade
                antes do próximo investimento.
              </p>
              <div className="mc-hero-actions">
                <a className="mc-button mc-button-primary" href="#filtro">
                  <span>Entender como funciona</span>
                  <ArrowDownRight aria-hidden="true" />
                </a>
                <p>Leitura empresarial para clínicas que já estão em movimento.</p>
              </div>
            </div>
          </div>

          <div className="mc-hero-signature" aria-hidden="true">
            <span>MedCEO</span>
            <span>Diagnóstico · direção · execução</span>
          </div>
        </section>

        <section id="filtro" className="mc-filter-section mc-section">
          <div className="mc-container mc-filter-layout">
            <AnimatedContent className="mc-filter-intro" distance={24}>
              <p className="mc-eyebrow">Filtro do diagnóstico</p>
              <h2>Não é para toda clínica. É para quem já tem uma operação real.</h2>
              <p>
                O diagnóstico precisa de matéria-prima: pacientes, equipe, faturamento, decisões e
                gargalos que já podem ser observados.
              </p>
              <span className="mc-section-index">01 / FILTRO</span>
            </AnimatedContent>

            <div className="mc-filter-cards">
              <AnimatedContent distance={22} delay={0.04}>
                <SpotlightSurface className="mc-filter-card mc-filter-card-positive">
                  <div className="mc-filter-card-title">
                    <Check aria-hidden="true" />
                    <h3>Faz sentido para você se...</h3>
                  </div>
                  <ul>
                    {diagnosisFor.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </SpotlightSurface>
              </AnimatedContent>

              <AnimatedContent distance={22} delay={0.09}>
                <SpotlightSurface className="mc-filter-card mc-filter-card-negative">
                  <div className="mc-filter-card-title">
                    <X aria-hidden="true" />
                    <h3>Ainda não é o momento se...</h3>
                  </div>
                  <ul>
                    {diagnosisNotFor.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </SpotlightSurface>
              </AnimatedContent>
            </div>
          </div>
        </section>

        <section id="entregas" className="mc-deliverables-section mc-section">
          <div className="mc-container">
            <AnimatedContent className="mc-deliverables-heading" distance={24}>
              <div>
                <p className="mc-eyebrow mc-eyebrow-dark">O que você recebe</p>
                <h2>Um diagnóstico que organiza a próxima</h2>
                <CanvasText text="decisão." />
              </div>
              <p>
                A resposta não é mais uma lista de coisas para fazer. É uma ordem de prioridade
                construída a partir do estágio da sua clínica.
              </p>
            </AnimatedContent>

            <div className="mc-feature-bento">
              {deliverables.map((item, index) => (
                <AnimatedContent
                  className={`mc-feature-card mc-feature-card-${index + 1}`}
                  distance={18}
                  delay={index * 0.04}
                  key={item.number}
                >
                  <span className="mc-feature-number">{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <strong>{item.accent}</strong>
                </AnimatedContent>
              ))}
            </div>

            <AnimatedContent className="mc-pillars-heading" distance={20}>
              <div>
                <p className="mc-eyebrow mc-eyebrow-dark">Cinco pilares avaliados</p>
                <h2>O foco aparece quando a operação inteira entra em perspectiva.</h2>
              </div>
              <p>Passe o cursor para revelar o eixo de atenção. No celular, a leitura é direta.</p>
            </AnimatedContent>

            <AnimatedContent distance={18}>
              <ChromaGrid items={pillars} />
            </AnimatedContent>
          </div>
        </section>

        <section
          id="prova-social"
          ref={proofScrollRef}
          className="mc-proof-scroll-track"
          aria-labelledby="proof-title"
        >
          <div className="mc-proof-section mc-section">
            <div
              className="mc-person-fold-background mc-proof-background"
              style={{ backgroundImage: `url(${drLuizSectionBackground})` }}
              aria-hidden="true"
            />
            <div className="mc-person-fold-wash mc-proof-wash" aria-hidden="true" />

            <div className="mc-container">
              <AnimatedContent className="mc-proof-heading" distance={24}>
                <p className="mc-eyebrow">Case MedCEO · Dr. Luiz Henrique</p>
                <h2 id="proof-title">Uma decisão concentrada mudou o patamar da operação.</h2>
              </AnimatedContent>

              <div className="mc-proof-layout">
                <AnimatedContent distance={22}>
                  <TiltSurface className="mc-proof-document">
                    <div className="mc-proof-image-frame">
                      <img
                        src={drLuizProfile}
                        alt="Perfil oficial do Dr. Luiz Henrique, @drluizhenriquedasilva"
                        width={1522}
                        height={636}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="mc-proof-caption">
                      <span>Case documentado</span>
                      <strong>Dr. Luiz Henrique</strong>
                      <small>Resultado individual informado pelo case.</small>
                    </div>
                  </TiltSurface>
                </AnimatedContent>

                <AnimatedContent distance={22} delay={0.06}>
                  <AnimatedCaseStudy slides={caseSlides} activeIndex={caseActiveIndex} />
                </AnimatedContent>
              </div>

              <p className="mc-proof-disclaimer">
                O desempenho varia conforme estágio, contexto e execução. O case não representa
                garantia de resultados futuros.
              </p>
              <p className="mc-proof-scroll-cue" aria-hidden="true">
                Continue rolando
                <span />
              </p>
            </div>
          </div>
        </section>

        <section id="autoridade" className="mc-authority-section mc-section">
          <div className="mc-authority-fold">
            <div
              className="mc-person-fold-background mc-authority-background"
              style={{ backgroundImage: `url(${drLucianoSectionBackground})` }}
              aria-hidden="true"
            />
            <div className="mc-person-fold-wash mc-authority-wash" aria-hidden="true" />

            <div className="mc-container">
              <div className="mc-authority-feature">
                <AnimatedContent className="mc-authority-copy" distance={24} delay={0.05}>
                  <p className="mc-eyebrow">Quem interpreta o diagnóstico</p>
                  <h2>Experiência de operação médica traduzida em direção empresarial.</h2>
                  <div>
                    <p>
                      Médico e CEO da Natuá, o Dr. Luciano lidera uma operação real, com pacientes,
                      equipe, comercial, margem e decisões para administrar todos os dias.
                    </p>
                    <p>
                      É essa prática que orienta a leitura do diagnóstico: começar pelas respostas e
                      pelo gargalo da clínica, não por uma solução pronta.
                    </p>
                  </div>
                  <div className="mc-authority-principle">
                    <span>Princípio de leitura</span>
                    <p>
                      Antes de crescer mais, o médico precisa saber qual parte da clínica ainda não
                      sustenta o próximo nível.
                    </p>
                  </div>
                </AnimatedContent>
              </div>
            </div>
          </div>

          <div className="mc-container mc-authority-gallery">
            <AnimatedContent distance={22}>
              <EditorialCarousel slides={editorialSlides} />
            </AnimatedContent>
          </div>
        </section>

        <section id="diagnostico" className="mc-final-section">
          <DottedGlowBackground />
          <div className="mc-final-wash" aria-hidden="true" />
          <div className="mc-container mc-final-content">
            <p className="mc-eyebrow">Diagnóstico disponível</p>
            <h2>Agora, descubra onde sua clínica está.</h2>
            <p>
              Responda às 20 perguntas e receba seu nível de maturidade, o gargalo prioritário e os
              três próximos passos coerentes com a operação.
            </p>
            <DiagnosticButton onClick={openDiagnostic}>Fazer o diagnóstico agora</DiagnosticButton>
            <small>Gratuito · resultado imediato · cerca de 5 minutos</small>
          </div>
        </section>
      </main>

      <footer className="mc-footer">
        <div className="mc-container mc-footer-grid">
          <img src="/logo.png" alt="MedCEO" />
          <p>Diagnóstico · maturidade · direção</p>
          <span>© 2026 MedCEO. Todos os direitos reservados.</span>
        </div>
      </footer>

      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        returnFocusRef={diagnosticReturnFocusRef}
      />
    </div>
  );
}
