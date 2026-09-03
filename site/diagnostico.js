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

  var ENDPOINT = window.MC_DIAG_ENDPOINT || "";
  /* PENDENTE: preencher depois de publicar apps-script-painel.gs como app
     da web e colar a URL /exec aqui, ou via window.MC_DIAG_ENDPOINT antes
     deste script. Enquanto vazio, o formulário funciona e enfileira local,
     sem perder a resposta, e ela sai assim que a URL existir. */

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
      var wa = document.querySelector("[data-ag-whats]");
      if (wa) {
        var msg =
          "Olá! Terminei de preencher o diagnóstico e gostaria de agendar " + "a data da reunião.";
        wa.href = "https://wa.me/5541984875688?text=" + encodeURIComponent(msg);
      }
      irPara("sucesso");
    });
  }

  /* ---------------------------------------------------------------------
     4. Ligação dos botões e partida.
     ------------------------------------------------------------------- */
  function iniciar() {
    escoarFila();

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
