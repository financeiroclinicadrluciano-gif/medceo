import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { NAV_LINKS, WHATSAPP_URL } from "@/lib/site-content";
import "@/site-v3.css";

export default function SiteLayout({
  children,
  active,
}: {
  children: ReactNode;
  active: string;
}) {
  return (
    <div className="medceo-page mc-v3-page">
      <a className="mc-skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <header className="mc-v3-header">
        <nav className="mc-v3-nav" aria-label="Navegação principal">
          <Link to="/" className="mc-v3-brand" aria-label="MedCEO — voltar ao início">
            <img src="/logo.png" alt="MedCEO" />
          </Link>

          <div className="mc-v3-nav-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={active === link.to ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <a className="mc-v3-nav-action" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            Falar com o time
            <ArrowUpRight aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="conteudo">{children}</main>

      <footer className="mc-v3-footer">
        <div className="mc-container mc-v3-footer-grid">
          <div>
            <img src="/logo.png" alt="MedCEO" />
            <p>
              Diagnóstico, direção e execução para médicos donos de clínica. Método criado dentro
              de uma operação real.
            </p>
          </div>
          <nav aria-label="Páginas">
            <span>Navegar</span>
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div>
            <span>Contato</span>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              WhatsApp do time MedCEO
            </a>
            <a href="https://natuamedspa.com.br/" target="_blank" rel="noreferrer">
              Natuá MedSpa
            </a>
            <a
              href="https://www.instagram.com/dr.lucianoalvesneves/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram do Dr. Luciano
            </a>
          </div>
        </div>
        <div className="mc-container mc-v3-footer-base">
          <small>© 2026 MedCEO. Todos os direitos reservados.</small>
          <small>CRM/PR 45049 · Curitiba, PR</small>
        </div>
      </footer>
    </div>
  );
}
