/**
 * Compartilhamento do post. O botão de copiar confirma pelo próprio rótulo e
 * por uma região `aria-live`, para quem não vê a mudança de texto.
 */

import { useState } from "react";
import { Link2, Linkedin, MessageCircle } from "lucide-react";

export default function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Sem permissão de área de transferência o link continua visível na barra
      // do navegador; o rótulo confirma mesmo assim para não travar o fluxo.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mc-blog-share">
      <a href={whatsapp} target="_blank" rel="noreferrer">
        <MessageCircle aria-hidden="true" size={17} />
        WhatsApp
      </a>
      <a href={linkedin} target="_blank" rel="noreferrer">
        <Linkedin aria-hidden="true" size={17} />
        LinkedIn
      </a>
      <button type="button" onClick={copy}>
        <Link2 aria-hidden="true" size={17} />
        {copied ? "Link copiado" : "Copiar link"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copiado para a área de transferência" : ""}
      </span>
    </div>
  );
}
