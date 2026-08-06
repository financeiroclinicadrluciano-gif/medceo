import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink, MessageCircle } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import { WHATSAPP_URL } from "@/lib/site-content";

const TITLE = "Contato MedCEO — fale com o time sobre sua clínica";
const DESCRIPTION =
  "Fale com o time MedCEO pelo WhatsApp para entender se a mentoria faz sentido para o estágio atual da sua clínica.";

export const Route = createFileRoute("/contato")({
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
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <SiteLayout active="/contato">
      <section className="mc-v3-hero">
        <div className="mc-container">
          <p className="mc-v3-eyebrow">Contato</p>
          <h1>
            Uma conversa direta sobre <em>o gargalo atual</em> da sua clínica.
          </h1>
          <p className="mc-v3-lead">
            O caminho mais rápido é o WhatsApp. Se preferir chegar com contexto, faça primeiro o
            diagnóstico gratuito de 20 perguntas e traga o resultado para a conversa.
          </p>

          <div className="mc-v3-grid">
            <article className="mc-v3-card">
              <span className="mc-v3-card-index">Direto</span>
              <h3>WhatsApp do time MedCEO</h3>
              <p>Resposta em horário comercial, sem robô e sem formulário longo.</p>
              <div className="mc-v3-actions">
                <a className="mc-v3-btn" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden="true" />
                  Abrir conversa
                </a>
              </div>
            </article>

            <article className="mc-v3-card">
              <span className="mc-v3-card-index">Com contexto</span>
              <h3>Diagnóstico primeiro</h3>
              <p>
                20 perguntas, cerca de 5 minutos, resultado imediato com nível de maturidade e três
                próximos passos.
              </p>
              <div className="mc-v3-actions">
                <a className="mc-v3-btn mc-v3-btn-ghost" href="/">
                  Fazer o diagnóstico
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </article>

            <article className="mc-v3-card">
              <span className="mc-v3-card-index">Canais oficiais</span>
              <h3>Natuá MedSpa e Instagram</h3>
              <p>A operação real por trás do método, em Curitiba (PR).</p>
              <div className="mc-v3-actions">
                <a
                  className="mc-v3-btn mc-v3-btn-ghost"
                  href="https://natuamedspa.com.br/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Natuá
                  <ExternalLink aria-hidden="true" />
                </a>
                <a
                  className="mc-v3-btn mc-v3-btn-ghost"
                  href="https://www.instagram.com/dr.lucianoalvesneves/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                  <ExternalLink aria-hidden="true" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
