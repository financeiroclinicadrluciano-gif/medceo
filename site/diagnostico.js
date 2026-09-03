/* MedCEO — Formulário de Diagnóstico (pré-sessão).
   Vanilla, sem dependência. Reaproveita o padrão de envio de qualifica.js
   (POST text/plain sem preflight, fila em localStorage, no-cors) e o padrão
   visual de /diagnostico (tokens, glass, Playfair + Poppins + JetBrains Mono).

   Diferença de propósito: qualifica.js é o portão rápido de 3 telas na
   frente de QUALQUER botão de WhatsApp do site. Este formulário é destino
   deliberado, mais profundo, para quem já decidiu que quer a sessão de
   diagnóstico com o Dr. Luciano e os pilares. Os dois convivem, nenhum
   substitui o outro. */
(function () {
  "use strict";

  var ENDPOINT =
    window.MC_DIAG_ENDPOINT ||
    "https://script.google.com/macros/s/AKfycbwYdsPM6RGZ-9hP3stjWN-SDyf4ej7fqFgCGl_FRN8Z307Q9-quP1Jq0WNGlvhNaIn72Q/exec";
  /* Web App do apps-script-painel.gs, publicado em 2026-09-03 e verificado
     com POST real: a linha chega na aba PAINEL da planilha
     1VlUUl-BfG5HaVbkKCanHIxp2OB95R2IPEFeWnXOwxCw.
     Se a implantação for republicada, a URL /exec muda e esta linha também.
     Enquanto a URL não responder, a resposta fica na fila do localStorage
     e sai sozinha na próxima visita, sem se perder. */

  var CHAVE_FILA = "medceo:diag:fila";
  var CHAVE_RASCUNHO = "medceo:diag:rascunho";

  /* ---------------------------------------------------------------------
     1. Os passos e os campos.

     Cada campo tem: id (a chave que chega na planilha), rotulo, tipo
     (text/tel/email/textarea/radio), e para radio a lista de opções como
     [valor, rótulo]. obrigatorio marca o que trava o avanço. quando(d) é a
     lógica de campo condicional (Q7A só aparece se Q7 não for "sim").
     ------------------------------------------------------------------- */
  var PASSOS = [
    {
      titulo: "Identificação",
      campos: [
        {
          id: "nome",
          rotulo: "Como você gostaria de ser chamado(a) na nossa conversa?",
          tipo: "text",
          ph: "Nome completo, e Dr. ou Dra. se preferir",
          auto: "name",
          obrigatorio: true,
        },
        {
          id: "telefone",
          rotulo: "Seu WhatsApp",
          tipo: "tel",
          ph: "(41) 99999-9999",
          auto: "tel",
          obrigatorio: true,
        },
        {
          id: "email",
          rotulo: "Seu e-mail",
          tipo: "email",
          ph: "nome@email.com",
          auto: "email",
          obrigatorio: false,
        },
        {
          id: "especialidade",
          rotulo: "Qual é a sua especialidade médica?",
          tipo: "text",
          ph: "Ex: dermatologia",
          obrigatorio: true,
        },
        {
          id: "clinica",
          rotulo: "Qual é o nome da sua clínica?",
          tipo: "text",
          ph: "Nome da clínica",
          obrigatorio: true,
        },
        {
          id: "cidade",
          rotulo: "Em qual cidade ela está localizada?",
          tipo: "text",
          ph: "Cidade",
          obrigatorio: true,
        },
      ],
    },
    {
      titulo: "Como a operação roda hoje",
      campos: [
        {
          id: "gargalos",
          rotulo:
            "Descreva em detalhes como a sua operação roda hoje: " +
            "quais são os principais gargalos no dia a dia?",
          tipo: "textarea",
          ph: "Tempo, gestão de equipe, vendas, o que fizer sentido.",
          obrigatorio: true,
        },
        {
          id: "equipe",
          rotulo: "Quantas pessoas trabalham na operação hoje?",
          tipo: "radio",
          obrigatorio: true,
          opcoes: [
            ["so_eu", "Somente eu"],
            ["1a3", "1 a 3 pessoas"],
            ["4a7", "4 a 7 pessoas"],
            ["8a15", "8 a 15 pessoas"],
            ["15mais", "Mais de 15 pessoas"],
          ],
        },
        {
          id: "decisor",
          rotulo:
            "Você é o único responsável pelas decisões estratégicas " + "e financeiras da clínica?",
          tipo: "radio",
          obrigatorio: true,
          opcoes: [
            ["sim", "Sim"],
            ["socio", "Não, tenho sócio(a)"],
            ["outro", "Existe outro decisor envolvido"],
          ],
        },
        {
          id: "socio_participa",
          rotulo: "Essa pessoa deveria participar da sessão de " + "diagnóstico?",
          tipo: "radio",
          obrigatorio: false,
          quando: function (r) {
            return r.decisor && r.decisor !== "sim";
          },
          opcoes: [
            ["sim", "Sim"],
            ["nao", "Não"],
          ],
        },
      ],
    },
    {
      titulo: "Os números de hoje",
      campos: [
        {
          id: "faturamento",
          rotulo: "Qual foi a média de faturamento bruto mensal nos " + "últimos 3 meses?",
          tipo: "radio",
          obrigatorio: true,
          opcoes: [
            ["ate25", "Até R$ 25 mil/mês"],
            ["25a50", "R$ 25 mil a R$ 50 mil/mês"],
            ["50a80", "R$ 50 mil a R$ 80 mil/mês"],
            ["80a150", "R$ 80 mil a R$ 150 mil/mês"],
            ["150a300", "R$ 150 mil a R$ 300 mil/mês"],
            ["300mais", "Acima de R$ 300 mil/mês"],
            ["prefiro_nao", "Prefiro informar durante a reunião"],
          ],
        },
        {
          id: "margem",
          rotulo: "Hoje você acompanha a margem líquida da clínica?",
          tipo: "radio",
          obrigatorio: true,
          opcoes: [
            ["sim", "Sim, acompanho regularmente"],
            ["estimativa", "Tenho uma estimativa"],
            ["financeiro", "O financeiro acompanha, eu não domino o número"],
            ["nao", "Não acompanho"],
          ],
        },
        {
          id: "conversao",
          rotulo: "De cada 10 pessoas que pedem orçamento ou avaliação, " + "quantas hoje fecham?",
          tipo: "radio",
          obrigatorio: true,
          opcoes: [
            ["0a2", "0 a 2"],
            ["3a4", "3 a 4"],
            ["5a6", "5 a 6"],
            ["7a8", "7 a 8"],
            ["9a10", "9 a 10"],
            ["nao_sei", "Não sei dizer"],
          ],
        },
        {
          id: "queda_ferias",
          rotulo:
            "Se você tirasse uma semana inteira de férias, o " +
            "faturamento da clínica cairia quanto?",
          tipo: "radio",
          obrigatorio: true,
          opcoes: [
            ["ate10", "Até 10%"],
            ["10a25", "10% a 25%"],
            ["25a40", "25% a 40%"],
            ["40a60", "40% a 60%"],
            ["60mais", "Mais de 60%"],
            ["nao_sei", "Não sei estimar"],
          ],
        },
      ],
    },
    {
      titulo: "Onde você quer chegar",
      campos: [
        {
          id: "desejo",
          rotulo:
            "O que você gostaria de ter construído ou mudado nos " +
            "últimos 6 meses e ainda não conseguiu tirar do papel? Por qual motivo?",
          tipo: "textarea",
          obrigatorio: true,
        },
        {
          id: "prioridade_agora",
          rotulo: "Por que esse problema virou uma prioridade agora?",
          tipo: "textarea",
          obrigatorio: true,
        },
      ],
    },
    {
      titulo: "A sessão de diagnóstico",
      campos: [
        {
          id: "clareza_desejada",
          rotulo:
            "Qual é a principal questão que você gostaria de " +
            "sair da sessão de diagnóstico tendo clareza?",
          tipo: "textarea",
          obrigatorio: true,
        },
        {
          id: "horario_preferido",
          rotulo:
            "Qual horário, independente do dia, você fica " +
            "mais propenso a realizar a reunião conosco?",
          tipo: "radio",
          obrigatorio: true,
          opcoes: [
            ["manha", "Manhã, 8h às 12h"],
            ["tarde", "Tarde, 12h às 18h"],
            ["noite", "Início da noite, 18h às 21h"],
          ],
        },
        {
          id: "info_extra",
          rotulo:
            "Existe alguma informação sobre sua clínica, equipe ou " +
            "momento atual que considera importante sabermos antes da reunião?",
          tipo: "textarea",
          obrigatorio: false,
        },
      ],
    },
  ];

  var TOTAL = PASSOS.length;

  /* ---------------------------------------------------------------------
     2. Estado, fila e envio — mesmo mecanismo de qualifica.js.
     ------------------------------------------------------------------- */
  var estado = { passo: 0, respostas: {} };

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
    return v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  }

  /* ---------------------------------------------------------------------
     3. Render. Um passo por vez, um campo por linha, radio como cartão.
     ------------------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function campoVisivel(campo) {
    return !campo.quando || campo.quando(estado.respostas);
  }

  function renderCampo(campo) {
    var v = estado.respostas[campo.id] || "";
    var wrap = document.createElement("div");
    wrap.className = "ag-campo";
    wrap.dataset.id = campo.id;
    if (!campoVisivel(campo)) wrap.hidden = true;

    var label = document.createElement("label");
    label.className = "ag-rotulo";
    label.textContent = campo.rotulo;
    wrap.appendChild(label);

    if (campo.ph_apoio) {
      var apoio = document.createElement("small");
      apoio.className = "ag-apoio";
      apoio.textContent = campo.ph_apoio;
      wrap.appendChild(apoio);
    }

    if (campo.tipo === "textarea") {
      var ta = document.createElement("textarea");
      ta.className = "ag-input ag-textarea";
      ta.placeholder = campo.ph || "";
      ta.value = v;
      ta.addEventListener("input", function () {
        estado.respostas[campo.id] = ta.value;
        limparErro(wrap);
        salvarRascunho();
      });
      wrap.appendChild(ta);
    } else if (campo.tipo === "radio") {
      var grade = document.createElement("div");
      grade.className = "ag-opcoes";
      campo.opcoes.forEach(function (op) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "ag-opt" + (v === op[0] ? " ag-opt-on" : "");
        b.textContent = op[1];
        b.addEventListener("click", function () {
          estado.respostas[campo.id] = op[0];
          grade.querySelectorAll(".ag-opt").forEach(function (x) {
            x.classList.remove("ag-opt-on");
          });
          b.classList.add("ag-opt-on");
          limparErro(wrap);
          salvarRascunho();
          atualizarCondicionais();
        });
        grade.appendChild(b);
      });
      wrap.appendChild(grade);
    } else {
      var inp = document.createElement("input");
      inp.className = "ag-input";
      inp.type = campo.tipo;
      inp.placeholder = campo.ph || "";
      inp.autocomplete = campo.auto || "on";
      inp.value = v;
      inp.addEventListener("input", function () {
        var val = inp.value;
        if (campo.tipo === "tel") {
          val = mascaraFone(val);
          inp.value = val;
        }
        estado.respostas[campo.id] = val;
        limparErro(wrap);
        salvarRascunho();
      });
      wrap.appendChild(inp);
    }

    var erro = document.createElement("em");
    erro.className = "ag-erro";
    wrap.appendChild(erro);
    return wrap;
  }

  function limparErro(wrap) {
    wrap.classList.remove("ag-ruim");
  }

  function atualizarCondicionais() {
    document.querySelectorAll(".ag-campo").forEach(function (el) {
      var campo = campoPorId(el.dataset.id);
      if (!campo) return;
      el.hidden = !campoVisivel(campo);
    });
  }

  function campoPorId(id) {
    for (var p = 0; p < PASSOS.length; p++) {
      for (var c = 0; c < PASSOS[p].campos.length; c++) {
        if (PASSOS[p].campos[c].id === id) return PASSOS[p].campos[c];
      }
    }
    return null;
  }

  function renderPasso() {
    var passo = PASSOS[estado.passo];
    var corpo = document.querySelector("[data-ag-corpo]");
    corpo.innerHTML = "";

    var h = document.createElement("h2");
    h.className = "ag-titulo-passo";
    h.textContent = passo.titulo;
    corpo.appendChild(h);

    passo.campos.forEach(function (campo) {
      corpo.appendChild(renderCampo(campo));
    });

    var seg = document.querySelector("[data-ag-segmentos]");
    if (seg) {
      seg.innerHTML = "";
      for (var i = 0; i < TOTAL; i++) {
        var s = document.createElement("span");
        s.className =
          "ag-seg" +
          (i < estado.passo ? " ag-seg-feito" : i === estado.passo ? " ag-seg-atual" : "");
        seg.appendChild(s);
      }
    }
    var num = document.querySelector("[data-ag-num]");
    if (num) num.textContent = estado.passo + 1 + " / " + TOTAL;

    var voltar = document.querySelector("[data-ag-voltar]");
    if (voltar) voltar.hidden = estado.passo === 0;

    var avancar = document.querySelector("[data-ag-avancar]");
    if (avancar)
      avancar.textContent = estado.passo === TOTAL - 1 ? "Enviar diagnóstico" : "Continuar";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validarPasso() {
    var passo = PASSOS[estado.passo];
    var ok = true;
    passo.campos.forEach(function (campo) {
      if (!campoVisivel(campo) || !campo.obrigatorio) return;
      var v = (estado.respostas[campo.id] || "").trim();
      var el = document.querySelector('.ag-campo[data-id="' + campo.id + '"]');
      var mau = !v;
      if (campo.id === "telefone" && v && !foneValido(v)) mau = true;
      if (campo.id === "email" && v && !emailValido(v)) mau = true;
      if (mau) {
        ok = false;
        if (el) {
          el.classList.add("ag-ruim");
          var erro = el.querySelector(".ag-erro");
          if (erro)
            erro.textContent =
              campo.id === "telefone"
                ? "WhatsApp incompleto"
                : campo.id === "email"
                  ? "E-mail inválido"
                  : "Campo obrigatório";
        }
      }
    });
    if (!ok) {
      var primeiro = document.querySelector(".ag-campo.ag-ruim");
      if (primeiro) primeiro.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return ok;
  }

  function salvarRascunho() {
    gravar(CHAVE_RASCUNHO, { passo: estado.passo, respostas: estado.respostas });
  }

  function montarPayload() {
    var d = {};
    PASSOS.forEach(function (p) {
      p.campos.forEach(function (c) {
        d[c.id] = estado.respostas[c.id] || "";
      });
    });
    d.enviado_em = new Date().toISOString();
    d.telefone_digitos = String(d.telefone).replace(/\D/g, "");
    d.pagina = location.pathname;
    var params = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign"].forEach(function (k) {
      d[k] = params.get(k) || "";
    });
    return d;
  }

  /* =====================================================================
     A ANALISE

     O que roda quando o medico termina os cinco passos. Recebe as mesmas 19
     respostas que vao para a planilha e monta a leitura que aparece na tela e
     no PDF. Nao faz requisicao nenhuma: tudo e calculado no aparelho dele.

     O codigo abaixo nasceu em modulos separados, testados um a um com node, e
     foi consolidado aqui para nao criar um segundo arquivo sem carimbo de
     cache. A consolidacao foi verificada por comparacao de saida: os modulos e
     este bloco produzem o mesmo HTML byte a byte.
     ================================================================== */

  var ANALISE = (function () {
    /* ===== motor.js ===== */
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


    /* ===== niveis.js ===== */
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


    /* ===== leitura.js ===== */
    /* Leitura do que o médico escreveu com as próprias palavras.

       O formulário tem quatro campos abertos: gargalos, desejo, prioridade_agora e
       clareza_desejada. Um quiz ignora esses campos. Esta análise faz duas coisas
       com eles.

       1. DEVOLVE A FRASE DELE, entre aspas, na tela. Nada convence um médico de que
          ele foi lido como ver a própria frase de volta. Só recorta, nunca reescreve:
          texto reescrito por máquina soa como máquina, e ele reconhece na hora.

       2. CLASSIFICA por termo, para ligar o que ele escreveu ao eixo que os números
          já apontaram. Quando o texto e os números batem, a análise diz isso, e essa
          convergência é o achado mais forte que a tela pode ter.

       O classificador é deliberadamente humilde: acerta ou fica calado. Ele nunca
       afirma "seu problema é comercial" a partir de uma palavra solta. Ele diz "você
       escreveu X, e os seus números mostram Y".
    */

    /* Termos por eixo. Vocabulário de médico dono de clínica, não de consultor.
       Sem acento nas chaves: a comparação roda sobre o texto já normalizado. */
    var TERMOS = {
      comercial: [
        "orcamento", "orcamentos", "fechar", "fecha", "fechamento", "converter",
        "conversao", "vender", "venda", "vendas", "comercial", "lead", "leads",
        "whatsapp", "secretaria", "recepcao", "recepcionista", "retorno",
        "follow up", "followup", "nao volta", "some", "sumiu", "perco paciente",
        "paciente nao fecha", "preco", "caro", "desconto", "negociar",
      ],
      marketing: [
        "marketing", "instagram", "rede social", "redes sociais", "trafego",
        "anuncio", "anuncios", "meta ads", "google", "divulgacao", "post",
        "conteudo", "seguidores", "aparecer", "ser visto", "captacao",
        "atrair", "agenda vazia", "poucos pacientes", "movimento",
      ],
      gestao: [
        "processo", "processos", "protocolo", "padronizar", "organizar",
        "organizacao", "planilha", "sistema", "controle", "financeiro",
        "margem", "custo", "custos", "lucro", "caixa", "indicador",
        "indicadores", "numero", "numeros", "relatorio", "prontuario",
        "agendamento", "no show", "falta", "estoque",
      ],
      pessoas: [
        "equipe", "time", "funcionario", "funcionarios", "colaborador",
        "contratar", "contratacao", "treinar", "treinamento", "demiti",
        "rotatividade", "turnover", "lideranca", "liderar", "delegar",
        "delego", "autonomia", "cobrar", "engajamento", "socio", "socia",
      ],
      tempo: [
        "tempo", "sem tempo", "corrido", "correria", "cansado", "cansaco",
        "exausto", "esgotado", "burnout", "sobrecarga", "sobrecarregado",
        "apagar incendio", "apagando incendio", "urgencia", "final de semana",
        "fim de semana", "ferias", "familia", "filho", "filhos", "noite",
        "madrugada", "nao paro", "nao consigo parar", "sozinho", "tudo em mim",
        "depende de mim", "passa por mim", "gargalo sou eu",
      ],
    };

    /* Como cada tema do texto se chama na tela, e a qual PILAR ele conversa.

       Os pilares sao os quatro da mentoria (Mentalidade, Comercial, Marketing,
       Gestao), e nao uma taxonomia propria: se a tela chamar de "operacao" o que a
       aula de segunda chama de "mentalidade", o medico recebe dois mapas do mesmo
       territorio. Marketing tem `pilar` mas nao tem nota, porque o formulario nao
       pergunta nada de captacao, e isso a tela declara em vez de estimar. */
    var NOME_EIXO = {
      comercial: { rot: "o comercial", pilar: "comercial" },
      marketing: { rot: "a captação", pilar: "marketing" },
      gestao: { rot: "a gestão e os números", pilar: "gestao" },
      pessoas: { rot: "a equipe e a delegação", pilar: "mentalidade" },
      tempo: { rot: "o seu tempo", pilar: "mentalidade" },
    };

    function normalizar(s) {
      return String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, " ");
    }

    /* Conta quantos termos DISTINTOS de cada eixo aparecem, e guarda quais foram.

       O descarte de termo contido em outro existe por um erro de contagem medido:
       "orcamento" casa dentro de "orcamentos", e um unico "orcamentos" no texto
       valia 2 pontos. Isso inflava o eixo com mais variacoes na lista, nao o eixo
       que o medico mais citou, e a convergencia final apontava para o lugar errado. */
    function classificar(texto) {
      var n = normalizar(texto);
      var achados = [];
      Object.keys(TERMOS).forEach(function (eixo) {
        var casou = TERMOS[eixo].filter(function (termo) {
          return n.indexOf(termo) !== -1;
        });
        casou = casou.filter(function (termo) {
          return !casou.some(function (outro) {
            return outro !== termo && outro.indexOf(termo) !== -1;
          });
        });
        if (casou.length) {
          achados.push({ eixo: eixo, peso: casou.length, termos: casou });
        }
      });
      achados.sort(function (a, b) {
        return b.peso - a.peso;
      });
      return achados;
    }

    /* Recorta a frase mais representativa, sem reescrever nada.
       Prefere a frase que carrega mais termos; empate vai para a mais longa, que
       costuma ser a que tem a cena. Corta em 190 caracteres no espaço, para não
       partir palavra. */
    function frase(texto, limite) {
      limite = limite || 190;
      var bruto = String(texto || "").trim();
      if (!bruto) return "";

      var partes = bruto
        .split(/(?<=[.!?])\s+|\n+/)
        .map(function (s) {
          return s.trim();
        })
        .filter(function (s) {
          return s.length > 24;
        });
      if (!partes.length) partes = [bruto];

      var melhor = partes[0];
      var melhorPeso = -1;
      partes.forEach(function (p) {
        var peso = classificar(p).reduce(function (s, a) {
          return s + a.peso;
        }, 0);
        if (peso > melhorPeso || (peso === melhorPeso && p.length > melhor.length)) {
          melhor = p;
          melhorPeso = peso;
        }
      });

      melhor = melhor.replace(/\s+/g, " ").trim();
      if (melhor.length > limite) {
        var corte = melhor.slice(0, limite);
        var esp = corte.lastIndexOf(" ");
        melhor = (esp > 60 ? corte.slice(0, esp) : corte).replace(/[,;:]$/, "") + "...";
      }
      return melhor;
    }

    /* O achado central: o texto dele e os números dele apontam para o mesmo lugar? */
    function convergencia(respostas, pilares) {
      var doTexto = classificar(
        [respostas.gargalos, respostas.desejo, respostas.prioridade_agora, respostas.clareza_desejada].join(" ")
      );
      if (!doTexto.length) return null;

      var topo = doTexto[0];
      var alvo = NOME_EIXO[topo.eixo];
      if (!alvo) return null;

      var medido = pilares[alvo.pilar];

      /* Marketing cai aqui: o medico escreveu sobre captacao e o formulario nao tem
         como medir isso. Nao e um achado fraco, e um achado honesto, e a tela usa
         essa informacao para dizer o que a sessao vai levantar. */
      if (!medido) {
        return { tema: topo.eixo, rot: alvo.rot, pilar: alvo.pilar, semMedida: true, bate: false };
      }

      /* `bate` significa: o pilar sobre o qual ele escreveu e o MENOR de todos, ou
         empata com o menor. Antes bastava nota <= 2, e a tela chegou a afirmar
         "Comercial e justamente o pilar mais baixo" com Mentalidade em 20% contra
         Comercial em 40%. A frase era falsa e o leitor via a contradicao na barra
         logo abaixo. */
      var menor = Object.keys(pilares).reduce(function (m, k) {
        return pilares[k].nota < m ? pilares[k].nota : m;
      }, Infinity);

      return {
        tema: topo.eixo,
        rot: alvo.rot,
        pilar: alvo.pilar,
        nota: medido.nota,
        semMedida: false,
        bate: medido.nota === menor,
        baixo: medido.nota <= 2,
        termos: topo.termos.slice(0, 4),
      };
    }


    /* ===== passos.js ===== */
    /* Os próximos passos.

       No diagnóstico anterior os três passos vinham do NÍVEL: todo médico de nível 2
       recebia os mesmos três. Aqui eles vêm do PILAR mais fraco dele.

       Cada passo respeita três limites, e é isso que os torna executáveis:
       não contratar ninguém, não comprar nada, e caber numa semana. Passo que
       depende de orçamento não é passo, é intenção.

       Os passos de Mentalidade e Gestão herdam as ferramentas de bolso que o deck
       comercial já entrega em cada pilar (gerar-deck.py, slides 6 a 9): a conta do
       percentual que vem da própria agenda, e a auditoria das conversas de preço.
    */

    var PASSOS = {
      mentalidade: [
        {
          o: "Marque no calendário, agora, um dia inteiro fora nas próximas quatro semanas.",
          porque:
            "Você estimou de cabeça o que a sua ausência causa. Um dia real mostra a " +
            "causa, que é o que dá para consertar, e é curto o bastante para não " +
            "assustar ninguém.",
          quando: "5 minutos para marcar, 1 dia para descobrir",
        },
        {
          o: "Antes desse dia, escreva quem decide o quê na sua ausência, com nome e limite de valor.",
          porque:
            "A queda de faturamento quando o dono sai quase nunca é falta de " +
            "competência da equipe. É falta de autorização, e autorização se escreve.",
          quando: "40 minutos",
        },
        {
          o: "Anote por três dias toda decisão que passou por você, com o tempo que levou.",
          porque:
            "A lista separa o que só você pode decidir do que virou hábito de passar " +
            "por você. Os dois grupos costumam ter tamanhos bem diferentes do que se " +
            "imagina antes de contar.",
          quando: "3 dias, anotando na hora",
        },
      ],
      comercial: [
        {
          o: "Conte, por sete dias, quantas pessoas pediram orçamento e quantas fecharam.",
          porque:
            "Você já estimou a taxa. Contar de verdade transforma a estimativa em " +
            "número, e é o número que mostra em qual etapa a pessoa some.",
          quando: "7 dias, uma linha por pedido",
        },
        {
          o: "Pegue 20 conversas de preço dos últimos 30 dias e leia o que foi respondido.",
          porque:
            "É a auditoria que o pilar Comercial faz na mentoria. Na maior parte das " +
            "clínicas a perda não é objeção de preço, é silêncio depois do valor, e " +
            "isso só aparece relendo o que foi escrito.",
          quando: "Uma hora com o WhatsApp aberto",
        },
        {
          o: "Defina quem responde, em quanto tempo, e o que se faz quando a pessoa não responde.",
          porque:
            "Sem uma regra de retorno escrita, o retorno depende de alguém lembrar. " +
            "E ninguém lembra numa terça cheia.",
          quando: "Uma conversa de 40 minutos com a recepção",
        },
      ],
      gestao: [
        {
          o: "Levante quanto sobrou de fato no último mês fechado: entrou menos saiu, incluindo a sua retirada.",
          porque:
            "Enquanto a margem for estimativa, investir é apostar. Um mês fechado já " +
            "tira você do escuro, e a meta do programa é 30% de margem líquida.",
          quando: "Meio dia com o extrato e as contas do mês",
        },
        {
          o: "Separe, dentro desse número, o que é despesa fixa e o que varia por atendimento.",
          porque:
            "É essa divisão que responde quanto sobra de cada paciente novo, e " +
            "portanto quanto você pode investir para trazer um sem perder dinheiro.",
          quando: "Duas horas, depois do passo 1",
        },
        {
          o: "Verifique se conta pessoal e conta da clínica ainda se misturam em algum ponto.",
          porque:
            "Enquanto se misturam, nenhum dos dois números é confiável, e a clínica " +
            "parece mais lucrativa ou menos lucrativa do que de fato é.",
          quando: "Uma hora olhando o cartão e a conta corrente",
        },
      ],
    };


    /* Escolhe o pilar mais fraco. Empate resolve pela ordem em que um pilar trava
       o outro: Gestão primeiro, porque sem margem não dá para escolher onde
       investir; depois Comercial, porque recuperar o que já chega é mais barato do
       que atrair; Mentalidade por último, que é o trabalho mais longo dos três. */
    function proximosPassos(pilares) {
      var presentes = ORDEM_DESEMPATE.filter(function (k) {
        return pilares[k];
      });
      if (!presentes.length) return { pilar: null, passos: [] };

      var menor = Math.min.apply(
        null,
        presentes.map(function (k) {
          return pilares[k].nota;
        })
      );
      var pilar = presentes.filter(function (k) {
        return pilares[k].nota === menor;
      })[0];

      return { pilar: pilar, passos: PASSOS[pilar] || [] };
    }


    /* ===== contas.js ===== */
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
      var f = FAT[r.faturamento];
      var q = QUEDA[r.queda_ferias];
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
      var f = FAT[r.faturamento];
      var c = CONV[r.conversao];
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
      var eq = EQUIPE[r.equipe];
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
      var f = FAT[r.faturamento];

      if (r.margem === "sim") {
        if (!f) return null;
        var naMeta = (f.meio * META_MARGEM) / 100;
        return {
          id: "margem",
          titulo: "A régua da margem",
          valor: mil(naMeta) + " por mês",
          valorAno: mil(naMeta * 12) + " por ano",
          conta:
            "Você acompanha a margem, e isso já coloca a sua clínica à frente da " +
            "maior parte. A meta de margem líquida do programa é " +
            META_MARGEM +
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
          META_MARGEM +
          "% de margem líquida, e sem o número de hoje não dá para saber a distância.",
      };
    }

    function todasAsContas(r) {
      return [contaDependencia(r), contaConversao(r), contaTeto(r), contaMargem(r)].filter(Boolean);
    }


    /* ===== extras.js ===== */
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


    /* ===== secoes.js ===== */
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
        "s-fer"
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


    /* ===== render.js ===== */
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
      var nota = notaGeral(pilares);
      var nv = nota === null ? null : nivelPara(nota, r, pilares);
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
      var f = frase(r.gargalos);
      if (!f) return "";
      var extra = frase(r.prioridade_agora, 150);
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
      var conv = convergencia(r, pilares);
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

      var meta = PILARES[conv.pilar];
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
      var chaves = Object.keys(PILARES).sort(function (a, b) {
        return PILARES[a].ordem - PILARES[b].ordem;
      });
      var medidos = chaves.filter(function (k) { return mapa[k]; });
      if (!medidos.length) return "";

      var menor = Math.min.apply(null, medidos.map(function (k) { return mapa[k].nota; }));

      var linhas = chaves
        .map(function (k) {
          var meta = PILARES[k];
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
      var lista = todasAsContas(r);
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
      var esc2 = proximosPassos(mapa);
      if (!esc2.passos.length) return "";
      var meta = PILARES[esc2.pilar];
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
      var q = frase(r.clareza_desejada, 150);
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
      var mapa = pontuar(r);
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

    return { montar: montarAnalise, href: href };
  })();

  /* Tela de reserva: se a analise falhar, isto e o que o medico ve. */
  function reserva() {
    return (
      '<div class="an"><header class="capa">' +
      '<p class="capa-quem">Diagnóstico MedCEO</p>' +
      '<h1 class="capa-tese">Recebemos as suas respostas.</h1>' +
      '<p class="capa-txt">A nossa equipe confirma a leitura com você em instantes. ' +
      "Se quiser agilizar, chame agora no WhatsApp.</p>" +
      '<div class="acoes"><a class="bt" href="' +
      ANALISE.href() +
      '" target="_blank" rel="noreferrer">Chamar no WhatsApp</a></div>' +
      "</header></div>"
    );
  }

  /* O botao "Baixar em PDF" existe duas vezes na analise, no alto e no fim, e
     a analise so nasce depois do envio. Por isso a escuta fica no documento, e
     nao nos botoes: ligar direto exigiria religar a cada render. */
  function ligarPdf() {
    document.addEventListener("click", function (ev) {
      var alvo = ev.target.closest ? ev.target.closest("[data-an-pdf]") : null;
      if (!alvo) return;
      ev.preventDefault();
      window.print();
    });
  }

  function irPara(stage) {
    document.querySelectorAll("[data-ag-stage]").forEach(function (el) {
      el.hidden = el.getAttribute("data-ag-stage") !== stage;
    });
  }

  function enviar() {
    var payload = montarPayload();
    var botao = document.querySelector("[data-ag-avancar]");
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Enviando...";
    }
    postar(payload).then(function () {
      try {
        localStorage.removeItem(CHAVE_RASCUNHO);
      } catch (e) {}

      var alvo = document.querySelector("[data-an-alvo]");
      if (alvo) {
        try {
          alvo.innerHTML = ANALISE.montar(payload);
        } catch (e) {
          /* A analise nunca pode engolir a confirmacao. Se ela falhar, a tela
             cai para o texto de recebido com o botao do WhatsApp, que e o
             minimo que o medico precisa ver depois de responder 19 perguntas. */
          alvo.innerHTML = reserva();
        }
      }
      irPara("sucesso");
      window.scrollTo(0, 0);
    });
  }

  /* ---------------------------------------------------------------------
     4. Ligação dos botões e partida.
     ------------------------------------------------------------------- */
  function iniciar() {
    escoarFila();
    ligarPdf();

    var rasc = ler(CHAVE_RASCUNHO);
    if (rasc && rasc.respostas) {
      estado.respostas = rasc.respostas;
      estado.passo = Math.min(rasc.passo || 0, TOTAL - 1);
    }

    var comecar = document.querySelector("[data-ag-comecar]");
    if (comecar)
      comecar.addEventListener("click", function () {
        irPara("form");
        renderPasso();
      });

    var avancar = document.querySelector("[data-ag-avancar]");
    if (avancar)
      avancar.addEventListener("click", function () {
        if (!validarPasso()) return;
        if (estado.passo < TOTAL - 1) {
          estado.passo++;
          salvarRascunho();
          renderPasso();
        } else {
          enviar();
        }
      });

    var voltar = document.querySelector("[data-ag-voltar]");
    if (voltar)
      voltar.addEventListener("click", function () {
        if (estado.passo > 0) {
          estado.passo--;
          renderPasso();
        }
      });

    irPara("intro");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
