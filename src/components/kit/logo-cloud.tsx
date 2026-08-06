import { cn } from "@/lib/utils";

export type LogoItem = { src: string; alt: string };

/** Muted logo strip that lights up on hover. */
export default function LogoCloud({
  logos,
  className,
  caption,
}: {
  logos: LogoItem[];
  className?: string;
  caption?: string;
}) {
  return (
    <div className={cn("kit-logo-cloud", className)}>
      {caption ? <p className="kit-logo-caption">{caption}</p> : null}
      <ul>
        {logos.map((logo) => (
          <li key={logo.alt}>
            <img src={logo.src} alt={logo.alt} loading="lazy" />
          </li>
        ))}
      </ul>
    </div>
  );
}
