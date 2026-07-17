import { useEffect, useRef, useState, type MouseEventHandler, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowRight, Check, X } from "lucide-react";

import AnimatedContent from "@/components/AnimatedContent";
import DiagnosticModal from "@/components/DiagnosticModal";
import drLuizProfile from "@/assets/medceo/dr-luiz-profile-proof.png";
import drEditorial from "@/assets/medceo/dr-luciano-editorial.jpg";

const TITLE = "MedCEO — Diagnóstico de Maturidade Empresarial para Clínicas";
const DESCRIPTION =
  "Descubra o nível de maturidade da sua clínica, o gargalo prioritário da operação e os próximos passos em 20 perguntas.";
const PANDA_PLAYER_URL =
  "https://player-vz-cc72507e-ecc.tv.pandavideo.com.br/embed/?v=b5568006-5017-48fd-85f4-334a9424dbbd";

// PENDENTE: adicionar o número em formato internacional, somente com dígitos.
// Exemplo de formato: código do país + DDD + número.
const WHATSAPP_PHONE = "";
const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site do MedCEO e quero conversar sobre a maturidade da minha clínica.";
const WHATSAPP_URL = WHATSAPP_PHONE
  ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
  : null;

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
      {
        rel: "preload",
        href: "https://player-vz-cc72507e-ecc.tv.pandavideo.com.br/embed/css/plyr.css",
        as: "style",
      },
      {
        rel: "preload",
        href: "https://player-vz-cc72507e-ecc.tv.pandavideo.com.br/embed/css/styles.css",
        as: "style",
      },
      {
        rel: "preload",
        href: "https://player-vz-cc72507e-ecc.tv.pandavideo.com.br/embed/css/pb.css",
        as: "style",
      },
      {
        rel: "preload",
        href: "https://config.tv.pandavideo.com.br/vz-cc72507e-ecc/b5568006-5017-48fd-85f4-334a9424dbbd.json",
        as: "fetch",
      },
      {
        rel: "preload",
        href: "https://config.tv.pandavideo.com.br/vz-cc72507e-ecc/config.json",
        as: "fetch",
      },
      {
        rel: "dns-prefetch",
        href: "https://b-vz-cc72507e-ecc.tv.pandavideo.com.br",
      },
      {
        rel: "preload",
        href: "https://b-vz-cc72507e-ecc.tv.pandavideo.com.br/b5568006-5017-48fd-85f4-334a9424dbbd/playlist.m3u8",
        as: "fetch",
      },
      { rel: "prerender", href: PANDA_PLAYER_URL },
      {
        rel: "dns-prefetch",
        href: "https://player-vz-cc72507e-ecc.tv.pandavideo.com.br",
      },
    ],
  }),
  component: Index,
});

const diagnosisFor = [
  "Médicos donos de clínica com pacientes, equipe e faturamento em andamento.",
  "Operações que já recebem demanda, mas ainda perdem oportunidades no comercial.",
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
    description: "Dependência do dono e maturidade atual da operação.",
  },
  {
    number: "02",
    title: "Gargalo prioritário",
    description: "O pilar que hoje mais limita o próximo nível da clínica.",
  },
  {
    number: "03",
    title: "Prioridade de gestão",
    description: "A decisão que merece atenção antes de uma nova iniciativa.",
  },
  {
    number: "04",
    title: "Três próximos passos",
    description: "Ações coerentes com o estágio identificado no diagnóstico.",
  },
];

type DiagnosticButtonProps = {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  compact?: boolean;
};

function DiagnosticButton({
  children,
  onClick,
  className = "",
  compact = false,
}: DiagnosticButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mc-button mc-button-primary ${compact ? "mc-button-compact" : ""} ${className}`}
    >
      <span>{children}</span>
      <ArrowRight aria-hidden="true" />
    </button>
  );
}

type WhatsAppButtonProps = {
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

function WhatsAppButton({ children, className = "", compact = false }: WhatsAppButtonProps) {
  const buttonClassName = `mc-button mc-button-primary ${compact ? "mc-button-compact" : ""} ${className}`;

  if (!WHATSAPP_URL) {
    return (
      <button
        type="button"
        className={buttonClassName}
        disabled
        aria-label={`${children} — WhatsApp em configuração`}
        title="O contato do WhatsApp será configurado em breve"
      >
        <span>{children}</span>
        <ArrowRight aria-hidden="true" />
      </button>
    );
  }

  return (
    <a className={buttonClassName} href={WHATSAPP_URL} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <ArrowRight aria-hidden="true" />
    </a>
  );
}

function Index() {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [mounted, setMounted] = useState(false);
  const diagnosticReturnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (typeof window === "undefined") return;
    setShowFloatingCta(latest > window.innerHeight * 0.82);
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isDiagnosticOpen ? "hidden" : previousOverflow;
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
      {mounted && (
        <motion.div className="mc-scroll-progress" style={{ scaleX }} aria-hidden="true" />
      )}

      <header className="mc-header">
        <nav className="mc-nav" aria-label="Navegação principal">
          <a href="#top" className="mc-brand" aria-label="MedCEO — voltar ao início">
            <img src="/logo.png" alt="MedCEO" />
          </a>

          <div className="mc-nav-links">
            <a href="#filtro">Filtro</a>
            <a href="#entregas">O que você recebe</a>
            <a href="#prova-social">Prova social</a>
            <a href="#autoridade">Dr. Luciano</a>
            <a href="#diagnostico">Diagnóstico</a>
          </div>

          <WhatsAppButton compact>Falar no WhatsApp</WhatsAppButton>
        </nav>
      </header>

      <main id="top">
        <section className="mc-hero" aria-labelledby="hero-title">
          <div className="mc-hero-grid mc-container">
            <AnimatedContent className="mc-hero-copy" distance={24}>
              <p className="mc-eyebrow">Diagnóstico de maturidade empresarial médica</p>
              <h1 id="hero-title">
                Se você saísse <em>30 dias</em>, sua clínica continuaria crescendo?
              </h1>
              <p className="mc-hero-lead">
                Descubra o nível de maturidade da sua operação, o gargalo que mais limita o próximo
                passo e a prioridade que merece atenção agora.
              </p>
            </AnimatedContent>

            <AnimatedContent className="mc-hero-video" distance={28} direction="horizontal" reverse>
              <div className="mc-hero-video-frame">
                <iframe
                  src={PANDA_PLAYER_URL}
                  title="Vídeo de apresentação do diagnóstico MedCEO"
                  width={1284}
                  height={720}
                  loading="eager"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </AnimatedContent>

            <AnimatedContent className="mc-hero-cta" distance={18} delay={0.08}>
              <div className="mc-hero-actions">
                <WhatsAppButton>Falar com o MedCEO</WhatsAppButton>
              </div>

              <p className="mc-hero-note">
                Conversa direta com a equipe · atendimento pelo WhatsApp
              </p>
            </AnimatedContent>
          </div>
        </section>

        <section id="filtro" className="mc-fit-section mc-section">
          <div className="mc-container mc-fit-grid">
            <AnimatedContent className="mc-section-intro" distance={24}>
              <p className="mc-eyebrow">Filtro do diagnóstico</p>
              <h2>Não é para toda clínica. É para quem já tem uma operação real.</h2>
              <p>
                O diagnóstico exige matéria-prima: pacientes, equipe, faturamento, decisões e
                gargalos que já podem ser observados.
              </p>
            </AnimatedContent>

            <AnimatedContent className="mc-fit-comparison" distance={28} delay={0.06}>
              <div className="mc-fit-list mc-fit-list-positive">
                <div className="mc-fit-title">
                  <Check aria-hidden="true" />
                  <span>Faz sentido para você se...</span>
                </div>
                <ul>
                  {diagnosisFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mc-fit-list">
                <div className="mc-fit-title">
                  <X aria-hidden="true" />
                  <span>Ainda não é o momento se...</span>
                </div>
                <ul>
                  {diagnosisNotFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </AnimatedContent>
          </div>
        </section>

        <section id="entregas" className="mc-paper-section mc-section mc-deliverables-section">
          <div className="mc-container">
            <AnimatedContent className="mc-deliverables-heading" distance={24}>
              <div>
                <p className="mc-eyebrow mc-eyebrow-dark">O que você recebe</p>
                <h2>Um diagnóstico que organiza a próxima decisão.</h2>
              </div>
              <p>Quatro respostas objetivas para transformar percepção em prioridade de gestão.</p>
            </AnimatedContent>

            <div className="mc-deliverables-list">
              {deliverables.map((item, index) => (
                <AnimatedContent
                  key={item.number}
                  className="mc-deliverable-row"
                  distance={18}
                  delay={index * 0.04}
                >
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </AnimatedContent>
              ))}
            </div>
          </div>
        </section>

        <section
          id="prova-social"
          className="mc-social-proof-section mc-section"
          aria-labelledby="social-proof-title"
        >
          <div className="mc-container mc-social-proof-grid">
            <AnimatedContent className="mc-social-proof-copy" distance={24}>
              <p className="mc-eyebrow">Case MedCEO · Dr. Luiz Henrique</p>
              <h2 id="social-proof-title">De R$ 80 mil para R$ 200 mil em cerca de 3 meses.</h2>
              <p className="mc-social-proof-lead">
                Ao trabalhar apenas um dos pilares do MedCEO, a clínica avançou R$ 120 mil em
                faturamento — um crescimento de 150% sobre o patamar inicial.
              </p>
              <p className="mc-social-proof-context">
                Uma mudança concentrada, antes de aprofundar os outros pilares da operação.
              </p>
            </AnimatedContent>

            <AnimatedContent
              className="mc-social-proof-visual"
              distance={28}
              direction="horizontal"
              reverse
              delay={0.06}
            >
              <figure>
                <div className="mc-social-proof-frame">
                  <img
                    src={drLuizProfile}
                    alt="Dr. Luiz Henrique no perfil oficial @drluizhenriquedasilva"
                    width={1522}
                    height={636}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption>
                  <span>Dr. Luiz Henrique</span>
                  <small>Case MedCEO · resultado em aproximadamente 3 meses</small>
                </figcaption>
              </figure>

              <div
                className="mc-case-shift"
                aria-label="Faturamento avançou de 80 mil reais para 200 mil reais em aproximadamente 3 meses"
              >
                <div>
                  <span>Antes</span>
                  <strong>R$ 80 mil</strong>
                </div>
                <div className="mc-case-shift-arrow" aria-hidden="true">
                  <span>≈ 3 meses</span>
                  <ArrowRight />
                </div>
                <div>
                  <span>Novo patamar</span>
                  <strong>R$ 200 mil</strong>
                </div>
              </div>

              <div className="mc-case-growth">
                <strong>+150%</strong>
                <span>de crescimento · 2,5x o patamar anterior</span>
                <small>01 pilar trabalhado</small>
              </div>

              <p className="mc-case-disclaimer">
                Resultado individual informado pelo case. O desempenho varia conforme o estágio da
                clínica e a execução; não representa garantia de resultados futuros.
              </p>
            </AnimatedContent>
          </div>
        </section>

        <section id="autoridade" className="mc-authority-section mc-section">
          <div className="mc-container mc-authority-grid">
            <AnimatedContent className="mc-authority-visual" distance={26}>
              <div className="mc-authority-image">
                <img
                  src={drEditorial}
                  alt="Dr. Luciano Alves"
                  width={4000}
                  height={6000}
                  loading="lazy"
                />
              </div>
              <p>Experiência real de operação médica transformada em leitura empresarial.</p>
            </AnimatedContent>

            <AnimatedContent className="mc-authority-copy" distance={24} delay={0.06}>
              <p className="mc-eyebrow mc-eyebrow-dark">Quem interpreta o diagnóstico</p>
              <h2>Dr. Luciano Alves.</h2>
              <div className="mc-authority-body">
                <p>
                  Médico e CEO da Natuá, o Dr. Luciano lidera uma operação real, com pacientes,
                  equipe, comercial, margem e decisões para administrar todos os dias.
                </p>
                <p>
                  É essa experiência prática que orienta a leitura do seu diagnóstico. A conversa
                  começa pelas suas respostas e pelo gargalo real da clínica, não por uma solução
                  pronta.
                </p>
              </div>
              <blockquote>
                “Antes de crescer mais, o médico precisa saber qual parte da clínica ainda não
                sustenta o próximo nível.”
              </blockquote>
            </AnimatedContent>
          </div>
        </section>

        <section id="diagnostico" className="mc-final-section">
          <div className="mc-container mc-final-grid">
            <div>
              <p className="mc-eyebrow">Diagnóstico disponível</p>
              <h2>Agora, descubra onde sua clínica está.</h2>
            </div>
            <div className="mc-final-action">
              <p>
                Responda às 20 perguntas e descubra onde sua clínica está, o que mais trava o
                próximo nível e qual decisão merece prioridade agora.
              </p>
              <DiagnosticButton onClick={openDiagnostic}>
                Fazer o diagnóstico agora
              </DiagnosticButton>
            </div>
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

      <AnimatePresence>
        {WHATSAPP_URL && showFloatingCta && !isDiagnosticOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.2 }}
            className="mc-floating-cta"
          >
            <WhatsAppButton compact>Falar no WhatsApp</WhatsAppButton>
          </motion.div>
        )}
      </AnimatePresence>

      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        returnFocusRef={diagnosticReturnFocusRef}
      />
    </div>
  );
}
