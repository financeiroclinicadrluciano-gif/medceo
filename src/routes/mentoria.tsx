import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import JourneyTimeline from "@/components/site/JourneyTimeline";
import FaqAccordion from "@/components/site/FaqAccordion";
import { benefits, faqItems, journeySteps, WHATSAPP_URL } from "@/lib/site-content";

const TITLE = "Mentoria MedCEO — gestão para médicos donos de clínica";
const DESCRIPTION =
  "A mentoria MedCEO acompanha médicos donos de clínica na execução: margem, comercial, operação, equipe e escala com direção clara.";

const forWho = [
  "Clínica ativa, com pacientes, equipe e faturamento em andamento.",
  "Dono disposto a olhar margem e processo, não só volume de pacientes.",
  "Operação que quer estrutura antes de investir em uma nova frente.",
  "Médico que quer sair do centro de todas as decisões.",
];

const notForWho = [
  "Quem ainda não abriu ou não opera a clínica.",
  "Quem busca promessa de faturamento rápido.",
  "Quem quer apenas mais anúncios, sem mexer na operação.",
  "Quem não quer responder com clareza sobre os próprios gargalos.",
];

export const Route = createFileRoute("/mentoria")({
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
  component: MentoriaPage,
});

function MentoriaPage() {
  return (
    <SiteLayout active="/mentoria">
      <section className="mc-v3-hero">
        <div className="mc-container">
          <p className="mc-v3-eyebrow">Mentoria</p>
          <h1>
            Direção de gestão para quem já tem <em>operação de verdade</em>.
          </h1>
          <p className="mc-v3-lead">
            A mentoria começa onde o diagnóstico termina: com o gargalo identificado, o time MedCEO
            acompanha a execução nas frentes que realmente destravam a clínica agora.
          </p>
          <div className="mc-v3-actions">
            <a className="mc-v3-btn" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Conversar sobre a mentoria
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="mc-v3-btn mc-v3-btn-ghost" href="/">
              Começar pelo diagnóstico
            </a>
          </div>
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-section-head">
            <p className="mc-v3-eyebrow">O caminho</p>
            <h2>Como o acompanhamento acontece.</h2>
          </div>
          <JourneyTimeline steps={journeySteps} />
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-section-head">
            <p className="mc-v3-eyebrow">Filtro</p>
            <h2>Não é para toda clínica — e isso é proposital.</h2>
          </div>
          <div className="mc-v3-grid">
            <article className="mc-v3-card">
              <span className="mc-v3-card-index">Faz sentido se…</span>
              <ul className="mc-v3-list">
                {forWho.map((item) => (
                  <li key={item}>
                    <Check aria-hidden="true" size={15} /> {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="mc-v3-card">
              <span className="mc-v3-card-index">Ainda não é o momento se…</span>
              <ul className="mc-v3-list">
                {notForWho.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-section-head">
            <p className="mc-v3-eyebrow">Benefícios</p>
            <h2>O que você leva de cada ciclo.</h2>
          </div>
          <div className="mc-v3-grid">
            {benefits.slice(0, 4).map((benefit) => (
              <article key={benefit.title} className="mc-v3-card">
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-v3-section">
        <div className="mc-container">
          <div className="mc-v3-section-head">
            <p className="mc-v3-eyebrow">Dúvidas</p>
            <h2>Objeções comuns, respondidas sem rodeio.</h2>
          </div>
          <FaqAccordion items={faqItems.slice(0, 5)} />
        </div>
      </section>
    </SiteLayout>
  );
}
