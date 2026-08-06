import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { MotionBlurText, NoiseOverlay, TextEffect, TextShimmer } from "@/components/kit";

import webnarHeroBackground from "@/assets/medceo/webnar-hero-background.jpg";
import "@/webnar.css";

const logoUrl = "/logo.png";

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
    links: [{ rel: "preload", as: "image", href: webnarHeroBackground }],
  }),
  component: Webnar,
});

const gifts = [
  { strong: "1 Aula gratuita toda semana" },
  { strong: "Presentes especiais no grupo" },
  { strong: "Comunidade de médicos CEO" },
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
          <img
            className="wb-hero-logo"
            src={logoUrl}
            alt="MedCEO — método de gestão para médicos donos de clínica"
            width={140}
            height={60}
          />

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
          <p className="wb-limited">Aula introdutória · acesso liberado</p>
          <MotionBlurText
            as="h2"
            stagger={0.05}
            text="Bem-vindo ao MedCEO: o método que transforma o médico em dono de uma clínica lucrativa"
          />

          <p className="wb-class-sub">
            Nesta aula introdutória você entende a lógica por trás da metodologia MedCEO —
            diagnóstico, margem, comercial, operação e escala — e enxerga onde a sua clínica
            está perdendo dinheiro hoje.
          </p>
          <div className="wb-player">
            <iframe
              src={CLASS_VIDEO_URL}
              title="Aula introdutória MedCEO — a metodologia"
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
