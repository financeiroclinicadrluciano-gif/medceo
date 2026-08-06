export type Option = { text: string; score: 1 | 3 | 5; description: string };
export type Question = {
  id: number;
  pillar: PillarKey;
  question: string;
  options: [Option, Option, Option];
};
export type PillarKey = "diagnostico" | "margem" | "comercial" | "operacao" | "escala";

export const pillarMeta: Record<PillarKey, { label: string; short: string }> = {
  diagnostico: { label: "Diagnóstico", short: "01" },
  margem: { label: "Margem", short: "02" },
  comercial: { label: "Comercial", short: "03" },
  operacao: { label: "Operação", short: "04" },
  escala: { label: "Escala", short: "05" },
};

export const questions: Question[] = [
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

export type Result = {
  level: number;
  title: string;
  subtitle: string;
  description: string;
  actions: string[];
  bottlenecks: { pillar: PillarKey; score: number }[];
};

export function buildResult(answers: Record<number, number>): Result {
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
