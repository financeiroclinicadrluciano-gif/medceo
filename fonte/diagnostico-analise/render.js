/* Monta o HTML da análise.

   A ordem das seções é a ordem que o médico precisa, não a ordem em que a
   análise foi calculada:

     1. o veredito, em uma frase que se lê de longe
     2. a conversa no WhatsApp
     3. a análise inteira
     4. o botão que salva em PDF

   SOBRE A FORMA, três decisões que a primeira versão errou e esta corrige:

   - Nada de rótulo em versalete acima de cada título. Um rótulo desses é ruído
     que se repete oito vezes na página e ensina o leitor a pular. O título
     carrega o próprio peso.
   - Nada de barra de progresso. Uma barra desenha uma precisão que três
     respostas não têm. O pilar diz "2 de 5" em número e o resto é palavra.
   - Nada de card uniforme como estrutura da página. O que separa uma seção da
     outra é espaço e régua fina, e o que chama atenção é tamanho de tipo.

   Sobre a voz, três regras do canônico 028-A-VOZ-DO-GUSTAVO valem em cada
   frase: supor em vez de afirmar, o número encostando no bolso, e a decepção
   antecipada dentro do próprio texto. Sem travessão como pontuação, sem
   "não é X, é Y" repetido, sem promessa de faturamento.

   Tudo que veio do formulário passa por esc(). O nome e o texto que o médico
   escreveu voltam para dentro de HTML, e sem escapar isso é uma porta aberta.
*/

var M = require("./motor.js");
var C = require("./contas.js");
var L = require("./leitura.js");
var P = require("./passos.js");
var N = require("./niveis.js");

var WHATS = "5541984875688";
var MSG =
  "Olá! Terminei o diagnóstico da minha clínica e gostaria de agendar a sessão " +
  "para conversar sobre o resultado.";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function href() {
  return "https://wa.me/" + WHATS + "?text=" + encodeURIComponent(MSG);
}

/* "Dra. Marina Prado Silva" vira { curto: "Dra. Marina", primeiro: "Marina" }.
   O tratamento sai do que a própria pessoa escreveu, nunca deduzido do nome. */
function tratar(nome) {
  var bruto = String(nome || "").trim();
  if (!bruto) return { trat: "", primeiro: "", curto: "" };
  var m = bruto.match(/^(dra?\.?)\s+(.*)$/i);
  var trat = "";
  var resto = bruto;
  if (m) {
    trat = m[1].toLowerCase().indexOf("dra") === 0 ? "Dra." : "Dr.";
    resto = m[2];
  }
  var primeiro = resto.split(/\s+/)[0] || "";
  return { trat: trat, primeiro: primeiro, curto: (trat + " " + primeiro).trim() };
}

function hoje() {
  var d = new Date();
  var meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return d.getDate() + " de " + meses[d.getMonth()] + " de " + d.getFullYear();
}

/* Uma seção. O título é um h2 de verdade, sem rótulo em cima. `largura` deixa
   algumas seções mais estreitas que outras, e é essa variação que impede a
   página de virar uma pilha de blocos iguais. */
function secao(titulo, conteudo, classe) {
  return (
    '<section class="s ' + (classe || "") + '">' +
    (titulo ? '<h2 class="s-tit">' + esc(titulo) + "</h2>" : "") +
    conteudo +
    "</section>"
  );
}

function botoes(variante) {
  return (
    '<div class="acoes' + (variante ? " acoes-" + variante : "") + '">' +
    '<a class="bt" href="' + href() + '" target="_blank" rel="noreferrer">' +
    "Agendar a sessão no WhatsApp</a>" +
    '<button type="button" class="bt bt-2" data-an-pdf>Baixar em PDF</button>' +
    "</div>"
  );
}

/* --------------------------------------------------------- 1. o veredito

   A abertura não é uma capa com nome de clínica e data. É a frase que resume
   a leitura, no maior tipo da página, com o nível logo abaixo. Quem lê só isto
   já sabe o que recebeu. */
function abertura(r, nome, pilares) {
  var nota = N.notaGeral(pilares);
  var nv = nota === null ? null : N.nivelPara(nota, r, pilares);
  var quem = [r.clinica, r.cidade].filter(Boolean).map(esc).join(", ");

  return (
    '<header class="capa">' +
    '<p class="capa-quem">' + (quem || esc(nome.curto)) +
    (r.especialidade ? " · " + esc(r.especialidade) : "") + "</p>" +
    (nv
      ? '<h1 class="capa-tese">' + esc(nv.resumo) + "</h1>" +
        '<p class="capa-nivel"><b>Nível ' + nv.n + "</b>, " + esc(nv.titulo) + "</p>" +
        '<p class="capa-txt">' + esc(nv.texto) + "</p>" +
        '<p class="capa-ressalva">O nível não tem relação com o quanto você fatura. ' +
        "Existe clínica faturando alto no nível 2 e clínica menor no nível 4.</p>"
      : '<h1 class="capa-tese">A sua leitura</h1>') +
    "</header>"
  );
}

/* --------------------------------------------------------- 2. a chamada
   Vem logo depois do veredito: quem já decidiu conversar não precisa rolar a
   página inteira para achar como. */
function chamada(nome) {
  var quem = nome.curto ? esc(nome.curto) + ", a" : "A";
  return (
    '<section class="cta">' +
    "<p>" + quem + " leitura abaixo é sua, para ler com calma. " +
    "A sessão de uma hora é onde ela vira decisão: o Dr. Luciano e os quatro " +
    "pilares abrem esses números com você. São três sessões por semana.</p>" +
    botoes() +
    "</section>"
  );
}

/* ------------------------------------------------- 3. o que ele escreveu */
function palavras(r, nome) {
  var f = L.frase(r.gargalos);
  if (!f) return "";
  var extra = L.frase(r.prioridade_agora, 150);
  var quem = nome.primeiro ? ", " + esc(nome.primeiro) : "";
  return secao(
    "",
    '<blockquote class="cit">' + esc(f) + "</blockquote>" +
      (extra ? '<p class="cit-p">E sobre por que virou prioridade agora: ' + esc(extra) + "</p>" : "") +
      '<p class="cit-nota">É daí que a sessão começa' + quem +
      ". O que vem abaixo é o que os seus próprios números dizem sobre essa frase.</p>",
    "s-cit"
  );
}

/* ------------------------------------------------------------ 4. o achado */
function achado(r, pilares) {
  var conv = L.convergencia(r, pilares);
  if (!conv) return "";

  if (conv.semMedida) {
    return secao(
      "O que este formulário não mediu",
      "<p>Você escreveu sobre " + esc(conv.rot) +
        ", e nenhuma das perguntas daqui consegue medir isso. Não vou fingir uma " +
        "leitura que os dados não sustentam. Captação é uma das quatro reuniões " +
        "iniciais da mentoria, e é lá que a origem dos seus últimos pacientes é " +
        "levantada, um por um.</p>",
      "s-txt"
    );
  }

  var meta = N.PILARES[conv.pilar];
  if (!meta) return "";

  if (conv.bate) {
    return secao(
      "O achado",
      "<p class='destaque'>O que você descreveu e o que os seus números mostram " +
        "apontam para o mesmo lugar.</p>" +
        "<p>Você escreveu sobre " + esc(conv.rot) + ", e " + esc(meta.rot) +
        " é o pilar mais baixo da sua leitura. Quando a percepção do dono e o " +
        "número coincidem, o problema costuma estar mesmo ali.</p>" +
        "<p>Isso não quer dizer que resolver seja rápido. Quer dizer que você já " +
        "sabe onde olhar, o que é mais do que a maior parte das clínicas tem na " +
        "hora de decidir mudar alguma coisa.</p>",
      "s-txt"
    );
  }
  if (conv.baixo) {
    return secao(
      "O achado",
      "<p class='destaque'>Você está olhando para um problema real, e existe um " +
        "outro abaixo dele.</p>" +
        "<p>Você escreveu sobre " + esc(conv.rot) + ", e " + esc(meta.rot) +
        " está mesmo entre os pilares mais baixos. Só que outro está ainda mais " +
        "abaixo, e ele costuma ser a causa, não a consequência. Começar pelo que " +
        "dói mais é o instinto certo na ordem errada, e desfazer esse nó é meia " +
        "hora de conversa.</p>",
      "s-txt"
    );
  }
  return secao(
    "O achado",
    "<p class='destaque'>A sua leitura e os seus números discordam, e isso é " +
      "uma informação boa.</p>" +
      "<p>Você escreveu sobre " + esc(conv.rot) + ", e os números colocam outro " +
      "pilar bem mais abaixo. Não quer dizer que você esteja errado: quer dizer " +
      "que existem duas leituras da mesma clínica, e é esse tipo de diferença " +
      "que uma hora de sessão resolve.</p>",
    "s-txt"
  );
}

/* -------------------------------------------------------- 5. os pilares

   Lista com régua, não card com barra. A nota aparece como "2 de 5" em número
   tabular, que é o que os dados sustentam, e o peso visual vem do tipo. */
function pilares(mapa) {
  var chaves = Object.keys(N.PILARES).sort(function (a, b) {
    return N.PILARES[a].ordem - N.PILARES[b].ordem;
  });
  var medidos = chaves.filter(function (k) { return mapa[k]; });
  if (!medidos.length) return "";

  var menor = Math.min.apply(null, medidos.map(function (k) { return mapa[k].nota; }));

  var linhas = chaves
    .map(function (k) {
      var meta = N.PILARES[k];
      var p = mapa[k];

      if (!p) {
        return (
          '<div class="pil pil-vazio">' +
          '<div class="pil-cab"><h3>' + esc(meta.rot) + "</h3>" +
          '<span class="pil-nota">não medido</span></div>' +
          "<p>" + esc(meta.naoMedido) + "</p>" +
          "</div>"
        );
      }

      var eh = p.nota === menor;
      return (
        '<div class="pil' + (eh ? " pil-gargalo" : "") + '">' +
        '<div class="pil-cab">' +
        "<h3>" + esc(meta.rot) + (eh ? ' <em>o gargalo</em>' : "") + "</h3>" +
        '<span class="pil-nota"><b>' + p.nota + "</b> de 5</span>" +
        "</div>" +
        "<p>" + esc(p.nota <= 3 ? meta.fraco : meta.forte) + "</p>" +
        '<p class="pil-sinal">' + esc(p.sinais.join(". ")) + ".</p>" +
        "</div>"
      );
    })
    .join("");

  return secao("Os quatro pilares", '<div class="pils">' + linhas + "</div>", "s-pil");
}

/* --------------------------------------------------------- 6. as contas

   Cada conta é um número grande com a conta escrita embaixo. Sem caixa: o que
   separa uma da outra é régua fina e espaço. */
function contas(r) {
  var lista = C.todasAsContas(r);
  if (!lista.length) return "";
  var itens = lista
    .map(function (c) {
      return (
        '<div class="cta-num">' +
        "<h3>" + esc(c.titulo) + "</h3>" +
        '<p class="num">' + esc(c.valor) + "</p>" +
        (c.valorAno ? '<p class="num-2">' + esc(c.valorAno) + "</p>" : "") +
        '<p class="num-txt">' + esc(c.conta) + "</p>" +
        '<p class="num-ps">' + esc(c.pressuposto) + "</p>" +
        "</div>"
      );
    })
    .join("");
  return secao(
    "O que isso vale, em reais",
    '<p class="s-intro">Cada conta usa apenas os números que você acabou de ' +
      "informar, e mostra a conta inteira. Se algum pressuposto não bater com a " +
      "sua realidade, o número muda, e é isso que a sessão acerta.</p>" +
      '<div class="nums">' + itens + "</div>",
    "s-num"
  );
}

/* --------------------------------------------------------- 7. os passos */
function passos(mapa) {
  var esc2 = P.proximosPassos(mapa);
  if (!esc2.passos.length) return "";
  var meta = N.PILARES[esc2.pilar];
  var itens = esc2.passos
    .map(function (p, i) {
      return (
        '<li class="pas">' +
        '<span class="pas-n">' + (i + 1) + "</span>" +
        "<div><h3>" + esc(p.o) + "</h3>" +
        "<p>" + esc(p.porque) + "</p>" +
        '<p class="pas-q">' + esc(p.quando) + "</p></div>" +
        "</li>"
      );
    })
    .join("");
  return secao(
    "Três passos, começando pelo gargalo",
    '<p class="s-intro">Os três atacam ' + esc(meta ? meta.rot : "o gargalo") +
      ". Nenhum exige contratar ninguém, comprar sistema ou gastar dinheiro, e o " +
      "primeiro já muda o que você sabe sobre a própria clínica.</p>" +
      '<ol class="pass">' + itens + "</ol>",
    "s-pas"
  );
}

/* ----------------------------------------------------------- 8. o fecho */
function fecho(r) {
  var q = L.frase(r.clareza_desejada, 150);
  return (
    '<section class="fim">' +
    (q
      ? '<p class="fim-q">Você quer sair da sessão com clareza sobre isto:</p>' +
        '<blockquote class="cit cit-2">' + esc(q) + "</blockquote>"
      : "<p>Esta é a leitura possível a partir do que você respondeu.</p>") +
    "<p>Na sessão, essa é a primeira pergunta da hora. A saída é um plano com " +
    "ordem e prazo, não uma lista de coisas para fazer.</p>" +
    botoes("fim") +
    '<p class="rodape">Leitura gerada a partir das suas respostas em ' + hoje() +
    ". Os valores derivam das faixas que você marcou e são aproximações " +
    "declaradas, não medições da sua contabilidade. Este documento organiza " +
    "sinais de gestão da operação. Não é avaliação clínica, não é auditoria " +
    "contábil e não promete resultado financeiro.</p>" +
    "</section>"
  );
}

/* A ordem das seções é a ordem de leitura de um documento, não a ordem de
   cálculo: o veredito, o resumo em três linhas, a conversa, e só então a
   demonstração inteira. Quem para no meio já levou o essencial. */
function montarAnalise(r) {
  var nome = tratar(r.nome);
  var mapa = M.pontuar(r);
  return (
    '<article class="an">' +
    abertura(r, nome, mapa) +
    sumario(r, mapa) +
    chamada(nome) +
    palavras(r, nome) +
    achado(r, mapa) +
    pilares(mapa) +
    contas(r) +
    cenarioSec(r) +
    regua(r, mapa) +
    indicadores(r) +
    passos(mapa) +
    ferramentas() +
    entregaveis() +
    fecho(r) +
    "</article>"
  );
}

module.exports = { montarAnalise: montarAnalise, tratar: tratar, esc: esc, WHATS: WHATS, MSG: MSG };
