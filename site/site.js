/* MedCEO — comportamento do site. Vanilla, sem dependencia externa.
   Portado do runtime original (DCLogic): progresso, nav, reveals, contadores,
   reguas, tilt, sheen, comparador arrastavel e o carrossel de pilares. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Pilares: um por dobra, trocados pela rolagem ----------
     O palco fica preso na viewport enquanto o container atras dele avanca.
     A posicao da rolagem dentro desse container decide qual profissional
     aparece. Sem JS os seis ficam empilhados: o conteudo nao depende disto. */
  (function () {
    var seq = document.querySelector("[data-atlas-seq]");
    if (!seq) return;
    var sticky = seq.querySelector(".atlas__sticky");
    var slides = Array.prototype.slice.call(seq.querySelectorAll(".pro"));
    var botoes = Array.prototype.slice.call(seq.querySelectorAll("[data-pillar-btn]"));
    var barra = seq.querySelector("[data-pill-progress]");
    var live = seq.querySelector('[data-pill="live"]');
    if (!sticky || slides.length < 2) return;

    var raiz = document.documentElement;
    raiz.style.setProperty("--pro-passos", String(slides.length));

    /* A navbar de mobile quebra em duas linhas: medir e melhor que chutar,
       senao o palco fica alto demais e o rodape do cartao some. */
    function medirNav() {
      var nav = document.querySelector("[data-nav]");
      if (nav) raiz.style.setProperty("--nav-height", Math.round(nav.offsetHeight) + "px");
    }

    var atual = -1;
    function pintar(i) {
      if (i === atual) return;
      atual = i;
      slides.forEach(function (s, n) {
        if (n === i) s.setAttribute("data-ativo", "");
        else s.removeAttribute("data-ativo");
      });
      botoes.forEach(function (b, n) {
        b.setAttribute("aria-current", n === i ? "true" : "false");
      });
      if (barra) barra.style.width = Math.round(((i + 1) / slides.length) * 100) + "%";
      if (live) {
        var papel = slides[i].querySelector(".pro__role");
        var nome = slides[i].querySelector("figcaption");
        live.textContent = "Pilar em destaque: " + (papel ? papel.textContent : "") +
          (nome ? ", " + nome.textContent.toLowerCase() + "." : ".");
      }
    }

    function trilho() {
      return Math.max(0, seq.offsetHeight - sticky.offsetHeight);
    }

    var agendado = false;
    function medir() {
      agendado = false;
      var total = trilho();
      if (total <= 0) { pintar(0); return; }
      var p = Math.min(Math.max(-seq.getBoundingClientRect().top / total, 0), 1);
      pintar(Math.round(p * (slides.length - 1)));
    }
    function aoRolar() {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(medir);
    }

    botoes.forEach(function (b, n) {
      b.addEventListener("click", function () {
        var total = trilho();
        var alvo = seq.getBoundingClientRect().top + window.pageYOffset +
          total * (n / (slides.length - 1));
        window.scrollTo({ top: Math.round(alvo), behavior: reduce ? "auto" : "smooth" });
      });
    });

    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", function () { medirNav(); aoRolar(); });
    medirNav();
    pintar(0);
    medir();
  })();

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

    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (el) {
        el.style.opacity = "1"; el.style.filter = "none"; el.style.transform = "none";
      });
      rulers.forEach(function (el) { el.style.transform = "scaleX(" + (el.dataset.w || 0) + ")"; });
      counters.forEach(function (el, i) { el.textContent = alvos[i]; });
      return;
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

    // Rede de seguranca: nenhuma falha de observer pode deixar texto invisivel.
    setTimeout(function () {
      reveals.forEach(function (el) {
        el.style.opacity = "1"; el.style.filter = "none"; el.style.transform = "none";
      });
      counters.forEach(function (el) {
        var alvo = (Number(el.dataset.count) || 0) + (el.dataset.suffix || "");
        if (el.textContent !== alvo) el.textContent = alvo;
      });
    }, 1800);
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
    var d = "calc(var(--d,0)*.06s)";
    el.style.transition =
      "opacity .56s cubic-bezier(.16,1,.3,1) " + d + "," +
      "transform .56s cubic-bezier(.16,1,.3,1) " + d + "," +
      "filter .56s cubic-bezier(.16,1,.3,1) " + d;
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


/* Cascata dos cartoes do filtro: entram quando a dobra aparece, um depois do
   outro, e os itens de cada lista atras. Quem pede menos movimento ja tem tudo
   visivel pelo CSS, entao aqui so ligamos a classe. */
(function () {
  var cards = document.querySelectorAll(".fcard");
  if (!cards.length || !("IntersectionObserver" in window)) {
    cards.forEach(function (c) { c.classList.add("dentro"); });
    return;
  }
  var io = new IntersectionObserver(function (ent) {
    ent.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("dentro"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
  cards.forEach(function (c) { io.observe(c); });
  document.documentElement.classList.add("motion-ready");
  window.setTimeout(function () {
    cards.forEach(function (c) { c.classList.add("dentro"); });
  }, 1800);
})();


/* ---------------- Menu do topo no celular ----------------
   Abre e fecha a lista de links. O estado mora no atributo data-aberto do
   header e no aria-expanded do botao, para que CSS e leitor de tela leiam a
   mesma coisa. Fecha ao escolher um link, com Escape, e ao voltar para
   desktop, caso a pessoa gire o aparelho com o menu aberto. */
(function () {
  var botao = document.querySelector("[data-menu]");
  var nav = document.querySelector("[data-nav]");
  if (!botao || !nav) return;
  var painel = document.getElementById(botao.getAttribute("aria-controls"));
  if (!painel) return;

  function medir() {
    document.documentElement.style.setProperty(
      "--nav-height", Math.round(nav.offsetHeight) + "px");
  }

  function definir(aberto) {
    nav.toggleAttribute("data-aberto", aberto);
    botao.setAttribute("aria-expanded", aberto ? "true" : "false");
    botao.setAttribute("aria-label", aberto ? "Fechar menu de navegação"
                                            : "Abrir menu de navegação");
    medir();
  }

  botao.addEventListener("click", function () {
    definir(botao.getAttribute("aria-expanded") !== "true");
  });

  painel.addEventListener("click", function (e) {
    if (e.target.closest("a")) definir(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && botao.getAttribute("aria-expanded") === "true") {
      definir(false);
      botao.focus();
    }
  });

  addEventListener("resize", function () {
    if (innerWidth >= 1120) definir(false);
  }, { passive: true });
})();
