import { useState } from "react";
import { cn } from "@/lib/utils";

export type Chapter = {
  id: string;
  label: string;
  /** Optional description shown for the active chapter. */
  detail?: string;
};

/**
 * Horizontal chapter scrubber: segmented rail where each segment is a button.
 * Fully keyboard operable; the active chapter is announced via aria-current.
 */
export default function ChapterScrubber({
  chapters,
  className,
  onChange,
}: {
  chapters: Chapter[];
  className?: string;
  onChange?: (id: string) => void;
}) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const active = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];

  return (
    <div className={cn("kit-scrubber", className)}>
      <div className="kit-scrubber-rail" role="tablist" aria-label="Capítulos">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === activeId;
          return (
            <button
              key={chapter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "step" : undefined}
              className={cn("kit-scrubber-segment", isActive && "is-active")}
              onClick={() => {
                setActiveId(chapter.id);
                onChange?.(chapter.id);
              }}
            >
              <span className="kit-scrubber-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="kit-scrubber-label">{chapter.label}</span>
            </button>
          );
        })}
      </div>
      {active?.detail ? <p className="kit-scrubber-detail">{active.detail}</p> : null}
    </div>
  );
}
