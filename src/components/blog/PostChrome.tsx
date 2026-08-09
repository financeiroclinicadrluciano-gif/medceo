/**
 * Cromo de leitura do post: barra de progresso, barra fixa com o título e
 * índice lateral com scrollspy.
 *
 * Os três dependem do mesmo número (a posição do scroll), então dividem um
 * único listener com `requestAnimationFrame`. A barra de progresso anima
 * `transform: scaleX`, nunca `width` — largura força layout a cada quadro.
 */

import { useEffect, useRef, useState } from "react";

import type { Heading } from "@/lib/blog/markdown";

const BODY_ID = "mc-blog-body";
const RAIL_TOP = 132;

export default function PostChrome({
  title,
  headings,
  shareUrl,
}: {
  title: string;
  headings: Heading[];
  shareUrl: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  const [onPaper, setOnPaper] = useState(false);
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const body = document.getElementById(BODY_ID);
    if (!body) return;
    const paper = document.querySelector<HTMLElement>(".mc-blog-paper");

    let queued = false;

    const paint = () => {
      const scrolled = window.scrollY;
      const read = scrolled + window.innerHeight * 0.5 - body.offsetTop;
      const ratio = Math.min(1, Math.max(0, read / Math.max(1, body.offsetHeight)));

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }
      setSticky(scrolled > 320);

      // RAIL_TOP acompanha o `top` de `.mc-blog-rail` no CSS.
      if (paper) setOnPaper(paper.getBoundingClientRect().top <= RAIL_TOP);

      let current: string | null = headings[0]?.id ?? null;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top < 140) current = heading.id;
      }
      setActive(current);
      queued = false;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`;

  return (
    <>
      <div className="mc-blog-progress" aria-hidden="true">
        <div ref={barRef} className="mc-blog-progress-bar" />
      </div>

      <div className={`mc-blog-sticky${sticky ? " is-on" : ""}`} aria-hidden={!sticky}>
        <div className="mc-blog-sticky-inner">
          <p>{title}</p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            tabIndex={sticky ? 0 : -1}
            className="mc-blog-sticky-action"
          >
            Enviar no WhatsApp
          </a>
        </div>
      </div>

      {headings.length > 1 ? (
        <nav
          className={`mc-blog-rail${onPaper ? " is-on-paper" : ""}`}
          aria-label="Índice do artigo"
        >
          <p className="mc-blog-rail-title">Neste artigo</p>
          <ol>
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={active === heading.id ? "is-active" : undefined}
                  aria-current={active === heading.id ? "location" : undefined}
                >
                  {heading.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
    </>
  );
}
