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
     longo: cada tela respondida e um compromisso ja assumido, e os tres
     tracos no topo mostram que falta pouco.

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
    /* --- Vela sobre a pagina ------------------------------------------- */
    ".mcq-fundo{position:fixed;inset:0;z-index:99998;background:rgba(3,6,10,.78);",
    "backdrop-filter:blur(10px) saturate(120%);-webkit-backdrop-filter:blur(10px) saturate(120%);",
    "opacity:0;transition:opacity .3s ease;overflow-y:auto;padding:20px;",
    "display:flex;align-items:center;justify-content:center}",
    ".mcq-fundo.mcq-on{opacity:1}",

    /* --- A caixa: vidro, e nao superficie chapada ----------------------
       A linha de luz no topo (inset 0 1px 0) e o que faz a borda ler como
       vidro em vez de contorno desenhado. */
    ".mcq-caixa{position:relative;width:100%;max-width:980px;",
    "background:rgba(12,19,27,.9);",
    "backdrop-filter:blur(28px) saturate(150%);-webkit-backdrop-filter:blur(28px) saturate(150%);",
    "border:1px solid rgba(255,255,255,.11);border-radius:20px;overflow:hidden;",
    "display:grid;grid-template-columns:1fr;",
    /* Teto de altura: sem ele a foto de 700x1500 estica a caixa para fora
       da tela e o texto da arte fica cortado. Medido a 1440x900. */
    "max-height:calc(100dvh - 40px);",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 40px 110px rgba(0,0,0,.72);",
    "transform:translateY(16px) scale(.99);",
    "transition:transform .42s cubic-bezier(.16,1,.3,1);",
    "font-family:Poppins,system-ui,-apple-system,Segoe UI,sans-serif}",
    ".mcq-fundo.mcq-on .mcq-caixa{transform:translateY(0) scale(1)}",
    "@media(min-width:900px){.mcq-caixa{grid-template-columns:352px minmax(0,1fr)}}",

    /* --- Coluna da arte: a foto E a coluna ----------------------------- */
    ".mcq-arte{position:relative;background:#070D14;overflow:hidden;min-height:0;",
    "display:flex;flex-direction:column;justify-content:flex-end}",
    /* absolutas de proposito: no fluxo, a foto de 700x1500 dimensionaria a
       coluna e a caixa passaria da altura da tela */
    ".mcq-fundo-img{position:absolute;inset:0;width:100%;height:100%;",
    "object-fit:cover;object-position:50% 26%}",
    ".mcq-veu{position:absolute;inset:0;background:linear-gradient(180deg,",
    "rgba(6,11,17,.28) 0%,rgba(6,11,17,.12) 26%,rgba(6,11,17,.72) 60%,",
    "rgba(6,11,17,.97) 100%)}",
    ".mcq-texto{position:relative;z-index:2;padding:24px 22px 24px}",
    ".mcq-logo{height:26px;width:auto;margin:0 0 14px;display:block;",
    "filter:drop-shadow(0 2px 10px rgba(0,0,0,.8))}",
    '.mcq-arte h3{font-family:"Playfair Display",Georgia,serif;font-size:21px;',
    "line-height:1.24;color:#F7F0E4;margin:0 0 8px;font-weight:400;",
    "text-shadow:0 2px 14px rgba(0,0,0,.75)}",
    ".mcq-arte h3 i{font-style:normal;color:#E7D3A3}",
    ".mcq-arte p{font-size:13px;line-height:1.55;color:rgba(234,226,207,.72);margin:0}",
    ".mcq-selo{display:inline-block;margin:0 0 12px;padding:5px 12px;border-radius:999px;",
    "border:1px solid rgba(195,161,78,.42);background:rgba(5,7,10,.45);",
    "backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);",
    "font-size:11.5px;letter-spacing:.05em;color:#E7D3A3}",

    /* No celular a arte vira faixa. Ela usa outro recorte, horizontal, porque
       o vertical cortado em 150px de altura mostraria so os ombros. */
    "@media(max-width:899px){",
    ".mcq-arte{height:132px;min-height:132px}",
    ".mcq-fundo-img{object-position:50% 22%}",
    ".mcq-veu{background:linear-gradient(180deg,rgba(6,11,17,.2) 0%,",
    "rgba(6,11,17,.66) 58%,rgba(6,11,17,.97) 100%)}",
    ".mcq-texto{padding:0 18px 14px}",
    ".mcq-logo{height:22px;margin:0 0 8px}",
    ".mcq-arte h3,.mcq-arte p{display:none}",
    ".mcq-selo{margin:0}}",

    /* --- Coluna do formulario ------------------------------------------ */
    ".mcq-corpo{padding:24px 22px 20px;display:flex;flex-direction:column;",
    "min-height:0;overflow-y:auto}",
    "@media(min-width:900px){.mcq-corpo{padding:34px 34px 26px}}",

    /* Progresso em tres tracos, no lugar do rotulo "1 DE 3" em caixa alta,
       que o playbook anti-IA lista como kicker. */
    ".mcq-passos{display:flex;gap:6px;margin:0 0 22px;padding:0;list-style:none}",
    ".mcq-passos li{height:3px;flex:1;border-radius:3px;",
    "background:rgba(255,255,255,.1);overflow:hidden;position:relative}",
    '.mcq-passos li::after{content:"";position:absolute;inset:0;border-radius:3px;',
    "background:linear-gradient(90deg,#C3A14E,#E7D3A3);",
    "transform:scaleX(0);transform-origin:left;",
    "transition:transform .44s cubic-bezier(.16,1,.3,1)}",
    ".mcq-passos li.mcq-feito::after{transform:scaleX(1)}",

    '.mcq-h{font-family:"Playfair Display",Georgia,serif;font-size:clamp(23px,2.4vw,28px);',
    "line-height:1.2;letter-spacing:-.01em;color:#F7F0E4;margin:0 0 9px;font-weight:400}",
    ".mcq-h i{font-style:normal;color:#E7D3A3}",
    ".mcq-sub{font-size:14px;line-height:1.6;color:rgba(234,226,207,.66);margin:0 0 22px}",

    ".mcq-tela{display:none}.mcq-tela.mcq-vis{display:block}",
    /* fade nas bordas em vez de corte seco: a opcao que continua abaixo
       aparece desbotando, e nao cortada na metade */
    ".mcq-rola{max-height:min(54vh,440px);overflow-y:auto;margin:0 -6px;padding:2px 6px 6px;",
    "-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 10px,#000 calc(100% - 16px),transparent 100%);",
    "mask-image:linear-gradient(180deg,transparent 0,#000 10px,#000 calc(100% - 16px),transparent 100%)}",
    ".mcq-rola::-webkit-scrollbar{width:4px}",
    ".mcq-rola::-webkit-scrollbar-thumb{background:rgba(195,161,78,.3);border-radius:4px}",

    /* --- Campos de texto, em vidro ------------------------------------- */
    ".mcq-campo{margin-bottom:15px}",
    ".mcq-campo label{display:block;font-size:12.5px;color:rgba(234,226,207,.6);",
    "margin-bottom:7px;letter-spacing:0}",
    ".mcq-campo input{width:100%;box-sizing:border-box;",
    "background:rgba(255,255,255,.045);",
    "backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);",
    "border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:14px 15px;",
    "color:#F7F0E4;font-size:15.5px;font-family:inherit;",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.07);",
    "transition:border-color .22s ease,box-shadow .22s ease,background .22s ease}",
    ".mcq-campo input::placeholder{color:rgba(234,226,207,.34)}",
    ".mcq-campo input:focus{outline:none;border-color:rgba(195,161,78,.75);",
    "background:rgba(255,255,255,.07);",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 0 3px rgba(195,161,78,.14)}",
    ".mcq-campo.mcq-ruim input{border-color:#C05B4D}",
    ".mcq-erro{display:none;font-size:12px;color:#E09A8E;margin-top:6px;font-style:normal}",
    ".mcq-campo.mcq-ruim .mcq-erro{display:block}",

    /* --- Perguntas ------------------------------------------------------ */
    ".mcq-grupo{margin-bottom:24px}",
    ".mcq-grupo:last-child{margin-bottom:6px}",
    '.mcq-grupo>h4{font-family:"Playfair Display",Georgia,serif;font-size:19px;',
    "line-height:1.3;color:#F7F0E4;margin:0 0 5px;font-weight:400}",
    ".mcq-ajuda{font-size:12.5px;line-height:1.5;color:rgba(234,226,207,.5);margin:0 0 12px}",
    ".mcq-grupo.mcq-ruim>h4{color:#E09A8E}",

    /* Opcao em vidro. O marcador e um circulo que preenche, no lugar do
       quadradinho de checkbox, que e o desenho padrao de formulario. */
    ".mcq-op{display:flex;align-items:flex-start;gap:13px;width:100%;box-sizing:border-box;",
    "background:rgba(255,255,255,.04);",
    "backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);",
    "border:1px solid rgba(255,255,255,.1);border-radius:12px;",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.06);",
    "padding:13px 15px;margin-bottom:9px;cursor:pointer;text-align:left;",
    "font-family:inherit;",
    "transition:border-color .2s ease,background .2s ease,transform .3s cubic-bezier(.16,1,.3,1)}",
    ".mcq-op:hover{border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.07);",
    "transform:translateY(-1px)}",
    ".mcq-op.mcq-sel{border-color:rgba(195,161,78,.8);background:rgba(195,161,78,.1);",
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.1)}",
    ".mcq-cx{flex:0 0 19px;width:19px;height:19px;margin-top:2px;border-radius:50%;",
    "border:1.5px solid rgba(234,226,207,.3);position:relative;",
    "transition:border-color .2s ease}",
    ".mcq-op.mcq-sel .mcq-cx{border-color:#C3A14E}",
    '.mcq-cx::after{content:"";position:absolute;inset:3.5px;border-radius:50%;',
    "background:linear-gradient(135deg,#C3A14E,#E7D3A3);",
    "transform:scale(0);transition:transform .24s cubic-bezier(.16,1,.3,1)}",
    ".mcq-op.mcq-sel .mcq-cx::after{transform:scale(1)}",
    ".mcq-op b{display:block;font-size:14.5px;font-weight:400;color:#F7F0E4;line-height:1.36}",
    ".mcq-op span{display:block;font-size:12.5px;color:rgba(234,226,207,.5);",
    "margin-top:3px;line-height:1.45}",

    /* --- Rodape do formulario ------------------------------------------- */
    ".mcq-pe{display:flex;gap:12px;align-items:center;margin-top:20px}",
    ".mcq-btn{flex:1;background:linear-gradient(135deg,#C3A14E,#E7D3A3);color:#0A0C10;",
    "border:none;border-radius:999px;padding:15px 22px;font-size:15px;font-weight:500;",
    "letter-spacing:.01em;font-family:inherit;cursor:pointer;",
    "box-shadow:0 10px 30px rgba(195,161,78,.24);",
    "transition:box-shadow .26s ease,transform .3s cubic-bezier(.16,1,.3,1),filter .2s}",
    ".mcq-btn:hover{filter:brightness(1.06);box-shadow:0 14px 38px rgba(195,161,78,.34);",
    "transform:translateY(-1px)}",
    ".mcq-btn:disabled{opacity:.45;cursor:default;box-shadow:none;transform:none}",
    ".mcq-volta{background:none;border:none;color:rgba(234,226,207,.5);font-size:13.5px;",
    "font-family:inherit;cursor:pointer;padding:12px 8px;transition:color .2s}",
    ".mcq-volta:hover{color:#E7D3A3}",

    ".mcq-nota{font-size:11.5px;line-height:1.5;color:rgba(234,226,207,.38);",
    "margin:14px 0 0;text-align:center}",

    ".mcq-x{position:absolute;top:14px;right:14px;z-index:5;width:34px;height:34px;",
    "border-radius:50%;border:1px solid rgba(255,255,255,.14);",
    "background:rgba(8,13,20,.55);",
    "backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);",
    "color:rgba(234,226,207,.66);font-size:17px;line-height:1;cursor:pointer;",
    "transition:color .2s,border-color .2s,background .2s}",
    ".mcq-x:hover{color:#F7F0E4;border-color:rgba(195,161,78,.6);background:rgba(8,13,20,.8)}",

    /* --- Tela final ------------------------------------------------------ */
    ".mcq-fim{text-align:center;padding:26px 0 10px}",
    ".mcq-tick{width:62px;height:62px;margin:0 auto 20px;border-radius:50%;",
    "border:1px solid rgba(195,161,78,.55);background:rgba(195,161,78,.08);",
    "box-shadow:0 0 0 8px rgba(195,161,78,.05);",
    "display:flex;align-items:center;justify-content:center}",
    '.mcq-tick::after{content:"";width:11px;height:21px;border:solid #E7D3A3;',
    "border-width:0 2px 2px 0;transform:rotate(45deg) translate(-1px,-2px)}",

    "@media(prefers-reduced-motion:reduce){.mcq-fundo,.mcq-caixa,.mcq-passos li::after,",
    ".mcq-cx::after,.mcq-op,.mcq-btn{transition:none}",
    ".mcq-op:hover,.mcq-btn:hover{transform:none}}",
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
      '<picture>' +
      '<source media="(max-width:899px)" srcset="/assets/medceo/form-arte-faixa.webp">' +
      '<img class="mcq-fundo-img" src="/assets/medceo/form-arte.webp" alt="" ' +
      'width="700" height="1500">' +
      '</picture>' +
      '<span class="mcq-veu" aria-hidden="true"></span>' +
      '<div class="mcq-texto">' +
      '<img class="mcq-logo" src="/assets/medceo/logo.png" alt="MedCEO" width="360" height="74">' +
      '<span class="mcq-selo">Exclusivo para m\u00e9dicos</span>' +
      "<h3>Sala fechada, s\u00f3 de m\u00e9dico <i>dono de cl\u00ednica</i>.</h3>" +
      "<p>Uma aula ao vivo por semana, materiais liberados e outros " +
      "m\u00e9dicos na mesma fase. Sem custo.</p>" +
      "</div>" +
      "</div>" +
      '<div class="mcq-corpo">' +
      '<ul class="mcq-passos">' +
      '<li class="mcq-feito"></li><li></li><li></li>' +
      '</ul>' +
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
    /* Tres tracos que acendem, no lugar do rotulo "1 DE 3" em caixa alta, que
       o playbook anti-IA lista como kicker. Diz a mesma coisa sem texto. */
    fundo.querySelectorAll(".mcq-passos li").forEach(function (li, n) {
      li.classList.toggle("mcq-feito", n <= i);
    });
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
