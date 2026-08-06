import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Check,
  ChevronLeft,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}

import {
  buildResult,
  pillarMeta,
  questions,
  type PillarKey,
  type Question,
  type Result,
} from "@/lib/diagnostic-data";


export default function DiagnosticModal({ isOpen, onClose, returnFocusRef }: DiagnosticModalProps) {
  const [step, setStep] = useState<number>(0); // 0 intro, 1..20 questions, 21 loading, 22 result
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      setStep(0);
      setAnswers({});
      setIsTransitioning(false);
    }
  }, [isOpen]);

  useEffect(
    () => () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || step === 0) return;
    const frame = requestAnimationFrame(() =>
      stageHeadingRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [isOpen, step]);

  const result = useMemo(
    () =>
      step === 22 && Object.keys(answers).length === questions.length ? buildResult(answers) : null,
    [step, answers],
  );

  const handleSelect = (qid: number, score: number) => {
    if (isTransitioning || step < 1 || step > questions.length) return;

    const isLastQuestion = step === questions.length;
    setIsTransitioning(true);
    setAnswers((previous) => ({ ...previous, [qid]: score }));

    transitionTimerRef.current = setTimeout(() => {
      if (!isLastQuestion) {
        setStep(step + 1);
        setIsTransitioning(false);
        return;
      }

      setStep(21);
      resultTimerRef.current = setTimeout(() => {
        setStep(22);
        setIsTransitioning(false);
      }, 700);
    }, 140);
  };

  const currentQuestion = step > 0 && step <= 20 ? questions[step - 1] : null;
  const progress = step > 0 && step <= 20 ? (step / 20) * 100 : 0;
  const bottleneckLabel = result
    ? result.bottlenecks.map(({ pillar }) => pillarMeta[pillar].label).join(" + ")
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
        className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-md border-halo-primary/30 bg-halo-surface p-0 text-halo-text shadow-[0_24px_72px_rgba(7,19,29,0.58)] sm:rounded-md"
      >
        <div className="flex items-center border-b border-white/10 px-5 py-4 pr-16 md:px-6 md:pr-16">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-sm border border-halo-primary/25 bg-halo-primary/8 text-halo-primary">
              <Award className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-primary">
                Diagnóstico MedCEO
              </DialogTitle>
              <DialogDescription className="block text-[11px] text-halo-muted">
                Maturidade empresarial médica · 20 perguntas
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto">
          {/* Intro */}
          {step === 0 && (
            <div className="p-7 text-center md:p-9">
              <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-sm border border-halo-primary/30 bg-halo-primary/8 text-halo-primary">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-2xl font-semibold md:text-3xl">
                Descubra a maturidade da sua clínica
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-halo-muted">
                20 perguntas estratégicas em 5 pilares: diagnóstico, margem, comercial, operação e
                escala. Ao final, você recebe seu nível de maturidade, o gargalo prioritário e três
                próximos passos coerentes com o resultado.
              </p>
              <button
                onClick={() => setStep(1)}
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-halo-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-medceo-default transition-colors hover:bg-halo-primary-hover"
              >
                Iniciar diagnóstico gratuito
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-halo-muted">
                ~5 minutos · resultado imediato · 100% gratuito
              </p>
            </div>
          )}

          {/* Questions */}
          {currentQuestion && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-primary">
                    Pilar {pillarMeta[currentQuestion.pillar].short} ·{" "}
                    {pillarMeta[currentQuestion.pillar].label}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-halo-muted">
                    {step}/20
                  </span>
                </div>
                <div
                  className="h-1 w-full overflow-hidden bg-white/10"
                  role="progressbar"
                  aria-label="Progresso do diagnóstico"
                  aria-valuemin={1}
                  aria-valuemax={questions.length}
                  aria-valuenow={step}
                >
                  <div
                    className="h-full bg-halo-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <h3
                id="question-title"
                ref={stageHeadingRef}
                tabIndex={-1}
                className="font-serif text-xl font-semibold leading-snug outline-none md:text-2xl"
              >
                {currentQuestion.question}
              </h3>

              <div className="mt-6 space-y-3" role="radiogroup" aria-labelledby="question-title">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = answers[currentQuestion.id] === opt.score;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isTransitioning}
                      onClick={() => handleSelect(currentQuestion.id, opt.score)}
                      className={`group min-h-11 w-full rounded-md border p-4 text-left transition-colors disabled:cursor-wait disabled:opacity-70 md:p-5 ${
                        isSelected
                          ? "border-halo-primary bg-halo-primary/5"
                          : "border-white/20 bg-white/[0.02] hover:border-halo-primary/50 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-sm border transition-colors ${
                            isSelected
                              ? "border-halo-primary bg-halo-primary text-medceo-default"
                              : "border-halo-muted"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                          )}
                        </span>
                        <div>
                          <span className="block text-sm font-semibold text-halo-text">
                            {opt.text}
                          </span>
                          <p className="mt-1 text-[13px] leading-relaxed text-halo-muted">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                <button
                  type="button"
                  disabled={isTransitioning}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="flex min-h-11 items-center gap-1.5 px-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-muted transition-colors hover:text-halo-text disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Voltar
                </button>
                <span className="max-w-[240px] text-right text-[11px] italic text-halo-muted">
                  Respostas mantidas apenas nesta sessão
                </span>
              </div>
            </div>
          )}

          {/* Processing */}
          {step === 21 && (
            <div
              className="flex flex-col items-center justify-center p-10 text-center"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-8 w-8 animate-spin text-halo-primary" aria-hidden="true" />
              <h3
                ref={stageHeadingRef}
                tabIndex={-1}
                className="mt-4 font-serif text-lg outline-none"
              >
                Analisando as suas respostas…
              </h3>
              <p className="mt-1 text-xs text-halo-muted">
                Calculando maturidade, menor pontuação e próximos passos.
              </p>
            </div>
          )}

          {/* Result */}
          {step === 22 && result && (
            <div className="p-6 md:p-8">
              <div className="text-center">
                <span className="inline-block rounded-sm border border-halo-primary/40 bg-halo-primary/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-primary">
                  Resultado do diagnóstico
                </span>
                <h3
                  ref={stageHeadingRef}
                  tabIndex={-1}
                  className="mt-3 font-serif text-2xl font-semibold outline-none md:text-3xl"
                >
                  {result.title}
                </h3>
                <p className="mt-1 text-sm italic text-halo-primary">"{result.subtitle}"</p>
              </div>

              <div className="mt-6 rounded-md border border-white/15 bg-white/[0.02] p-5">
                <h5 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-text">
                  <TrendingUp className="h-4 w-4 text-halo-primary" aria-hidden="true" /> Análise de
                  maturidade
                </h5>
                <p className="mt-3 text-[13px] leading-relaxed text-halo-muted">
                  {result.description}
                </p>

                <div className="my-4 h-px bg-white/10" />

                <h5 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-text">
                  <AlertTriangle className="h-4 w-4 text-halo-primary" aria-hidden="true" />
                  {result.bottlenecks.length > 1
                    ? "Pilares prioritários"
                    : "Pilar prioritário"}: {bottleneckLabel}
                </h5>
                <p className="mt-2 text-[13px] leading-relaxed text-halo-muted">
                  {result.bottlenecks.length > 1
                    ? "Esses pilares empataram com a menor pontuação. A decisão correta é validar qual deles gera o maior efeito em cadeia antes de acelerar os demais."
                    : "Este foi o pilar com menor pontuação nas suas respostas e deve orientar a primeira decisão antes de acelerar os demais."}
                </p>

                <div className="my-4 h-px bg-white/10" />

                <h5 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-text">
                  <Sparkles className="h-4 w-4 text-halo-primary" aria-hidden="true" /> Próximos
                  passos recomendados
                </h5>
                <ul className="mt-3 space-y-2.5">
                  {result.actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-halo-text">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-halo-primary/12 font-mono text-[10px] font-semibold text-halo-primary">
                        {i + 1}
                      </span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-md border border-halo-primary/30 bg-halo-bg/45 p-5 md:p-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-primary">
                  Leitura inicial concluída
                </p>
                <h4 className="mt-2 font-serif text-lg font-semibold md:text-xl">
                  Seu resultado foi calculado sem coletar dados pessoais.
                </h4>
                <p className="mt-2 text-[13px] leading-relaxed text-halo-muted">
                  Use esta leitura para organizar a próxima conversa de gestão. Uma avaliação
                  aprofundada exige validar indicadores, contexto e capacidade de execução com o
                  time MedCEO.
                </p>
                <a
                  href="https://wa.me/554184875688?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20mentoria%21"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-halo-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-medceo-default transition-colors hover:bg-halo-primary-hover"
                >
                  Falar com o time MedCEO
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-halo-muted">
                <button
                  type="button"
                  onClick={() => {
                    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
                    setAnswers({});
                    setStep(0);
                    setIsTransitioning(false);
                  }}
                  className="min-h-11 px-3 underline underline-offset-4 hover:text-halo-text"
                >
                  Refazer o diagnóstico
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
