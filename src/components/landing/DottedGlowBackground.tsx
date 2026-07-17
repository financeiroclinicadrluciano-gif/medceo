import { useEffect, useRef } from "react";

type DottedGlowBackgroundProps = {
  className?: string;
  dotColor?: string;
  glowColor?: string;
  gap?: number;
};

type CanvasMetrics = {
  width: number;
  height: number;
  ratio: number;
};

/**
 * Aceternity-inspired dotted glow, implemented with a small 2D canvas.
 * Rendering pauses outside the viewport and draws a static frame for users
 * who prefer reduced motion.
 */
export default function DottedGlowBackground({
  className = "",
  dotColor = "rgba(231, 210, 140, 0.16)",
  glowColor = "rgba(200, 169, 81, 0.56)",
  gap = 34,
}: DottedGlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let metrics: CanvasMetrics = { width: 0, height: 0, ratio: 1 };
    let animationFrame = 0;
    let visible = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      metrics = { width: rect.width, height: rect.height, ratio };
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time = 0) => {
      const { width, height } = metrics;
      context.clearRect(0, 0, width, height);

      const travel = reduceMotion ? 0.54 : (Math.sin(time * 0.00032) + 1) / 2;
      const glowX = width * (0.18 + travel * 0.64);
      const glowY = height * (0.72 - travel * 0.38);

      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          const distance = Math.hypot(x - glowX, y - glowY);
          const glow = Math.max(0, 1 - distance / Math.max(width * 0.3, 220));
          context.beginPath();
          context.arc(x, y, 0.9 + glow * 1.35, 0, Math.PI * 2);
          context.fillStyle =
            glow > 0.03 ? glowColor.replace(/([\d.]+)\)$/, `${0.14 + glow * 0.4})`) : dotColor;
          context.fill();
        }
      }
    };

    const loop = (time: number) => {
      draw(time);
      if (!reduceMotion && visible) animationFrame = requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      cancelAnimationFrame(animationFrame);
      if (visible && !reduceMotion) animationFrame = requestAnimationFrame(loop);
    });

    resize();
    draw();
    resizeObserver.observe(parent);
    intersectionObserver.observe(parent);
    if (!reduceMotion) animationFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [dotColor, glowColor, gap]);

  return <canvas ref={canvasRef} className={`mc-dotted-glow ${className}`} aria-hidden="true" />;
}
