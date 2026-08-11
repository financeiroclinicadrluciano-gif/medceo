import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import JourneyTimeline from "@/components/site/JourneyTimeline";
import { benefits, journeySteps, pillarsSummary, WHATSAPP_URL } from "@/lib/site-content";

const TITLE = "Método MedCEO — os seis pilares da clínica que cresce";
const DESCRIPTION =
  "Conheça o método MedCEO: mentalidade CEO, marketing, comercial, gestão, projetos e conteúdo — com diagnóstico, direção e execução acompanhada.";

export const Route = createFileRoute("/metodo")({
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
  component: MetodoPage,
});

function MetodoPage() {
  return (
    <SiteLayout active="/metodo">
      <section className="mc-v3-hero">
        <div className="mc-container">
          <p className="mc-v3-eyebrow">O método</p>
          <h1>
            Seis pilares para tirar a clínica das <em>costas do dono</em>.
          </h1>
          <p className="mc-v3-lead">
            O método MedCEO nasceu dentro da Natuá MedSpa, uma operação real em Curitiba. Cada
            pilar existe porque resolveu um gargalo concreto — não porque cabia bonito em um slide.
          </p>
          <div className="mc-v3-actions">
            <a className="mc-v3-btn" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Falar com o time
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="mc-v3-btn mc-v3-btn-ghost" href="/">
              Fazer o diagnóstico
            </a>
          </div>
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-section-head">
            <p className="mc-v3-eyebrow">Pilares</p>
            <h2>Cada frente com um responsável e uma tese.</h2>
          </div>
          <div className="mc-v3-grid">
            {pillarsSummary.map((pillar) => (
              <article key={pillar.number} className="mc-v3-card">
                <span className="mc-v3-card-index">
                  {pillar.number} · {pillar.role}
                </span>
                <h3>{pillar.name}</h3>
                <p>{pillar.thesis}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-section-head">
            <p className="mc-v3-eyebrow">Como funciona</p>
            <h2>Do diagnóstico à execução, em quatro etapas.</h2>
          </div>
          <JourneyTimeline steps={journeySteps} />
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-section-head">
            <p className="mc-v3-eyebrow">Benefícios</p>
            <h2>O que muda quando a gestão vira método.</h2>
          </div>
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
    </SiteLayout>
  );
}
