import { useEffect, useRef, useState, type MouseEventHandler, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowRight, Check, Compass, X } from "lucide-react";

import AnimatedContent from "@/components/AnimatedContent";
import DiagnosticModal from "@/components/DiagnosticModal";
import VideoModal from "@/components/VideoModal";
import drEditorial from "@/assets/medceo/dr-luciano-editorial.jpg";
import drHero from "@/assets/medceo/dr-luciano-hero.jpg";

const TITLE = "MedCEO — Diagnóstico de Maturidade Empresarial para Clínicas";
const DESCRIPTION =
  "Descubra o nível de maturidade da sua clínica, o gargalo prioritário da operação e os próximos passos em 20 perguntas.";

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
  }),
  component: Index,
});

const diagnosticSummary = [
  { value: "20", label: "perguntas estratégicas" },
  { value: "05", label: "pilares avaliados" },
  { value: "03", label: "próximos passos" },
];

const operationalSignals = [
  {
    label: "O que aparece",
    title: "A clínica cresce, mas você continua no centro de tudo.",
    items: [
      "A equipe consulta você antes de decidir.",
      "O comercial perde ritmo sem sua cobrança.",
      "O faturamento aumenta, mas a margem continua nebulosa.",
    ],
  },
  {
    label: "O que realmente trava",
    title: "Não é falta de esforço. É crescimento antes da estrutura.",
    items: [
      "Papéis, processos e indicadores ainda não sustentam autonomia.",
      "Marketing amplifica uma operação que ainda depende do dono.",
      "Sem diagnóstico, cada nova iniciativa disputa atenção e caixa.",
    ],
  },
];

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
    description:
      "Uma leitura clara de quanto a clínica ainda depende do dono e do improviso para funcionar.",
  },
  {
    number: "02",
    title: "Gargalo prioritário",
    description:
      "O pilar que mais limita o próximo nível: diagnóstico, margem, comercial, operação ou escala.",
  },
  {
    number: "03",
    title: "Prioridade de gestão",
    description:
      "A primeira decisão que merece atenção antes de abrir uma nova frente de crescimento.",
  },
  {
    number: "04",
    title: "Três próximos passos",
    description:
      "Ações iniciais coerentes com o estágio encontrado para orientar a próxima conversa de gestão.",
  },
];

const maturityPillars = [
  {
    number: "01",
    title: "Diagnóstico",
    question: "Você sabe exatamente onde a clínica está travada?",
    description: "Maturidade, dependência do dono e gargalo prioritário antes de qualquer solução.",
  },
  {
    number: "02",
    title: "Margem",
    question: "O faturamento mostra quanto realmente sobra?",
    description: "Clareza financeira, margem por serviço e decisões sustentadas por indicador.",
  },
  {
    number: "03",
    title: "Comercial",
    question: "Sua recepção atende ou conduz uma decisão?",
    description: "Lead, WhatsApp, qualificação, proposta e follow-up seguindo um método.",
  },
  {
    number: "04",
    title: "Operação",
    question: "A equipe resolve ou apenas encaminha tudo para você?",
    description: "Papéis, processos, rotina e autonomia para reduzir centralização.",
  },
  {
    number: "05",
    title: "Escala",
    question: "A estrutura sustenta o próximo nível?",
    description: "Crescimento em ordem, com prioridades e uma sequência executável.",
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

function Index() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [mounted, setMounted] = useState(false);
  const diagnosticReturnFocusRef = useRef<HTMLElement | null>(null);
  const methodReturnFocusRef = useRef<HTMLElement | null>(null);

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
    document.body.style.overflow = isDiagnosticOpen || isVideoOpen ? "hidden" : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDiagnosticOpen, isVideoOpen]);

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
            <a href="#diagnostico">Diagnóstico</a>
            <a href="#entregas">Entregas</a>
            <a href="#maturidade">Maturidade</a>
            <a href="#autoridade">Autoridade</a>
          </div>

          <DiagnosticButton onClick={openDiagnostic} compact>
            Iniciar diagnóstico
          </DiagnosticButton>
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

              <div className="mc-hero-actions">
                <DiagnosticButton onClick={openDiagnostic}>
                  Descobrir meu nível de maturidade
                </DiagnosticButton>
                <button
                  type="button"
                  className="mc-button mc-button-secondary"
                  onClick={(event) => {
                    methodReturnFocusRef.current = event.currentTarget;
                    setIsVideoOpen(true);
                  }}
                >
                  <Compass aria-hidden="true" />
                  <span>Entender o diagnóstico</span>
                </button>
              </div>

              <p className="mc-hero-note">Gratuito · leva poucos minutos · resultado imediato</p>
            </AnimatedContent>

            <AnimatedContent
              className="mc-hero-visual"
              distance={28}
              direction="horizontal"
              reverse
            >
              <div className="mc-photo-frame">
                <img
                  src={drHero}
                  alt="Dr. Luciano Alves em retrato executivo"
                  width={3718}
                  height={5577}
                  fetchPriority="high"
                />
                <div className="mc-photo-caption">
                  <span>Dr. Luciano Alves</span>
                  <small>Médico, CEO e mentor MedCEO</small>
                </div>
              </div>

              <div className="mc-diagnostic-ticket" aria-label="Resumo do diagnóstico">
                <span className="mc-ticket-kicker">Leitura executiva</span>
                <strong>Da dependência do dono à escala previsível.</strong>
                <span className="mc-ticket-line" />
                <small>Diagnóstico · margem · comercial · operação · escala</small>
              </div>
            </AnimatedContent>
          </div>

          <div className="mc-container mc-hero-ledger" aria-label="Estrutura do diagnóstico">
            {diagnosticSummary.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
            <p>Uma direção antes de mais uma iniciativa.</p>
          </div>
        </section>

        <section id="diagnostico" className="mc-paper-section mc-section">
          <div className="mc-container">
            <AnimatedContent className="mc-paper-heading" distance={24}>
              <p className="mc-eyebrow mc-eyebrow-dark">O custo invisível</p>
              <h2>
                Sua clínica pode faturar bem — <em>e ainda depender demais de você.</em>
              </h2>
            </AnimatedContent>

            <div className="mc-signal-grid">
              {operationalSignals.map((signal, index) => (
                <AnimatedContent
                  key={signal.label}
                  className="mc-signal-column"
                  distance={22}
                  delay={index * 0.06}
                >
                  <span className="mc-index">0{index + 1}</span>
                  <p className="mc-signal-label">{signal.label}</p>
                  <h3>{signal.title}</h3>
                  <ul>
                    {signal.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </AnimatedContent>
              ))}
            </div>

            <AnimatedContent className="mc-control-question" distance={18}>
              <span>PERGUNTA DE CONTROLE</span>
              <p>
                Se toda decisão ainda volta para você, o crescimento da clínica está financiando uma
                empresa — ou apenas uma rotina maior?
              </p>
            </AnimatedContent>
          </div>
        </section>

        <section className="mc-fit-section mc-section">
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
              <p>
                Cada resposta precisa mudar a leitura da clínica e a ordem das próximas decisões. Se
                não muda a ação, é apenas informação.
              </p>
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

        <section id="maturidade" className="mc-maturity-section mc-section">
          <div className="mc-container mc-maturity-grid">
            <AnimatedContent className="mc-maturity-intro" distance={24}>
              <p className="mc-eyebrow">Mapa de maturidade</p>
              <h2>Cinco leituras. Uma ordem para crescer.</h2>
              <p>
                O próximo nível não começa por mais tráfego, mais equipe ou mais uma unidade. Ele
                começa pelo pilar que ainda não sustenta o que você quer construir.
              </p>
              <DiagnosticButton onClick={openDiagnostic}>Mapear minha clínica</DiagnosticButton>
            </AnimatedContent>

            <div className="mc-maturity-map">
              {maturityPillars.map((pillar, index) => (
                <AnimatedContent
                  key={pillar.number}
                  className="mc-maturity-row"
                  distance={20}
                  delay={index * 0.05}
                >
                  <span className="mc-maturity-number">{pillar.number}</span>
                  <div>
                    <p>{pillar.title}</p>
                    <h3>{pillar.question}</h3>
                  </div>
                  <small>{pillar.description}</small>
                </AnimatedContent>
              ))}
            </div>
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
              <h2>Dr. Luciano Alves e mentores MedCEO.</h2>
              <div className="mc-authority-body">
                <p>
                  Médico e CEO da Natuá, o Dr. Luciano lidera uma operação real, com pacientes,
                  equipe, comercial, margem e decisões para administrar todos os dias.
                </p>
                <p>
                  O MedCEO conecta essa vivência ao olhar de mentores em gestão, margem, comercial,
                  operação e escala. A conversa começa pelas suas respostas, não por uma solução
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

        <section className="mc-final-section">
          <div className="mc-container mc-final-grid">
            <div>
              <p className="mc-eyebrow">Seu próximo passo</p>
              <h2>Estrutura antes da escala.</h2>
            </div>
            <div className="mc-final-action">
              <p>
                Responda às 20 perguntas e descubra onde sua clínica está, o que mais trava o
                próximo nível e qual decisão merece prioridade agora.
              </p>
              <DiagnosticButton onClick={openDiagnostic}>
                Iniciar diagnóstico gratuito
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
        {showFloatingCta && !isDiagnosticOpen && !isVideoOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.2 }}
            className="mc-floating-cta"
          >
            <DiagnosticButton onClick={openDiagnostic} compact>
              Descobrir meu nível
            </DiagnosticButton>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        returnFocusRef={methodReturnFocusRef}
        onStartDiagnostic={() => {
          diagnosticReturnFocusRef.current = methodReturnFocusRef.current;
          setIsVideoOpen(false);
          setIsDiagnosticOpen(true);
        }}
      />
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        returnFocusRef={diagnosticReturnFocusRef}
      />
    </div>
  );
}
