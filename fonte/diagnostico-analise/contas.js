/* As contas em reais.

   O que separa isto de um resultado de quiz: o número sai dos dados que o
   próprio médico acabou de informar, e a conta aparece inteira ao lado do
   resultado. Ele consegue refazer de cabeça e discordar.

   Duas destas contas são as MESMAS que o deck comercial faz na reunião
   presencial (Comercial/Duas-Clinicas/fonte/gerar-deck.py, função calcula):

       dep   = FAT * QUEDA / 100      quanto do faturamento só existe com ele
       perde = 10 - FECHA             quantos dos 10 se perdem

   Herdar a fórmula, em vez de inventar outra, é o que faz a tela e a reunião
   contarem a mesma história com o mesmo número.

   Nenhuma conta usa régua de mercado ou "o ideal seria", com uma exceção
   declarada: a margem de 30%, que é meta escrita do programa de 12 meses. As
   outras usam valor marginal, matemática pura sobre os dados dele.
*/

var M = require("./motor.js");

/* Recebe o valor JÁ EM MILHARES, que é a unidade das faixas do formulário:
   65 significa R$ 65 mil. Abaixo de 10 mantém a casa decimal, senão
   "R$ 7 mil" esconde 7,5. */
function mil(v) {
  if (v >= 1000) {
    var mi = (v / 1000).toFixed(1).replace(".", ",");
    return "R$ " + mi + (mi === "1,0" ? " milhão" : " milhões");
  }
  if (v >= 10) return "R$ " + Math.round(v) + " mil";
  return "R$ " + v.toFixed(1).replace(".", ",") + " mil";
}

/* --------------------------------------------------------------------------
   CONTA 1. Índice de dependência do fundador.

   É o 9º dos indicadores mínimos do método, e o único que não aparece em
   painel de clínica nenhuma. A fórmula é a do deck: o percentual que ele mesmo
   estimou, aplicado sobre o faturamento dele.
-------------------------------------------------------------------------- */
function contaDependencia(r) {
  var f = M.FAT[r.faturamento];
  var q = M.QUEDA[r.queda_ferias];
  if (!f || !q) return null;

  var preso = (f.meio * q.pct) / 100;
  var semana = (f.meio / 4.33) * (q.pct / 100);

  return {
    id: "dependencia",
    titulo: "Índice de dependência do fundador",
    valor: q.pct + "% do faturamento",
    valorAno: mil(preso) + " por mês presos na sua agenda",
    conta:
      "Você estimou que uma semana sua fora derruba " +
      q.rot +
      ". " +
      (f.base === "piso"
        ? "Sobre o piso da faixa que você marcou, "
        : "Sobre o meio da faixa que você marcou, ") +
      mil(f.meio) +
      ", isso significa que " +
      mil(preso) +
      " por mês existem porque você está na sala. " +
      "Uma semana fora custa " +
      mil(semana) +
      ".",
    pressuposto:
      "Esse número não mede o seu esforço, mede o desenho da operação. É o que " +
      "separa uma clínica de um emprego caro, e é o indicador que quase nenhum " +
      "painel de clínica acompanha.",
  };
}

/* --------------------------------------------------------------------------
   CONTA 2. Quantos se perdem, e quanto vale um.

   `perde` é a conta do deck. O valor de um fechamento a mais é valor marginal
   sobre o volume que ele já tem, sem afirmar qual taxa ele deveria ter.
-------------------------------------------------------------------------- */
function contaConversao(r) {
  var f = M.FAT[r.faturamento];
  var c = M.CONV[r.conversao];
  if (!f || !c) return null;

  var perde = 10 - c.n;
  var porFechamento = f.meio / c.n;

  return {
    id: "conversao",
    titulo: "Os que pedem e não voltam",
    valor: String(perde).replace(".", ",") + " de cada 10 se perdem",
    valorAno: mil(porFechamento) + " é o que vale recuperar um, por mês",
    conta:
      "Você marcou " +
      c.rot +
      " fechando, então " +
      String(perde).replace(".", ",") +
      " de cada 10 pedem e não voltam. " +
      (f.base === "piso" ? "Tomando o piso da faixa, " : "Tomando o meio da faixa, ") +
      mil(f.meio) +
      ", e " +
      String(c.n).replace(".", ",") +
      (c.n === 1 ? " fechamento, ele responde" : " fechamentos, cada um responde") +
      " por " +
      mil(porFechamento) +
      ". " +
      "Recuperar um único desses, a cada 10, é " +
      mil(porFechamento) +
      " por mês, " +
      mil(porFechamento * 12) +
      " em doze meses.",
    pressuposto:
      "A conta supõe o mesmo volume de pedidos e o mesmo ticket. É dinheiro que " +
      "já bateu na porta e não entrou, não paciente novo, e por isso não depende " +
      "de gastar mais em anúncio.",
  };
}

/* --------------------------------------------------------------------------
   CONTA 3. O teto da agenda. Sem valor em reais, porque não existe dado para
   isso, e inventar um seria pior do que não ter.
-------------------------------------------------------------------------- */
function contaTeto(r) {
  var eq = M.EQUIPE[r.equipe];
  if (!eq || r.decisor !== "sim" || eq.n > 3) return null;

  return {
    id: "teto",
    titulo: "Onde está o teto",
    valor: eq.n <= 1 ? "A clínica é você" : "O teto é a sua agenda",
    valorAno: null,
    conta:
      "Você marcou " +
      eq.rot +
      " na operação, e que todas as decisões estratégicas e financeiras passam " +
      "por você. Nessa configuração o faturamento tem um limite físico, e o " +
      "limite é quantas horas você consegue trabalhar.",
    pressuposto:
      "Não é falta de esforço. Nenhuma quantidade de esforço muda um teto feito " +
      "de horas, e é por isso que trabalhar mais costuma piorar o quadro em vez " +
      "de resolver.",
  };
}

/* --------------------------------------------------------------------------
   CONTA 4. A margem.

   Única conta que usa meta declarada: 30% de margem líquida, meta escrita do
   programa de 12 meses. Quando ele não acompanha, não existe conta a fazer, e
   dizer isso vale mais do que estimar uma margem que ninguém mediu.
-------------------------------------------------------------------------- */
function contaMargem(r) {
  var f = M.FAT[r.faturamento];

  if (r.margem === "sim") {
    if (!f) return null;
    var naMeta = (f.meio * M.META_MARGEM) / 100;
    return {
      id: "margem",
      titulo: "A régua da margem",
      valor: mil(naMeta) + " por mês",
      valorAno: mil(naMeta * 12) + " por ano",
      conta:
        "Você acompanha a margem, e isso já coloca a sua clínica à frente da " +
        "maior parte. A meta de margem líquida do programa é " +
        M.META_MARGEM +
        "%. Sobre " +
        mil(f.meio) +
        ", seriam " +
        mil(naMeta) +
        " por mês sobrando. Como você tem o número real na mão, a sessão começa " +
        "comparando os dois, e essa é a conversa mais curta que existe.",
      pressuposto:
        "Os 30% são a meta do programa, não uma média de mercado. Se a sua " +
        "margem real já passa disso, a conversa muda de assunto.",
    };
  }

  var comoEsta = {
    estimativa: "você tem uma estimativa da margem, não o número",
    financeiro: "o financeiro acompanha a margem, e você não domina o número",
    nao: "a margem não é acompanhada",
  }[r.margem];
  if (!comoEsta) return null;

  return {
    id: "margem",
    titulo: "A conta que ainda não dá para fazer",
    valor: "Sem margem, não há decisão",
    valorAno: null,
    conta:
      "Você informou que " +
      comoEsta +
      ". " +
      (f
        ? "Sabemos que entram " + f.rot + ". Não sabemos quanto fica. "
        : "Sabemos que entra faturamento. Não sabemos quanto fica. ") +
      "Sem esse número, decidir contratar, comprar equipamento ou investir em " +
      "marketing é apostar, e o resultado da aposta só aparece depois que o " +
      "dinheiro já saiu.",
    pressuposto:
      "É o primeiro número a levantar, porque é ele que torna os outros " +
      "decidíveis. A meta do programa é " +
      M.META_MARGEM +
      "% de margem líquida, e sem o número de hoje não dá para saber a distância.",
  };
}

function todasAsContas(r) {
  return [contaDependencia(r), contaConversao(r), contaTeto(r), contaMargem(r)].filter(Boolean);
}

module.exports = { mil: mil, todasAsContas: todasAsContas };
