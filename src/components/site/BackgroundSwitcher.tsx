import { useEffect, useState } from "react";

import "@/site-v3.css";

export type BackgroundVariant = "elite" | "clean";

const STORAGE_KEY = "medceo:bg-variant";

function apply(variant: BackgroundVariant) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-mc-bg", variant);
}

/**
 * Alternador temporário entre as duas variações de fundo do site
 * (Elite Cinematográfico e Minimal Clean) para decisão de direção visual.
 */
export default function BackgroundSwitcher() {
  const [variant, setVariant] = useState<BackgroundVariant>("elite");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    const initial: BackgroundVariant = stored === "clean" ? "clean" : "elite";
    setVariant(initial);
    apply(initial);
  }, []);

  const choose = (next: BackgroundVariant) => {
    setVariant(next);
    apply(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  if (!mounted) return null;

  return (
    <div className="mc-bg-switcher" role="group" aria-label="Variação de fundo do site">
      <span className="mc-bg-switcher-label">Fundo</span>
      <button
        type="button"
        onClick={() => choose("elite")}
        aria-pressed={variant === "elite"}
        className={variant === "elite" ? "is-active" : undefined}
      >
        Elite
      </button>
      <button
        type="button"
        onClick={() => choose("clean")}
        aria-pressed={variant === "clean"}
        className={variant === "clean" ? "is-active" : undefined}
      >
        Clean
      </button>
    </div>
  );
}
