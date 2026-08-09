/**
 * FAQ do post em acordeão.
 *
 * Usa `<details>/<summary>` nativo, como o layout aprovado: já vem com
 * semântica de expansão, foco e teclado sem nenhum JavaScript, e não anima
 * altura. O sinal de aberto/fechado gira com `transform`.
 */

import type { FaqPair } from "@/lib/blog/markdown";

export default function PostFaq({ items }: { items: FaqPair[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mc-blog-faq">
      {items.map((item, index) => (
        <details key={item.question} open={index === 0}>
          <summary>
            <span>{item.question}</span>
            <span className="mc-blog-faq-sign" aria-hidden="true">
              +
            </span>
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
