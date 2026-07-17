import { type RefObject } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import drLucianoPortrait from "@/assets/medceo/dr-luciano-hero.jpg";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDiagnostic: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}

const methodSteps = [
  "Responder 20 perguntas objetivas sobre a operação da clínica.",
  "Comparar as respostas em cinco pilares de maturidade empresarial.",
  "Identificar o nível atual sem confundir faturamento com estrutura.",
  "Localizar o gargalo que deve ser tratado antes de buscar escala.",
  "Receber três próximos passos coerentes com o estágio encontrado.",
];

export default function VideoModal({
  isOpen,
  onClose,
  onStartDiagnostic,
  returnFocusRef,
}: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
        className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-4xl gap-0 overflow-y-auto rounded-md border-halo-primary/30 bg-halo-surface p-0 text-halo-text shadow-[0_24px_72px_rgba(7,19,29,0.58)] sm:rounded-md"
      >
        <div className="grid md:grid-cols-[0.82fr_1.18fr]">
          <figure className="relative min-h-64 overflow-hidden border-b border-halo-primary/20 md:min-h-[590px] md:border-b-0 md:border-r">
            <img
              src={drLucianoPortrait}
              alt="Dr. Luciano, fundador do MedCEO"
              className="absolute inset-0 h-full w-full object-cover object-[50%_28%]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-halo-bg/90 p-5 backdrop-blur-sm">
              <p className="font-serif text-lg">Dr. Luciano</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-halo-muted">
                Médico, gestor e fundador do MedCEO
              </p>
            </div>
          </figure>

          <div className="flex flex-col justify-center p-6 pt-16 md:p-10">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-halo-primary">
              Método de leitura · 5 pilares
            </p>
            <DialogTitle className="mt-3 font-serif text-2xl font-medium leading-tight md:text-4xl">
              O diagnóstico mostra onde a clínica perdeu comando.
            </DialogTitle>
            <DialogDescription className="mt-4 text-sm leading-relaxed text-halo-muted md:text-base">
              Não há vídeo simulado nem promessa de fórmula pronta. A experiência começa por uma
              leitura objetiva da clínica e transforma respostas em uma prioridade de gestão.
            </DialogDescription>

            <ol className="mt-7 border-y border-white/10">
              {methodSteps.map((step, index) => (
                <li
                  key={step}
                  className="grid grid-cols-[24px_1fr] gap-3 border-b border-white/10 py-3.5 text-sm leading-relaxed text-halo-muted last:border-b-0"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-halo-primary" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Etapa {index + 1}: </span>
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-7 border-l-2 border-halo-primary bg-halo-bg/45 p-4">
              <p className="text-sm leading-relaxed text-halo-muted">
                Resultado imediato na própria tela. Suas respostas não são enviadas a nenhum sistema
                externo nesta versão.
              </p>
            </div>

            <button
              type="button"
              onClick={onStartDiagnostic}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-halo-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-medceo-default transition-colors hover:bg-halo-primary-hover"
            >
              Começar diagnóstico
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
