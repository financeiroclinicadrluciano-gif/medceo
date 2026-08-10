import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import { pillarsSummary, WHATSAPP_URL } from "@/lib/site-content";

const TITLE = "Sobre o MedCEO — método criado dentro de uma clínica real";
const DESCRIPTION =
  "Dr. Luciano Alves Neves (CRM/PR 45049), médico, CEO e fundador da Natuá MedSpa, lidera o MedCEO com um time de seis frentes de execução.";

export const Route = createFileRoute("/sobre")({
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
  component: SobrePage,
});

function SobrePage() {
  return (
    <SiteLayout active="/sobre">
      <section className="mc-v3-hero">
        <div className="mc-container">
          <p className="mc-v3-eyebrow">Sobre</p>
          <h1>
            Quem construiu uma operação médica entende o <em>peso de cada decisão</em>.
          </h1>
          <p className="mc-v3-lead">
            Médico, CEO e fundador da Natuá MedSpa, o Dr. Luciano Alves Neves conduz uma operação
            real em Curitiba — com pacientes, equipe, método, comercial e decisões que não cabem em
            uma teoria de gestão. Foi dessa vivência que nasceu o MedCEO.
          </p>

          <dl className="mc-v3-stats">
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
          <p className="mc-v3-lead" style={{ fontSize: 12 }}>
            Dados declarados nos canais oficiais da Natuá e do Dr. Luciano.
          </p>
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-section-head">
            <p className="mc-v3-eyebrow">O time</p>
            <h2>Seis frentes, uma leitura só da clínica.</h2>
          </div>
          <div className="mc-v3-grid">
            {pillarsSummary.map((pillar) => (
              <article key={pillar.number} className="mc-v3-card">
                <span className="mc-v3-card-index">{pillar.role}</span>
                <h3>{pillar.name}</h3>
                <p>{pillar.thesis}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-cta">
            <p className="mc-v3-eyebrow">Fontes oficiais</p>
            <h2>Veja a operação por trás do método.</h2>
            <div className="mc-v3-actions">
              <a
                className="mc-v3-btn mc-v3-btn-ghost"
                href="https://natuamedspa.com/"
                target="_blank"
                rel="noreferrer"
              >
                Conhecer a Natuá
                <ExternalLink aria-hidden="true" />
              </a>
              <a
                className="mc-v3-btn mc-v3-btn-ghost"
                href="https://www.instagram.com/dr.lucianoalvesneves/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram oficial
                <ExternalLink aria-hidden="true" />
              </a>
              <a className="mc-v3-btn" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Falar com o time
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
