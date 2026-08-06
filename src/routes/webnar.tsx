import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { MotionBlurText, NoiseOverlay, TextEffect, TextShimmer } from "@/components/kit";

import webnarHeroBackground from "@/assets/medceo/webnar-hero-background.jpg";
import "@/webnar.css";

const TITLE = "Aulas semanais MedCEO — grupo de médicos donos de clínica";
const DESCRIPTION =
  "Toda semana uma aula ao vivo sobre pacientes qualificados, margem e previsibilidade de faturamento. Entre no grupo do WhatsApp e receba presentes e oportunidades.";

// PENDENTE: substituir pelo link oficial do grupo quando o cliente enviar.
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/";

// Aula gratuita da mentoria (Panda Video).
const CLASS_VIDEO_URL =
  "https://player-vz-cc72507e-ecc.tv.pandavideo.com.br/embed/?v=85638f9a-6681-4a3d-bdab-83aed5805455";

export const Route = createFileRoute("/webnar")({
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
    ],
    links: [{ rel: "preload", as: "image", href: webnarHeroBackground, fetchpriority: "high" }],
  }),
  component: Webnar,
});

const gifts = [
  {
    strong: "Aula nova toda semana",
    text: "ao vivo, com o time que opera clínicas de verdade — não teoria de palco.",
  },
  {
    strong: "Presentes liberados no grupo",
    text: "planilhas de margem, scripts comerciais e o mapa de maturidade da operação.",
  },
  {
    strong: "Oportunidades antes de todo mundo",
    text: "vagas, bastidores e convites que só circulam entre quem está lá dentro.",
  },
];

function Webnar() {
  return (
    <main className="wb-page">
      <section className="wb-hero">
        <div
          className="wb-hero-media"
          style={{ ["--wb-hero-image" as string]: `url(${webnarHeroBackground})` }}
          aria-hidden="true"
        />
        <div className="wb-hero-wash" aria-hidden="true" />
        <NoiseOverlay />

        <div className="wb-container wb-hero-inner">
          <p className="wb-eyebrow">
            <TextShimmer>Grupo MedCEO · aulas semanais</TextShimmer>
          </p>

          <MotionBlurText
            as="h1"
            text="A sala onde médicos param de trabalhar mais e passam a faturar melhor."
          />

          <TextEffect as="p" per="line" preset="slide" className="wb-hook">
            {
              "Você não precisa de mais um curso. Precisa entrar no lugar onde a decisão certa da semana é dita em voz alta."
            }
          </TextEffect>

          <ul className="wb-gifts">
            {gifts.map((gift) => (
              <li key={gift.strong}>
                <strong>{gift.strong}</strong> — {gift.text}
              </li>
            ))}
          </ul>

          <div className="wb-actions">
            <a
              className="wb-cta"
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Entrar no grupo do WhatsApp
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
            <p className="wb-cta-note">Entrada gratuita. Saia quando quiser.</p>
          </div>
        </div>
      </section>

      <section className="wb-class">
        <div className="wb-container wb-class-inner">
          <p className="wb-limited">Por tempo limitado</p>
          <h2>
            Aula da mentoria grátis: <em>como atrair pacientes qualificados</em> e ter
            previsibilidade de faturamento
          </h2>
          <div className="wb-player">
            <iframe
              src={CLASS_VIDEO_URL}
              title="Aula da mentoria MedCEO"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
