import { type PointerEvent as ReactPointerEvent } from "react";

export type ChromaPillar = {
  number: string;
  title: string;
  description: string;
};

type ChromaGridProps = {
  items: ChromaPillar[];
  className?: string;
};

/** React Bits ChromaGrid adapted from profile cards into diagnostic pillars. */
export default function ChromaGrid({ items, className = "" }: ChromaGridProps) {
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--chroma-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--chroma-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div className={`mc-chroma-grid ${className}`} onPointerMove={handlePointerMove}>
      {items.map((item) => (
        <article className="mc-chroma-card" key={item.number}>
          <span className="mc-chroma-number">{item.number}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
      <div className="mc-chroma-focus" aria-hidden="true" />
    </div>
  );
}
