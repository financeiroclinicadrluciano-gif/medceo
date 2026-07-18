import { createFileRoute } from "@tanstack/react-router";

import designSystemCss from "../design-system.css?url";
import drLucianoBackground from "@/assets/medceo/dr-luciano-section-background.jpg";
import drLuizBackground from "@/assets/medceo/dr-luiz-section-background.jpg";
import alessandraPortrait from "@/assets/medceo/method-pillars/alessandra.jpg";
import amandaPortrait from "@/assets/medceo/method-pillars/amanda.jpg";
import drLucianoPortrait from "@/assets/medceo/method-pillars/dr-luciano.jpg";
import gustavoPortrait from "@/assets/medceo/method-pillars/gustavo.jpg";
import marcosPortrait from "@/assets/medceo/method-pillars/marcos.jpg";
import michelePortrait from "@/assets/medceo/method-pillars/michele.jpg";

const TITLE = "MedCEO Nocturne — Design System";
const DESCRIPTION =
  "Sistema visual vivo do MedCEO: uma linguagem editorial executiva construída com precisão, contraste e direção.";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "stylesheet", href: designSystemCss }],
  }),
  component: DesignSystem,
});

const colors = [
  { name: "Obsidian", token: "--medceo-color-obsidian", hex: "#02070B", tone: "dark" },
  { name: "Night", token: "--medceo-color-night", hex: "#041019", tone: "dark" },
  { name: "Navy", token: "--medceo-color-navy", hex: "#092536", tone: "dark" },
  { name: "Direction", token: "--medceo-color-gold", hex: "#CDAE58", tone: "light" },
  { name: "Gold soft", token: "--medceo-color-gold-soft", hex: "#F0D98A", tone: "light" },
  { name: "Paper", token: "--medceo-color-paper", hex: "#F4EBDD", tone: "light" },
];

const typeScale = [
  { name: "Display / Tese", sample: "Direção antes de escala.", className: "ds-type-display" },
  { name: "Heading / Capítulo", sample: "Clareza para liderar.", className: "ds-type-heading" },
  {
    name: "Body / Argumento",
    sample: "Estratégia não é uma coleção de iniciativas. É saber o que merece atenção agora.",
    className: "ds-type-body",
  },
  { name: "Data / Evidência", sample: "R$ 200 mil", className: "ds-type-data" },
  { name: "Label / Índice", sample: "SISTEMA 01 / 06", className: "ds-type-label" },
];

const portraits = [
  {
    name: "Dr. Luciano",
    role: "Direção & mentalidade",
    image: drLucianoPortrait,
    position: "center 24%",
  },
  { name: "Gustavo", role: "Marketing", image: gustavoPortrait, position: "center 18%" },
  { name: "Marcos", role: "Comercial", image: marcosPortrait, position: "center 16%" },
  { name: "Alessandra", role: "Gestão", image: alessandraPortrait, position: "center 16%" },
  { name: "Michele", role: "Projetos", image: michelePortrait, position: "center 17%" },
  { name: "Amanda", role: "Audiovisual", image: amandaPortrait, position: "center 17%" },
];

const principles = [
  {
    number: "01",
    title: "Contraste com função",
    text: "Escuro concentra. Papel explica. Dourado aponta a decisão — nunca decora o vazio.",
  },
  {
    number: "02",
    title: "Composição, não grade",
    text: "Alinhamentos precisos convivem com recortes, sobreposições e assimetria controlada.",
  },
  {
    number: "03",
    title: "Prova antes do efeito",
    text: "Números, pessoas e argumentos continuam legíveis sem hover, animação ou contexto extra.",
  },
  {
    number: "04",
    title: "Movimento editorial",
    text: "A animação revela hierarquia e mudança de capítulo. Nunca disputa atenção com a mensagem.",
  },
];

function SectionHeader({
  index,
  eyebrow,
  title,
  copy,
}: {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <header className="ds-section-head">
      <div className="ds-section-head__index" aria-hidden="true">
        {index}
      </div>
      <div className="ds-section-head__content">
        <p className="ds-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
    </header>
  );
}

function DesignSystem() {
  return (
    <main className="medceo-ds">
      <a className="ds-skip" href="#ds-content">
        Ir para o conteúdo
      </a>

      <header className="ds-topbar">
        <a className="ds-brand" href="/" aria-label="Voltar para a landing MedCEO">
          <img src="/logo.png" alt="MedCEO" />
        </a>
        <nav aria-label="Navegação do design system">
          <a href="#foundation">Fundação</a>
          <a href="#components">Componentes</a>
          <a href="#photography">Fotografia</a>
        </nav>
        <a className="ds-back" href="/">
          Ver landing <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="ds-hero" id="ds-content" aria-labelledby="ds-title">
        <div className="ds-hero__ghost" aria-hidden="true">
          DS/01
        </div>
        <div className="ds-hero__content">
          <p className="ds-eyebrow">MedCEO / Sistema visual vivo / 2026</p>
          <h1 id="ds-title">
            MedCEO
            <span>Nocturne.</span>
          </h1>
          <p className="ds-hero__lede">
            Uma linguagem editorial executiva para transformar conhecimento de gestão em direção
            clara, memorável e humana.
          </p>
        </div>
        <aside className="ds-hero__manifesto" aria-label="Conceito central do sistema">
          <p className="ds-hero__manifesto-label">Assinatura 01</p>
          <div className="ds-angle-mark" aria-hidden="true">
            <span>8°</span>
          </div>
          <h2>Corte de Direção</h2>
          <p>
            Uma diagonal de oito graus atravessa capas, transições e CTAs. Ela traduz o gesto mais
            importante do método: escolher o próximo movimento.
          </p>
        </aside>
        <div className="ds-hero__coordinates" aria-hidden="true">
          <span>23°33&apos;S</span>
          <span>46°38&apos;W</span>
          <span>EXECUTIVE DARKROOM</span>
        </div>
      </section>

      <section className="ds-principles ds-section" aria-labelledby="principles-title">
        <div className="ds-principles__intro">
          <p className="ds-eyebrow">Princípios / 04</p>
          <h2 id="principles-title">
            O sistema parece premium porque cada decisão tem trabalho a fazer.
          </h2>
        </div>
        <div className="ds-principles__grid">
          {principles.map((principle) => (
            <article key={principle.number} className="ds-principle">
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="ds-section ds-foundation"
        id="foundation"
        aria-labelledby="foundation-title"
      >
        <SectionHeader
          index="01"
          eyebrow="Fundação"
          title="Cor com hierarquia, não ruído."
          copy="A base escura cria concentração. O papel quente acolhe argumentos longos. O ouro aparece apenas nos pontos de direção."
        />
        <div className="ds-colors" role="list" aria-label="Paleta principal MedCEO Nocturne">
          {colors.map((color) => (
            <article
              key={color.token}
              className={`ds-color ds-color--${color.tone}`}
              style={{ background: `var(${color.token})` }}
              role="listitem"
            >
              <span>{color.name}</span>
              <code>{color.hex}</code>
              <small>{color.token}</small>
            </article>
          ))}
        </div>

        <div className="ds-type-specimen">
          <div className="ds-type-specimen__meta">
            <p className="ds-eyebrow">Tipografia / Contraste editorial</p>
            <p>
              Playfair e Bodoni constroem tese. Montserrat sustenta leitura. Poppins organiza
              interface. Mono é reservado para índice e evidência.
            </p>
          </div>
          <div className="ds-type-list">
            {typeScale.map((type) => (
              <div className="ds-type-row" key={type.name}>
                <span>{type.name}</span>
                <p className={type.className}>{type.sample}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-section ds-materials" aria-labelledby="materials-title">
        <SectionHeader
          index="02"
          eyebrow="Materiais"
          title="Profundidade construída em camadas."
          copy="Texturas leves simulam uma composição finalizada no Photoshop sem transformar a interface em uma imagem estática."
        />
        <div className="ds-material-grid">
          <article className="ds-material ds-material--night">
            <span>01 / Darkroom</span>
            <h3>Noite recortada</h3>
            <p>Vinheta, luz fria e grid técnico para seções de concentração.</p>
          </article>
          <article className="ds-material ds-material--metal">
            <span>02 / Metal</span>
            <h3>Ouro direcional</h3>
            <p>Brilho com variação tonal para ações e evidências-chave.</p>
          </article>
          <article className="ds-material ds-material--paper">
            <span>03 / Documento</span>
            <h3>Papel executivo</h3>
            <p>Superfície quente para relatórios, entregáveis e leitura longa.</p>
          </article>
          <article className="ds-material ds-material--glass">
            <span>04 / Interface</span>
            <h3>Vidro fumê</h3>
            <p>Camada de apoio para informação sem esconder o contexto.</p>
          </article>
        </div>
      </section>

      <section
        className="ds-section ds-components"
        id="components"
        aria-labelledby="components-title"
      >
        <SectionHeader
          index="03"
          eyebrow="Componentes"
          title="Objetos com peso editorial."
          copy="A interface evita o catálogo de cartões genéricos. Cada componente recebe uma função visual específica: decidir, comparar, provar ou orientar."
        />

        <div className="ds-component-stage">
          <div className="ds-component-stage__actions">
            <p className="ds-spec-label">Ações</p>
            <a className="ds-button ds-button--primary" href="#photography">
              Explorar direção fotográfica <span aria-hidden="true">↗</span>
            </a>
            <a className="ds-button ds-button--secondary" href="/">
              Voltar para a landing <span aria-hidden="true">→</span>
            </a>
            <div className="ds-chip-row" aria-label="Exemplos de marcadores">
              <span className="ds-chip">Case documentado</span>
              <span className="ds-chip ds-chip--quiet">Pilar 03 / 05</span>
            </div>
          </div>

          <article className="ds-data-card">
            <div className="ds-data-card__top">
              <span>Indicador / Evolução</span>
              <span>03 meses</span>
            </div>
            <strong>+150%</strong>
            <h3>Mais direção. Menos dispersão.</h3>
            <div className="ds-data-card__rule" aria-hidden="true">
              <i />
            </div>
            <p>O número domina a composição. A explicação preserva contexto e responsabilidade.</p>
          </article>

          <form className="ds-form" onSubmit={(event) => event.preventDefault()}>
            <p className="ds-spec-label">Campos & estados</p>
            <label htmlFor="ds-clinic-name">Nome da clínica</label>
            <input id="ds-clinic-name" name="clinic" placeholder="Ex.: Clínica Horizonte" />
            <label htmlFor="ds-stage">Momento da operação</label>
            <select id="ds-stage" name="stage" defaultValue="">
              <option value="" disabled>
                Selecione uma etapa
              </option>
              <option>Estruturação</option>
              <option>Tração</option>
              <option>Escala</option>
            </select>
            <p className="ds-field-note">
              Rótulo sempre visível. Instrução curta. Contraste preservado.
            </p>
          </form>
        </div>
      </section>

      <section
        className="ds-section ds-photography"
        id="photography"
        aria-labelledby="photography-title"
      >
        <SectionHeader
          index="04"
          eyebrow="Fotografia"
          title="Pessoas como presença, não como avatar."
          copy="Retratos ocupam a composição com escala, sombra e espaço negativo. O enquadramento reserva uma zona real para a mensagem."
        />

        <figure className="ds-photo-hero">
          <img
            src={drLucianoBackground}
            alt="Retrato editorial do Dr. Luciano em fundo azul profundo"
          />
          <figcaption>
            <span>Direção de arte / Hero</span>
            <h3>A pessoa sustenta a tese.</h3>
            <p>Contraluz discreta, pele natural e fundo escuro com espaço de composição.</p>
          </figcaption>
        </figure>

        <div className="ds-contact-sheet" aria-label="Retratos dos pilares do método MedCEO">
          {portraits.map((portrait, index) => (
            <figure key={portrait.name} className="ds-portrait">
              <div className="ds-portrait__image">
                <img
                  src={portrait.image}
                  alt={`Retrato de ${portrait.name}`}
                  style={{ objectPosition: portrait.position }}
                  loading="lazy"
                />
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <figcaption>
                <strong>{portrait.name}</strong>
                <span>{portrait.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <figure className="ds-photo-proof">
          <img
            src={drLuizBackground}
            alt="Retrato editorial do Dr. Luiz em fundo azul profundo"
            loading="lazy"
          />
          <figcaption>
            <span>Direção de arte / Prova</span>
            <strong>O case entra como documento, nunca como promessa solta.</strong>
          </figcaption>
        </figure>
      </section>

      <section className="ds-section ds-motion" aria-labelledby="motion-title">
        <SectionHeader
          index="05"
          eyebrow="Motion & acessibilidade"
          title="Movimento que orienta. Conteúdo que permanece."
          copy="A experiência ganha ritmo quando o dispositivo permite — e continua completa quando animações são reduzidas, toque substitui hover ou a conexão é lenta."
        />

        <div className="ds-motion-layout">
          <div
            className="ds-motion-demo"
            aria-label="Demonstração decorativa do Corte de Direção em movimento"
          >
            <div className="ds-motion-demo__grid" aria-hidden="true" />
            <div className="ds-motion-demo__cut" aria-hidden="true" />
            <div className="ds-motion-demo__copy">
              <span>Sequência / 820ms</span>
              <strong>Entrar. Pausar. Direcionar.</strong>
            </div>
          </div>
          <div className="ds-access-grid">
            <article>
              <span>01</span>
              <h3>Reduced motion</h3>
              <p>A linha para. A hierarquia permanece.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Sem hover obrigatório</h3>
              <p>Informação e ação estão visíveis no primeiro estado.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Foco perceptível</h3>
              <p>Controles recebem contorno de alto contraste.</p>
            </article>
            <article>
              <span>04</span>
              <h3>Leitura responsiva</h3>
              <p>Escala, ritmo e recortes se adaptam sem truncar.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="ds-footer">
        <div>
          <img src="/logo.png" alt="MedCEO" />
          <p>Design System Nocturne / Direção antes de escala.</p>
        </div>
        <a className="ds-button ds-button--primary" href="/">
          Ver sistema em contexto <span aria-hidden="true">↗</span>
        </a>
        <span>DS 01 / JUL 2026</span>
      </footer>
    </main>
  );
}
