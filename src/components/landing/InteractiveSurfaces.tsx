import {
  useRef,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type SurfaceProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function SpotlightSurface({ children, className = "", ...props }: SurfaceProps) {
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      className={`mc-spotlight-surface ${className}`}
      onPointerMove={handlePointerMove}
      {...props}
    >
      {children}
    </div>
  );
}

export function TiltSurface({ children, className = "", ...props }: SurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${-y * 5}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${x * 5}deg`);
  };

  const reset = () => {
    rootRef.current?.style.setProperty("--tilt-x", "0deg");
    rootRef.current?.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={rootRef}
      className={`mc-tilt-surface ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      {...props}
    >
      {children}
    </div>
  );
}
