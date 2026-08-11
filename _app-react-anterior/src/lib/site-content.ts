/**
 * Conteúdo compartilhado do site MedCEO.
 * Todos os dados aqui são reais (declarados nos canais oficiais da Natuá e do Dr. Luciano)
 * ou descrevem o funcionamento do diagnóstico e da mentoria.
 */

export const WHATSAPP_URL =
  "https://wa.me/554184875688?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20mentoria%21";

export const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/metodo", label: "Método" },
  { to: "/mentoria", label: "Mentoria" },
  { to: "/blog", label: "Blog" },
  { to: "/sobre", label: "Sobre" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
] as const;

export type JourneyStep = {
  step: string;
  title: string;
  description: string;
  outcome: string;
};

export const journeySteps: JourneyStep[] = [
  {
    step: "01",
    title: "Diagnóstico em 20 perguntas",
    description:
      "Cerca de 5 minutos sobre dependência do dono, margem, comercial, operação e escala da clínica.",
    outcome: "Retrato honesto da operação, sem achismo.",
  },
  {
    step: "02",
    title: "Nível de maturidade",
    description:
      "O resultado posiciona a clínica em um dos cinco estágios e mostra o gargalo que trava o próximo salto.",
    outcome: "Você sabe exatamente onde está.",
  },
  {
    step: "03",
    title: "Três próximos passos",
    description:
      "Ações coerentes com o seu estágio — não um plano genérico de crescimento copiado de outra clínica.",
    outcome: "Prioridade clara para a semana.",
  },
  {
    step: "04",
    title: "Conversa com o time MedCEO",
    description:
      "Se fizer sentido, o diagnóstico vira ponto de partida para a mentoria com os seis pilares do método.",
    outcome: "Execução acompanhada, não teoria.",
  },
];

export type Benefit = {
  title: string;
  description: string;
};

export const benefits: Benefit[] = [
  {
    title: "Clareza antes de investir",
    description:
      "Você descobre o gargalo real antes de colocar dinheiro em tráfego, equipe nova ou expansão.",
  },
  {
    title: "Decisão de dono, não de plantão",
    description:
      "O diagnóstico separa o que é urgência operacional do que é decisão estratégica de CEO.",
  },
  {
    title: "Margem no centro",
    description:
      "Faturar mais sem olhar margem só aumenta o volume do problema. Aqui a conta entra primeiro.",
  },
  {
    title: "Comercial fora do improviso",
    description: "Processo replicável para transformar demanda em receita previsível.",
  },
  {
    title: "Operação que roda sem você",
    description:
      "Cultura, gestão de pessoas e projetos com dono, prazo e critério — para a clínica não parar quando você para.",
  },
  {
    title: "Método nascido em operação real",
    description:
      "O DOC365 foi criado dentro da Natuá MedSpa, com pacientes, equipe e decisões de verdade.",
  },
];

export type FaqItem = { question: string; answer: string };

export const faqItems: FaqItem[] = [
  {
    question: "O diagnóstico é gratuito?",
    answer:
      "Sim. São 20 perguntas, cerca de 5 minutos, e o resultado aparece na hora — nível de maturidade, gargalo prioritário e três próximos passos.",
  },
  {
    question: "Preciso já ter uma clínica funcionando?",
    answer:
      "Sim. O diagnóstico precisa de matéria-prima: pacientes, equipe, faturamento e decisões que já podem ser observadas. Quem ainda não abriu a operação não tem o que diagnosticar.",
  },
  {
    question: "Isso é mais um curso de marketing médico?",
    answer:
      "Não. Marketing é apenas um dos seis pilares. Antes dele vêm mentalidade de CEO, margem, comercial, gestão de pessoas e projetos — porque mais pacientes em uma operação desorganizada só amplifica o gargalo.",
  },
  {
    question: "Quanto tempo preciso dedicar por semana?",
    answer:
      "O diagnóstico leva cerca de 5 minutos. A mentoria é desenhada para caber na agenda de quem atende: encontros com pauta objetiva e execução acompanhada, não maratona de aulas.",
  },
  {
    question: "Quem conduz o método?",
    answer:
      "Dr. Luciano Alves Neves (CRM/PR 45049), médico, CEO e fundador da Natuá MedSpa, ao lado de um time com frentes de marketing, comercial, gestão, projetos e conteúdo.",
  },
  {
    question: "Vocês prometem determinado faturamento?",
    answer:
      "Não. Nenhum resultado é garantido: ele depende da sua operação, do seu mercado e da sua execução. O que entregamos é diagnóstico, direção e acompanhamento.",
  },
  {
    question: "Atende clínicas de qualquer especialidade?",
    answer:
      "O método é de gestão, então se aplica a clínicas de diferentes especialidades. O que define o encaixe é o estágio da operação, não a área médica.",
  },
  {
    question: "E depois do diagnóstico, o que acontece?",
    answer:
      "Você recebe o resultado imediatamente e pode falar com o time pelo WhatsApp para entender se a mentoria faz sentido para o seu estágio. Não há cobrança nem compromisso.",
  },
];

export const pillarsSummary = [
  {
    number: "01",
    name: "Dr. Luciano",
    role: "Mentalidade CEO",
    thesis:
      "De médico indispensável a CEO capaz de liderar, decidir e desenhar um negócio que cresce.",
  },
  {
    number: "02",
    name: "Gustavo",
    role: "Marketing",
    thesis: "Transformar visibilidade em demanda mensurável — e demanda em receita previsível.",
  },
  {
    number: "03",
    name: "Comercial",
    role: "Comercial",
    thesis: "Tirar a venda do improviso e criar um processo comercial replicável para clínicas.",
  },
  {
    number: "04",
    name: "Alessandra",
    role: "Gestão",
    thesis: "Construir cultura, elevar performance e reter gente boa sem centralizar tudo no dono.",
  },
  {
    number: "05",
    name: "Michele",
    role: "Projetos",
    thesis:
      "Fazer a IA sair do discurso e virar execução: projetos com dono, prazo e critério de sucesso.",
  },
  {
    number: "06",
    name: "Amanda",
    role: "Filmmaker",
    thesis:
      "Transformar conhecimento médico em conteúdo que prende atenção e sustenta posicionamento.",
  },
];
