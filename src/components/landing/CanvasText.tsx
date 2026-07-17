import { useEffect, useRef } from "react";

type CanvasTextProps = {
  text: string;
  className?: string;
};

/**
 * Aceternity Canvas Text reinterpreted as an editorial light sweep.
 * The canvas renders one short word, pauses offscreen and stays static for
 * reduced-motion users, keeping the effect subordinate to the message.
 */
export default function CanvasText({ text, className = "" }: CanvasTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = rect.width;
      height = Math.max(74, Math.min(156, rect.width * 0.18));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const fontSize = Math.min(height * 0.82, width * 0.2);
      context.font = `400 ${fontSize}px "Playfair Display", Georgia, serif`;
      context.textBaseline = "middle";
      context.textAlign = "left";

      const sweep = reduced ? 0.62 : (Math.sin(time * 0.0011) + 1) / 2;
      const gradient = context.createLinearGradient(0, 0, width, 0);
      const center = 0.18 + sweep * 0.55;
      gradient.addColorStop(0, "#12202D");
      gradient.addColorStop(Math.max(0, center - 0.16), "#12202D");
      gradient.addColorStop(center, "#C8A951");
      gradient.addColorStop(Math.min(1, center + 0.18), "#12202D");
      gradient.addColorStop(1, "#12202D");
      context.fillStyle = gradient;
      context.fillText(text, 0, height * 0.5);

      context.globalCompositeOperation = "source-atop";
      context.globalAlpha = 0.1;
      for (let x = 0; x < width; x += 7) {
        context.fillStyle = x % 14 === 0 ? "#F7F0E4" : "#07131D";
        context.fillRect(x, 0, 1, height);
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };

    const loop = (time: number) => {
      draw(time);
      if (!reduced && visible) frame = requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      cancelAnimationFrame(frame);
      if (visible && !reduced) frame = requestAnimationFrame(loop);
    });

    const start = async () => {
      await document.fonts.ready;
      if (cancelled) return;
      resize();
      draw();
      resizeObserver.observe(parent);
      intersectionObserver.observe(parent);
      if (!reduced) frame = requestAnimationFrame(loop);
    };
    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [text]);

  return (
    <span className={`mc-canvas-text-wrap ${className}`} role="img" aria-label={text}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </span>
  );
}
