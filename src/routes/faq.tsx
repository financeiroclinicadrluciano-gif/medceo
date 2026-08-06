import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import FaqAccordion from "@/components/site/FaqAccordion";
import { faqItems, WHATSAPP_URL } from "@/lib/site-content";

const TITLE = "FAQ MedCEO — dúvidas sobre o diagnóstico e a mentoria";
const DESCRIPTION =
  "Respostas objetivas sobre o diagnóstico gratuito, o método de seis pilares, tempo de dedicação e como funciona a mentoria MedCEO.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout active="/faq">
      <section className="mc-v3-hero">
        <div className="mc-container">
          <p className="mc-v3-eyebrow">Perguntas frequentes</p>
          <h1>
            As dúvidas que aparecem <em>antes</em> de qualquer decisão.
          </h1>
          <p className="mc-v3-lead">
            Sem promessa de faturamento, sem fórmula pronta. Abaixo estão as respostas que damos na
            primeira conversa com todo médico dono de clínica.
          </p>
          <FaqAccordion items={faqItems} />
          <div className="mc-v3-actions">
            <a className="mc-v3-btn" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Ainda tenho uma dúvida
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="mc-v3-btn mc-v3-btn-ghost" href="/">
              Fazer o diagnóstico
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
