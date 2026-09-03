/* Os cinco níveis e os quatro pilares.

   ATENÇÃO A UMA TROCA QUE PARECE COSMÉTICA E NÃO É. A primeira versão deste
   arquivo usava Improviso / Organização / Gestão / Previsibilidade / Escala,
   que é a nomenclatura do quiz que rodou em medceo.online até 03/09. Essa lista
   está superada. A lista canônica de hoje é a que o Dr. Luciano fala na Aula 1
   (`Webinar-MedCEO/04-ROTEIRO-AULA-1.md`) e a que o material de vendas de 27/08
   usa (`Comercial/REUNIAO-DE-VENDAS-MEDCEO.md`). Se a tela usar a antiga, o
   médico recebe um nome na terça e ouve outro na aula de segunda.

   Os quatro pilares, na ordem oficial invertida em 14/08 (Mentalidade primeiro,
   porque é onde o teto destrava): Mentalidade, Comercial, Marketing, Gestão.
*/

var NIVEIS = [
  {
    n: 1,
    titulo: "Médico Autônomo",
    resumo: "A receita é a sua agenda. Se você para, ela para.",
    texto:
      "Nesse estágio a clínica é, na prática, a sua capacidade de atender. Faturar " +
      "mais significa atender mais, e atender mais tem um limite físico que não é " +
      "de esforço, é de horas. O que destrava aqui é base comercial, oferta e uma " +
      "rotina mínima de gestão, para que o faturamento pare de ser só o seu tempo.",
  },
  {
    n: 2,
    titulo: "Clínica Dependente do Dono",
    resumo: "Existe equipe, e toda decisão continua passando por você.",
    texto:
      "Já existem outras pessoas, e mesmo assim quase nada anda sem a sua palavra. " +
      "A equipe executa e hesita em decidir, porque não sabe até onde pode ir. " +
      "O que destrava aqui é processo, papel definido, indicador e autonomia " +
      "operacional, nessa ordem.",
  },
  {
    n: 3,
    titulo: "Clínica com Receita, Sem Governança",
    resumo: "Fatura bem, e ninguém sabe de onde vem nem quanto sobra.",
    texto:
      "O dinheiro entra em volume, e as decisões continuam sendo tomadas por " +
      "intuição, porque falta o número. Não se sabe a margem real nem qual canal " +
      "traz o paciente que fica. O que destrava aqui é governança: painel de " +
      "indicadores e rotina comercial com cadência.",
  },
  {
    n: 4,
    titulo: "Clínica Estruturada",
    resumo: "Processo, indicador e alguma previsibilidade.",
    texto:
      "A clínica opera como empresa e já sustenta a sua ausência por períodos " +
      "curtos. O trabalho agora é fino: melhorar time, oferta e margem, e instalar " +
      "uma cadência de gestão que não dependa de você lembrar.",
  },
  {
    n: 5,
    titulo: "Clínica Escalável",
    resumo: "Gestão, equipe e margem sustentam o próximo passo.",
    texto:
      "A estrutura suporta crescer sem quebrar: existe gestão, existe time, existe " +
      "margem. A conversa passa a ser escala segura, novas unidades, formação de " +
      "lideranças e metas de longo prazo.",
  },
];

/* Os quatro pilares. `sinal: false` significa que o formulário não faz nenhuma
   pergunta capaz de medir aquele pilar, e a tela diz isso em vez de inventar
   uma nota. Marketing é o caso: não existe pergunta de captação no formulário. */
var PILARES = {
  mentalidade: {
    rot: "Mentalidade",
    ordem: 1,
    sinal: true,
    pergunta: "A clínica funciona quando você não está?",
    fraco:
      "O faturamento está preso à sua presença e à sua decisão. É o que transforma " +
      "uma semana de férias em prejuízo e o que mantém o teto onde ele está.",
    forte: "Existe decisão acontecendo além de você, e a operação sustenta a sua ausência.",
  },
  comercial: {
    rot: "Comercial",
    ordem: 2,
    sinal: true,
    pergunta: "O que chega até você, entra?",
    fraco:
      "A demanda chega e se perde no caminho. Antes de investir para trazer mais " +
      "gente, vale parar de perder a que já bateu na porta.",
    forte: "O que chega tem caminho até o sim, e você sabe qual é a sua taxa.",
  },
  marketing: {
    rot: "Marketing",
    ordem: 3,
    sinal: false,
    pergunta: "De onde vem quem procura você?",
    naoMedido:
      "Este formulário não pergunta nada sobre captação, então não existe leitura " +
      "honesta a fazer aqui. Marketing é uma das quatro reuniões iniciais da " +
      "mentoria, e é lá que a origem dos seus últimos pacientes é levantada.",
  },
  gestao: {
    rot: "Gestão",
    ordem: 4,
    sinal: true,
    pergunta: "Você tem os números na mão?",
    fraco:
      "Faltam números básicos da própria operação, a começar pela margem. Sem eles, " +
      "cada decisão de contratar ou investir é feita no escuro, e o resultado só " +
      "aparece depois que o dinheiro saiu.",
    forte: "Você conhece os números que descrevem a sua clínica e decide em cima deles.",
  },
};

/* A ordem em que um pilar trava o outro. Empate no gargalo resolve por aqui.
   Gestão vem primeiro no desempate porque é o pilar que torna os outros
   decidíveis: sem margem, não dá para escolher onde investir. */
var ORDEM_DESEMPATE = ["gestao", "comercial", "mentalidade"];

/* Nota de 0 a 100, média dos pilares medidos.
   Média e não soma: quem prefere informar o faturamento na sessão responde
   menos, e uma soma o puniria por isso. */
function notaGeral(pilares) {
  var chaves = Object.keys(pilares);
  if (!chaves.length) return null;
  var soma = chaves.reduce(function (s, k) {
    return s + pilares[k].nota;
  }, 0);
  return Math.round((soma / chaves.length / 5) * 100);
}

/* O nível sai do SINTOMA que define cada nível, não de uma faixa de média.

   A primeira versão usava faixa de nota, herdada do quiz de 20 perguntas, e
   errava de forma visível: um médico com equipe de 1 a 3 pessoas caía em
   "Médico Autônomo", cuja definição é justamente não ter estrutura e vender a
   própria agenda. Média não distingue "não tem equipe" de "tem equipe e não
   delega", e essa é exatamente a fronteira entre o nível 1 e o nível 2.

   A escada abaixo lê os sintomas na ordem em que o método os descreve
   (Comercial/REUNIAO-DE-VENDAS-MEDCEO.md), do topo para baixo. A nota continua
   existindo, como número de apoio, não como classificador. */
function nivelPara(nota, r, pilares) {
  r = r || {};

  var soEu = r.equipe === "so_eu";
  var equipePequena = r.equipe === "so_eu" || r.equipe === "1a3";
  var equipeGrande = r.equipe === "8a15" || r.equipe === "15mais";
  var decideSozinho = r.decisor === "sim";
  var temMargem = r.margem === "sim";
  var faturaAlto =
    r.faturamento === "80a150" || r.faturamento === "150a300" || r.faturamento === "300mais";
  var quedaMinima = r.queda_ferias === "ate10";
  var quedaAlta =
    r.queda_ferias === "40a60" || r.queda_ferias === "60mais" || r.queda_ferias === "nao_sei";

  /* 5. Escalável: margem na mão, time grande, decisão dividida e a clínica
     sustenta a ausência. */
  if (temMargem && equipeGrande && !decideSozinho && quedaMinima) return NIVEIS[4];

  /* 4. Estruturada: margem acompanhada e a ausência já não derruba. */
  if (temMargem && !quedaAlta && !equipePequena) return NIVEIS[3];

  /* 3. Receita sem governança: o dinheiro entra em volume e o número não existe.
     É o único nível definido pela combinação de faturamento alto com margem
     que ninguém acompanha. */
  if (faturaAlto && !temMargem) return NIVEIS[2];

  /* 1. Médico autônomo: não existe estrutura nenhuma, a receita é a agenda dele.
     A condição é estar sozinho. Uma versão anterior aceitava "equipe de 1 a 3 +
     decide sozinho + queda alta", e mandava para cá um médico que tem
     secretária, contradizendo o resumo do próprio nível na tela. Ter uma pessoa
     já é ter equipe, e ter equipe sem delegar é a definição do nível 2. */
  if (soEu) return NIVEIS[0];

  /* 2. Dependente do dono: existe equipe, e a decisão continua sendo dele.
     É também o destino de quem não se encaixou em nenhuma regra acima, que é o
     retrato mais comum entre clínicas que procuram a mentoria. */
  return NIVEIS[1];
}

module.exports = {
  NIVEIS: NIVEIS,
  PILARES: PILARES,
  ORDEM_DESEMPATE: ORDEM_DESEMPATE,
  notaGeral: notaGeral,
  nivelPara: nivelPara,
};
