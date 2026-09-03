/* As seções de profundidade, desenhadas.

   Ficam num arquivo próprio porque render.js já é a espinha da página; aqui
   estão as partes que existem para dar a um médico a sensação de ter recebido
   um documento, e não uma tela de obrigado.
*/

/* --------------------------------------------------------- O SUMÁRIO
   Três linhas no alto, antes de qualquer coisa. Quem lê só isto já sabe o que
   o documento diz. Cada linha é um achado com número, nunca um adjetivo. */
function sumario(r, mapa) {
  var itens = [];

  var medidos = Object.keys(mapa);
  if (medidos.length) {
    var menor = Math.min.apply(null, medidos.map(function (k) { return mapa[k].nota; }));
    var gargalo = medidos.filter(function (k) { return mapa[k].nota === menor; })[0];
    itens.push({
      chave: PILARES[gargalo].rot,
      txt: "é o pilar mais baixo da sua leitura, com " + menor + " de 5.",
    });
  }

  var q = QUEDA[r.queda_ferias];
  var f = FAT[r.faturamento];
  if (q && f) {
    itens.push({
      chave: q.pct + "% do faturamento",
      txt: "depende de você estar na sala, o que dá " + mil((f.meio * q.pct) / 100) + " por mês.",
    });
  }

  var c = CONV[r.conversao];
  if (c && f) {
    var perde = 10 - c.n;
    itens.push({
      chave: String(perde).replace(".", ",") + " de cada 10",
      txt:
        "que pedem orçamento não voltam, e cada um vale " +
        mil(f.meio / c.n) +
        " por mês.",
    });
  } else if (r.conversao === "nao_sei") {
    itens.push({
      chave: "A taxa de fechamento",
      txt: "ainda não é medida, e é o primeiro número que a sessão levanta.",
    });
  }

  if (!itens.length) return "";

  return (
    '<section class="sum">' +
    '<ul class="sum-l">' +
    itens
      .map(function (i) {
        return "<li><b>" + esc(i.chave) + "</b> " + esc(i.txt) + "</li>";
      })
      .join("") +
    "</ul></section>"
  );
}

/* --------------------------------------------------- A RÉGUA DOS NÍVEIS
   Os cinco, com o dele marcado. Mostra o caminho, que é o que falta num
   resultado que só diz onde a pessoa está. */
function regua(r, mapa) {
  var nota = notaGeral(mapa);
  if (nota === null) return "";
  var atual = nivelPara(nota, r, mapa);

  var linhas = NIVEIS.map(function (nv) {
    var eh = nv.n === atual.n;
    var prox = nv.n === atual.n + 1;
    return (
      '<li class="rg' + (eh ? " rg-aqui" : prox ? " rg-prox" : "") + '">' +
      '<span class="rg-n">' + nv.n + "</span>" +
      "<div><h3>" + esc(nv.titulo) +
      (eh ? ' <em>você está aqui</em>' : prox ? ' <em>o próximo</em>' : "") +
      "</h3>" +
      "<p>" + esc(nv.resumo) + "</p></div></li>"
    );
  }).join("");

  return secao(
    "A régua inteira, e onde você entra nela",
    '<p class="s-intro">Cinco níveis. A passagem de um para o outro não é ' +
      "questão de faturar mais: é o que a clínica passa a fazer sem você.</p>" +
      '<ol class="rgs">' + linhas + "</ol>",
    "s-rg"
  );
}

/* ------------------------------------------------------ OS 9 INDICADORES
   Quais você já tem na mão, quais são estimativa, quais este formulário nem
   perguntou. Três estados, porque "não perguntei" não é o mesmo que "falta". */
function indicadores(r) {
  var linhas = INDICADORES.map(function (ind) {
    var e = estadoIndicador(r, ind);
    return (
      '<li class="ind ind-' + e.estado + '">' +
      "<span>" + esc(ind.nome) +
      (ind.nota ? ' <i>' + esc(ind.nota) + "</i>" : "") +
      "</span>" +
      "<b>" + esc(e.txt) + "</b></li>"
    );
  }).join("");

  var faltam = INDICADORES.filter(function (ind) {
    return estadoIndicador(r, ind).estado === "falta";
  }).length;

  return secao(
    "Os nove indicadores mínimos",
    '<p class="s-intro">São os nove que a mentoria instala no painel de qualquer ' +
      "clínica. Este formulário toca em quatro deles, e é por isso que a leitura " +
      "acima é um começo, não um retrato completo." +
      (faltam ? " Hoje, " + faltam + " deles estão sem número na sua mão." : "") +
      "</p>" +
      '<ul class="inds">' + linhas + "</ul>",
    "s-ind"
  );
}

/* ------------------------------------------------------------ O CENÁRIO
   Aritmética declarada, não previsão. A diferença está escrita no texto,
   porque prometer resultado é vedado e porque seria falso. */
function cenarioSec(r) {
  var c = cenario(r);
  if (!c) return "";

  return secao(
    "Uma conta, não uma previsão",
    "<p>Você informou que " + c.pctHoje + "% do faturamento depende da sua " +
      "presença, o que hoje são " + esc(c.presoHoje) + " por mês. " +
      "Se esse número caísse pela metade, para " + c.pctMetade + "%, " +
      "a parte presa passaria a ser " + esc(c.presoDepois) + ".</p>" +
      '<p class="destaque">A diferença é ' + esc(c.liberado) + " por mês, " +
      esc(c.liberadoAno) + " em doze meses, de faturamento que deixaria de " +
      "depender de você estar na sala.</p>" +
      "<p>Isto não é uma projeção e não é uma promessa. É a mesma conta de antes " +
      "com um número trocado, para mostrar o tamanho do que está em jogo. " +
      "Se a dependência vai cair, em quanto tempo e a que custo, é exatamente o " +
      "que a sessão existe para responder, olhando a sua operação.</p>",
    "s-txt"
  );
}

/* ------------------------------------------------- AS FERRAMENTAS DE BOLSO
   Quatro contas que ele roda sozinho, hoje, sem nós. Entregar isto de graça é
   o que separa uma análise de um anúncio. */
function ferramentas() {
  var linhas = FERRAMENTAS.map(function (f) {
    return (
      '<li class="fer">' +
      '<span class="fer-p">' + esc(f.pilar) + "</span>" +
      "<h3>" + esc(f.o) + "</h3>" +
      "<p>" + esc(f.como) + "</p></li>"
    );
  }).join("");

  return secao(
    "Quatro contas que você pode fazer sozinho",
    '<p class="s-intro">Uma por pilar, com dado que já está na sua clínica. ' +
      "São as mesmas que abrem cada encontro da mentoria. Fazer qualquer uma " +
      "delas nesta semana muda o que você sabe, mesmo que a gente nunca " +
      "converse.</p>" +
      '<ul class="fers">' + linhas + "</ul>",
    "s-fer faixa faixa-carvao"
  );
}

/* ------------------------------------------------------- OS ENTREGÁVEIS */
function entregaveis() {
  var linhas = ENTREGAVEIS.map(function (e) {
    return "<li class='ent'><h3>" + esc(e.o) + "</h3><p>" + esc(e.d) + "</p></li>";
  }).join("");

  return secao(
    "O que a mentoria entrega",
    "<ul class='ents'>" + linhas + "</ul>",
    "s-ent"
  );
}
