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

type Option = { text: string; score: 1 | 3 | 5; description: string };
type Question = {
  id: number;
  pillar: PillarKey;
  question: string;
  options: [Option, Option, Option];
};
type PillarKey = "diagnostico" | "margem" | "comercial" | "operacao" | "escala";

const pillarMeta: Record<PillarKey, { label: string; short: string }> = {
  diagnostico: { label: "Diagnóstico", short: "01" },
  margem: { label: "Margem", short: "02" },
  comercial: { label: "Comercial", short: "03" },
  operacao: { label: "Operação", short: "04" },
  escala: { label: "Escala", short: "05" },
};

const questions: Question[] = [
  // Diagnóstico (dependência do dono / clareza)
  {
    id: 1,
    pillar: "diagnostico",
    question: "Qual o nível de dependência que a sua clínica tem de você hoje?",
    options: [
      {
        text: "Dependência total",
        score: 1,
        description: "Se eu me afasto por uma semana, a clínica para de faturar e operar.",
      },
      {
        text: "Dependência parcial",
        score: 3,
        description: "Outros profissionais atendem, mas todas as decisões passam por mim.",
      },
      {
        text: "Autonomia operacional",
        score: 5,
        description: "A operação roda por até 30 dias sem minha presença direta.",
      },
    ],
  },
  {
    id: 2,
    pillar: "diagnostico",
    question: "Você sabe exatamente onde a clínica está travada hoje?",
    options: [
      {
        text: "Sinto que trava, mas não sei onde",
        score: 1,
        description: "Percebo cansaço e teto de faturamento, sem clareza do gargalo real.",
      },
      {
        text: "Suspeito de um ou dois pontos",
        score: 3,
        description: "Tenho hipóteses (comercial, equipe, margem), mas nada mensurado.",
      },
      {
        text: "Diagnóstico mapeado",
        score: 5,
        description: "Sei qual pilar é o gargalo dominante e por que ele trava o próximo nível.",
      },
    ],
  },
  {
    id: 3,
    pillar: "diagnostico",
    question: "Como você toma decisões estratégicas na clínica?",
    options: [
      {
        text: "Por instinto e urgência",
        score: 1,
        description: "Decido no impulso, pressionado por problemas do dia.",
      },
      {
        text: "Com base em conversa e experiência",
        score: 3,
        description: "Consulto sócios e equipe, mas sem indicadores consolidados.",
      },
      {
        text: "Com base em indicadores",
        score: 5,
        description: "Uso métricas de faturamento, margem, conversão e produtividade.",
      },
    ],
  },
  {
    id: 4,
    pillar: "diagnostico",
    question: "Quanto tempo você dedica hoje à gestão estratégica (não clínica)?",
    options: [
      {
        text: "Praticamente nenhum",
        score: 1,
        description: "Todo meu tempo é consumido em atendimento e apagar incêndios.",
      },
      {
        text: "Algumas horas por semana",
        score: 3,
        description: "Consigo pensar em gestão, mas sem rotina fixa nem planejamento.",
      },
      {
        text: "Rotina estratégica semanal",
        score: 5,
        description: "Tenho agenda protegida para planejamento, análise e liderança.",
      },
    ],
  },

  // Margem (financeiro / lucratividade)
  {
    id: 5,
    pillar: "margem",
    question: "Como funciona o controle financeiro e de lucratividade?",
    options: [
      {
        text: "Foco no faturamento",
        score: 1,
        description: "Sei quanto faturamos, mas não conheço a margem real de cada procedimento.",
      },
      {
        text: "Acompanhamento mensal",
        score: 3,
        description: "Tenho fluxo de caixa e DRE simples, sem uso ativo para decisões.",
      },
      {
        text: "Margem por serviço",
        score: 5,
        description: "Sei a margem de cada linha, lucro previsível e reinvestimento planejado.",
      },
    ],
  },
  {
    id: 6,
    pillar: "margem",
    question: "Contas pessoais e da clínica estão separadas?",
    options: [
      {
        text: "Ainda se misturam",
        score: 1,
        description: "Uso conta e cartão da clínica para despesas pessoais com frequência.",
      },
      {
        text: "Em transição",
        score: 3,
        description: "Estamos separando, mas ainda há vazamentos e retiradas informais.",
      },
      {
        text: "Totalmente separadas",
        score: 5,
        description: "Pró-labore definido, retiradas previsíveis, patrimônios distintos.",
      },
    ],
  },
  {
    id: 7,
    pillar: "margem",
    question: "Qual o nível de previsibilidade do seu lucro líquido?",
    options: [
      {
        text: "Baixa",
        score: 1,
        description: "O lucro varia muito de mês a mês; sobra depende do movimento.",
      },
      {
        text: "Média",
        score: 3,
        description: "Sei estimar por trimestre, mas não confio em projeção anual.",
      },
      {
        text: "Alta",
        score: 5,
        description: "Tenho projeção anual confiável baseada em margem e capacidade.",
      },
    ],
  },
  {
    id: 8,
    pillar: "margem",
    question: "Você conhece o CAC (custo de aquisição de paciente) por canal?",
    options: [
      {
        text: "Não meço",
        score: 1,
        description: "Investimos em marketing, mas não medimos o retorno por canal.",
      },
      {
        text: "Estimo por conversa",
        score: 3,
        description: "Tenho ideia geral do retorno, sem dados formais.",
      },
      {
        text: "Meço e comparo",
        score: 5,
        description: "Sei CAC, LTV e ROI por canal e ajusto investimento com base neles.",
      },
    ],
  },

  // Comercial
  {
    id: 9,
    pillar: "comercial",
    question: "Como é estruturado o processo comercial da recepção à venda?",
    options: [
      {
        text: "Secretária apenas atende",
        score: 1,
        description: "Não temos vendas ativas, funil de WhatsApp ou metas comerciais.",
      },
      {
        text: "Processo reativo",
        score: 3,
        description: "Respondemos leads, mas sem métricas nem script claro.",
      },
      {
        text: "Comercial com método",
        score: 5,
        description: "CRM, script, metas diárias e time treinado em conversão.",
      },
    ],
  },
  {
    id: 10,
    pillar: "comercial",
    question: "O que acontece com os leads que chegam pelo WhatsApp?",
    options: [
      {
        text: "Muitos ficam sem resposta",
        score: 1,
        description: "Volume alto, resposta lenta e sem follow-up estruturado.",
      },
      {
        text: "Respondemos, mas sem qualificar",
        score: 3,
        description: "Falamos com todos, mas não temos qualificação nem funil.",
      },
      {
        text: "Funil qualificado",
        score: 5,
        description: "Todo lead passa por qualificação, agendamento e reengajamento.",
      },
    ],
  },
  {
    id: 11,
    pillar: "comercial",
    question: "Qual sua taxa de conversão de consulta para tratamento?",
    options: [
      {
        text: "Não medimos",
        score: 1,
        description: "Não temos indicador de fechamento por médico ou tratamento.",
      },
      {
        text: "Medimos de forma geral",
        score: 3,
        description: "Sabemos a média da clínica, sem quebra por médico ou canal.",
      },
      {
        text: "Medimos com granularidade",
        score: 5,
        description: "Sabemos conversão por médico, procedimento, canal e vendedor.",
      },
    ],
  },
  {
    id: 12,
    pillar: "comercial",
    question: "Como está o follow-up de pacientes que não fecharam?",
    options: [
      {
        text: "Praticamente inexistente",
        score: 1,
        description: "Se o paciente não fecha na hora, raramente volta a ser contatado.",
      },
      {
        text: "Feito às vezes",
        score: 3,
        description: "Fazemos quando lembramos, sem cadência definida.",
      },
      {
        text: "Cadência estruturada",
        score: 5,
        description: "Fluxo de reengajamento por dias/temas com métricas de retorno.",
      },
    ],
  },

  // Operação
  {
    id: 13,
    pillar: "operacao",
    question: "Como é a jornada do paciente e a padronização das entregas?",
    options: [
      {
        text: "Informal",
        score: 1,
        description: "A jornada depende de quem atende; não há protocolo escrito.",
      },
      {
        text: "Protocolos básicos",
        score: 3,
        description: "Existem passos descritos, mas a execução varia bastante.",
      },
      {
        text: "Jornada sistematizada",
        score: 5,
        description: "Cada ponto segue protocolo com auditoria de qualidade.",
      },
    ],
  },
  {
    id: 14,
    pillar: "operacao",
    question: "Sua equipe tem autonomia para resolver problemas do dia?",
    options: [
      {
        text: "Baixa",
        score: 1,
        description: "Tudo passa por mim, mesmo decisões pequenas do operacional.",
      },
      {
        text: "Média",
        score: 3,
        description: "Resolvem parte, mas têm receio de agir sem confirmação.",
      },
      {
        text: "Alta",
        score: 5,
        description: "Matriz de autonomia clara, com alçadas e responsabilidades definidas.",
      },
    ],
  },
  {
    id: 15,
    pillar: "operacao",
    question: "Como funciona a contratação e o treinamento da equipe?",
    options: [
      {
        text: "Contrato pela urgência",
        score: 1,
        description: "Contrato conhecidos ou indicações, sem processo estruturado.",
      },
      {
        text: "Processo básico",
        score: 3,
        description: "Uso entrevistas e teste, mas onboarding é feito no dia a dia.",
      },
      {
        text: "Processo estruturado",
        score: 5,
        description: "Perfil, entrevista, teste, treinamento e trilha de desenvolvimento.",
      },
    ],
  },
  {
    id: 16,
    pillar: "operacao",
    question: "Existe um gestor operacional (não médico) na sua clínica?",
    options: [
      {
        text: "Não, quem gerencia sou eu",
        score: 1,
        description: "Acumulo o papel de médico e gestor operacional.",
      },
      {
        text: "Existe, mas de forma parcial",
        score: 3,
        description: "Alguém coordena, mas eu ainda decido rotina e conflitos.",
      },
      {
        text: "Sim, com autonomia",
        score: 5,
        description: "Gestor executivo conduz a operação com autonomia e prestação de contas.",
      },
    ],
  },

  // Escala
  {
    id: 17,
    pillar: "escala",
    question: "Qual a prontidão atual da clínica para expansão ou replicação?",
    options: [
      {
        text: "Sem condições",
        score: 1,
        description: "Gargalos operacionais e falta de processos impedem qualquer expansão.",
      },
      {
        text: "Preparação inicial",
        score: 3,
        description: "Estamos estruturando processos para receber sócios ou nova unidade.",
      },
      {
        text: "Prontidão para escala",
        score: 5,
        description: "Estrutura pronta para nova unidade ou expansão de time médico.",
      },
    ],
  },
  {
    id: 18,
    pillar: "escala",
    question: "Se você ficasse 30 dias fora, o que aconteceria?",
    options: [
      {
        text: "A clínica entra em colapso",
        score: 1,
        description: "Faturamento cai e decisões param sem minha presença.",
      },
      {
        text: "Segue com dificuldades",
        score: 3,
        description: "Roda, mas com queda de qualidade, receita e clima interno.",
      },
      {
        text: "Segue estável",
        score: 5,
        description: "Operação, comercial e financeiro mantêm padrão sem mim.",
      },
    ],
  },
  {
    id: 19,
    pillar: "escala",
    question: "Existe um plano estratégico de 12 meses documentado?",
    options: [
      {
        text: "Não",
        score: 1,
        description: "Tocamos por metas mensais informais e reação ao mercado.",
      },
      {
        text: "Existe em rascunho",
        score: 3,
        description: "Tenho ideias e metas anuais, mas sem plano executável.",
      },
      {
        text: "Existe e é acompanhado",
        score: 5,
        description: "Plano com metas, indicadores e rituais de revisão trimestral.",
      },
    ],
  },
  {
    id: 20,
    pillar: "escala",
    question: "O que você quer da clínica nos próximos 12 meses?",
    options: [
      {
        text: "Sobreviver com menos desgaste",
        score: 1,
        description: "Preciso primeiro estabilizar o que já existe antes de crescer.",
      },
      {
        text: "Crescer com estrutura",
        score: 3,
        description: "Quero crescer 30–60% com processos e equipe mais autônomos.",
      },
      {
        text: "Escalar de forma previsível",
        score: 5,
        description: "Quero preparar nova unidade, novos médicos ou sociedade.",
      },
    ],
  },
];

type Result = {
  level: number;
  title: string;
  subtitle: string;
  description: string;
  actions: string[];
  bottlenecks: { pillar: PillarKey; score: number }[];
};

function buildResult(answers: Record<number, number>): Result {
  const validAnswerCount = questions.filter((question) =>
    [1, 3, 5].includes(answers[question.id]),
  ).length;
  if (validAnswerCount !== questions.length) {
    throw new Error("O resultado só pode ser calculado com as 20 respostas válidas.");
  }

  const total = questions.reduce((sum, question) => sum + answers[question.id], 0);

  // pillar scores
  const pillarScore: Record<PillarKey, number> = {
    diagnostico: 0,
    margem: 0,
    comercial: 0,
    operacao: 0,
    escala: 0,
  };
  const pillarCount: Record<PillarKey, number> = {
    diagnostico: 0,
    margem: 0,
    comercial: 0,
    operacao: 0,
    escala: 0,
  };
  for (const q of questions) {
    const s = answers[q.id];
    pillarScore[q.pillar] += s;
    pillarCount[q.pillar] += 1;
  }
  const pillarAvg = (Object.keys(pillarScore) as PillarKey[]).map((k) => ({
    pillar: k,
    avg: pillarScore[k] / pillarCount[k],
    total: pillarScore[k],
  }));
  const lowestAverage = Math.min(...pillarAvg.map((entry) => entry.avg));
  const bottlenecks = pillarAvg
    .filter((entry) => entry.avg === lowestAverage)
    .map((entry) => ({ pillar: entry.pillar, score: entry.total }));

  const levels: Omit<Result, "bottlenecks">[] = [
    {
      level: 1,
      title: "Nível 1 — Improviso",
      subtitle: "O dono é o sistema. Nada roda sem ele.",
      description:
        "A operação, o comercial e as finanças dependem da sua energia pessoal. Faturar mais agora significa cansar mais. Antes de escalar, é preciso tirar decisões da sua cabeça e criar as primeiras rotinas.",
      actions: [
        "Documentar as 3 principais tarefas da recepção.",
        "Separar de forma definitiva contas pessoais e da clínica.",
        "Mapear onde seu tempo é consumido por burocracia.",
      ],
    },
    {
      level: 2,
      title: "Nível 2 — Organização",
      subtitle: "Existe rotina, mas a decisão ainda é toda do médico.",
      description:
        "A clínica fatura e tem alguma organização, mas o dono ainda centraliza. A equipe hesita em agir sem autorização e o comercial perde leads no WhatsApp. Falta transferir decisão para papéis definidos.",
      actions: [
        "Criar matriz de autonomia por cargo.",
        "Estipular orçamento operacional mensal por área.",
        "Treinar recepção com roteiro de conversão de WhatsApp.",
      ],
    },
    {
      level: 3,
      title: "Nível 3 — Gestão",
      subtitle: "Indicadores guiam decisão. Papéis definidos.",
      description:
        "A clínica opera com indicadores básicos e papéis claros. O próximo desafio é aumentar previsibilidade de lucro e sistematizar a jornada do paciente para sustentar crescimento sem depender do dono.",
      actions: [
        "Definir metas comerciais semanais com incentivos ao time.",
        "Desenhar o manual de atendimento do paciente ideal.",
        "Analisar CAC e LTV por canal de aquisição.",
      ],
    },
    {
      level: 4,
      title: "Nível 4 — Previsibilidade",
      subtitle: "Margem clara, comercial com método, entrega sistêmica.",
      description:
        "A clínica funciona como empresa: metas, relatórios de lucratividade e comercial que não perde leads. Você já se ausenta por períodos curtos. Agora o foco é preparar a próxima unidade ou nova camada de liderança.",
      actions: [
        "Criar plano de transição de liderança operacional.",
        "Padronizar protocolo clínico para médicos parceiros.",
        "Otimizar funil financeiro para retenção de caixa para expansão.",
      ],
    },
    {
      level: 5,
      title: "Nível 5 — Escala",
      subtitle: "A empresa opera sem o dono. Estrutura sustenta novas unidades.",
      description:
        "Sua empresa médica tem alto valor de mercado. Liberdade de tempo, operação independente do seu atendimento clínico e estrutura pronta para expansão. Agora é hora de governança e replicação estratégica.",
      actions: [
        "Avaliar oportunidades de M&A e novas linhas de receita.",
        "Estabelecer governança corporativa e conselho consultivo.",
        "Desenvolver playbook de replicação ou franquia.",
      ],
    },
  ];

  // 20 questions, min 20, max 100
  let idx = 0;
  if (total <= 36) idx = 0;
  else if (total <= 55) idx = 1;
  else if (total <= 72) idx = 2;
  else if (total <= 88) idx = 3;
  else idx = 4;

  return { ...levels[idx], bottlenecks };
}

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
                  href="#maturidade"
                  onClick={onClose}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-halo-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-medceo-default transition-colors hover:bg-halo-primary-hover"
                >
                  Revisar o mapa de maturidade
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
