import { useEffect, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";
import heroPortrait from "@/assets/medceo-business.jpg";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const subtitles = [
  { time: 0, text: "Doutor, doutora: se sua clínica já tem pacientes, equipe e faturamento, este vídeo é para você." },
  { time: 6, text: "Principalmente se, mesmo crescendo, tudo ainda depende da sua presença para funcionar bem." },
  { time: 12, text: "O problema não é vender mais consulta. É que a clínica cresceu antes da estrutura." },
  { time: 19, text: "Agenda cheia não é liberdade quando você não sabe a margem e toda decisão volta para você." },
  { time: 27, text: "Muitos médicos confundem crescimento com prisão operacional." },
  { time: 34, text: "A clínica fatura, mas rouba a vida que esse dinheiro deveria financiar." },
  { time: 41, text: "Se você saísse 30 dias, o que aconteceria com a operação?" },
  { time: 49, text: "Se a resposta for 'a clínica perde comando', você precisa mais do que pacientes." },
  { time: 56, text: "Você precisa saber o nível de maturidade empresarial da sua clínica." },
  { time: 63, text: "No MedCEO analisamos cinco pilares: diagnóstico, margem, comercial, operação e escala." },
];

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState("");
  const total = 660;

  useEffect(() => {
    if (!isOpen) {
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev + 1 >= total) {
          setIsPlaying(false);
          return total;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isOpen, isPlaying]);

  useEffect(() => {
    const match = subtitles.slice().reverse().find((s) => currentTime >= s.time);
    setActiveSubtitle(match?.text ?? "");
  }, [currentTime]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const format = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const progress = (currentTime / total) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-halo-primary/25 bg-halo-surface shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-halo-primary" />
            <h4 className="font-serif text-sm font-semibold md:text-base">
              Masterclass MedCEO — Método de Gestão de Clínicas
            </h4>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-halo-muted transition-colors hover:bg-white/5 hover:text-halo-text"
            aria-label="Fechar vídeo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-video overflow-hidden bg-black">
          <img
            src={heroPortrait}
            alt="Masterclass MedCEO"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
              isPlaying ? "scale-105 brightness-[0.45]" : "blur-[1px] brightness-[0.35]"
            }`}
          />
          <div className="absolute left-6 top-4 z-10 flex items-center gap-2 rounded border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-halo-primary" />
            Aula exclusiva
          </div>

          {activeSubtitle && (
            <div className="pointer-events-none absolute inset-x-6 bottom-20 z-10 flex justify-center">
              <div className="max-w-xl rounded-lg border border-white/10 bg-black/80 px-5 py-2.5 text-center text-xs font-medium text-white backdrop-blur-sm md:text-sm">
                {activeSubtitle}
              </div>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            {!isPlaying && currentTime < total && (
              <button
                onClick={() => setIsPlaying(true)}
                className="grid h-20 w-20 place-items-center rounded-full bg-halo-primary text-[#070807] shadow-2xl transition-transform hover:scale-105"
                aria-label="Reproduzir"
              >
                <Play className="ml-1 h-8 w-8 fill-current" />
              </button>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 pb-4 pt-10">
            <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-halo-primary" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-white/80">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/15"
                  aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                </button>
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/15"
                  aria-label={muted ? "Ativar som" : "Silenciar"}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <span className="font-mono">{format(currentTime)} / {format(total)}</span>
              </div>
              <span className="hidden font-mono uppercase tracking-wider text-white/60 md:inline">
                MedCEO · Masterclass
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
