/* As seções que dão profundidade à leitura.

   Tudo aqui vem de material canônico do método, nada é invenção da tela:

   - os 9 indicadores mínimos e a meta de 30% de margem estão em
     PROGRAMA-MEDCEO-12-MESES.md
   - as quatro ferramentas de bolso são as que o deck comercial entrega em cada
     pilar (Duas-Clinicas/fonte/gerar-deck.py, slides 6 a 9)
   - os quatro entregáveis são os que o Gustavo ditou palavra por palavra e que
     estão no slide 12 do deck vigente
   - os cinco níveis e o que destrava cada um vêm de REUNIAO-DE-VENDAS-MEDCEO.md

   O CENÁRIO precisa de um cuidado especial. Ele não prevê nada e não promete
   faturamento: é aritmética declarada, do tipo "se este número que você
   informou fosse outro, a conta daria isto". A publicidade médica veda promessa
   de resultado, e uma projeção com cara de previsão seria exatamente isso.
*/

/* Os nove indicadores mínimos. `campo` liga ao que o formulário perguntou;
   os que têm `campo: null` não foram medidos aqui, e a tela diz isso. */
var INDICADORES = [
  { nome: "Receita total", campo: "faturamento" },
  { nome: "Margem líquida", campo: "margem" },
  { nome: "Ticket médio", campo: null },
  { nome: "Origem da aquisição", campo: null },
  { nome: "Conversão", campo: "conversao" },
  { nome: "Recorrência", campo: null },
  { nome: "Retenção", campo: null },
  { nome: "Produtividade da equipe", campo: null },
  {
    nome: "Índice de dependência do fundador",
    campo: "queda_ferias",
    nota: "o nono, e o que quase nenhuma clínica acompanha",
  },
];

/* Diz, para cada indicador, se o médico tem o número, se ele é estimativa, ou
   se este formulário não perguntou. Três estados, nunca dois. */
function estadoIndicador(r, ind) {
  if (!ind.campo) return { estado: "nao_perguntado", txt: "não perguntado aqui" };

  var v = r[ind.campo];
  if (!v || v === "nao_sei" || v === "prefiro_nao") {
    return { estado: "falta", txt: "sem número" };
  }
  if (ind.campo === "margem") {
    if (v === "sim") return { estado: "tem", txt: "você acompanha" };
    if (v === "estimativa") return { estado: "estima", txt: "estimativa" };
    if (v === "financeiro") return { estado: "estima", txt: "com o financeiro" };
    return { estado: "falta", txt: "sem número" };
  }
  if (ind.campo === "conversao" || ind.campo === "queda_ferias") {
    return { estado: "estima", txt: "você estimou" };
  }
  return { estado: "tem", txt: "informado" };
}

/* As quatro ferramentas de bolso, uma por pilar. São as mesmas do deck: contas
   que o médico roda sozinho, com dado que ele já tem em casa. */
var FERRAMENTAS = [
  {
    pilar: "Mentalidade",
    o: "Quanto do faturamento do mês passado veio da sua própria agenda",
    como:
      "Some o que foi faturado em procedimentos que só você executa e divida pelo " +
      "faturamento total. O resultado é o tamanho real da sua dependência, e " +
      "costuma ser maior do que a estimativa de cabeça.",
  },
  {
    pilar: "Comercial",
    o: "As últimas 20 conversas em que alguém perguntou preço",
    como:
      "Abra o WhatsApp e leia o que foi respondido nas 20 últimas. Conte quantas " +
      "terminaram sem resposta da pessoa e quantas terminaram sem resposta nossa. " +
      "A segunda coluna costuma ser a grande.",
  },
  {
    pilar: "Marketing",
    o: "De onde vieram os seus últimos 20 pacientes",
    como:
      "Um por um, sem estimar: indicação, Instagram, Google, convênio, passagem. " +
      "É a conta que revela se o investimento em captação está indo para o canal " +
      "que traz quem fecha.",
  },
  {
    pilar: "Gestão",
    o: "O custo da sua hora contra a sua tabela de preços",
    como:
      "Divida o custo fixo mensal pelas horas de atendimento do mês. Compare com " +
      "o preço dos procedimentos que mais ocupam a agenda. Alguns costumam sair " +
      "no prejuízo, e quase sempre são os mais pedidos.",
  },
];

/* Os quatro entregáveis, na redação oficial. */
var ENTREGAVEIS = [
  {
    o: "Diagnóstico completo",
    d: "Quatro reuniões iniciais, uma com cada pilar, nas primeiras quatro semanas, além das aulas.",
  },
  {
    o: "Um encontro ao vivo por semana",
    d: "Com 30 minutos finais de tira-dúvidas, um plano de ação de 30 dias ao fim de cada aula e materiais próprios.",
  },
  {
    o: "Tutoria individual todo mês",
    d: "Uma reunião individual com um dos pilares, para o que é específico da sua clínica.",
  },
  {
    o: "Comunidade de médicos",
    d: "Médicos vivendo a mesma fase da clínica, decidindo as mesmas coisas.",
  },
];

/* O cenário. Aritmética declarada sobre o índice de dependência, nunca previsão.
   Só aparece quando existe faturamento e queda informados, e some quando a
   dependência já é baixa, porque aí a conta não tem o que mostrar. */
function cenario(r) {
  var f = FAT[r.faturamento];
  var q = QUEDA[r.queda_ferias];
  if (!f || !q || q.pct < 25) return null;

  var presoAgora = (f.meio * q.pct) / 100;
  var metade = Math.round(q.pct / 2);
  var presoAdiante = (f.meio * metade) / 100;
  var liberado = presoAgora - presoAdiante;

  return {
    pctHoje: q.pct,
    pctMetade: metade,
    presoHoje: mil(presoAgora),
    presoDepois: mil(presoAdiante),
    liberado: mil(liberado),
    liberadoAno: mil(liberado * 12),
  };
}
