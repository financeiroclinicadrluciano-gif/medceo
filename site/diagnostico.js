/* MedCEO — Diagnóstico de maturidade. Vanilla, sem dependencia externa.
   Portado do runtime original (DCLogic): mesmas perguntas, mesma pontuacao,
   mesmos cortes de nivel e mesma regra de gargalo. Nada e enviado. */
(function () {
  "use strict";
  var D = window.__MC_QUIZ__;
  if (!D) return;

  var QUESTIONS = D.QUESTIONS, LEVELS = D.LEVELS, BOTTLENECK = D.BOTTLENECK;
  var PILLARS = {
    diagnostico: { label: "Diagnóstico", short: "01" },
    margem: { label: "Margem", short: "02" },
    comercial: { label: "Comercial", short: "03" },
    operacao: { label: "Operação", short: "04" },
    escala: { label: "Escala", short: "05" }
  };
  var ORDER = ["diagnostico", "margem", "comercial", "operacao", "escala"];
  var LETRAS = ["A", "B", "C"];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var estado = { stage: "intro", index: 0, answers: [] };

  var telas = {
    intro: document.querySelector("[data-stage=intro]"),
    quiz: document.querySelector("[data-stage=quiz]"),
    result: document.querySelector("[data-stage=result]")
  };

  function mostrar(stage) {
    Object.keys(telas).forEach(function (k) {
      if (telas[k]) telas[k].hidden = k !== stage;
    });
  }

  function totaisPorPilar() {
    var t = {};
    ORDER.forEach(function (k) { t[k] = 0; });
    QUESTIONS.forEach(function (q, i) { t[q.p] += estado.answers[i] || 0; });
    return t;
  }

  /* ---------------- Perguntas ---------------- */
  function pintarPergunta() {
    var i = estado.index;
    var q = QUESTIONS[Math.min(i, QUESTIONS.length - 1)];
    var meta = PILLARS[q.p];

    var seg = document.querySelector("[data-segments]");
    if (seg) {
      seg.innerHTML = "";
      ORDER.forEach(function (chave, ci) {
        var g = document.createElement("div");
        g.setAttribute("style", "display:grid;grid-template-columns:repeat(4,1fr);gap:3px");
        for (var t = 0; t < 4; t++) {
          var qi = ci * 4 + t;
          var cor = qi < estado.answers.length ? "#C3A14E"
            : qi === i ? "rgba(217,190,126,.5)" : "rgba(234,226,207,.1)";
          var s = document.createElement("span");
          s.setAttribute("style", "height:2px;background:" + cor + ";transition:background .45s ease");
          g.appendChild(s);
        }
        seg.appendChild(g);
      });
    }

    var restam = QUESTIONS.length - i;
    var mins = Math.max(1, Math.round((restam * 15) / 60));
    var txt = function (sel, v) { var e = document.querySelector(sel); if (e) e.textContent = v; };
    txt("[data-pillar-short]", meta.short);
    txt("[data-pillar-label]", meta.label);
    txt("[data-qnum]", String(i + 1).padStart(2, "0"));
    txt("[data-minutes]", restam <= 1 ? "última" : "~" + mins + " min restantes");
    txt("[data-qtext]", q.q);

    var caixa = document.querySelector("[data-options]");
    if (caixa) {
      caixa.innerHTML = "";
      q.o.forEach(function (op, oi) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "mc-opt";
        b.setAttribute("style",
          "display:grid;grid-template-columns:auto minmax(0,1fr);gap:20px;align-items:start;width:100%;" +
          "padding:24px 26px;border:1px solid rgba(234,226,207,.1);border-radius:8px;background:rgba(255,255,255,.018);" +
          "text-align:left;cursor:pointer;transition:border-color .35s ease, background .35s ease, transform .35s cubic-bezier(.16,1,.3,1)");
        var letra = document.createElement("span");
        letra.setAttribute("aria-hidden", "true");
        letra.setAttribute("style",
          "display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(195,161,78,.32);" +
          "border-radius:50%;color:rgba(195,161,78,.9);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:400");
        letra.textContent = LETRAS[oi];
        var wrap = document.createElement("span");
        wrap.setAttribute("style", "display:grid;gap:8px;min-width:0");
        var forte = document.createElement("strong");
        forte.setAttribute("style",
          "color:rgba(234,226,207,.94);font-size:15.5px;font-weight:400;letter-spacing:.01em;line-height:1.35");
        forte.textContent = op[0];
        var desc = document.createElement("span");
        desc.setAttribute("style",
          "color:rgba(234,226,207,.68);font-size:14px;font-weight:300;line-height:1.64;letter-spacing:.015em");
        desc.textContent = op[2];
        wrap.appendChild(forte); wrap.appendChild(desc);
        b.appendChild(letra); b.appendChild(wrap);
        var escolhida = estado.answers[i] === op[1];
        b.setAttribute("aria-pressed", escolhida ? "true" : "false");
        function marcar() {
          b.setAttribute("aria-pressed", "true");
          b.style.borderColor = "rgba(195,161,78,.62)";
          b.style.background = "rgba(195,161,78,.08)";
          letra.style.borderColor = "#C3A14E";
          letra.style.background = "rgba(195,161,78,.16)";
          letra.style.color = "#EFE0BB";
        }
        if (escolhida) marcar();
        b.addEventListener("click", function () {
          // 1 frame de confirmacao antes de trocar a pergunta: sem isto o botao
          // clicado some no mesmo tick e o clique nao devolve nada.
          marcar();
          setTimeout(function () { responder(op[1]); }, reduce ? 0 : 140);
        });
        caixa.appendChild(b);
      });
    }

    // O botao que recebeu o clique acabou de ser removido pelo innerHTML="",
    // entao o foco cairia no <body> e o teclado teria que percorrer a pagina
    // inteira de novo, 20 vezes seguidas. Levar o foco para a primeira opcao.
    var primeiro = document.querySelector("[data-options] button");
    if (primeiro && estado.stage === "quiz") primeiro.focus();

    var painel = document.querySelector("[data-qpanel]");
    if (painel && !reduce) {
      painel.style.animation = "none";
      void painel.offsetWidth;
      painel.style.animation = "dgRise .6s cubic-bezier(.16,1,.3,1) both";
    }
  }

  function responder(score) {
    var prox = estado.answers.slice(0, estado.index).concat(score);
    if (estado.index + 1 >= QUESTIONS.length) {
      estado.answers = prox; estado.stage = "result";
      mostrar("result"); pintarResultado();
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      estado.answers = prox; estado.index += 1;
      pintarPergunta();
    }
  }

  /* ---------------- Resultado ---------------- */
  function pintarResultado() {
    var t = totaisPorPilar();
    var total = ORDER.reduce(function (s, k) { return s + t[k]; }, 0);
    var li = total <= 36 ? 0 : total <= 55 ? 1 : total <= 72 ? 2 : total <= 88 ? 3 : 4;
    var r = LEVELS[li];

    var menor = Math.min.apply(null, ORDER.map(function (k) { return t[k]; }));
    var gargalos = ORDER.filter(function (k) { return t[k] === menor; });

    var txt = function (sel, v) { var e = document.querySelector(sel); if (e) e.textContent = v; };
    txt("[data-res-level]", String(r.level));
    txt("[data-res-title]", r.title);
    txt("[data-res-subtitle]", r.subtitle);
    txt("[data-res-description]", r.description);
    txt("[data-res-score]", String(total));
    txt("[data-bottleneck]", gargalos.length >= 4
      ? "Nenhum pilar se destaca: os cinco estão no mesmo patamar. Comece por Margem — é o único que dá base numérica para decidir os outros quatro."
      : gargalos.slice(0, 2).map(function (k) { return BOTTLENECK[k]; }).join(" "));

    var ol = document.querySelector("[data-actions]");
    if (ol) {
      ol.innerHTML = "";
      r.actions.forEach(function (a, i) {
        var li2 = document.createElement("li");
        li2.setAttribute("style",
          "display:grid;grid-template-columns:32px minmax(0,1fr);gap:16px;align-items:baseline;" +
          "padding:18px 0;border-bottom:1px solid rgba(234,226,207,.09)");
        var n = document.createElement("span");
        n.setAttribute("style",
          "color:rgba(195,161,78,.62);font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:300;letter-spacing:.16em");
        n.textContent = String(i + 1).padStart(2, "0");
        var s2 = document.createElement("span");
        s2.setAttribute("style",
          "color:rgba(234,226,207,.76);font-size:14.5px;font-weight:300;line-height:1.66;letter-spacing:.015em");
        s2.textContent = a;
        li2.appendChild(n); li2.appendChild(s2); ol.appendChild(li2);
      });
    }

    var dl = document.querySelector("[data-readings]");
    if (dl) {
      dl.innerHTML = "";
      ORDER.forEach(function (k) {
        var pct = Math.round((t[k] / 20) * 100) + "%";
        var ehGargalo = t[k] === menor;
        var box = document.createElement("div");
        box.setAttribute("style", "display:grid;gap:10px;padding:15px 0;border-bottom:1px solid rgba(234,226,207,.09)");
        var linha = document.createElement("div");
        linha.setAttribute("style", "display:flex;align-items:baseline;justify-content:space-between;gap:12px");
        var dt = document.createElement("dt");
        dt.setAttribute("style",
          "display:flex;align-items:baseline;gap:10px;min-width:0;color:rgba(234,226,207,.56);" +
          "font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:300;letter-spacing:.18em;text-transform:uppercase");
        dt.textContent = PILLARS[k].label;
        if (ehGargalo) {
          var em = document.createElement("em");
          em.setAttribute("style",
            "color:#D9BE7E;font-family:'JetBrains Mono',monospace;font-size:8.5px;font-style:normal;letter-spacing:.16em;white-space:nowrap");
          em.textContent = "← gargalo";
          dt.appendChild(em);
        }
        var dd = document.createElement("dd");
        dd.setAttribute("style",
          "flex:0 0 auto;margin:0;color:rgba(234,226,207,.62);font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:300;letter-spacing:.06em");
        dd.textContent = pct;
        linha.appendChild(dt); linha.appendChild(dd);
        var trilho = document.createElement("div");
        trilho.setAttribute("aria-hidden", "true");
        trilho.setAttribute("style", "height:2px;background:rgba(234,226,207,.1)");
        var barra = document.createElement("span");
        barra.setAttribute("style",
          "display:block;height:100%;width:" + pct + ";transition:width 1.1s cubic-bezier(.16,1,.3,1);background:" +
          (ehGargalo ? "linear-gradient(90deg,#B08F3C,#EFE0BB)" : "rgba(195,161,78,.42)"));
        trilho.appendChild(barra);
        box.appendChild(linha); box.appendChild(trilho); dl.appendChild(box);
      });
    }
  }

  /* ---------------- Navegacao ---------------- */
  function comecar() {
    estado = { stage: "quiz", index: 0, answers: [] };
    mostrar("quiz"); pintarPergunta();
  }
  function voltar() {
    if (estado.index === 0) { estado.stage = "intro"; mostrar("intro"); return; }
    estado.index -= 1;
    // A resposta NAO e descartada: quem volta precisa ver o que respondeu.
    // responder() sobrescreve a posicao atual de qualquer jeito (slice + concat).
    pintarPergunta();
  }
  function refazer() {
    estado = { stage: "intro", index: 0, answers: [] };
    mostrar("intro");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  var bStart = document.querySelector("[data-start]");
  var bBack = document.querySelector("[data-back]");
  var bRestart = document.querySelector("[data-restart]");
  if (bStart) bStart.addEventListener("click", comecar);
  if (bBack) bBack.addEventListener("click", voltar);
  if (bRestart) bRestart.addEventListener("click", refazer);

  mostrar("intro");

  /* ---------------- Sheen ---------------- */
  if (!reduce) {
    document.querySelectorAll("[data-sheen]").forEach(function (btn) {
      var gleam = document.createElement("span");
      gleam.setAttribute("aria-hidden", "true");
      gleam.style.cssText =
        "position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 38%," +
        "rgba(239,224,187,.34) 50%,transparent 62%);background-size:220% 100%;background-position:-140% 0;" +
        "transition:background-position .9s cubic-bezier(.16,1,.3,1)";
      btn.appendChild(gleam);
      btn.addEventListener("pointerenter", function () { gleam.style.backgroundPosition = "140% 0"; });
      btn.addEventListener("pointerleave", function () {
        gleam.style.transition = "none";
        gleam.style.backgroundPosition = "-140% 0";
        requestAnimationFrame(function () {
          gleam.style.transition = "background-position .9s cubic-bezier(.16,1,.3,1)";
        });
      });
    });
  }
})();
