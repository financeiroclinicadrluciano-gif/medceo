/* =========================================================================
   Formulario de qualificacao do MedCEO.

   Todo botao que leva ao WhatsApp, em qualquer pagina do site, abre este
   popup antes. Ninguem chega na conversa sem responder.

   POR QUE ISTO EXISTE
   O grupo e a conversa recebiam contato sem nenhuma informacao de quem
   estava do outro lado. Sem cargo, sem tamanho de operacao, sem faturamento,
   nao da para saber se o trafego pago esta trazendo medico dono de clinica
   ou estudante curioso. O formulario transforma cada clique em uma linha de
   planilha com nome, contato e quatro respostas de qualificacao.

   POR QUE ELE MORA AQUI E NAO NO HTML DE CADA PAGINA
   Sao 25 paginas e 60 botoes. Editar uma por uma significa que a proxima
   pagina nasce sem o formulario, e que o gerador do blog apaga a edicao no
   proximo deploy, exatamente como aconteceu com a versao do tracking.js em
   26/08. Este arquivo e carregado pelo tracking.js, que ja esta nas 25
   paginas e ja e versionado por hash.

   COMO O CLIQUE E CAPTURADO
   Listener no document em fase de captura, o mesmo padrao do tracking.js.
   Captura pega o evento antes de qualquer handler da propria pagina, entao
   funciona em botao, link e elemento com data-track, e funciona tambem em
   botao que a pagina cria depois do carregamento.

   O QUE ACONTECE COM O DADO
   POST para um Web App do Apps Script, que grava uma linha na planilha. O
   envio e no-cors, entao a resposta nao e legivel: por isso existe fila em
   localStorage, e o envio que falhar e repetido no proximo carregamento de
   qualquer pagina do site. Sem fila, uma queda de rede no meio do envio
   perderia o lead em silencio.
   ====================================================================== */
(function () {
  "use strict";

  if (window.__MC_QUALIFICA) return;
  window.__MC_QUALIFICA = true;

  /* ----------------------------------------------------------------------
     1. Configuracao
     ------------------------------------------------------------------- */

  /* URL do Web App do Apps Script. Enquanto estiver vazia o formulario
     funciona e libera o WhatsApp normalmente, mas a resposta so fica na fila
     local. Preencher depois de publicar o script como aplicativo da web. */
  var ENDPOINT = window.MC_FORM_ENDPOINT ||
    "https://script.google.com/macros/s/AKfycbzDRR-ZonKXZyDvWwiglT0c8EFkTFoaD1ZfAW6CLrAB5ySAt_wl5jpn2WzF-OGLotQy/exec";

  var CHAVE_LEAD = "medceo:lead";
  var CHAVE_FILA = "medceo:fila";

  var RE_WHATS = /wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com/;

  /* ----------------------------------------------------------------------
     2. As perguntas

     Quatro, em tres telas. Multi-etapa converte melhor que um formulario
     longo: cada tela respondida e um compromisso ja assumido, e a barra
     mostra que falta pouco.

     A pergunta de faturamento e a que mais faz gente desistir quando vem
     como sondagem comercial. Ela esta enquadrada como fase da clinica, que
     e a informacao que o MedCEO usa de verdade (os cinco niveis), da o mesmo
     dado e soa como diagnostico em vez de peneira de dinheiro.

     A quarta pergunta, o gargalo, nao estava no pedido. Ela entra porque e
     a unica que o medico responde com vontade, ja que fala da dor dele, e
     porque e o que da assunto pro primeiro contato humano. Vale mais para
     a abordagem que a faixa de faturamento sozinha.
     ------------------------------------------------------------------- */

  var TELAS = [
    {
      tag: "1 de 3",
      titulo: "Para quem é este grupo",
      texto:
        "Sala fechada, só de médico. Precisamos do seu contato para " +
        "liberar a entrada e avisar das aulas.",
      campos: [
        { id: "nome", rotulo: "Seu nome", tipo: "text", ph: "Nome e sobrenome", auto: "name" },
        { id: "email", rotulo: "Seu e-mail", tipo: "email", ph: "nome@email.com", auto: "email" },
        { id: "fone", rotulo: "Seu WhatsApp", tipo: "tel", ph: "(41) 99999-9999", auto: "tel" },
      ],
    },
    {
      tag: "2 de 3",
      perguntas: [
        {
          id: "atuacao",
          titulo: "Como você atende hoje?",
          unica: true,
          opcoes: [
            { v: "clinica_propria", r: "Tenho clínica própria", d: "Sou dono ou sócio do espaço" },
            {
              v: "consultorio",
              r: "Consultório próprio",
              d: "Atendo no meu, sozinho ou com equipe pequena",
            },
            {
              v: "terceiros",
              r: "Atendo em espaço de terceiros",
              d: "Clínica de outro, hospital ou coworking",
            },
            {
              v: "nao_atendendo",
              r: "Não estou atendendo agora",
              d: "Pausa, transição ou só plantão",
            },
            { v: "estudante", r: "Estou na faculdade de medicina", d: "Ainda em formação" },
          ],
        },
        {
          id: "equipe",
          titulo: "Quantas pessoas trabalham com você?",
          unica: true,
          opcoes: [
            { v: "0", r: "Não tenho equipe" },
            { v: "1a3", r: "1 a 3 pessoas" },
            { v: "4a10", r: "4 a 10 pessoas" },
            { v: "11a30", r: "11 a 30 pessoas" },
            { v: "30+", r: "Mais de 30 pessoas" },
          ],
        },
        {
          id: "pilares",
          titulo: "Quais frentes já existem na sua operação?",
          ajuda: "Pode marcar mais de uma.",
          opcoes: [
            { v: "marketing", r: "Marketing", d: "Alguém cuidando de conteúdo ou anúncio" },
            { v: "comercial", r: "Comercial", d: "Alguém que responde e agenda" },
            { v: "gestao", r: "Gestão", d: "Alguém que olha número e processo" },
            { v: "financeiro", r: "Financeiro", d: "Fluxo de caixa e precificação" },
            { v: "recepcao", r: "Recepção e atendimento" },
            { v: "nenhum", r: "Não tenho nenhuma dessas", exclusiva: true },
          ],
        },
      ],
    },
    {
      tag: "3 de 3",
      perguntas: [
        {
          id: "fase",
          titulo: "Em qual fase a sua clínica está hoje?",
          ajuda:
            "A faixa serve para o Dr. Luciano saber de onde partir na " +
            "conversa. Nenhum valor é divulgado.",
          unica: true,
          opcoes: [
            { v: "ate30", r: "Até R$ 30 mil por mês", d: "Começando ou reconstruindo" },
            { v: "30a80", r: "R$ 30 mil a R$ 80 mil", d: "Agenda girando, margem apertada" },
            {
              v: "80a200",
              r: "R$ 80 mil a R$ 200 mil",
              d: "Operação montada, dono ainda no centro",
            },
            { v: "200a500", r: "R$ 200 mil a R$ 500 mil", d: "Estrutura formada, escala em vista" },
            { v: "500+", r: "Acima de R$ 500 mil", d: "Múltiplas frentes ou unidades" },
            { v: "prefiro_nao", r: "Prefiro não informar agora" },
          ],
        },
        {
          id: "gargalo",
          titulo: "O que mais te trava hoje?",
          unica: true,
          opcoes: [
            { v: "dependencia", r: "A clínica para quando eu paro" },
            { v: "margem", r: "Fatura bem e sobra pouco" },
            { v: "leads", r: "Falta paciente entrando" },
            { v: "conversao", r: "Chega lead e não vira consulta" },
            { v: "equipe", r: "Equipe que não anda sozinha" },
            { v: "tempo", r: "Não tenho tempo para nada disso" },
          ],
        },
      ],
    },
  ];

  /* ----------------------------------------------------------------------
     3. Estilo

     Escrito aqui e nao em arquivo separado para que o popup nao dependa de
     um segundo download: se o CSS demorar, o formulario aparece sem forma e
     o lead sai. Paleta lida do proprio /webnar2 em 26/08.
     ------------------------------------------------------------------- */

  var CSS = [
    ".mcq-fundo{position:fixed;inset:0;z-index:99998;background:rgba(4,9,14,.86);",
    "backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;",
    "transition:opacity .28s ease;overflow-y:auto;padding:20px;",
    "display:flex;align-items:center;justify-content:center}",
    ".mcq-fundo.mcq-on{opacity:1}",

    ".mcq-caixa{position:relative;width:100%;max-width:960px;background:#0B1620;",
    "border:1px solid rgba(200,169,81,.22);border-radius:16px;overflow:hidden;",
    "display:grid;grid-template-columns:1fr;box-shadow:0 30px 90px rgba(0,0,0,.6);",
    "transform:translateY(14px);transition:transform .34s cubic-bezier(.16,1,.3,1);",
    "font-family:Poppins,system-ui,-apple-system,Segoe UI,sans-serif}",
    ".mcq-fundo.mcq-on .mcq-caixa{transform:translateY(0)}",
    "@media(min-width:900px){.mcq-caixa{grid-template-columns:340px minmax(0,1fr)}}",

    /* coluna da imagem */
    ".mcq-arte{position:relative;background:#07131D;overflow:hidden;",
    "display:flex;flex-direction:column;justify-content:flex-end;padding:22px}",
    ".mcq-fundo-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;",
    "object-position:50% 22%;opacity:.62}",
    '.mcq-arte::after{content:"";position:absolute;inset:0;',
    "background:linear-gradient(180deg,rgba(7,19,29,.08) 0%,rgba(7,19,29,.55) 46%,",
    "rgba(7,19,29,.95) 100%)}",
    ".mcq-arte>*{position:relative;z-index:2}",
    ".mcq-logo{height:24px;width:auto;align-self:flex-start;margin-bottom:auto;",
    "filter:drop-shadow(0 2px 8px rgba(0,0,0,.7))}",
    ".mcq-selo{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;",
    "letter-spacing:.2em;text-transform:uppercase;color:#E7D28C;margin:0 0 8px;",
    "text-shadow:0 1px 6px rgba(0,0,0,.9)}",
    '.mcq-arte h3{font-family:"Playfair Display",Georgia,serif;font-size:20px;',
    "line-height:1.26;color:#F7F0E4;margin:0 0 7px;font-weight:500;",
    "text-shadow:0 2px 12px rgba(0,0,0,.8)}",
    ".mcq-arte p{font-size:12.5px;line-height:1.5;color:#A3AEB8;margin:0}",

    /* no celular a arte e so uma faixa: cada pixel dela sai do formulario */
    "@media(max-width:899px){",
    ".mcq-arte{height:92px;min-height:92px;padding:0 18px 12px;justify-content:flex-end}",
    ".mcq-fundo-img{object-position:50% 20%;opacity:.5}",
    ".mcq-arte::after{background:linear-gradient(180deg,rgba(7,19,29,.35) 0%,",
    "rgba(7,19,29,.9) 100%)}",
    ".mcq-logo,.mcq-arte h3,.mcq-arte p:not(.mcq-selo){display:none}",
    ".mcq-selo{margin:0}}",
    "@media(min-width:900px){.mcq-arte{min-height:100%}.mcq-arte h3{font-size:22px}}",

    /* coluna do formulario */
    ".mcq-corpo{padding:26px 24px 22px;display:flex;flex-direction:column;min-height:0}",
    "@media(min-width:900px){.mcq-corpo{padding:30px 32px 26px}}",

    ".mcq-barra{height:2px;background:rgba(200,169,81,.16);border-radius:2px;margin-bottom:20px}",
    ".mcq-barra i{display:block;height:100%;background:linear-gradient(90deg,#C8A951,#E7D28C);",
    "border-radius:2px;width:33%;transition:width .38s cubic-bezier(.16,1,.3,1)}",

    ".mcq-tag{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;",
    "letter-spacing:.2em;text-transform:uppercase;color:#C8A951;margin:0 0 10px}",
    '.mcq-h{font-family:"Playfair Display",Georgia,serif;font-size:24px;line-height:1.22;',
    "color:#F7F0E4;margin:0 0 8px;font-weight:500}",
    ".mcq-sub{font-size:13.5px;line-height:1.58;color:#8B98A3;margin:0 0 20px}",

    ".mcq-tela{display:none}.mcq-tela.mcq-vis{display:block}",
    ".mcq-rola{max-height:min(56vh,470px);overflow-y:auto;margin:0 -6px;padding:0 6px 2px}",
    ".mcq-rola::-webkit-scrollbar{width:5px}",
    ".mcq-rola::-webkit-scrollbar-thumb{background:rgba(200,169,81,.26);border-radius:5px}",

    ".mcq-campo{margin-bottom:14px}",
    ".mcq-campo label{display:block;font-size:11px;letter-spacing:.06em;",
    "text-transform:uppercase;color:#8B98A3;margin-bottom:6px}",
    ".mcq-campo input{width:100%;box-sizing:border-box;background:#07131D;",
    "border:1px solid rgba(200,169,81,.2);border-radius:9px;padding:13px 14px;",
    "color:#F7F0E4;font-size:15px;font-family:inherit;transition:border-color .2s}",
    ".mcq-campo input::placeholder{color:#55616B}",
    ".mcq-campo input:focus{outline:none;border-color:#C8A951}",
    ".mcq-campo.mcq-ruim input{border-color:#C05B4D}",
    ".mcq-erro{display:none;font-size:11.5px;color:#D98A7E;margin-top:5px}",
    ".mcq-campo.mcq-ruim .mcq-erro{display:block}",

    ".mcq-grupo{margin-bottom:22px}",
    ".mcq-grupo>h4{font-size:15px;line-height:1.4;color:#F7F0E4;margin:0 0 4px;font-weight:600}",
    ".mcq-ajuda{font-size:12px;line-height:1.5;color:#65727C;margin:0 0 10px}",
    ".mcq-grupo.mcq-ruim>h4{color:#D98A7E}",

    ".mcq-op{display:flex;align-items:flex-start;gap:11px;width:100%;box-sizing:border-box;",
    "background:#07131D;border:1px solid rgba(200,169,81,.14);border-radius:10px;",
    "padding:12px 13px;margin-bottom:7px;cursor:pointer;text-align:left;",
    "font-family:inherit;transition:border-color .18s,background .18s}",
    ".mcq-op:hover{border-color:rgba(200,169,81,.4)}",
    ".mcq-op.mcq-sel{border-color:#C8A951;background:rgba(200,169,81,.09)}",
    ".mcq-cx{flex:0 0 18px;width:18px;height:18px;margin-top:1px;border-radius:5px;",
    "border:1.5px solid rgba(200,169,81,.42);position:relative;transition:all .18s}",
    ".mcq-op.mcq-sel .mcq-cx{background:#C8A951;border-color:#C8A951}",
    '.mcq-cx::after{content:"";position:absolute;left:5.5px;top:2px;width:4px;height:9px;',
    "border:solid #07131D;border-width:0 2px 2px 0;transform:rotate(45deg) scale(0);",
    "transition:transform .18s cubic-bezier(.16,1,.3,1)}",
    ".mcq-op.mcq-sel .mcq-cx::after{transform:rotate(45deg) scale(1)}",
    ".mcq-op b{display:block;font-size:14px;font-weight:500;color:#F7F0E4;line-height:1.35}",
    ".mcq-op span{display:block;font-size:12px;color:#65727C;margin-top:2px;line-height:1.42}",

    ".mcq-pe{display:flex;gap:10px;align-items:center;margin-top:18px}",
    ".mcq-btn{flex:1;background:linear-gradient(135deg,#C8A951,#E7D28C);color:#07131D;",
    "border:none;border-radius:10px;padding:14px 18px;font-size:14.5px;font-weight:600;",
    "font-family:inherit;cursor:pointer;transition:opacity .2s}",
    ".mcq-btn:hover{opacity:.9}",
    ".mcq-btn:disabled{opacity:.5;cursor:default}",
    ".mcq-volta{background:none;border:none;color:#65727C;font-size:13px;font-family:inherit;",
    "cursor:pointer;padding:12px 6px}",
    ".mcq-volta:hover{color:#C8A951}",

    ".mcq-nota{font-size:11px;line-height:1.5;color:#55616B;margin:12px 0 0;text-align:center}",

    ".mcq-x{position:absolute;top:12px;right:12px;z-index:5;width:32px;height:32px;",
    "border-radius:50%;border:1px solid rgba(200,169,81,.24);background:rgba(7,19,29,.8);",
    "color:#8B98A3;font-size:17px;line-height:1;cursor:pointer;transition:all .2s}",
    ".mcq-x:hover{color:#F7F0E4;border-color:#C8A951}",

    /* tela final */
    ".mcq-fim{text-align:center;padding:14px 0 4px}",
    ".mcq-tick{width:52px;height:52px;margin:0 auto 16px;border-radius:50%;",
    "border:1.5px solid #C8A951;display:flex;align-items:center;justify-content:center}",
    '.mcq-tick::after{content:"";width:10px;height:19px;border:solid #C8A951;',
    "border-width:0 2px 2px 0;transform:rotate(45deg) translate(-1px,-2px)}",

    "@media(prefers-reduced-motion:reduce){.mcq-fundo,.mcq-caixa,.mcq-barra i,",
    ".mcq-cx::after{transition:none}}",
  ].join("");

  /* ----------------------------------------------------------------------
     4. Utilitarios
     ------------------------------------------------------------------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ler(chave) {
    try {
      return JSON.parse(localStorage.getItem(chave) || "null");
    } catch (e) {
      return null;
    }
  }
  function gravar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {}
  }

  /* Telefone brasileiro: 10 ou 11 digitos depois de tirar o codigo do pais.
     A mascara nao rejeita nada sozinha, so formata enquanto digita. */
  function mascaraFone(v) {
    var d = String(v).replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  function foneValido(v) {
    var d = String(v).replace(/\D/g, "");
    return d.length === 10 || d.length === 11;
  }
  function emailValido(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  }

  /* ----------------------------------------------------------------------
     5. Fila de envio

     O POST vai como no-cors, entao o navegador nao deixa ler a resposta e
     nao da para saber se o Apps Script gravou. O que da para saber e se a
     requisicao saiu. O que nao saiu fica na fila e e reenviado no proximo
     carregamento de qualquer pagina.
     ------------------------------------------------------------------- */

  function enfileirar(dados) {
    var f = ler(CHAVE_FILA) || [];
    f.push(dados);
    gravar(CHAVE_FILA, f.slice(-20));
  }

  function postar(dados) {
    if (!ENDPOINT) {
      enfileirar(dados);
      return Promise.resolve(false);
    }
    return fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      /* text/plain nao dispara preflight, que o Apps Script nao responde */
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dados),
    })
      .then(function () {
        return true;
      })
      .catch(function () {
        enfileirar(dados);
        return false;
      });
  }

  function escoarFila() {
    var f = ler(CHAVE_FILA);
    if (!ENDPOINT || !f || !f.length) return;
    gravar(CHAVE_FILA, []);
    f.forEach(function (d) {
      postar(d);
    });
  }

  /* ----------------------------------------------------------------------
     6. Montagem do modal
     ------------------------------------------------------------------- */

  var fundo = null,
    caixa = null,
    estado = null;

  function opcaoHTML(p, o) {
    return (
      '<button type="button" class="mcq-op" data-p="' +
      esc(p.id) +
      '" data-v="' +
      esc(o.v) +
      '"' +
      (o.exclusiva ? ' data-x="1"' : "") +
      ">" +
      '<i class="mcq-cx"></i>' +
      "<span><b>" +
      esc(o.r) +
      "</b>" +
      (o.d ? "<span>" + esc(o.d) + "</span>" : "") +
      "</span>" +
      "</button>"
    );
  }

  function grupoHTML(p) {
    return (
      '<div class="mcq-grupo" data-g="' +
      esc(p.id) +
      '">' +
      "<h4>" +
      esc(p.titulo) +
      "</h4>" +
      (p.ajuda ? '<p class="mcq-ajuda">' + esc(p.ajuda) + "</p>" : "") +
      p.opcoes
        .map(function (o) {
          return opcaoHTML(p, o);
        })
        .join("") +
      "</div>"
    );
  }

  function campoHTML(c) {
    return (
      '<div class="mcq-campo" data-c="' +
      esc(c.id) +
      '">' +
      '<label for="mcq-' +
      esc(c.id) +
      '">' +
      esc(c.rotulo) +
      "</label>" +
      '<input id="mcq-' +
      esc(c.id) +
      '" name="' +
      esc(c.id) +
      '" type="' +
      esc(c.tipo) +
      '" placeholder="' +
      esc(c.ph) +
      '" autocomplete="' +
      esc(c.auto || "on") +
      '">' +
      '<em class="mcq-erro"></em>' +
      "</div>"
    );
  }

  function telaHTML(t, i) {
    var dentro = t.campos ? t.campos.map(campoHTML).join("") : t.perguntas.map(grupoHTML).join("");
    return (
      '<div class="mcq-tela' +
      (i === 0 ? " mcq-vis" : "") +
      '" data-t="' +
      i +
      '">' +
      '<p class="mcq-tag">' +
      esc(t.tag) +
      "</p>" +
      (t.titulo ? '<h2 class="mcq-h">' + esc(t.titulo) + "</h2>" : "") +
      (t.texto ? '<p class="mcq-sub">' + esc(t.texto) + "</p>" : "") +
      '<div class="mcq-rola">' +
      dentro +
      "</div>" +
      "</div>"
    );
  }

  function montar() {
    if (fundo) return;

    var st = document.createElement("style");
    st.id = "mcq-css";
    st.textContent = CSS;
    document.head.appendChild(st);

    fundo = document.createElement("div");
    fundo.className = "mcq-fundo";
    fundo.setAttribute("role", "dialog");
    fundo.setAttribute("aria-modal", "true");
    fundo.setAttribute("aria-label", "Formulário de entrada no grupo do MedCEO");

    fundo.innerHTML =
      '<div class="mcq-caixa">' +
      '<button type="button" class="mcq-x" aria-label="Fechar">&times;</button>' +
      '<div class="mcq-arte">' +
      '<img class="mcq-fundo-img" src="/assets/medceo/webnar-hero.jpg" alt="">' +
      '<img class="mcq-logo" src="/assets/medceo/logo.png" alt="MedCEO">' +
      '<p class="mcq-selo">Exclusivo para médicos</p>' +
      "<h3>Sala fechada, só de médico dono de clínica.</h3>" +
      "<p>Uma aula ao vivo por semana, materiais liberados e outros " +
      "médicos na mesma fase. Sem custo.</p>" +
      "</div>" +
      '<div class="mcq-corpo">' +
      '<div class="mcq-barra"><i></i></div>' +
      "<form novalidate>" +
      TELAS.map(telaHTML).join("") +
      '<div class="mcq-tela" data-t="' +
      TELAS.length +
      '">' +
      '<div class="mcq-fim">' +
      '<div class="mcq-tick"></div>' +
      '<h2 class="mcq-h">Tudo certo.</h2>' +
      '<p class="mcq-sub">Estamos abrindo o WhatsApp para você.</p>' +
      "</div>" +
      "</div>" +
      '<div class="mcq-pe">' +
      '<button type="button" class="mcq-volta" hidden>Voltar</button>' +
      '<button type="submit" class="mcq-btn">Continuar</button>' +
      "</div>" +
      '<p class="mcq-nota">Seus dados ficam com a equipe do MedCEO. ' +
      "Nada é vendido nem compartilhado.</p>" +
      "</form>" +
      "</div>" +
      "</div>";

    document.body.appendChild(fundo);
    caixa = fundo.querySelector(".mcq-caixa");
    ligar();
  }

  /* ----------------------------------------------------------------------
     7. Comportamento
     ------------------------------------------------------------------- */

  function ligar() {
    var form = fundo.querySelector("form");
    var btn = fundo.querySelector(".mcq-btn");
    var voltar = fundo.querySelector(".mcq-volta");

    fundo.querySelector(".mcq-x").addEventListener("click", fechar);
    fundo.addEventListener("mousedown", function (ev) {
      if (ev.target === fundo) fechar();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && fundo && fundo.classList.contains("mcq-on")) fechar();
    });

    /* mascara do telefone */
    var fone = fundo.querySelector("#mcq-fone");
    if (fone) {
      fone.addEventListener("input", function () {
        var p = this.selectionStart === this.value.length;
        this.value = mascaraFone(this.value);
        if (p) this.setSelectionRange(this.value.length, this.value.length);
      });
    }

    /* limpar o erro assim que a pessoa corrige */
    form.addEventListener("input", function (ev) {
      var c = ev.target.closest(".mcq-campo");
      if (c) c.classList.remove("mcq-ruim");
    });

    /* selecao de opcao */
    form.addEventListener("click", function (ev) {
      var op = ev.target.closest(".mcq-op");
      if (!op) return;
      ev.preventDefault();

      var grupo = op.closest(".mcq-grupo");
      var pid = op.getAttribute("data-p");
      var perg = acharPergunta(pid);
      grupo.classList.remove("mcq-ruim");

      if (perg && perg.unica) {
        grupo.querySelectorAll(".mcq-op").forEach(function (o) {
          o.classList.remove("mcq-sel");
        });
        op.classList.add("mcq-sel");
        return;
      }

      /* multipla: a opcao marcada como exclusiva limpa as outras, e
         qualquer outra limpa a exclusiva. Sem isto, "nao tenho nenhuma
         dessas" convive com "marketing" e a linha da planilha mente. */
      var eraSel = op.classList.contains("mcq-sel");
      if (op.getAttribute("data-x")) {
        grupo.querySelectorAll(".mcq-op").forEach(function (o) {
          o.classList.remove("mcq-sel");
        });
        if (!eraSel) op.classList.add("mcq-sel");
      } else {
        var x = grupo.querySelector(".mcq-op[data-x]");
        if (x) x.classList.remove("mcq-sel");
        op.classList.toggle("mcq-sel");
      }
    });

    voltar.addEventListener("click", function () {
      irPara(estado.tela - 1);
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!validarTela(estado.tela)) return;
      colher(estado.tela);
      if (estado.tela < TELAS.length - 1) {
        irPara(estado.tela + 1);
        return;
      }
      concluir();
    });

    function acharPergunta(id) {
      for (var i = 0; i < TELAS.length; i++) {
        var ps = TELAS[i].perguntas || [];
        for (var j = 0; j < ps.length; j++) if (ps[j].id === id) return ps[j];
      }
      return null;
    }
  }

  function elTela(i) {
    return fundo.querySelector('.mcq-tela[data-t="' + i + '"]');
  }

  function irPara(i) {
    estado.tela = i;
    fundo.querySelectorAll(".mcq-tela").forEach(function (t) {
      t.classList.toggle("mcq-vis", Number(t.getAttribute("data-t")) === i);
    });
    fundo.querySelector(".mcq-barra i").style.width =
      Math.round(((i + 1) / TELAS.length) * 100) + "%";
    fundo.querySelector(".mcq-volta").hidden = i === 0;
    fundo.querySelector(".mcq-btn").textContent =
      i === TELAS.length - 1 ? "Entrar no grupo" : "Continuar";
    var r = elTela(i) && elTela(i).querySelector(".mcq-rola");
    if (r) r.scrollTop = 0;
    var p = elTela(i) && elTela(i).querySelector("input");
    if (p && window.matchMedia("(min-width:900px)").matches) p.focus();
  }

  function validarTela(i) {
    var t = TELAS[i],
      el = elTela(i),
      ok = true,
      primeiro = null;

    (t.campos || []).forEach(function (c) {
      var div = el.querySelector('.mcq-campo[data-c="' + c.id + '"]');
      var inp = div.querySelector("input");
      var v = inp.value.trim();
      var msg = "";

      if (!v) msg = "Preencha este campo.";
      else if (c.id === "email" && !emailValido(v)) msg = "Confira o e-mail.";
      else if (c.id === "fone" && !foneValido(v)) msg = "Confira o número, com DDD.";
      else if (c.id === "nome" && v.length < 3) msg = "Escreva seu nome completo.";

      div.classList.toggle("mcq-ruim", !!msg);
      div.querySelector(".mcq-erro").textContent = msg;
      if (msg) {
        ok = false;
        if (!primeiro) primeiro = div;
      }
    });

    (t.perguntas || []).forEach(function (p) {
      var g = el.querySelector('.mcq-grupo[data-g="' + p.id + '"]');
      var tem = g.querySelector(".mcq-op.mcq-sel");
      g.classList.toggle("mcq-ruim", !tem);
      if (!tem) {
        ok = false;
        if (!primeiro) primeiro = g;
      }
    });

    if (primeiro && primeiro.scrollIntoView) {
      primeiro.scrollIntoView({ block: "nearest", behavior: "smooth" });
      var f = primeiro.querySelector("input");
      if (f) f.focus();
    }
    return ok;
  }

  function colher(i) {
    var t = TELAS[i],
      el = elTela(i);
    (t.campos || []).forEach(function (c) {
      estado.dados[c.id] = el.querySelector("#mcq-" + c.id).value.trim();
    });
    (t.perguntas || []).forEach(function (p) {
      var vs = Array.prototype.map.call(
        el.querySelectorAll('.mcq-grupo[data-g="' + p.id + '"] .mcq-op.mcq-sel'),
        function (o) {
          return o.getAttribute("data-v");
        },
      );
      estado.dados[p.id] = vs.join(", ");
    });
  }

  function concluir() {
    var btn = fundo.querySelector(".mcq-btn");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    var origem = (window.MCTrack && window.MCTrack.origem && window.MCTrack.origem()) || {};
    var linha = {
      enviado_em: new Date().toISOString(),
      nome: estado.dados.nome,
      email: estado.dados.email,
      fone: estado.dados.fone,
      fone_digitos: String(estado.dados.fone).replace(/\D/g, ""),
      atuacao: estado.dados.atuacao,
      equipe: estado.dados.equipe,
      pilares: estado.dados.pilares,
      fase: estado.dados.fase,
      gargalo: estado.dados.gargalo,
      destino: estado.tipo,
      pagina: location.pathname,
      botao: estado.rotulo,
      utm_source: origem.utm_source || "",
      utm_medium: origem.utm_medium || "",
      utm_campaign: origem.utm_campaign || "",
      canal: origem.canal || "",
      site_marca: window.SITE_MARCA || "medceo",
    };

    gravar(CHAVE_LEAD, {
      nome: linha.nome,
      email: linha.email,
      fone: linha.fone,
      em: linha.enviado_em,
    });

    /* o evento sai antes do POST: se o Apps Script cair, ainda existe o
       registro no GA4 e no pixel, e a campanha nao fica cega */
    if (window.MCTrack && typeof window.MCTrack.event === "function") {
      window.MCTrack.event("formulario_qualificacao", {
        destino: linha.destino,
        atuacao: linha.atuacao,
        fase: linha.fase,
        gargalo: linha.gargalo,
        equipe: linha.equipe,
      });
    }

    postar(linha).then(function () {
      irPara(TELAS.length);
      fundo.querySelector(".mcq-pe").style.display = "none";
      setTimeout(abrirDestino, 900);
    });
  }

  function abrirDestino() {
    var u = estado.href;
    fechar();
    if (!u) return;
    /* window.open bloqueia fora de gesto do usuario em parte dos
       navegadores; location.href sempre funciona */
    var w = window.open(u, "_blank", "noopener");
    if (!w) window.location.href = u;
  }

  function abrir(href, tipo, rotulo) {
    montar();
    estado = { tela: 0, dados: {}, href: href, tipo: tipo, rotulo: rotulo || "" };

    /* pre-preencher para quem ja passou por aqui antes */
    var ant = ler(CHAVE_LEAD);
    if (ant) {
      ["nome", "email", "fone"].forEach(function (k) {
        var i = fundo.querySelector("#mcq-" + k);
        if (i && ant[k]) i.value = ant[k];
      });
    }

    fundo.querySelectorAll(".mcq-op.mcq-sel").forEach(function (o) {
      o.classList.remove("mcq-sel");
    });
    fundo.querySelectorAll(".mcq-ruim").forEach(function (o) {
      o.classList.remove("mcq-ruim");
    });
    fundo.querySelector(".mcq-pe").style.display = "";
    var b = fundo.querySelector(".mcq-btn");
    b.disabled = false;

    irPara(0);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      fundo.classList.add("mcq-on");
    });

    if (window.MCTrack && typeof window.MCTrack.event === "function") {
      window.MCTrack.event("formulario_abriu", { destino: tipo, botao: rotulo || "" });
    }
  }

  function fechar() {
    if (!fundo) return;
    fundo.classList.remove("mcq-on");
    document.body.style.overflow = "";
    setTimeout(function () {
      if (fundo) fundo.style.display = "none";
    }, 300);
    setTimeout(function () {
      if (fundo) fundo.style.display = "";
    }, 340);
  }

  /* ----------------------------------------------------------------------
     8. Interceptacao dos cliques

     Captura no document, igual ao tracking.js. Pega botao, link e elemento
     com data-track, inclusive os que a pagina cria depois de carregar.

     Quem ja preencheu neste navegador passa direto. O formulario existe para
     qualificar o lead, nao para cobrar pedagio de quem ja pagou: repetir o
     preenchimento a cada visita derrubaria a conversao de quem ja e nosso.
     ------------------------------------------------------------------- */

  function jaPreencheu() {
    var l = ler(CHAVE_LEAD);
    return !!(l && l.email && l.fone);
  }

  document.addEventListener(
    "click",
    function (ev) {
      if (ev.defaultPrevented) return;
      if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

      var alvo = ev.target.closest("a, button, [data-track]");
      if (!alvo) return;
      if (alvo.closest(".mcq-caixa")) return;
      if (alvo.hasAttribute("data-sem-form")) return;

      var href = alvo.getAttribute("href") || alvo.getAttribute("data-href") || "";
      var ehWhats = RE_WHATS.test(href) || alvo.getAttribute("data-track") === "whatsapp";
      if (!ehWhats) return;

      if (jaPreencheu()) return;

      ev.preventDefault();
      ev.stopPropagation();

      abrir(
        href,
        /chat\.whatsapp\.com/.test(href) ? "grupo" : "conversa",
        (alvo.textContent || "").trim().slice(0, 60),
      );
    },
    true,
  );

  /* reenvio do que ficou na fila */
  if (document.readyState === "complete") escoarFila();
  else window.addEventListener("load", escoarFila);

  /* abertura manual: MC_FORM("https://chat.whatsapp.com/...") */
  window.MC_FORM = function (href, rotulo) {
    abrir(href || "", /chat\.whatsapp\.com/.test(href || "") ? "grupo" : "conversa", rotulo);
  };
  window.MC_FORM_LIMPAR = function () {
    try {
      localStorage.removeItem(CHAVE_LEAD);
    } catch (e) {}
    return "lead local apagado, o formulario volta a abrir";
  };
})();
