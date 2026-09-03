/* Motor de análise do diagnóstico MedCEO.

   Recebe as 19 respostas do formulário e devolve o que a tela e o PDF desenham.
   Roda no navegador do médico, sem dependência.

   Três regras governam tudo aqui:

   1. A pontuação sai nos QUATRO PILARES da mentoria, não numa taxonomia
      própria. Se a tela chamar de "operação" o que a aula de segunda chama de
      "mentalidade", o médico recebe dois mapas do mesmo território.

   2. Pilar sem pergunta que o meça NÃO recebe nota. Marketing é esse caso: o
      formulário não tem uma única pergunta de captação. A tela diz isso, e dizer
      vale mais do que estimar.

   3. Toda leitura declara de onde saiu, no campo `sinais`. O médico precisa
      poder discordar do caminho, não só do resultado.
*/

/* ---------------------------------------------------------------------------
   1. As faixas viram número.

   O ponto médio é a regra herdada do painel que já recebe as respostas
   (FORMULARIO-DIAGNOSTICO-V2/00-LEIA-PRIMEIRO.md: "50a80 virou 65"). A faixa
   aberta do topo usa o piso, nunca um teto inventado, e declara isso em `base`.
------------------------------------------------------------------------- */
var FAT = {
  ate25: { rot: "até R$ 25 mil por mês", meio: 20, base: "meio" },
  "25a50": { rot: "entre R$ 25 mil e R$ 50 mil por mês", meio: 37, base: "meio" },
  "50a80": { rot: "entre R$ 50 mil e R$ 80 mil por mês", meio: 65, base: "meio" },
  "80a150": { rot: "entre R$ 80 mil e R$ 150 mil por mês", meio: 115, base: "meio" },
  "150a300": { rot: "entre R$ 150 mil e R$ 300 mil por mês", meio: 225, base: "meio" },
  "300mais": { rot: "acima de R$ 300 mil por mês", meio: 300, base: "piso" },
};

/* Conversão: quantos fecham a cada 10 que pedem orçamento. */
var CONV = {
  "0a2": { n: 1, rot: "1 a cada 10" },
  "3a4": { n: 3.5, rot: "3 ou 4 a cada 10" },
  "5a6": { n: 5.5, rot: "5 ou 6 a cada 10" },
  "7a8": { n: 7.5, rot: "7 ou 8 a cada 10" },
  "9a10": { n: 9.5, rot: "9 ou 10 a cada 10" },
};

/* Queda numa semana de férias. É a matéria-prima do índice de dependência do
   fundador, que é o 9º dos indicadores mínimos do método
   (PROGRAMA-MEDCEO-12-MESES.md) e o único que não aparece em painel de clínica
   nenhuma. */
var QUEDA = {
  ate10: { pct: 10, rot: "até 10%" },
  "10a25": { pct: 18, rot: "entre 10% e 25%" },
  "25a40": { pct: 33, rot: "entre 25% e 40%" },
  "40a60": { pct: 50, rot: "entre 40% e 60%" },
  "60mais": { pct: 65, rot: "mais de 60%" },
};

var EQUIPE = {
  so_eu: { n: 1, rot: "só você" },
  "1a3": { n: 2, rot: "1 a 3 pessoas" },
  "4a7": { n: 5.5, rot: "4 a 7 pessoas" },
  "8a15": { n: 11, rot: "8 a 15 pessoas" },
  "15mais": { n: 18, rot: "mais de 15 pessoas" },
};

/* A única meta numérica que o método declara e que este formulário consegue
   comparar. Fonte: PROGRAMA-MEDCEO-12-MESES.md, margem líquida meta de 30%.
   As demais metas do programa (retenção 30%, agendamento mínimo 3%) não têm
   pergunta correspondente aqui e por isso não entram na tela. */
var META_MARGEM = 30;

/* ---------------------------------------------------------------------------
   2. Pontuação por pilar, de 1 a 5.
------------------------------------------------------------------------- */
function pontuar(r) {
  var p = {};

  /* MENTALIDADE: o quanto a clínica ainda é você.
     Três sinais entram: quem decide, quantas mãos existem, e o que acontece
     com o faturamento quando você sai. */
  var eq = EQUIPE[r.equipe];
  var q = QUEDA[r.queda_ferias];
  if (eq || q || r.decisor) {
    var nota = 3;
    var sinais = [];

    if (q) {
      nota = q.pct >= 60 ? 1 : q.pct >= 40 ? 2 : q.pct >= 25 ? 3 : q.pct >= 10 ? 4 : 5;
      sinais.push("uma semana sua fora derruba " + q.rot);
    } else if (r.queda_ferias === "nao_sei") {
      nota = 2;
      sinais.push("não sabe estimar o efeito da própria ausência");
    }

    if (r.decisor === "sim") {
      nota = Math.max(1, nota - 1);
      sinais.push("todas as decisões estratégicas passam por você");
    } else if (r.decisor === "socio") {
      sinais.push("existe sócio dividindo a decisão");
    } else if (r.decisor === "outro") {
      sinais.push("existe outro decisor envolvido");
    }

    if (eq) {
      if (eq.n <= 1) nota = Math.max(1, nota - 1);
      else if (eq.n >= 8) nota = Math.min(5, nota + 1);
      sinais.push(eq.rot + " na operação");
    }

    p.mentalidade = { nota: nota, sinais: sinais };
  }

  /* COMERCIAL: o que acontece com a demanda que já chega. */
  var conv = CONV[r.conversao];
  if (conv) {
    p.comercial = {
      nota: conv.n <= 2 ? 1 : conv.n <= 4 ? 2 : conv.n <= 6 ? 3 : conv.n <= 8 ? 4 : 5,
      sinais: ["fecha " + conv.rot + " que pedem orçamento"],
    };
  } else if (r.conversao === "nao_sei") {
    p.comercial = { nota: 1, sinais: ["não mede quantos fecham"] };
  }

  /* GESTÃO: a margem, e quantos números da própria clínica faltam na mão. */
  var mapaMargem = { sim: 5, estimativa: 3, financeiro: 2, nao: 1 };
  var rotMargem = {
    sim: "acompanha a margem líquida",
    estimativa: "tem uma estimativa da margem, não o número",
    financeiro: "o financeiro acompanha a margem, você não domina o número",
    nao: "a margem não é acompanhada",
  };
  if (mapaMargem[r.margem]) {
    var notaG = mapaMargem[r.margem];
    var sinaisG = [rotMargem[r.margem]];
    var faltando = [];

    if (r.conversao === "nao_sei") faltando.push("a taxa de fechamento");
    if (r.queda_ferias === "nao_sei") faltando.push("o efeito da sua ausência");
    if (r.faturamento === "prefiro_nao") faltando.push("o faturamento");

    if (faltando.length >= 2) notaG = Math.max(1, notaG - 1);
    if (faltando.length) sinaisG.push("sem número na mão para " + juntar(faltando));

    p.gestao = { nota: notaG, sinais: sinaisG, faltando: faltando };
  }

  /* MARKETING não entra: o formulário não tem pergunta que o meça. A ausência é
     deliberada e a tela declara isso, em vez de estimar uma nota. */

  return p;
}

function juntar(lista) {
  if (lista.length === 1) return lista[0];
  return lista.slice(0, -1).join(", ") + " e " + lista[lista.length - 1];
}

module.exports = {
  FAT: FAT,
  CONV: CONV,
  QUEDA: QUEDA,
  EQUIPE: EQUIPE,
  META_MARGEM: META_MARGEM,
  pontuar: pontuar,
  juntar: juntar,
};
