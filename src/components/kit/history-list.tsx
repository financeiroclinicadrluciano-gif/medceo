import { cn } from "@/lib/utils";

export type HistoryEntry = {
  id: string;
  title: string;
  subtitle?: string;
  value?: string;
  status?: "done" | "pending" | "failed";
  date?: string;
};

/** Compact history / ledger list with status pills. */
export default function HistoryList({ entries, className }: { entries: HistoryEntry[]; className?: string }) {
  return (
    <ul className={cn("kit-history", className)}>
      {entries.map((entry) => (
        <li key={entry.id} className="kit-history-row">
          <div className="kit-history-main">
            <p>{entry.title}</p>
            {entry.subtitle ? <span>{entry.subtitle}</span> : null}
          </div>
          <div className="kit-history-side">
            {entry.value ? <strong>{entry.value}</strong> : null}
            {entry.status ? (
              <span className={cn("kit-status", `is-${entry.status}`)}>
                {entry.status === "done" ? "concluído" : entry.status === "pending" ? "em curso" : "parado"}
              </span>
            ) : null}
            {entry.date ? <time>{entry.date}</time> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
