import { useEffect, useMemo, useState } from "react";
import {
  X, Check, ChevronLeft, Award, Sparkles, TrendingUp, AlertTriangle, ArrowRight, Loader2,
} from "lucide-react";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Option = { text: string; score: 1 | 3 | 5; description: string };
type Question = { id: number; pillar: PillarKey; question: string; options: [Option, Option, Option] };
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
    id: 1, pillar: "diagnostico",
    question: "Qual o nível de dependência que a sua clínica tem de você hoje?",
    options: [
      { text: "Dependência total", score: 1, description: "Se eu me afasto por uma semana, a clínica para de faturar e operar." },
      { text: "Dependência parcial", score: 3, description: "Outros profissionais atendem, mas todas as decisões passam por mim." },
      { text: "Autonomia operacional", score: 5, description: "A operação roda por até 30 dias sem minha presença direta." },
    ],
  },
  {
    id: 2, pillar: "diagnostico",
    question: "Você sabe exatamente onde a clínica está travada hoje?",
    options: [
      { text: "Sinto que trava, mas não sei onde", score: 1, description: "Percebo cansaço e teto de faturamento, sem clareza do gargalo real." },
      { text: "Suspeito de um ou dois pontos", score: 3, description: "Tenho hipóteses (comercial, equipe, margem), mas nada mensurado." },
      { text: "Diagnóstico mapeado", score: 5, description: "Sei qual pilar é o gargalo dominante e por que ele trava o próximo nível." },
    ],
  },
  {
    id: 3, pillar: "diagnostico",
    question: "Como você toma decisões estratégicas na clínica?",
    options: [
      { text: "Por instinto e urgência", score: 1, description: "Decido no impulso, pressionado por problemas do dia." },
      { text: "Com base em conversa e experiência", score: 3, description: "Consulto sócios e equipe, mas sem indicadores consolidados." },
      { text: "Com base em indicadores", score: 5, description: "Uso métricas de faturamento, margem, conversão e produtividade." },
    ],
  },
  {
    id: 4, pillar: "diagnostico",
    question: "Quanto tempo você dedica hoje à gestão estratégica (não clínica)?",
    options: [
      { text: "Praticamente nenhum", score: 1, description: "Todo meu tempo é consumido em atendimento e apagar incêndios." },
      { text: "Algumas horas por semana", score: 3, description: "Consigo pensar em gestão, mas sem rotina fixa nem planejamento." },
      { text: "Rotina estratégica semanal", score: 5, description: "Tenho agenda protegida para planejamento, análise e liderança." },
    ],
  },

  // Margem (financeiro / lucratividade)
  {
    id: 5, pillar: "margem",
    question: "Como funciona o controle financeiro e de lucratividade?",
    options: [
      { text: "Foco no faturamento", score: 1, description: "Sei quanto faturamos, mas não conheço a margem real de cada procedimento." },
      { text: "Acompanhamento mensal", score: 3, description: "Tenho fluxo de caixa e DRE simples, sem uso ativo para decisões." },
      { text: "Margem por serviço", score: 5, description: "Sei a margem de cada linha, lucro previsível e reinvestimento planejado." },
    ],
  },
  {
    id: 6, pillar: "margem",
    question: "Contas pessoais e da clínica estão separadas?",
    options: [
      { text: "Ainda se misturam", score: 1, description: "Uso conta e cartão da clínica para despesas pessoais com frequência." },
      { text: "Em transição", score: 3, description: "Estamos separando, mas ainda há vazamentos e retiradas informais." },
      { text: "Totalmente separadas", score: 5, description: "Pró-labore definido, retiradas previsíveis, patrimônios distintos." },
    ],
  },
  {
    id: 7, pillar: "margem",
    question: "Qual o nível de previsibilidade do seu lucro líquido?",
    options: [
      { text: "Baixa", score: 1, description: "O lucro varia muito de mês a mês; sobra depende do movimento." },
      { text: "Média", score: 3, description: "Sei estimar por trimestre, mas não confio em projeção anual." },
      { text: "Alta", score: 5, description: "Tenho projeção anual confiável baseada em margem e capacidade." },
    ],
  },
  {
    id: 8, pillar: "margem",
    question: "Você conhece o CAC (custo de aquisição de paciente) por canal?",
    options: [
      { text: "Não meço", score: 1, description: "Investimos em marketing, mas não medimos o retorno por canal." },
      { text: "Estimo por conversa", score: 3, description: "Tenho ideia geral do retorno, sem dados formais." },
      { text: "Meço e comparo", score: 5, description: "Sei CAC, LTV e ROI por canal e ajusto investimento com base neles." },
    ],
  },

  // Comercial
  {
    id: 9, pillar: "comercial",
    question: "Como é estruturado o processo comercial da recepção à venda?",
    options: [
      { text: "Secretária apenas atende", score: 1, description: "Não temos vendas ativas, funil de WhatsApp ou metas comerciais." },
      { text: "Processo reativo", score: 3, description: "Respondemos leads, mas sem métricas nem script claro." },
      { text: "Comercial com método", score: 5, description: "CRM, script, metas diárias e time treinado em conversão." },
    ],
  },
  {
    id: 10, pillar: "comercial",
    question: "O que acontece com os leads que chegam pelo WhatsApp?",
    options: [
      { text: "Muitos ficam sem resposta", score: 1, description: "Volume alto, resposta lenta e sem follow-up estruturado." },
      { text: "Respondemos, mas sem qualificar", score: 3, description: "Falamos com todos, mas não temos qualificação nem funil." },
      { text: "Funil qualificado", score: 5, description: "Todo lead passa por qualificação, agendamento e reengajamento." },
    ],
  },
  {
    id: 11, pillar: "comercial",
    question: "Qual sua taxa de conversão de consulta para tratamento?",
    options: [
      { text: "Não medimos", score: 1, description: "Não temos indicador de fechamento por médico ou tratamento." },
      { text: "Medimos de forma geral", score: 3, description: "Sabemos a média da clínica, sem quebra por médico ou canal." },
      { text: "Medimos com granularidade", score: 5, description: "Sabemos conversão por médico, procedimento, canal e vendedor." },
    ],
  },
  {
    id: 12, pillar: "comercial",
    question: "Como está o follow-up de pacientes que não fecharam?",
    options: [
      { text: "Praticamente inexistente", score: 1, description: "Se o paciente não fecha na hora, raramente volta a ser contatado." },
      { text: "Feito às vezes", score: 3, description: "Fazemos quando lembramos, sem cadência definida." },
      { text: "Cadência estruturada", score: 5, description: "Fluxo de reengajamento por dias/temas com métricas de retorno." },
    ],
  },

  // Operação
  {
    id: 13, pillar: "operacao",
    question: "Como é a jornada do paciente e a padronização das entregas?",
    options: [
      { text: "Informal", score: 1, description: "A jornada depende de quem atende; não há protocolo escrito." },
      { text: "Protocolos básicos", score: 3, description: "Existem passos descritos, mas a execução varia bastante." },
      { text: "Jornada sistematizada", score: 5, description: "Cada ponto segue protocolo com auditoria de qualidade." },
    ],
  },
  {
    id: 14, pillar: "operacao",
    question: "Sua equipe tem autonomia para resolver problemas do dia?",
    options: [
      { text: "Baixa", score: 1, description: "Tudo passa por mim, mesmo decisões pequenas do operacional." },
      { text: "Média", score: 3, description: "Resolvem parte, mas têm receio de agir sem confirmação." },
      { text: "Alta", score: 5, description: "Matriz de autonomia clara, com alçadas e responsabilidades definidas." },
    ],
  },
  {
    id: 15, pillar: "operacao",
    question: "Como funciona a contratação e o treinamento da equipe?",
    options: [
      { text: "Contrato pela urgência", score: 1, description: "Contrato conhecidos ou indicações, sem processo estruturado." },
      { text: "Processo básico", score: 3, description: "Uso entrevistas e teste, mas onboarding é feito no dia a dia." },
      { text: "Processo estruturado", score: 5, description: "Perfil, entrevista, teste, treinamento e trilha de desenvolvimento." },
    ],
  },
  {
    id: 16, pillar: "operacao",
    question: "Existe um gestor operacional (não médico) na sua clínica?",
    options: [
      { text: "Não, quem gerencia sou eu", score: 1, description: "Acumulo o papel de médico e gestor operacional." },
      { text: "Existe, mas de forma parcial", score: 3, description: "Alguém coordena, mas eu ainda decido rotina e conflitos." },
      { text: "Sim, com autonomia", score: 5, description: "Gestor executivo conduz a operação com autonomia e prestação de contas." },
    ],
  },

  // Escala
  {
    id: 17, pillar: "escala",
    question: "Qual a prontidão atual da clínica para expansão ou replicação?",
    options: [
      { text: "Sem condições", score: 1, description: "Gargalos operacionais e falta de processos impedem qualquer expansão." },
      { text: "Preparação inicial", score: 3, description: "Estamos estruturando processos para receber sócios ou nova unidade." },
      { text: "Prontidão para escala", score: 5, description: "Estrutura pronta para nova unidade ou expansão de time médico." },
    ],
  },
  {
    id: 18, pillar: "escala",
    question: "Se você ficasse 30 dias fora, o que aconteceria?",
    options: [
      { text: "A clínica entra em colapso", score: 1, description: "Faturamento cai e decisões param sem minha presença." },
      { text: "Segue com dificuldades", score: 3, description: "Roda, mas com queda de qualidade, receita e clima interno." },
      { text: "Segue estável", score: 5, description: "Operação, comercial e financeiro mantêm padrão sem mim." },
    ],
  },
  {
    id: 19, pillar: "escala",
    question: "Existe um plano estratégico de 12 meses documentado?",
    options: [
      { text: "Não", score: 1, description: "Tocamos por metas mensais informais e reação ao mercado." },
      { text: "Existe em rascunho", score: 3, description: "Tenho ideias e metas anuais, mas sem plano executável." },
      { text: "Existe e é acompanhado", score: 5, description: "Plano com metas, indicadores e rituais de revisão trimestral." },
    ],
  },
  {
    id: 20, pillar: "escala",
    question: "O que você quer da clínica nos próximos 12 meses?",
    options: [
      { text: "Sobreviver com menos desgaste", score: 1, description: "Preciso primeiro estabilizar o que já existe antes de crescer." },
      { text: "Crescer com estrutura", score: 3, description: "Quero crescer 30–60% com processos e equipe mais autônomos." },
      { text: "Escalar de forma previsível", score: 5, description: "Quero preparar nova unidade, novos médicos ou sociedade." },
    ],
  },
];

type Result = {
  level: number;
  title: string;
  subtitle: string;
  description: string;
  actions: string[];
  bottleneck: { pillar: PillarKey; score: number };
  badgeClass: string;
};

function buildResult(answers: Record<number, number>): Result {
  const total = Object.values(answers).reduce((s, v) => s + v, 0);

  // pillar scores
  const pillarScore: Record<PillarKey, number> = {
    diagnostico: 0, margem: 0, comercial: 0, operacao: 0, escala: 0,
  };
  const pillarCount: Record<PillarKey, number> = {
    diagnostico: 0, margem: 0, comercial: 0, operacao: 0, escala: 0,
  };
  for (const q of questions) {
    const s = answers[q.id] ?? 0;
    pillarScore[q.pillar] += s;
    pillarCount[q.pillar] += 1;
  }
  const pillarAvg = (Object.keys(pillarScore) as PillarKey[]).map((k) => ({
    pillar: k,
    avg: pillarScore[k] / pillarCount[k],
    total: pillarScore[k],
  }));
  const bottleneckEntry = pillarAvg.reduce((a, b) => (a.avg <= b.avg ? a : b));

  const levels: Omit<Result, "bottleneck">[] = [
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
      badgeClass: "text-red-400 bg-red-500/10 border-red-500/25",
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
      badgeClass: "text-amber-300 bg-amber-400/10 border-amber-400/25",
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
      badgeClass: "text-sky-300 bg-sky-500/10 border-sky-400/25",
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
      badgeClass: "text-emerald-300 bg-emerald-500/10 border-emerald-400/25",
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
      badgeClass: "text-halo-primary bg-halo-primary/10 border-halo-primary/40",
    },
  ];

  // 20 questions, min 20, max 100
  let idx = 0;
  if (total <= 36) idx = 0;
  else if (total <= 55) idx = 1;
  else if (total <= 72) idx = 2;
  else if (total <= 88) idx = 3;
  else idx = 4;

  return { ...levels[idx], bottleneck: { pillar: bottleneckEntry.pillar, score: bottleneckEntry.total } };
}

export default function DiagnosticModal({ isOpen, onClose }: DiagnosticModalProps) {
  const [step, setStep] = useState<number>(0); // 0 intro, 1..20 questions, 21 loading, 22 result
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [lead, setLead] = useState({ name: "", email: "", whatsapp: "", specialty: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setAnswers({});
      setLeadSubmitted(false);
    }
  }, [isOpen]);

  const result = useMemo(() => (step >= 22 ? buildResult(answers) : null), [step, answers]);

  if (!isOpen) return null;

  const handleSelect = (qid: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: score }));
    setTimeout(() => {
      setStep((s) => (s < 20 ? s + 1 : 21));
      if (step >= 20) {
        setTimeout(() => setStep(22), 1400);
      }
    }, 160);
  };

  const currentQuestion = step > 0 && step <= 20 ? questions[step - 1] : null;
  const progress = step > 0 && step <= 20 ? (step / 20) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-halo-primary/25 bg-halo-surface text-halo-text shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-halo-primary/10 text-halo-primary">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-primary">
                Diagnóstico MedCEO
              </span>
              <span className="block text-[11px] text-halo-faint">
                Maturidade empresarial médica · 20 perguntas
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-halo-muted transition-colors hover:bg-white/5 hover:text-halo-text"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Intro */}
          {step === 0 && (
            <div className="p-7 text-center md:p-9">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-halo-primary/10 text-halo-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-2xl font-semibold md:text-3xl">
                Descubra a maturidade da sua clínica
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-halo-muted">
                20 perguntas estratégicas em 5 pilares: diagnóstico, margem, comercial, operação e escala. Ao final, você recebe seu nível de maturidade, o gargalo dominante e um plano estratégico de 12 meses.
              </p>
              <button
                onClick={() => setStep(1)}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-halo-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#070807] transition-all hover:bg-halo-primary-hover"
              >
                Iniciar diagnóstico gratuito
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-halo-faint">
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
                    Pilar {pillarMeta[currentQuestion.pillar].short} · {pillarMeta[currentQuestion.pillar].label}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-halo-muted">
                    {step}/20
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-halo-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <h4 className="font-serif text-xl font-semibold leading-snug md:text-2xl">
                {currentQuestion.question}
              </h4>

              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = answers[currentQuestion.id] === opt.score;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(currentQuestion.id, opt.score)}
                      className={`group w-full rounded-xl border p-4 text-left transition-all md:p-5 ${
                        isSelected
                          ? "border-halo-primary bg-halo-primary/5"
                          : "border-white/8 bg-white/[0.02] hover:border-halo-primary/40 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                            isSelected
                              ? "border-halo-primary bg-halo-primary text-[#070807]"
                              : "border-halo-faint/60"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
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

              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-muted transition-colors hover:text-halo-text"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
                <span className="text-[11px] italic text-halo-faint">
                  Suas respostas são confidenciais
                </span>
              </div>
            </div>
          )}

          {/* Processing */}
          {step === 21 && (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-halo-primary" />
              <p className="mt-4 font-serif text-lg">Analisando as suas respostas…</p>
              <p className="mt-1 text-xs text-halo-muted">
                Calculando maturidade, gargalo dominante e plano de 12 meses.
              </p>
            </div>
          )}

          {/* Result */}
          {step === 22 && result && (
            <div className="p-6 md:p-8">
              <div className="text-center">
                <span
                  className={`inline-block rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${result.badgeClass}`}
                >
                  Resultado do diagnóstico
                </span>
                <h3 className="mt-3 font-serif text-2xl font-semibold md:text-3xl">
                  {result.title}
                </h3>
                <p className="mt-1 text-sm italic text-halo-primary">"{result.subtitle}"</p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <h5 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-text">
                  <TrendingUp className="h-4 w-4 text-halo-primary" /> Análise de maturidade
                </h5>
                <p className="mt-3 text-[13px] leading-relaxed text-halo-muted">
                  {result.description}
                </p>

                <div className="my-4 h-px bg-white/5" />

                <h5 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-text">
                  <AlertTriangle className="h-4 w-4 text-halo-primary" />
                  Gargalo dominante: {pillarMeta[result.bottleneck.pillar].label}
                </h5>
                <p className="mt-2 text-[13px] leading-relaxed text-halo-muted">
                  Este é o pilar com menor pontuação nas suas respostas — é por onde o plano de 12 meses deve começar antes de acelerar os demais.
                </p>

                <div className="my-4 h-px bg-white/5" />

                <h5 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-halo-text">
                  <Sparkles className="h-4 w-4 text-halo-primary" /> Próximos passos recomendados
                </h5>
                <ul className="mt-3 space-y-2.5">
                  {result.actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-halo-text">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-halo-primary/12 font-mono text-[10px] font-semibold text-halo-primary">
                        {i + 1}
                      </span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lead capture / plan CTA */}
              <div className="mt-6 rounded-2xl border border-halo-primary/30 bg-gradient-to-br from-halo-elevated to-halo-surface p-5 md:p-6">
                {leadSubmitted ? (
                  <div className="text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-halo-primary/15 text-halo-primary">
                      <Check className="h-6 w-6" />
                    </div>
                    <h4 className="mt-3 font-serif text-lg font-semibold">Recebemos o seu diagnóstico</h4>
                    <p className="mt-2 text-[13px] text-halo-muted">
                      Um mentor MedCEO vai preparar o plano estratégico de 12 meses a partir das suas respostas e entrar em contato pelo WhatsApp em até 24h úteis.
                    </p>
                  </div>
                ) : (
                  <>
                    <h4 className="font-serif text-lg font-semibold md:text-xl">
                      Receba o plano estratégico completo de 12 meses
                    </h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-halo-muted">
                      Preencha para receber o relatório detalhado e agendar uma reunião personalizada com o time MedCEO — a conversa começa pelas suas respostas, não por discurso pronto.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setLeadSubmitted(true);
                      }}
                      className="mt-4 grid gap-3 md:grid-cols-2"
                    >
                      <input
                        required
                        placeholder="Nome completo"
                        value={lead.name}
                        onChange={(e) => setLead({ ...lead, name: e.target.value })}
                        className="rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-halo-text placeholder:text-halo-faint focus:border-halo-primary/60 focus:outline-none"
                      />
                      <input
                        required
                        type="email"
                        placeholder="E-mail profissional"
                        value={lead.email}
                        onChange={(e) => setLead({ ...lead, email: e.target.value })}
                        className="rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-halo-text placeholder:text-halo-faint focus:border-halo-primary/60 focus:outline-none"
                      />
                      <input
                        required
                        placeholder="WhatsApp com DDD"
                        value={lead.whatsapp}
                        onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })}
                        className="rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-halo-text placeholder:text-halo-faint focus:border-halo-primary/60 focus:outline-none"
                      />
                      <input
                        required
                        placeholder="Especialidade / cidade"
                        value={lead.specialty}
                        onChange={(e) => setLead({ ...lead, specialty: e.target.value })}
                        className="rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-halo-text placeholder:text-halo-faint focus:border-halo-primary/60 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-halo-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#070807] transition-colors hover:bg-halo-primary-hover"
                      >
                        Receber plano de 12 meses
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                    <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-halo-faint">
                      Reunião personalizada · vagas limitadas na agenda do mentor
                    </p>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-halo-faint">
                <button
                  onClick={() => {
                    setAnswers({});
                    setStep(0);
                    setLeadSubmitted(false);
                  }}
                  className="underline underline-offset-4 hover:text-halo-muted"
                >
                  Refazer o diagnóstico
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
