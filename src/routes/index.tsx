import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowRight, Check, Play, X } from "lucide-react";

import AnimatedContent from "@/components/AnimatedContent";
import VideoModal from "@/components/VideoModal";
import DiagnosticModal from "@/components/DiagnosticModal";
import drSeated from "@/assets/dr-luciano.jpg";

const TITLE = "MedCEO · Diagnóstico de Maturidade Empresarial Médica";
const DESCRIPTION =
  "Diagnóstico gratuito para médicos donos de clínica. Descubra o nível de maturidade da sua operação e receba um plano estratégico de 12 meses.";

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

const authorityMarkers = [
  { label: "Formato", value: "20 perguntas estratégicas" },
  { label: "Entrega", value: "Relatório + plano de 12 meses" },
  { label: "Leitura", value: "Nível de maturidade da clínica" },
  { label: "Próximo passo", value: "Reunião personalizada" },
];

const diagnosisFor = [
  "Médicos donos de clínica com pacientes, equipe e faturamento em andamento.",
  "Clínicas que já recebem leads, mas perdem oportunidades no WhatsApp, no preço ou no follow-up.",
  "Operações em que o dono ainda decide demais: agenda, comercial, contratação, margem e entrega.",
  "Médicos que querem saber qual estrutura precisa vir antes de crescer mais.",
];

const diagnosisNotFor = [
  "Quem ainda não tem clínica em operação ou agenda minimamente ativa.",
  "Quem procura promessa de faturamento rápido ou fórmula pronta de marketing.",
  "Quem quer apenas mais pacientes, sem olhar gestão, margem, equipe e comercial.",
  "Quem não está disposto a responder com clareza sobre faturamento e gargalos.",
];

const diagnosticDeliverables = [
  {
    title: "Mapa do nível atual",
    desc: "Mostra se a clínica ainda depende da agenda do médico, da improvisação da equipe ou se já tem base para avançar.",
  },
  {
    title: "Leitura dos gargalos",
    desc: "Aponta onde a operação perde maturidade: gestão, margem, comercial, equipe, entrega ou escala.",
  },
  {
    title: "Plano estratégico de 12 meses",
    desc: "Organiza prioridades para corrigir primeiro, estruturar depois e evitar acelerar o que ainda não sustenta crescimento.",
  },
  {
    title: "Reunião personalizada",
    desc: "O time conversa a partir das suas respostas, com contexto real da clínica, e não com um discurso pronto.",
  },
];

const methodPillars = [
  {
    level: "01",
    title: "Diagnóstico",
    desc: "Mapear maturidade, faturamento, dependência do dono e gargalo dominante antes de qualquer solução.",
  },
  {
    level: "02",
    title: "Margem",
    desc: "Entender se a clínica fatura com clareza ou se a receita esconde desperdício, desconto e decisão sem indicador.",
  },
  {
    level: "03",
    title: "Comercial",
    desc: "Avaliar se lead, WhatsApp, qualificação, proposta e follow-up seguem método ou dependem do improviso.",
  },
  {
    level: "04",
    title: "Operação",
    desc: "Verificar equipe, entrega, rotina, processos e autonomia para reduzir a centralização no médico dono.",
  },
  {
    level: "05",
    title: "Escala",
    desc: "Transformar o diagnóstico em plano de crescimento para 12 meses, com prioridades e ordem de execução.",
  },
];

function Index() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (typeof window === "undefined") return;
    setShowFloatingCta(latest > window.innerHeight * 0.72);
  });

  // Body scroll lock while modal open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isDiagnosticOpen || isVideoOpen ? "hidden" : "";
  }, [isDiagnosticOpen, isVideoOpen]);

  const openDiagnostic = () => setIsDiagnosticOpen(true);

  const DiagnosticButton = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      onClick={openDiagnostic}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-halo-primary px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-wider text-[#070807] transition-all duration-300 hover:-translate-y-0.5 hover:bg-halo-primary-hover hover:shadow-[0_18px_40px_rgba(211,183,91,0.28)] focus:outline-none focus:ring-2 focus:ring-halo-primary focus:ring-offset-2 focus:ring-offset-halo-bg ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );

  return (
    <div className="site-grain min-h-screen overflow-x-hidden bg-halo-bg font-sans text-halo-text selection:bg-halo-primary/25 selection:text-halo-primary">
      {mounted && (
        <motion.div
          className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left bg-halo-primary"
          style={{ scaleX }}
        />
      )}

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/5 bg-halo-bg/74 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-10">
          <a href="#top" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MedCEO"
              className="h-8 max-w-[150px] object-contain md:h-9 md:max-w-[168px]"
            />
          </a>

          <div className="hidden items-center gap-8 font-mono text-[10px] font-medium uppercase tracking-wider text-halo-muted md:flex">
            <a href="#fit" className="nav-link">Para quem</a>
            <a href="#deliverables" className="nav-link">Entregas</a>
            <a href="#method" className="nav-link">Método</a>
            <a href="#authority" className="nav-link">Autoridade</a>
          </div>

          <DiagnosticButton className="px-4 md:px-5">
            <span className="hidden sm:inline">Iniciar diagnóstico</span>
            <span className="sm:hidden">Diagnóstico</span>
          </DiagnosticButton>
        </nav>
      </header>

      <main id="top">
        {/* HERO */}
        <section
          id="hero"
          className="relative overflow-hidden border-b border-white/5 px-5 pb-14 pt-28 md:px-10 md:pt-32 lg:flex lg:min-h-screen lg:items-center lg:pt-20"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_28%_18%,rgba(211,183,91,0.18),transparent_36%),linear-gradient(180deg,rgba(7,8,7,0.94),#070807_64%)]" />

          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <AnimatedContent distance={36} className="max-w-2xl">
                <span className="eyebrow-line mb-6">
                  Diagnóstico gratuito para médicos donos de clínica
                </span>

                <h1 className="max-w-3xl font-serif text-[38px] font-semibold leading-[1.02] tracking-tight text-halo-text md:text-[54px] lg:text-[60px] xl:text-[66px]">
                  Receba um plano estratégico de 12 meses para evoluir sua clínica.
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-halo-muted md:text-[17px]">
                  Responda 20 perguntas sobre faturamento, equipe, comercial, margem e dependência do dono. O MedCEO identifica o nível de maturidade da sua clínica e gera uma direção personalizada para os próximos 12 meses.
                </p>

                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <DiagnosticButton className="w-full sm:w-auto">
                    Iniciar diagnóstico gratuito
                  </DiagnosticButton>
                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-wider text-halo-text transition-colors duration-300 hover:border-halo-primary/60 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-halo-primary focus:ring-offset-2 focus:ring-offset-halo-bg sm:w-auto"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Assistir explicação
                  </button>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-halo-faint">
                  <span>20 perguntas</span>
                  <span className="h-1 w-1 rounded-full bg-halo-primary/70" />
                  <span>relatório estratégico</span>
                  <span className="h-1 w-1 rounded-full bg-halo-primary/70" />
                  <span>plano de 12 meses</span>
                </div>
              </AnimatedContent>

              <div className="hidden min-h-[420px] lg:block" aria-hidden="true" />
            </div>

            <div className="mt-12 grid grid-cols-1 border-y border-white/8 md:grid-cols-4">
              {authorityMarkers.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-white/8 px-5 py-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
                >
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-halo-faint">
                    {item.label}
                  </span>
                  <span className="mt-2 block font-serif text-lg font-semibold text-halo-text">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FIT */}
        <section
          id="fit"
          className="border-b border-white/5 px-5 py-16 md:px-10 lg:flex lg:min-h-screen lg:items-center lg:py-16"
        >
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <AnimatedContent distance={36}>
              <span className="eyebrow-line mb-6">Filtro do diagnóstico</span>
              <h2 className="max-w-xl font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-[50px]">
                Não é para toda clínica. É para quem já tem operação real.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-halo-muted">
                O diagnóstico foi criado para médicos que já têm algo para diagnosticar: pacientes, equipe, faturamento, gargalos e decisões que afetam os próximos 12 meses.
              </p>
            </AnimatedContent>

            <AnimatedContent
              distance={44}
              delay={0.05}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="comparison-panel comparison-panel-featured">
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-halo-primary" />
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-halo-primary">
                    Para quem é
                  </h3>
                </div>
                <ul className="space-y-5">
                  {diagnosisFor.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-halo-primary/18 text-halo-primary">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                      <span className="text-[15px] leading-relaxed text-halo-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="comparison-panel">
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-halo-error" />
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-halo-muted">
                    Para quem não é
                  </h3>
                </div>
                <ul className="space-y-5">
                  {diagnosisNotFor.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-halo-error/12 text-halo-error">
                        <X className="h-3 w-3 stroke-[2.5]" />
                      </span>
                      <span className="text-[15px] leading-relaxed text-halo-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContent>
          </div>
        </section>

        {/* DELIVERABLES */}
        <section
          id="deliverables"
          className="border-b border-white/5 px-5 py-16 md:px-10 lg:flex lg:min-h-screen lg:items-center lg:py-16"
        >
          <div className="mx-auto w-full max-w-7xl">
            <AnimatedContent
              distance={36}
              className="grid grid-cols-1 gap-7 md:grid-cols-[0.76fr_1.24fr] md:items-end"
            >
              <div>
                <span className="eyebrow-line mb-6">O que você recebe</span>
                <h2 className="max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-[50px]">
                  Um diagnóstico que vira plano, não só uma pontuação.
                </h2>
              </div>
              <p className="max-w-lg text-[15px] leading-relaxed text-halo-muted md:ml-auto">
                As respostas não servem apenas para classificar sua clínica. Elas orientam o relatório, o plano estratégico e a reunião que o time MedCEO fará depois.
              </p>
            </AnimatedContent>

            <AnimatedContent
              distance={44}
              delay={0.05}
              className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              {diagnosticDeliverables.map((item, idx) => (
                <article
                  key={item.title}
                  className={`comparison-panel compact-panel ${idx === 2 ? "comparison-panel-featured" : ""}`}
                >
                  <span className="mb-7 block font-mono text-[10px] font-semibold text-halo-primary">
                    0{idx + 1}
                  </span>
                  <h3 className="font-serif text-[23px] font-semibold leading-tight text-halo-text">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[14px] leading-relaxed text-halo-muted">{item.desc}</p>
                </article>
              ))}
            </AnimatedContent>
          </div>
        </section>

        {/* METHOD */}
        <section
          id="method"
          className="relative overflow-hidden border-b border-white/5 bg-halo-surface px-5 py-16 md:px-10 lg:flex lg:min-h-screen lg:items-center lg:py-16"
        >
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(247,240,228,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(247,240,228,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="relative mx-auto w-full max-w-7xl">
            <AnimatedContent
              distance={36}
              className="grid grid-cols-1 gap-8 md:grid-cols-[0.88fr_1.12fr] md:items-end"
            >
              <div>
                <span className="eyebrow-line mb-6">Método MedCEO</span>
                <h2 className="max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-[50px]">
                  Cinco pilares em uma trilha de maturidade.
                </h2>
              </div>
              <p className="max-w-lg text-[15px] leading-relaxed text-halo-muted md:ml-auto">
                O relatório organiza suas respostas em uma sequência lógica. Primeiro entendemos onde você está; depois, qual pilar precisa ser estruturado para sustentar os próximos 12 meses.
              </p>
            </AnimatedContent>

            <AnimatedContent distance={48} delay={0.08} className="maturity-stair mt-12">
              {methodPillars.map((lvl) => (
                <article key={lvl.level} className="maturity-step">
                  <span className="maturity-number">{lvl.level}</span>
                  <div>
                    <h3>{lvl.title}</h3>
                    <p>{lvl.desc}</p>
                  </div>
                </article>
              ))}
            </AnimatedContent>

            <div className="mt-9 flex flex-col gap-5 border-t border-white/8 pt-7 md:flex-row md:items-center md:justify-between">
              <p className="max-w-2xl text-[15px] leading-relaxed text-halo-muted">
                A trilha evita uma decisão comum: tentar escalar tráfego, equipe ou faturamento antes de saber qual pilar ainda está imaturo.
              </p>
              <DiagnosticButton className="w-full md:w-auto">
                Fazer diagnóstico agora
              </DiagnosticButton>
            </div>
          </div>
        </section>

        {/* AUTHORITY */}
        <section
          id="authority"
          className="border-b border-white/5 px-5 py-16 md:px-10 lg:flex lg:min-h-screen lg:items-center lg:py-16"
        >
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <AnimatedContent distance={44} className="authority-portrait">
              <figure>
                <img src={drSeated} alt="Dr. Luciano Alves em retrato profissional" />
              </figure>
            </AnimatedContent>

            <AnimatedContent distance={36} delay={0.08}>
              <span className="eyebrow-line mb-6">Quem interpreta o diagnóstico</span>
              <h2 className="max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-[52px]">
                Dr. Luciano Alves e mentores MedCEO.
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-halo-muted">
                <p>
                  Médico e CEO da Natuá, o Dr. Luciano lidera uma operação real, com pacientes, equipe, comercial, margem e rotina para administrar todos os dias.
                </p>
                <p>
                  O diagnóstico conecta essa vivência prática ao olhar dos mentores MedCEO em gestão, margem, comercial, operação e escala. A reunião personalizada começa pelas suas respostas, não por um discurso pronto.
                </p>
              </div>

              <blockquote className="mt-8 border-l border-halo-primary pl-6 font-serif text-2xl leading-snug text-halo-text md:text-[30px]">
                “Antes de crescer mais, o médico precisa saber qual parte da clínica ainda não sustenta o próximo nível.”
              </blockquote>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <DiagnosticButton className="w-full sm:w-auto">
                  Começar meu diagnóstico
                </DiagnosticButton>
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/12 px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-wider text-halo-text transition-colors duration-300 hover:border-halo-primary/60 hover:bg-white/[0.05] sm:w-auto"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Ver explicação
                </button>
              </div>
            </AnimatedContent>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-[12px] text-halo-faint md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MedCEO"
              className="h-8 max-w-[150px] object-contain opacity-85"
            />
            <span className="font-mono uppercase tracking-wider">
              Diagnóstico · Maturidade · Plano
            </span>
          </div>
          <span>© 2026 MedCEO. Todos os direitos reservados.</span>
        </div>
      </footer>

      <AnimatePresence>
        {showFloatingCta && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 22 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-5 right-5 z-40 hidden md:block"
          >
            <button
              onClick={openDiagnostic}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-halo-primary px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-wider text-[#070807] shadow-[0_18px_46px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:bg-halo-primary-hover"
            >
              Diagnóstico gratuito
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
      <DiagnosticModal isOpen={isDiagnosticOpen} onClose={() => setIsDiagnosticOpen(false)} />
    </div>
  );
}
