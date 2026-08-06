import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type FluidParticlesBackgroundProps = {
  className?: string;
  count?: number;
  color?: string;
};

/**
 * Canvas particle field with soft drift and pointer attraction.
 * Runs on rAF, pauses when reduced motion is requested or the tab is hidden.
 */
export default function FluidParticlesBackground({
  className,
  count = 46,
  color = "205, 174, 88",
}: FluidParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999 };

    const particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      a: Math.random() * 0.4 + 0.12,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 1) particle.vy *= -1;

        const px = particle.x * width;
        const py = particle.y * height;
        const dx = pointer.x - px;
        const dy = pointer.y - py;
        const dist = Math.hypot(dx, dy);
        const boost = dist < 140 ? (1 - dist / 140) * 0.5 : 0;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, ${particle.a + boost})`;
        ctx.arc(px, py, particle.r + boost * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [color, count, reduce]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("kit-bg-canvas", className)} />;
}
