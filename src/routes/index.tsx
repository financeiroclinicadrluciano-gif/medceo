import { createFileRoute } from "@tanstack/react-router";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowDownRight, ArrowRight, Check, ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEventHandler, type ReactNode } from "react";

import AnimatedContent from "@/components/AnimatedContent";
import DiagnosticModal from "@/components/DiagnosticModal";
import CaseEvolution from "@/components/landing/CaseEvolution";
import MethodPillarsExperience, {
  type MethodPillarExperienceItem,
} from "@/components/landing/MethodPillarsExperience";
import SplitText from "@/components/landing/SplitText";

import heroBackground from "@/assets/medceo/medceo-hero-background.jpg";
import drLucianoSectionBackground from "@/assets/medceo/dr-luciano-section-background.jpg";
import drLuizSectionBackground from "@/assets/medceo/dr-luiz-section-background.jpg";
import alessandraPortrait from "@/assets/medceo/method-pillars/alessandra.jpg";
import amandaPortrait from "@/assets/medceo/method-pillars/amanda.jpg";
import drLucianoMethodPortrait from "@/assets/medceo/method-pillars/dr-luciano.jpg";
import gustavoPortrait from "@/assets/medceo/method-pillars/gustavo.jpg";
import marcosPortrait from "@/assets/medceo/method-pillars/marcos.jpg";
import michelePortrait from "@/assets/medceo/method-pillars/michele.jpg";
import "@/coffee-v2.css";

const TITLE = "MedCEO — Diagnóstico de Maturidade Empresarial para Clínicas";
const DESCRIPTION =
  "Descubra o nível de maturidade da sua clínica, o gargalo prioritário da operação e os próximos passos em 20 perguntas.";
const PANDA_PLAYER_URL =
  "https://player-vz-cc72507e-ecc.tv.pandavideo.com.br/embed/?v=85638f9a-6681-4a3d-bdab-83aed5805455";
const HERO_CTA_DELAY_MS = 5 * 60 * 1000;
const HERO_SESSION_START_KEY = "medceo:hero-session-start";

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
    links: [
      { rel: "preload", href: heroBackground, as: "image" },
      {
        rel: "preconnect",
        href: "https://player-vz-cc72507e-ecc.tv.pandavideo.com.br",
        crossOrigin: "anonymous",
      },
      {
        rel: "preconnect",
        href: "https://config.tv.pandavideo.com.br",
        crossOrigin: "anonymous",
      },
      {
        rel: "preconnect",
        href: "https://b-vz-cc72507e-ecc.tv.pandavideo.com.br",
        crossOrigin: "anonymous",
      },
    ],
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

const methodPillars: MethodPillarExperienceItem[] = [
  {
    number: "01",
    name: "Dr. Luciano",
    role: "Mentalidade CEO",
    thesis:
      "De médico indispensável a CEO capaz de liderar, decidir e desenhar um negócio que cresce.",
    topics: ["Liderança", "Mentalidade", "Tomada de decisões", "Modelos de negócio"],
    image: drLucianoMethodPortrait,
    imagePosition: "center 24%",
  },
  {
    number: "02",
    name: "Gustavo",
    role: "Marketing",
    thesis: "Transformar visibilidade em demanda mensurável — e demanda em receita previsível.",
    topics: [
      "Visibilidade",
      "Análise de dados e indicadores",
      "IA para copy, sites e análise de dados",
      "Receita previsível",
      "Tráfego pago",
    ],
    image: gustavoPortrait,
    imagePosition: "center 18%",
  },
  {
    number: "03",
    name: "Marcos",
    role: "Comercial",
    thesis: "Tirar a venda do improviso e criar um processo comercial replicável para clínicas.",
    topics: [
      "Scripts comerciais para clínicas",
      "Análise de dados e indicadores",
      "Técnicas de venda",
    ],
    image: marcosPortrait,
    imagePosition: "center 16%",
  },
  {
    number: "04",
    name: "Alessandra",
    role: "Gestão",
    thesis: "Construir cultura, elevar performance e reter gente boa sem centralizar tudo no dono.",
    topics: [
      "Cultura",
      "Gestão de pessoas",
      "Perfil comportamental",
      "Retenção de bons profissionais",
    ],
    image: alessandraPortrait,
    imagePosition: "center 16%",
  },
  {
    number: "05",
    name: "Michele",
    role: "Projetos",
    thesis:
      "Fazer a IA sair do discurso e virar execução: projetos com dono, prazo e critério de sucesso.",
    topics: ["IA para clínicas", "IA aplicada à gestão e análise", "Gestão de projetos"],
    image: michelePortrait,
    imagePosition: "center 17%",
  },
  {
    number: "06",
    name: "Amanda",
    role: "Filmmaker",
    thesis:
      "Transformar conhecimento médico em conteúdo que prende atenção e sustenta posicionamento.",
    topics: [
      "Gravação de conteúdo: equipamentos e técnicas",
      "Criação de roteiros",
      "Edição de vídeo",
    ],
    image: amandaPortrait,
    imagePosition: "center 14%",
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
  const [heroCtaVisible, setHeroCtaVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const diagnosticReturnFocusRef = useRef<HTMLElement | null>(null);
  const filterCardsRef = useRef<HTMLDivElement | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const { scrollYProgress: filterScrollProgress } = useScroll({
    target: filterCardsRef,
    offset: ["start 92%", "end 8%"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    restDelta: 0.001,
  });
  const filterPrimaryY = useTransform(filterScrollProgress, [0, 1], [52, -12]);
  const filterSecondaryY = useTransform(filterScrollProgress, [0, 1], [84, -24]);
  const heroDecadeY = useTransform(scrollY, [0, 1100], [0, -160]);

  useMotionValueEvent(scrollY, "change", (latest) => setHeaderCondensed(latest > 48));

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timerId: number | undefined;

    try {
      const storedValue = Number(window.sessionStorage.getItem(HERO_SESSION_START_KEY));
      const now = Date.now();
      const startedAt = Number.isFinite(storedValue) && storedValue > 0 ? storedValue : now;

      if (startedAt === now) {
        window.sessionStorage.setItem(HERO_SESSION_START_KEY, String(startedAt));
      }

      const remaining = Math.max(HERO_CTA_DELAY_MS - (now - startedAt), 0);
      if (remaining === 0) {
        setHeroCtaVisible(true);
        return;
      }

      timerId = window.setTimeout(() => setHeroCtaVisible(true), remaining);
    } catch {
      timerId = window.setTimeout(() => setHeroCtaVisible(true), HERO_CTA_DELAY_MS);
    }

    return () => {
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

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
      <a className="mc-skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <motion.div className="mc-scroll-progress" style={{ scaleX }} aria-hidden="true" />

      <header className={`mc-header ${headerCondensed ? "is-condensed" : ""}`}>
        <nav className="mc-nav" aria-label="Navegação principal">
          <a href="#top" className="mc-brand" aria-label="MedCEO — voltar ao início">
            <img src="/logo.png" alt="MedCEO" />
          </a>

          <div className="mc-nav-links">
            <a href="#filtro">Filtro</a>
            <a href="#prova-social">Case</a>
            <a href="#pilares-metodo">Pilares</a>
            <a href="#autoridade">Dr. Luciano</a>
            <a href="#diagnostico">Diagnóstico</a>
          </div>

          {heroCtaVisible ? (
            <motion.a
              className="mc-nav-action"
              href="#diagnostico"
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Fazer diagnóstico
              <ArrowDownRight aria-hidden="true" />
            </motion.a>
          ) : (
            <span className="mc-nav-action-placeholder" aria-hidden="true" />
          )}
        </nav>
      </header>

      <main id="conteudo">
        <section id="top" className="mc-hero mc-hero-vsl" aria-labelledby="hero-title">
          <div
            className="mc-hero-background"
            style={{ backgroundImage: `url(${heroBackground})` }}
            aria-hidden="true"
          />
          <div className="mc-hero-wash" aria-hidden="true" />
          <motion.span
            className="mc-hero-decade-word"
            style={{ y: shouldReduceMotion ? 0 : heroDecadeY }}
            aria-hidden="true"
          >
            10 anos
          </motion.span>

          <div className="mc-container mc-hero-layout">
            <div className="mc-hero-copy">
              <p className="mc-eyebrow">
                [ Para médicos que querem construir uma empresa, não apenas uma agenda cheia ]
              </p>
              <SplitText
                id="hero-title"
                as="h1"
                text={"Os próximos 20 minutos\npodem definir os próximos\n10 anos da sua clínica."}
                className="mc-hero-title"
                threshold={0.01}
              />
              <p className="mc-hero-lead">
                Assista e identifique o que hoje limita sua liderança, sua receita e a capacidade da
                clínica crescer sem depender de você.
              </p>
              <div className="mc-hero-promise-rail" aria-label="Promessa da apresentação">
                <span>
                  <strong>20</strong>
                  minutos
                </span>
                <span aria-hidden="true">→</span>
                <span>
                  <strong>10</strong>
                  anos
                </span>
                <span aria-hidden="true">→</span>
                <span>
                  <strong>01</strong>
                  decisão
                </span>
              </div>
            </div>

            <div
              className="mc-hero-video"
              role="group"
              aria-label="Apresentação em vídeo do MedCEO"
            >
              <div className="mc-hero-video-header" aria-hidden="true">
                <span>Apresentação MedCEO</span>
                <span>20 minutos · uma decisão</span>
              </div>
              <div className="mc-hero-video-frame">
                <iframe
                  id="panda-85638f9a-6681-4a3d-bdab-83aed5805455"
                  src={PANDA_PLAYER_URL}
                  title="VSL MedCEO — os próximos 20 minutos podem definir os próximos 10 anos"
                  width={1284}
                  height={720}
                  loading="eager"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p className="mc-hero-urgency">
                Assista com cuidado. Esta apresentação sai do ar em breve.
              </p>
            </div>

            {heroCtaVisible ? (
              <motion.div
                className="mc-hero-actions mc-hero-delayed-actions"
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <a className="mc-button mc-button-primary" href="#filtro">
                  <span>Identificar meu próximo gargalo</span>
                  <ArrowDownRight aria-hidden="true" />
                </a>
                <p>Disponível após assistir à apresentação com atenção.</p>
              </motion.div>
            ) : null}
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

            <div ref={filterCardsRef} className="mc-filter-cards">
              <motion.div
                className="mc-filter-scroll-item mc-filter-scroll-item-primary"
                style={{ y: shouldReduceMotion ? 0 : filterPrimaryY }}
              >
                <AnimatedContent distance={22} delay={0.04}>
                  <div className="mc-filter-card mc-filter-card-positive">
                    <div className="mc-filter-card-title">
                      <Check aria-hidden="true" />
                      <h3>Faz sentido para você se...</h3>
                    </div>
                    <ul>
                      {diagnosisFor.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </AnimatedContent>
              </motion.div>

              <motion.div
                className="mc-filter-scroll-item mc-filter-scroll-item-secondary"
                style={{ y: shouldReduceMotion ? 0 : filterSecondaryY }}
              >
                <AnimatedContent distance={22} delay={0.09}>
                  <div className="mc-filter-card mc-filter-card-negative">
                    <div className="mc-filter-card-title">
                      <X aria-hidden="true" />
                      <h3>Ainda não é o momento se...</h3>
                    </div>
                    <ul>
                      {diagnosisNotFor.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </AnimatedContent>
              </motion.div>
            </div>
          </div>
        </section>

        <CaseEvolution backgroundImage={drLuizSectionBackground} />

        <section
          id="pilares-metodo"
          className="mc-method-pillars-experience-section"
          aria-label="Pilares do Método MedCEO"
        >
          <MethodPillarsExperience pillars={methodPillars} />
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
                  <h2>Quem construiu uma operação médica entende o peso de cada decisão.</h2>
                  <div className="mc-authority-body">
                    <p>
                      Médico, CEO e fundador da Natuá MedSpa, o Dr. Luciano conduz uma operação real
                      em Curitiba — com pacientes, equipe, método, comercial e decisões que não
                      cabem em uma teoria de gestão.
                    </p>
                    <p>
                      Essa vivência sustenta a leitura do diagnóstico MedCEO: identificar o gargalo
                      que limita a empresa agora e transformar resposta em prioridade de execução.
                    </p>
                  </div>

                  <dl className="mc-authority-credentials" aria-label="Credenciais publicadas">
                    <div>
                      <dt>2.500+</dt>
                      <dd>pacientes atendidos informados pela Natuá</dd>
                    </div>
                    <div>
                      <dt>15+ anos</dt>
                      <dd>de experiência em saúde publicada</dd>
                    </div>
                    <div>
                      <dt>CRM/PR 45049</dt>
                      <dd>médico, CEO e fundador</dd>
                    </div>
                    <div>
                      <dt>DOC365</dt>
                      <dd>método criado dentro da própria operação</dd>
                    </div>
                  </dl>

                  <nav className="mc-authority-links" aria-label="Fontes oficiais do Dr. Luciano">
                    <a href="https://natuamedspa.com.br/" target="_blank" rel="noreferrer">
                      Conhecer a Natuá
                      <ExternalLink aria-hidden="true" />
                    </a>
                    <a
                      href="https://www.instagram.com/dr.lucianoalvesneves/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver Instagram oficial
                      <ExternalLink aria-hidden="true" />
                    </a>
                  </nav>
                  <small className="mc-authority-source">
                    Dados declarados nos canais oficiais da Natuá e do Dr. Luciano.
                  </small>
                </AnimatedContent>
              </div>
            </div>
          </div>
        </section>

        <section id="diagnostico" className="mc-final-section">
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
