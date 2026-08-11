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
import CountUp from "@/components/landing/CountUp";
import FaqAccordion from "@/components/site/FaqAccordion";
import JourneyTimeline from "@/components/site/JourneyTimeline";
import { getPosts } from "@/lib/blog/posts";
import { benefits, faqItems, journeySteps } from "@/lib/site-content";
import {
  HowItWorks,
  Magnetic,
  MarqueeCta,
  PointerHighlight,
  ShineBorder,
  SpotlightMaskedGrid,
  TextShimmer,
} from "@/components/kit";

import drLucianoSectionBackground from "@/assets/medceo/dr-luciano-section-background.jpg";
import drLuizSectionBackground from "@/assets/medceo/dr-luiz-section-background.jpg";
import alessandraPortrait from "@/assets/medceo/method-pillars/alessandra.jpg";
import amandaPortrait from "@/assets/medceo/method-pillars/amanda.jpg";
import drLucianoMethodPortrait from "@/assets/medceo/method-pillars/dr-luciano.jpg";
import gustavoPortrait from "@/assets/medceo/method-pillars/gustavo.jpg";
import comercialPortrait from "@/assets/medceo/method-pillars/alessandra-luciano.jpg";
import michelePortrait from "@/assets/medceo/method-pillars/michele.jpg";
import "@/coffee-v2.css";
import "@/site-v3.css";

const TITLE = "MedCEO — Diagnóstico de Gestão para Clínicas Médicas";
const DESCRIPTION =
  "Diagnóstico gratuito em 20 perguntas para médicos donos de clínica: veja o nível de maturidade da operação, o gargalo principal e os próximos passos.";
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
    imageAlt:
      "Gustavo, responsável pelo pilar de Marketing do MedCEO, em retrato de estúdio com fundo escuro.",
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
    image: comercialPortrait,
    imageAlt: "Alessandra e Dr. Luciano lado a lado, representando o pilar Comercial do MedCEO.",
    imagePosition: "center 22%",
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
    imageAlt:
      "Alessandra, responsável pelo pilar de Gestão do MedCEO, em retrato de estúdio com fundo escuro.",
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
  // Avaliado por requisicao, nunca no escopo do modulo: em Cloudflare Workers
  // o relogio so existe depois que a requisicao chega, e no escopo global
  // new Date() devolve 1970 — o que fazia o filtro de data descartar todos os
  // posts e o blog anunciar "0 textos publicados".
  const postsRecentes = getPosts().slice(0, 3);
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

          {/*
            O Blog entrou aqui em 10/08. A home tem menu proprio, separado do
            NAV_LINKS que as paginas internas usam, entao o blog existia, era
            navegavel por /blog e nao aparecia para quem entrava pela home.
            Menu que diverge em dois lugares e o jeito de um deles envelhecer.
          */}
          <div className="mc-nav-links">
            <a href="/metodo">Método</a>
            <a href="/mentoria">Mentoria</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="/blog">Blog</a>
            <a href="/sobre">Sobre</a>
            <a href="#faq">FAQ</a>
            <a href="/contato">Contato</a>
          </div>

          {heroCtaVisible ? (
            <motion.button
              type="button"
              onClick={openDiagnostic}
              className="mc-nav-action"
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Fazer diagnóstico
              <ArrowDownRight aria-hidden="true" />
            </motion.button>
          ) : (
            <span className="mc-nav-action-placeholder" aria-hidden="true" />
          )}
        </nav>
      </header>

      <main id="conteudo">
        <section
          id="top"
          className="mc-hero mc-hero-vsl mc-hero-elite"
          aria-labelledby="hero-title"
        >
          <div className="mc-hero-ambient mc-hero-ambient-a" aria-hidden="true" />
          <div className="mc-hero-ambient mc-hero-ambient-b" aria-hidden="true" />
          <div className="mc-hero-hairline" aria-hidden="true" />

          <div className="mc-container mc-hero-layout">
            <div className="mc-hero-copy">
              <p className="mc-eyebrow mc-eyebrow-rule">
                Mentoria estratégica para donos de clínica
              </p>
              <h1 id="hero-title" className="mc-hero-title">
                Os próximos <em>20 minutos</em> podem definir os próximos 10 anos da sua clínica.
              </h1>
              <p className="mc-hero-lead">
                Existe uma distância silenciosa entre ser um médico excelente e ser dono de uma
                empresa que cresce sem você no centro de tudo. Esta apresentação mostra exatamente
                onde essa distância está na sua clínica — e o que precisa ser decidido primeiro.
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
                <span className="mc-hero-video-live">
                  <i />
                  Apresentação MedCEO
                </span>
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
              <div className="mc-hero-video-meta">
                <p className="mc-hero-urgency">
                  Conteúdo restrito a médicos proprietários. Sai do ar em breve.
                </p>
                <span className="mc-hero-video-duration" aria-hidden="true">
                  <small>Duração</small>
                  20 min
                </span>
              </div>
            </div>

            {heroCtaVisible ? (
              <motion.div
                className="mc-hero-actions mc-hero-delayed-actions"
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Magnetic>
                  <button
                    type="button"
                    onClick={openDiagnostic}
                    className="mc-button mc-button-primary"
                  >
                    <span>Identificar meu próximo gargalo</span>
                    <ArrowDownRight aria-hidden="true" />
                  </button>
                </Magnetic>
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
              <h2>
                Não é para toda clínica. É para quem já tem uma{" "}
                <PointerHighlight>operação real</PointerHighlight>.
              </h2>
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
                  <ShineBorder>
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
                  </ShineBorder>
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

        <section id="como-funciona" className="mc-section mc-how-section">
          <div className="mc-container">
            <AnimatedContent distance={22}>
              <p className="mc-eyebrow">Como funciona</p>
              <h2>Três passos entre a dúvida de hoje e a prioridade da semana.</h2>
            </AnimatedContent>
            <HowItWorks
              className="mc-how-kit"
              steps={[
                {
                  step: "01",
                  title: "Responda às 20 perguntas",
                  description:
                    "Cerca de 5 minutos sobre margem, comercial, operação, equipe e escala da sua clínica.",
                },
                {
                  step: "02",
                  title: "Receba o nível de maturidade",
                  description:
                    "O resultado aponta em que estágio a operação está hoje e qual gargalo trava o próximo passo.",
                },
                {
                  step: "03",
                  title: "Saia com três próximos passos",
                  description:
                    "Ações coerentes com o seu estágio, não um plano genérico de crescimento.",
                },
              ]}
            />

            <JourneyTimeline steps={journeySteps} />

            <div className="mc-v3-grid">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="mc-v3-card">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
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
                      <dt>
                        <CountUp
                          value={2500}
                          format={(current) =>
                            `${new Intl.NumberFormat("pt-BR").format(Math.round(current))}+`
                          }
                        />
                      </dt>
                      <dd>pacientes atendidos informados pela Natuá</dd>
                    </div>
                    <div>
                      <dt>
                        <CountUp value={15} format={(c) => `${Math.round(c)}+ anos`} />
                      </dt>
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
                    <a href="https://natuamedspa.com/" target="_blank" rel="noreferrer">
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

        <section className="mc-marquee-section" aria-hidden="true">
          <MarqueeCta words={["Diagnóstico", "Direção", "Execução", "Margem", "Escala"]} />
        </section>

        <section id="faq" className="mc-section">
          <div className="mc-container">
            <AnimatedContent distance={22}>
              <p className="mc-eyebrow">Perguntas frequentes</p>
              <h2>As objeções que aparecem antes de qualquer decisão.</h2>
            </AnimatedContent>
            <FaqAccordion items={faqItems} />
          </div>
        </section>

        {/*
          Entrada do blog na home. Fica depois do FAQ e antes do CTA: quem
          chegou ate aqui e nao clicou no diagnostico ainda esta decidindo, e
          o artigo e o proximo passo de menor compromisso. Mostra so os tres
          mais recentes ja publicados — a lista completa fica em /blog.
        */}
        {postsRecentes.length > 0 ? (
          <section id="blog" className="mc-section mc-home-blog">
            <div className="mc-container">
              <AnimatedContent distance={22}>
                <p className="mc-eyebrow">No blog</p>
                <h2>Gestão de clínica com a conta à mostra.</h2>
                <p className="mc-home-blog-lead">
                  Cada texto abre o número, mostra a fonte e termina com o que fazer na
                  segunda-feira.
                </p>
              </AnimatedContent>

              <div className="mc-home-blog-grid">
                {postsRecentes.map((post) => (
                  <a key={post.slug} href={`/blog/${post.slug}`} className="mc-home-blog-card">
                    <img src={post.cover} alt={post.coverAlt} loading="lazy" />
                    <div className="mc-home-blog-card-body">
                      <p className="mc-home-blog-silo">{post.silo}</p>
                      <h3>{post.titulo}</h3>
                      <p className="mc-home-blog-dek">{post.dek}</p>
                      <small>
                        {post.dataLegivel} · {post.minutos} min de leitura
                      </small>
                    </div>
                  </a>
                ))}
              </div>

              <a href="/blog" className="mc-home-blog-todos">
                Ver todos os textos
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </section>
        ) : null}

        <section
          id="grupo-whatsapp"
          className="mc-whatsapp-section"
          aria-label="Grupo gratuito no WhatsApp"
        >
          <div className="mc-whatsapp-aura" aria-hidden="true" />
          <div className="mc-whatsapp-dots" aria-hidden="true" />
          <div className="mc-container mc-whatsapp-content">
            <p className="mc-whatsapp-badge">
              <span className="mc-whatsapp-dot" aria-hidden="true" />
              Gratuito · toda semana
            </p>
            <h2>Entre no nosso Grupo Gratuito do WhatsApp</h2>
            <p className="mc-whatsapp-lede">
              Realizamos encontros semanais online liberando acesso a um encontro da nossa mentoria
              MedCEO, de graça.
            </p>
            <a
              className="mc-whatsapp-cta"
              href="https://chat.whatsapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="currentColor"
              >
                <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.2 4.79 1.2h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2z" />
              </svg>
              Entrar no grupo agora
            </a>
            <small>Entrada gratuita · saia quando quiser</small>
          </div>
        </section>

        <section
          id="convite-diagnostico"
          className="mc-invite-section"
          aria-label="Convite ao diagnóstico da clínica"
        >
          <div
            className="mc-invite-background"
            aria-hidden="true"
            style={{ backgroundImage: `url(${drLucianoSectionBackground})` }}
          />
          <div className="mc-invite-wash" aria-hidden="true" />
          <div className="mc-container mc-invite-content">
            <p className="mc-eyebrow">Onde está o seu gargalo</p>
            <h2 className="mc-invite-title">
              Gostaria de realizar um <em>diagnóstico</em> da sua clínica?
            </h2>
            <p className="mc-invite-lede">
              Aborde Marketing, Comercial, Gestão ou Financeiro para saber onde está o gargalo da
              sua clínica — junto com um plano de ação prático de 60 dias para você entrar no
              MedCEO.
            </p>
            <ul className="mc-invite-chips">
              <li>Marketing</li>
              <li>Comercial</li>
              <li>Gestão</li>
              <li>Financeiro</li>
            </ul>
            <div className="mc-invite-actions">
              <Magnetic>
                <DiagnosticButton onClick={openDiagnostic}>Fazer o diagnóstico</DiagnosticButton>
              </Magnetic>
              <small>
                Gratuito · 5 minutos
                <br />
                plano de 60 dias no fim
              </small>
            </div>
          </div>
        </section>

        <section id="diagnostico" className="mc-final-section">
          <div className="mc-final-wash" aria-hidden="true" />
          <SpotlightMaskedGrid className="mc-final-kit-layer" />
          <div className="mc-container mc-final-content">
            <p className="mc-eyebrow">Diagnóstico disponível</p>
            <h2>Realize seu diagnóstico agora com a nossa Inteligência Artificial</h2>
            <p>
              São mais de 17 anos de conhecimento clínico, empresarial, gestão, marketing,
              comercial, financeiro e mentalidade juntos em uma inteligência artificial que pode
              virar a chave do seu negócio.
            </p>
            <Magnetic>
              <DiagnosticButton onClick={openDiagnostic}>
                Fazer o diagnóstico agora
              </DiagnosticButton>
            </Magnetic>
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
