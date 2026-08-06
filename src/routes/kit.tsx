import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Gauge, LineChart, Users } from "lucide-react";

import {
  AnimatedText,
  BeamsBackground,
  BorderBeam,
  CardsStack,
  ChapterScrubber,
  FeatureGrid,
  FloatingPaths,
  FluidParticlesBackground,
  HistoryList,
  HoverBorderGradient,
  HowItWorks,
  IntegrationsOrbit,
  Loader,
  LogoCloud,
  Magnetic,
  MarqueeCta,
  MetricCard,
  MotionBlurText,
  MovingDotCard,
  NoiseOverlay,
  NotificationCenter,
  PointerHighlight,
  RadialDarkBackground,
  RadioCards,
  ShineBorder,
  SpotlightMaskedGrid,
  TestimonialsSection,
  TextEffect,
  TextShimmer,
  Timeline,
} from "@/components/kit";

import "@/kit-demo.css";

const TITLE = "MedCEO Kit — catálogo de componentes e guia do design system";
const DESCRIPTION =
  "Todos os componentes do MedCEO Kit com seus estados (hover, foco, loading, reduced-motion) e o guia prático de tokens, espaçamento, tipografia e hierarquia.";

export const Route = createFileRoute("/kit")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: KitCatalog,
});

const tokens = [
  { name: "Night", value: "#041019", token: "--medceo-color-night" },
  { name: "Navy", value: "#092536", token: "--medceo-color-navy" },
  { name: "Direction (gold)", value: "#CDAE58", token: "--medceo-color-gold" },
  { name: "Gold soft", value: "#F0D98A", token: "--medceo-color-gold-soft" },
  { name: "Paper", value: "#F4EBDD", token: "--medceo-color-paper" },
];

const typeScale = [
  { name: "Display", size: "clamp(2.4rem, 1.7rem + 3.6vw, 4.6rem)", role: "tese da dobra, serifada, uma por seção" },
  { name: "Heading", size: "clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)", role: "capítulo dentro da dobra" },
  { name: "Body", size: "clamp(0.9375rem, 0.88rem + 0.28vw, 1.125rem)", role: "argumento, máx. 60ch" },
  { name: "Label", size: "0.6875rem / 0.28em tracking", role: "índice, eyebrow, metadado" },
];

const spacing = [
  { name: "4 / 8 / 12", role: "dentro do componente" },
  { name: "16 / 24 / 32", role: "entre elementos de um bloco" },
  { name: "48 / 64 / 88", role: "entre blocos de uma dobra" },
  { name: "clamp(88px, 10vw, 168px)", role: "entre dobras (--medceo-space-section)" },
];

const timelineItems = [
  { title: "20 minutos", description: "O diagnóstico em 20 perguntas.", meta: "Etapa 01" },
  { title: "10 anos", description: "A leitura de operação acumulada do método.", meta: "Etapa 02" },
  { title: "01 decisão", description: "A prioridade que muda o próximo trimestre.", meta: "Etapa 03" },
];

const steps = [
  { step: "01", title: "Responda", description: "Cerca de 5 minutos sobre margem, comercial e operação." },
  { step: "02", title: "Receba o nível", description: "O estágio real da operação hoje." },
  { step: "03", title: "Execute", description: "Três próximos passos coerentes com o estágio." },
];

const chapters = [
  { id: "c1", label: "Mentalidade", detail: "Decisão antes de tática." },
  { id: "c2", label: "Margem", detail: "Preço, custo e mix." },
  { id: "c3", label: "Comercial", detail: "Conversão previsível." },
];

const features = [
  { title: "Mentalidade CEO", description: "A decisão sai do reflexo e entra no processo.", icon: <Compass size={18} /> },
  { title: "Margem", description: "Preço e custo lidos juntos, não separados.", icon: <Gauge size={18} /> },
  { title: "Comercial", description: "Da agenda cheia à agenda certa.", icon: <LineChart size={18} /> },
  { title: "Equipe", description: "Papéis claros antes de contratar mais.", icon: <Users size={18} /> },
];

const cardsStack = [
  { id: "s1", content: <p>Camada 01 — a operação como ela é hoje.</p> },
  { id: "s2", content: <p>Camada 02 — o gargalo que trava o próximo passo.</p> },
  { id: "s3", content: <p>Camada 03 — a decisão que destrava o trimestre.</p> },
];

const testimonials = [
  { quote: "A clareza veio antes do crescimento.", name: "Dr. Luiz Henrique", role: "Clínica própria" },
  { quote: "Parei de apagar incêndio e comecei a decidir.", name: "Dra. Amanda", role: "Gestão clínica" },
  { quote: "O diagnóstico apontou o que eu evitava olhar.", name: "Dr. Marcos", role: "Comercial" },
];

const notifications = [
  { id: "n1", title: "Diagnóstico concluído", description: "Nível 3 — operação estruturada.", time: "agora", unread: true },
  { id: "n2", title: "Novo material no grupo", description: "Planilha de margem por procedimento.", time: "2 h" },
];

const history = [
  { id: "h1", title: "Diagnóstico enviado", subtitle: "20 perguntas", value: "Nível 3", status: "done" as const, date: "12 mai" },
  { id: "h2", title: "Plano de ação", subtitle: "3 próximos passos", status: "pending" as const, date: "14 mai" },
];

const radioOptions = [
  { value: "a", label: "Até 30 pacientes/semana", description: "Operação em formação." },
  { value: "b", label: "30 a 90 pacientes/semana", description: "Operação real, gargalo visível." },
];

function KitCatalog() {
  const [reduced, setReduced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [radio, setRadio] = useState("b");
  const [notes, setNotes] = useState(notifications);

  return (
    <main className="kd-page" data-reduced={reduced ? "true" : "false"}>
      <header className="kd-header">
        <div className="kd-container">
          <p className="kd-eyebrow">
            <TextShimmer>MedCEO Kit · catálogo vivo</TextShimmer>
          </p>
          <h1>Todos os componentes, seus estados e como compor com eles.</h1>
          <p>
            Esta página é a referência de implementação: cada bloco mostra o componente, os estados
            relevantes e o trecho de código de uso. O guia de composição fica no final.
          </p>
          <div className="kd-toolbar">
            <button
              type="button"
              className="kd-toggle"
              aria-pressed={reduced}
              onClick={() => setReduced((value) => !value)}
            >
              Simular prefers-reduced-motion
            </button>
            <button
              type="button"
              className="kd-toggle"
              aria-pressed={loading}
              onClick={() => setLoading((value) => !value)}
            >
              Simular estado de loading
            </button>
          </div>
        </div>
      </header>

      <Section
        title="Tipografia animada"
        description="Quatro tratamentos de texto. Todos mantêm o texto acessível no DOM e ficam estáticos com motion reduzido."
      >
        <Card title="MotionBlurText" note="Entrada palavra a palavra, de desfocado para nítido." code={`<MotionBlurText as="h2" text="Direção antes de escala." />`}>
          <MotionBlurText as="h3" text="Direção antes de escala." />
        </Card>
        <Card title="TextShimmer" note="Brilho contínuo em label curta. Nunca em parágrafo." code={`<TextShimmer>Diagnóstico gratuito</TextShimmer>`}>
          <p className="kd-eyebrow">
            <TextShimmer>Diagnóstico gratuito</TextShimmer>
          </p>
        </Card>
        <Card title="TextEffect" note="Presets fade, slide, scale e blur, por letra, palavra ou linha." code={`<TextEffect per="word" preset="blur">Clareza para liderar</TextEffect>`}>
          <TextEffect per="word" preset="blur">
            Clareza para liderar a própria operação.
          </TextEffect>
          <TextEffect per="char" preset="scale" className="kd-note">
            Preset scale, por caractere.
          </TextEffect>
        </Card>
        <Card title="AnimatedText" note="Revelação por máscara vertical com destaque dourado." code={`<AnimatedText text="A decisão certa" highlight={["decisão"]} />`}>
          <AnimatedText as="h3" text="A decisão certa vale mais que o esforço extra." highlight={["decisão"]} />
        </Card>
      </Section>

      <Section
        title="Interação e ênfase"
        description="Estados de hover e foco são obrigatórios: todo alvo interativo tem 44px mínimos e anel de foco visível."
      >
        <Card title="Magnetic" note="Hover: atração suave ao ponteiro. Sem hover, o botão permanece idêntico." code={`<Magnetic><button /></Magnetic>`}>
          <div className="kd-demo-row">
            <Magnetic>
              <button type="button" className="kd-button">
                Passe o mouse
              </button>
            </Magnetic>
            <span className="kd-state">hover · foco</span>
          </div>
        </Card>
        <Card title="PointerHighlight" note="Destaque decorativo em uma expressão dentro do título." code={`<PointerHighlight>operação real</PointerHighlight>`}>
          <h3>
            Para quem já tem uma <PointerHighlight>operação real</PointerHighlight>.
          </h3>
        </Card>
        <Card title="HoverBorderGradient" note="Anel dourado que gira apenas no hover/foco." code={`<HoverBorderGradient as="button">Ver mais</HoverBorderGradient>`}>
          <div className="kd-demo-row">
            <HoverBorderGradient as="button">Ver diagnóstico</HoverBorderGradient>
            <span className="kd-state">default · hover · focus-visible</span>
          </div>
        </Card>
        <Card title="ShineBorder / BorderBeam" note="Bordas animadas para o card protagonista da dobra. Uma por seção." code={`<ShineBorder><Card /></ShineBorder>`}>
          <ShineBorder>
            <div style={{ padding: 18 }}>Card com ShineBorder</div>
          </ShineBorder>
          <div className="kit-border-beam" style={{ position: "relative", padding: 18, borderRadius: 12 }}>
            Card com BorderBeam
            <BorderBeam />
          </div>
        </Card>
        <Card title="MovingDotCard" note="Superfície com ponto de luz em órbita — use em métricas." code={`<MovingDotCard><MetricCard … /></MovingDotCard>`}>
          <MovingDotCard>
            <MetricCard label="Faturamento" value="R$ 200 mil" delta="+150%" caption="Case Dr. Luiz Henrique" />
          </MovingDotCard>
        </Card>
        <Card title="Loader" note="Estado de carregamento com rótulo textual, nunca só o spinner." code={`{loading ? <Loader label="Calculando" /> : <Result />}`}>
          {loading ? <Loader label="Calculando diagnóstico" /> : <p className="kd-note">Ative “Simular estado de loading”.</p>}
        </Card>
      </Section>

      <Section
        title="Fundos e atmosfera"
        description="Camadas de fundo são decorativas (aria-hidden) e sempre GPU-friendly. No máximo duas camadas animadas por dobra."
      >
        <Card title="SpotlightMaskedGrid + NoiseOverlay" note="Custo zero de JS: gradiente mascarado e grão estático." code={`<SpotlightMaskedGrid /><NoiseOverlay />`}>
          <div className="kd-bg-frame">
            <SpotlightMaskedGrid />
            <NoiseOverlay />
            <span className="kd-bg-caption">grid + grão</span>
          </div>
        </Card>
        <Card title="BeamsBackground / RadialDarkBackground" note="Feixes animados por transform; radial é estático." code={`<BeamsBackground />`}>
          <div className="kd-bg-frame">
            <RadialDarkBackground />
            <BeamsBackground />
            <span className="kd-bg-caption">radial + feixes</span>
          </div>
        </Card>
        <Card title="FluidParticlesBackground" note="Canvas leve; pausa fora da viewport e com motion reduzido." code={`<FluidParticlesBackground count={36} />`}>
          <div className="kd-bg-frame">
            <FluidParticlesBackground count={36} />
            <span className="kd-bg-caption">partículas</span>
          </div>
        </Card>
        <Card title="FloatingPaths" note="Traços SVG lentos para dobras de respiro." code={`<FloatingPaths position={-1} />`}>
          <div className="kd-bg-frame">
            <FloatingPaths position={-1} />
            <span className="kd-bg-caption">floating paths</span>
          </div>
        </Card>
      </Section>

      <Section
        title="Estrutura e narrativa"
        description="Componentes que organizam a leitura da dobra. Cada estado precisa ser compreensível isoladamente."
      >
        <Card title="HowItWorks" wide code={`<HowItWorks steps={steps} />`}>
          <HowItWorks steps={steps} />
        </Card>
        <Card title="Timeline" code={`<Timeline items={items} />`}>
          <Timeline items={timelineItems} />
        </Card>
        <Card title="ChapterScrubber" note="Tabs acessíveis por teclado (setas, Home/End)." code={`<ChapterScrubber chapters={chapters} />`}>
          <ChapterScrubber chapters={chapters} />
        </Card>
        <Card title="CardsStack" wide note="Empilhamento com perspectiva no scroll." code={`<CardsStack items={items} />`}>
          <CardsStack items={cardsStack} />
        </Card>
        <Card title="FeatureGrid" wide code={`<FeatureGrid features={features} />`}>
          <FeatureGrid features={features} />
        </Card>
        <Card title="IntegrationsOrbit" code={`<IntegrationsOrbit center={<Logo />} nodes={nodes} />`}>
          <IntegrationsOrbit
            center={<strong>MedCEO</strong>}
            nodes={[
              { id: "o1", label: "Margem" },
              { id: "o2", label: "Equipe" },
              { id: "o3", label: "Agenda" },
              { id: "o4", label: "Comercial" },
            ]}
          />
        </Card>
      </Section>

      <Section
        title="Prova, dados e conversão"
        description="Números sempre com unidade e contexto textual. Nada de dado sem origem."
      >
        <Card title="MetricCard" code={`<MetricCard label="Pacientes" value="2.500+" />`}>
          <MetricCard label="Pacientes atendidos" value="2.500+" caption="Natuá, acumulado" />
        </Card>
        <Card title="HistoryList" code={`<HistoryList entries={entries} />`}>
          <HistoryList entries={history} />
        </Card>
        <Card title="NotificationCenter" note="Dispensa item por item; lista vazia tem estado próprio." code={`<NotificationCenter items={items} onDismiss={…} />`}>
          <NotificationCenter
            items={notes}
            onDismiss={(id) => setNotes((current) => current.filter((item) => item.id !== id))}
          />
        </Card>
        <Card title="RadioCards" note="Grupo de rádio real: navegável por setas, foco visível." code={`<RadioCards options={options} value={value} onValueChange={set} />`}>
          <RadioCards options={radioOptions} value={radio} onValueChange={setRadio} name="kd-demo" />
        </Card>
        <Card title="TestimonialsSection" wide code={`<TestimonialsSection testimonials={items} />`}>
          <TestimonialsSection testimonials={testimonials} />
        </Card>
        <Card title="LogoCloud" wide code={`<LogoCloud logos={logos} caption="…" />`}>
          <LogoCloud logos={[{ src: "/logo.png", alt: "MedCEO" }, { src: "/logo.png", alt: "MedCEO Mentoria" }]} caption="Marcas atendidas" />
        </Card>
        <Card title="MarqueeCta" wide note="Decorativo: pausa no hover/foco e vira scroll com motion reduzido." code={`<MarqueeCta words={["Direção", "Margem"]} />`}>
          <MarqueeCta words={["Direção", "Margem", "Previsibilidade"]} />
        </Card>
      </Section>

      <section className="kd-section" id="guia">
        <div className="kd-container">
          <h2>Guia prático de composição</h2>
          <p>
            Como montar uma dobra nova sem quebrar o sistema: tokens, espaçamento, tipografia e
            hierarquia. A referência completa em texto está em docs/design-system/GUIA.md.
          </p>

          <div className="kd-guide-grid">
            <div className="kd-card">
              <header>
                <h3>1. Tokens</h3>
                <p>Nunca use hex solto. Toda cor vem de uma variável do sistema.</p>
              </header>
              {tokens.map((token) => (
                <div key={token.name} className="kd-swatch">
                  <div className="kd-swatch-chip" style={{ background: token.value }} />
                  <p className="kd-note">
                    {token.name} · <code>{token.token}</code>
                  </p>
                </div>
              ))}
            </div>

            <div className="kd-card">
              <header>
                <h3>2. Tipografia</h3>
                <p>Serifada para tese e capítulo; sans para argumento e metadado.</p>
              </header>
              {typeScale.map((item) => (
                <div key={item.name} className="kd-scale-row">
                  <strong>{item.name}</strong>
                  <span className="kd-note">{item.size}</span>
                  <span className="kd-note">{item.role}</span>
                </div>
              ))}
            </div>

            <div className="kd-card">
              <header>
                <h3>3. Espaçamento</h3>
                <p>Escala de 4px. Ritmo cresce do componente para a dobra.</p>
              </header>
              {spacing.map((item, index) => (
                <div key={item.name} className="kd-scale-row">
                  <div className="kd-spacing-bar" style={{ width: `${28 + index * 24}%` }} />
                  <strong>{item.name}</strong>
                  <span className="kd-note">{item.role}</span>
                </div>
              ))}
            </div>

            <div className="kd-card">
              <header>
                <h3>4. Hierarquia da dobra</h3>
                <p>Uma dobra = um argumento. Sempre nesta ordem.</p>
              </header>
              <pre className="kd-code">{`<section className="mc-section">
  <p className="mc-eyebrow">Label</p>      // índice
  <h2>Tese em uma frase</h2>               // serifada
  <p>Argumento de apoio (máx. 60ch)</p>    // sans
  <Componente />                            // prova ou ação
  <span className="mc-section-index" />    // 01 / FILTRO
</section>`}</pre>
            </div>
          </div>

          <div className="kd-card kd-card-wide" style={{ marginTop: 24 }}>
            <header>
              <h3>5. Regras de uso do kit</h3>
            </header>
            <div className="kd-do-dont">
              <ul className="kd-do">
                <li>Uma borda animada (ShineBorder ou BorderBeam) por dobra, no elemento protagonista.</li>
                <li>No máximo duas camadas de fundo animadas simultâneas na mesma viewport.</li>
                <li>Texto animado sempre mantém a versão legível no DOM e o rótulo acessível.</li>
                <li>Alvos interativos com 44px e anel de foco `--medceo-focus-ring-color`.</li>
                <li>Números com unidade e contexto textual ao lado.</li>
              </ul>
              <ul className="kd-dont">
                <li>Não empilhar shimmer em parágrafos ou textos longos.</li>
                <li>Não revelar conteúdo essencial apenas no hover.</li>
                <li>Não animar blur, box-shadow grande ou background-position em área extensa.</li>
                <li>Não criar duração ou curva nova: use os quatro tokens de motion.</li>
                <li>Não usar o corte de 8° cruzando rosto, número ou CTA.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="kd-section">
      <div className="kd-container">
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="kd-grid">{children}</div>
      </div>
    </section>
  );
}

function Card({
  title,
  note,
  code,
  wide,
  children,
}: {
  title: string;
  note?: string;
  code?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className={`kd-card${wide ? " kd-card-wide" : ""}`}>
      <header>
        <h3>{title}</h3>
        {note ? <p>{note}</p> : null}
      </header>
      <div className="kd-demo">{children}</div>
      {code ? <pre className="kd-code">{code}</pre> : null}
    </article>
  );
}
