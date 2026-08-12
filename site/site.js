/* MedCEO — comportamento do site. Vanilla, sem dependencia externa.
   Portado do runtime original (DCLogic): progresso, nav, reveals, contadores,
   reguas, tilt, sheen, comparador arrastavel e o carrossel de pilares. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Pilares ---------------- */
  var PILLARS = window.__MC_PILLARS__ || [];
  var atual = 0;

  function pintarPilar(i) {
    var p = PILLARS[i];
    if (!p) return;
    atual = i;
    var painel = document.querySelector("[data-pill-panel]");

    function set(nome, valor) {
      document.querySelectorAll('[data-pill="' + nome + '"]').forEach(function (el) {
        el.textContent = valor;
      });
    }
    set("number", p.number);
    set("name", p.name);
    set("kicker", p.kicker);
    set("role", p.role);
    set("thesis", p.thesis);
    set("counter", p.number + " / " + String(PILLARS.length).padStart(2, "0"));
    set("live", "Pilar em destaque: " + p.role + ", com " + p.name + ".");

    var img = document.querySelector('img[data-pill="image"]');
    if (img) {
      img.setAttribute("src", p.image);
      img.setAttribute("alt", p.alt || "");
      if (p.position) img.style.objectPosition = p.position;
    }

    var ul = document.querySelector("[data-topics]");
    if (ul) {
      ul.innerHTML = "";
      (p.topics || []).forEach(function (t, n) {
        var li = document.createElement("li");
        li.setAttribute("style",
          "display:grid;grid-template-columns:32px minmax(0,1fr);gap:14px;align-items:baseline;" +
          "padding:14px 0;border-bottom:1px solid rgba(234,226,207,.09);color:rgba(234,226,207,.74);" +
          "font-size:14px;font-weight:300;line-height:1.6;letter-spacing:.015em");
        var num = document.createElement("span");
        num.setAttribute("aria-hidden", "true");
        num.setAttribute("style",
          "color:rgba(195,161,78,.6);font-family:'JetBrains Mono',monospace;font-size:9px;" +
          "font-weight:300;letter-spacing:.16em");
        num.textContent = String(n + 1).padStart(2, "0");
        var txt = document.createElement("span");
        txt.textContent = t;
        li.appendChild(num); li.appendChild(txt); ul.appendChild(li);
      });
    }

    var barra = document.querySelector("[data-pill-progress]");
    if (barra) barra.style.width = Math.round(((i + 1) / PILLARS.length) * 100) + "%";

    document.querySelectorAll("[data-pillar-btn]").forEach(function (btn) {
      var ativo = Number(btn.getAttribute("data-pillar-btn")) === i;
      btn.setAttribute("aria-current", ativo ? "true" : "false");
      var n = btn.querySelector("[data-pill-num]");
      var r = btn.querySelector("[data-pill-role]");
      if (n) n.style.color = ativo ? "#C3A14E" : "rgba(234,226,207,.36)";
      if (r) r.style.color = ativo ? "#EAE2CF" : "rgba(234,226,207,.5)";
    });

    if (painel && !reduce) {
      painel.style.animation = "none";
      void painel.offsetWidth;
      painel.style.animation = "mcRise .7s cubic-bezier(.16,1,.3,1) both";
    }
  }

  document.querySelectorAll("[data-pillar-btn]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      pintarPilar(Number(btn.getAttribute("data-pillar-btn")));
    });
  });
  if (PILLARS.length) pintarPilar(0);

  /* ---------------- Comparador arrastavel ---------------- */
  (function () {
    var wrap = document.querySelector("[data-compare]");
    if (!wrap) return;
    var top = wrap.querySelector("[data-compare-top]");
    var handle = wrap.querySelector("[data-compare-handle]");
    var input = wrap.querySelector("[data-compare-input]");
    if (!top || !handle) return;

    function set(pct) {
      var p = Math.max(2, Math.min(98, pct));
      top.style.clipPath = "inset(0 " + (100 - p) + "% 0 0)";
      handle.style.left = p + "%";
      if (input) input.value = String(Math.round(p));
    }
    function fromEvent(e) {
      var r = wrap.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      set((x / r.width) * 100);
    }
    var dragging = false;
    wrap.addEventListener("pointerdown", function (e) { dragging = true; fromEvent(e); });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      fromEvent(e);
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    window.addEventListener("pointerup", function () { dragging = false; });
    if (input) input.addEventListener("input", function () { set(Number(input.value)); });
  })();

  /* ---------------- Progresso + nav + dica de rolagem ----------------
     Fica ACIMA do corte de reduced-motion de proposito: barra de progresso e o
     estado "rolado" da navbar sao feedback de ESTADO, nao movimento decorativo.
     Quem pede menos movimento nao pediu menos informacao — e o CSS de
     prefers-reduced-motion ja zera a duracao das transicoes deles. */
  (function () {
    var bar = document.querySelector("[data-progress]");
    var nav = document.querySelector("[data-nav]");
    var hint = document.querySelector("[data-scrollhint]");
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
        if (nav) {
          var solid = y > 60;
          nav.style.background = solid ? "rgba(5,7,10,.94)" : "rgba(5,7,10,.72)";
          nav.style.borderBottomColor = solid ? "rgba(195,161,78,.24)" : "rgba(195,161,78,.14)";
        }
        if (hint) {
          hint.style.opacity = y > 40 ? "0" : ".8";
          hint.style.transform = y > 40 ? "translateX(-50%) translateY(6px)" : "translateX(-50%)";
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ---------------- Fachada de video ----------------
     O player do Panda no heroi era `loading="eager"` e baixava 436 KB de JS de
     terceiro mais 4,4 MB de segmentos de video ANTES de qualquer clique — mais
     do que o site inteiro. `loading="lazy"` nao resolve porque o iframe esta
     dentro do viewport inicial. O poster e o primeiro quadro do proprio video,
     entao a dobra continua igual; o player so nasce no clique. */
  document.querySelectorAll("[data-video-facade]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = btn.getAttribute("data-video-facade") + "&autoplay=1";
      f.title = btn.getAttribute("data-video-title") || "";
      f.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
      f.setAttribute("allowfullscreen", "true");
      f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      f.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;border:0";
      btn.replaceWith(f);
      f.focus();
    }, { once: true });
  });

  // Daqui para baixo e tudo movimento: reveals, contadores, tilt, sheen.
  if (reduce) return;

  /* ---------------- Reveals, reguas, contadores ---------------- */
  (function () {
    var vh = window.innerHeight;
    var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"))
      .filter(function (el) { return el.getBoundingClientRect().top > vh * 0.92; });
    reveals.forEach(function (el) {
      el.style.opacity = "0";
      el.style.filter = "blur(6px)";
      el.style.transform = "translateY(16px)";
      el.style.transition =
        "opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1), filter .8s cubic-bezier(.16,1,.3,1)";
    });

    var rulers = Array.prototype.slice.call(document.querySelectorAll("[data-ruler]"));
    rulers.forEach(function (el) { el.style.transform = "scaleX(0)"; });

    var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    var alvos = counters.map(function (el) { return el.textContent; });
    counters.forEach(function (el) { el.textContent = "0" + (el.dataset.suffix || ""); });

    function runCounter(el) {
      var target = Number(el.dataset.count) || 0;
      var suffix = el.dataset.suffix || "";
      var t0 = performance.now();
      // rede de seguranca: se o rAF for interrompido (aba em background, snapshot
      // estatico, throttling), o numero final entra de qualquer jeito.
      var garantia = setTimeout(function () { el.textContent = target + suffix; }, 2200);
      (function tick(now) {
        var p = Math.min((now - t0) / 1500, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) { requestAnimationFrame(tick); }
        else { clearTimeout(garantia); el.textContent = target + suffix; }
      })(t0);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute("data-reveal")) {
          el.style.opacity = "1"; el.style.filter = "none"; el.style.transform = "none";
        } else if (el.hasAttribute("data-ruler")) {
          el.style.transform = "scaleX(" + (el.dataset.w || 0) + ")";
        } else if (el.hasAttribute("data-count")) {
          runCounter(el);
        }
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    reveals.concat(rulers, counters).forEach(function (el) { io.observe(el); });

    // se o observer nunca disparar, ou a animacao parar no meio, o valor final entra
    setTimeout(function () {
      counters.forEach(function (el) {
        var alvo = (Number(el.dataset.count) || 0) + (el.dataset.suffix || "");
        if (el.textContent !== alvo) el.textContent = alvo;
      });
    }, 2600);
  })();

  /* ---------------- Tilt ---------------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
        card.style.transform =
          "perspective(1200px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-3px)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "perspective(1200px) rotateX(0) rotateY(0)";
      });
    });
  }

  /* ---------------- Sheen nos botoes ---------------- */
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

})();

/* ==========================================================================
   MedCEO — extensao do redesign 2026-08-11.
   Camadas que o runtime original nao tinha: stagger dos reveals (--d),
   scrub da timeline do metodo, parallax em GPU e o selo de maturidade.
   Tudo respeita prefers-reduced-motion; a classe .js no <html> vem de um
   script inline no <head> (antes da primeira pintura, para o gate no-JS).
   ========================================================================== */

/* Stagger: reveals com --d entram em cascata (delay so na saida). */
(function () {
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    if (!el.style.getPropertyValue("--d")) return;
    var d = "calc(var(--d,0)*.09s)";
    el.style.transition =
      "opacity .8s cubic-bezier(.16,1,.3,1) " + d + "," +
      "transform .8s cubic-bezier(.16,1,.3,1) " + d + "," +
      "filter .8s cubic-bezier(.16,1,.3,1) " + d;
  });
})();

/* Scrub da timeline: o fio dourado avanca com a rolagem da secao. */
(function () {
  var tl = document.querySelector("[data-timeline]");
  var draw = document.querySelector("[data-draw]");
  if (!tl || !draw) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    draw.style.transform = "scaleY(1)";
    return;
  }
  var ticking = false;
  function update() {
    var r = tl.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = r.height + vh;
    var p = total > 0 ? (vh - r.top) / total : 0;
    p = Math.max(0, Math.min(1, p));
    draw.style.transform = "scaleY(" + p.toFixed(3) + ")";
    ticking = false;
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  update();
})();

/* Parallax em GPU para [data-parallax] — fotos e fundos. */
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!els.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -240 || r.top > vh + 240) return;
      var speed = Number(el.getAttribute("data-speed") || 0.1);
      var mid = r.top + r.height / 2 - vh / 2;
      var maxMove = Math.max(20, el.offsetHeight * 0.035);
      var y = -mid * speed;
      y = Math.max(-maxMove, Math.min(maxMove, y));
      el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
    });
    ticking = false;
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();

/* Selo de maturidade: desenha o anel quando entra no viewport. */
(function () {
  var seal = document.querySelector("[data-seal]");
  if (!seal) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        seal.classList.add("ativo");
        io.unobserve(seal);
      }
    });
  }, { threshold: 0.35 });
  io.observe(seal);
})();

/* Pilares por rolagem: a dobra e alta e o painel gruda; cada trecho avanca um
   pilar. A troca acontece clicando no proprio botao, entao o estado, o aria e o
   teclado continuam valendo. Sem a preferencia de menos movimento, nada disso
   liga — a dobra volta ao normal e so os botoes operam. */
(function () {
  var sec = document.getElementById("time");
  if (!sec) return;
  var botoes = Array.prototype.slice.call(sec.querySelectorAll("[data-pillar-btn]"));
  if (botoes.length < 2) return;

  var mq = window.matchMedia("(min-width:1040px) and (prefers-reduced-motion:no-preference)");
  var atual = -1, pendente = false;

  function medir() {
    pendente = false;
    if (!mq.matches) return;
    var r = sec.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = r.height - vh;
    if (total <= 0) return;
    var p = Math.min(Math.max(-r.top / total, 0), 0.9999);
    var i = Math.floor(p * botoes.length);
    if (i !== atual) { atual = i; botoes[i].click(); }
  }
  function onScroll() {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(medir);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // clique manual continua mandando: reseta o indice para o proximo scroll nao brigar
  botoes.forEach(function (b, i) {
    b.addEventListener("click", function () { atual = i; });
  });
  medir();
})();
