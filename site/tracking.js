/* =============================================================================
   Rastreamento MedCEO / Natuá — vanilla, sem dependência, sem cookie próprio.
   Responde 4 perguntas: quantos entraram · quantos clicaram no WhatsApp ·
   de qual canal vieram · de qual seção da página o clique partiu.
   Funciona sem GA4 configurado (falha silenciosa, nada quebra).
   ========================================================================== */
(function () {
  "use strict";

  // Respeita quem pediu para não ser rastreado.
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  var CHAVE = "mc_origem";

  /* ---------------------------------------------------------------------
     1. Canal — de onde o lead veio.
     Prioridade: UTM da URL > UTM guardado na sessão > referrer > direto.
     A sessão é o que faz o clique no WhatsApp herdar a origem mesmo depois
     de o visitante navegar para outra página do site.
     ------------------------------------------------------------------ */
  function lerUTMs() {
    var q = new URLSearchParams(location.search);
    var u = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      var v = q.get(k);
      if (v) u[k] = v;
    });
    return u;
  }

  function classificarPorReferrer() {
    var r = document.referrer || "";
    if (!r) return { canal: "direto", detalhe: "sem referrer" };
    var h = "";
    try { h = new URL(r).hostname.replace(/^www\./, ""); } catch (e) { h = r; }
    if (/instagram|l\.instagram/.test(h)) return { canal: "instagram", detalhe: h };
    if (/facebook|fb\.com|fb\.me/.test(h)) return { canal: "facebook", detalhe: h };
    if (/google/.test(h)) return { canal: "google", detalhe: h };
    if (/whatsapp|wa\.me/.test(h)) return { canal: "whatsapp", detalhe: h };
    if (/youtube|youtu\.be/.test(h)) return { canal: "youtube", detalhe: h };
    if (h && h.indexOf(location.hostname.replace(/^www\./, "")) === 0) {
      return { canal: "interno", detalhe: h };
    }
    return { canal: "referral", detalhe: h };
  }

  function resolverOrigem() {
    var utms = lerUTMs();

    // Chegou com UTM: essa é a verdade, grava na sessão.
    if (utms.utm_source) {
      var o = {
        canal: utms.utm_source,
        origem_detalhe: utms.utm_campaign || utms.utm_medium || "",
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium || "",
        utm_campaign: utms.utm_campaign || "",
        utm_content: utms.utm_content || "",
        landing: location.pathname
      };
      try { sessionStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) {}
      return o;
    }

    // Já tem origem guardada nesta sessão: mantém.
    try {
      var salvo = sessionStorage.getItem(CHAVE);
      if (salvo) return JSON.parse(salvo);
    } catch (e) {}

    // Sem UTM e sem sessão: deduz pelo referrer.
    var ref = classificarPorReferrer();
    var novo = {
      canal: ref.canal,
      origem_detalhe: ref.detalhe,
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      landing: location.pathname
    };
    // "interno" não é origem de lead — não sobrescreve o que já existe.
    if (ref.canal !== "interno") {
      try { sessionStorage.setItem(CHAVE, JSON.stringify(novo)); } catch (e) {}
    }
    return novo;
  }

  var origem = resolverOrigem();

  /* ---------------------------------------------------------------------
     7. Pixel da Meta.
     O Pixel MedCEO (2914933312232977) foi criado em 13/08 e nunca disparou:
     medido pela API em 26/08, last_fired_time volta como 1969-12-31, o valor
     nulo. Sem ele a campanha de Vendas nao tem conversao para otimizar, e o
     publico de remarketing do site nao existe.

     Allowlist em vez de mandar tudo: rolagem e tempo disparam dezenas de
     vezes por visita, e no pixel isso vira volume sem virar publico util,
     alem de poluir o Gerenciador de Eventos.
     ------------------------------------------------------------------ */
  var PIXEL = "2914933312232977";
  var NO_PIXEL = {
    page_view_custom:   { evento: "ViewContent", etapa: "pagina",        valor: 1 },
    clique_cta_interno: { evento: "Search",      etapa: "cta_interno",   valor: 2 },
    clique_whatsapp:    { evento: "ViewContent", etapa: "whatsapp",      valor: 5 },
    video_marco:        { evento: "Search",      etapa: "video",         valor: 3 },
    secao_chave:        { evento: "Search",      etapa: "secao_chave",   valor: 1 }
  };

  /* Guarda de host: o pixel so inicializa no site publicado. Sem isto,
     preview e maquina local entram no publico de remarketing e no custo por
     resultado. Na Natua isso chegou a 41% dos eventos do pixel. */
  var HOST = location.hostname.replace(/^www\./, "");
  var HOST_REAL = (HOST === "medceo.online" || HOST === "medceo.com.br");

  if (HOST_REAL && !window.fbq) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL);
    window.fbq("track", "PageView");
  }


  /* ---------------------------------------------------------------------
     2. Envio — GA4 (gtag) e/ou GTM (dataLayer). Nenhum dos dois? Não quebra.
     ------------------------------------------------------------------ */
  function enviar(nome, params) {
    var p = params || {};
    p.canal = origem.canal;
    p.origem_detalhe = origem.origem_detalhe;
    p.utm_source = origem.utm_source;
    p.utm_medium = origem.utm_medium;
    p.utm_campaign = origem.utm_campaign;
    p.pagina = location.pathname;
    p.site_marca = window.SITE_MARCA || 'medceo';

    if (typeof window.gtag === "function") {
      try { window.gtag("event", nome, p); } catch (e) {}
    }
    if (Array.isArray(window.dataLayer)) {
      try { window.dataLayer.push(Object.assign({ event: nome }, p)); } catch (e) {}
    }
    if (window.MC_DEBUG) console.log("[track]", nome, p);
    mandarAoPixel(nome, p);
  }

  /* ---------------------------------------------------------------------
     3. Seção — de qual parte da página o clique saiu.
     Usa data-section, senão o id da <section> ancestral, senão o
     aria-label. Sem nada disso, cai para "sem-secao".
     ------------------------------------------------------------------ */
  function secaoDe(el) {
    var marcado = el.closest("[data-section]");
    if (marcado) return marcado.getAttribute("data-section");
    var sec = el.closest("section");
    if (sec) {
      return sec.id || (sec.getAttribute("aria-label") || "").slice(0, 40) || "secao-sem-id";
    }
    return "sem-secao";
  }

  // Qual seção o visitante está vendo agora (responde "de qual aba" mesmo
  // quando o botão é fixo/flutuante e não pertence a nenhuma seção).
  var secaoVisivel = "";
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          secaoVisivel = e.target.id ||
            (e.target.getAttribute("aria-label") || "").slice(0, 40) || "secao-sem-id";
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll("section").forEach(function (s) { io.observe(s); });
  }

  /* ---------------------------------------------------------------------
     4. Pageview
     ------------------------------------------------------------------ */
  enviar("page_view_custom", {
    titulo: document.title,
    caminho: location.pathname,
    landing_da_sessao: origem.landing
  });

  /* ---------------------------------------------------------------------
     5. Clique de WhatsApp — a conversão que o Gustavo quer medir.
     Pega qualquer link wa.me / api.whatsapp.com / chat.whatsapp.com
     e qualquer elemento marcado com data-track="whatsapp".
     ------------------------------------------------------------------ */
  document.addEventListener("click", function (ev) {
    var alvo = ev.target.closest('a, button, [data-track]');
    if (!alvo) return;

    var href = alvo.getAttribute("href") || "";
    var ehWhats = /wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com/.test(href) ||
                  alvo.getAttribute("data-track") === "whatsapp";

    if (ehWhats) {
      enviar("clique_whatsapp", {
        secao: secaoDe(alvo),
        secao_visivel: secaoVisivel,
        texto_botao: (alvo.textContent || "").trim().slice(0, 60),
        destino: href,
        tipo: /chat\.whatsapp\.com/.test(href) ? "grupo" : "conversa"
      });
      return;
    }

    // CTAs internos importantes (diagnóstico, webinar) — mede o funil interno.
    if (/\/diagnostico|\/webnar/.test(href)) {
      enviar("clique_cta_interno", {
        secao: secaoDe(alvo),
        secao_visivel: secaoVisivel,
        texto_botao: (alvo.textContent || "").trim().slice(0, 60),
        destino: href
      });
    }
  }, true);



  function mandarAoPixel(nome, p) {
    if (!HOST_REAL || typeof window.fbq !== "function") return;
    var m = NO_PIXEL[nome];
    if (!m) return;
    var ids = [m.etapa];
    if (p && p.marco) ids.push(m.etapa + "_" + p.marco);
    try {
      window.fbq("track", m.evento, {
        content_ids: ids,
        content_type: "product",
        value: m.valor,
        currency: "BRL"
      });
    } catch (e) {}
  }

  /* ---------------------------------------------------------------------
     8. Profundidade de rolagem.
     Uma vez por marco, nunca repetido: o listener de scroll dispara centenas
     de vezes e sem a trava o relatorio vira ruido.
     ------------------------------------------------------------------ */
  (function () {
    var marcos = [25, 50, 75, 90];
    var atingidos = {};
    var pendente = false;

    /* O alvo do scroll nao e sempre o window: no MedCEO a pagina rola dentro
       de um container. Medido em 26/08 na /servicos: scrollY chegou a 10761 e
       o listener no window disparou zero vezes. Por isso a medicao le o
       elemento que de fato rolou, e o listener fica no document em modo
       CAPTURA, ja que scroll nao borbulha mas e capturavel. */
    function medir(alvo) {
      pendente = false;
      var topo, altura;
      if (!alvo || alvo === document || alvo === document.documentElement || alvo === window) {
        var doc = document.documentElement;
        topo = window.scrollY || doc.scrollTop || 0;
        altura = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
      } else {
        topo = alvo.scrollTop || 0;
        altura = alvo.scrollHeight - alvo.clientHeight;
      }
      if (altura <= 0) return;
      var pct = Math.round((topo / altura) * 100);
      for (var i = 0; i < marcos.length; i++) {
        var m = marcos[i];
        if (pct >= m && !atingidos[m]) {
          atingidos[m] = true;
          enviar("rolagem", { marco: m, altura_da_pagina: Math.round(altura) });
        }
      }
    }
    document.addEventListener("scroll", function (ev) {
      if (pendente) return;
      pendente = true;
      var alvo = ev.target;
      window.requestAnimationFrame
        ? requestAnimationFrame(function () { medir(alvo); })
        : setTimeout(function () { medir(alvo); }, 120);
    }, true);
    medir(null);
  })();

  /* ---------------------------------------------------------------------
     9. Tempo na pagina.
     Conta so o tempo com a aba VISIVEL. Contar aba escondida infla a media e
     mente sobre atencao: quem abre em segundo plano e esquece nao esta lendo.
     ------------------------------------------------------------------ */
  (function () {
    var marcos = [15, 30, 60, 120, 300];
    var enviados = {};
    var segundos = 0;
    var relogio = null;

    function tique() {
      segundos += 1;
      for (var i = 0; i < marcos.length; i++) {
        var m = marcos[i];
        if (segundos >= m && !enviados[m]) {
          enviados[m] = true;
          enviar("tempo_na_pagina", { marco: m });
        }
      }
    }
    function ligar()  { if (!relogio) relogio = setInterval(tique, 1000); }
    function parar()  { if (relogio) { clearInterval(relogio); relogio = null; } }

    document.addEventListener("visibilitychange", function () {
      document.hidden ? parar() : ligar();
    });
    if (!document.hidden) ligar();

    /* Ao sair, grava o tempo exato. sendBeacon sobrevive ao unload; um
       gtag comum e cancelado no meio do caminho. */
    window.addEventListener("pagehide", function () {
      parar();
      if (segundos > 0) enviar("saida_da_pagina", { segundos: segundos });
    });
  })();

  /* ---------------------------------------------------------------------
     10. Video.
     Cobre <video> nativo e o player do Panda, que e o usado no webnar e
     roda dentro de um iframe, por postMessage.
     ------------------------------------------------------------------ */
  (function () {
    function marcar(id, marco, fonte) {
      enviar("video_marco", { marco: marco, video: String(id).slice(0, 40), player: fonte });
    }

    document.querySelectorAll("video").forEach(function (v, i) {
      var id = v.getAttribute("data-video") || v.getAttribute("id") || ("video_" + i);
      var vistos = {};
      v.addEventListener("play", function () {
        if (!vistos.play) { vistos.play = true; marcar(id, "play", "nativo"); }
      });
      v.addEventListener("timeupdate", function () {
        if (!v.duration) return;
        var pct = Math.floor((v.currentTime / v.duration) * 100);
        [25, 50, 75, 100].forEach(function (m) {
          if (pct >= m && !vistos[m]) { vistos[m] = true; marcar(id, String(m), "nativo"); }
        });
      });
    });

    /* Panda Video fala por postMessage. Os nomes de evento seguem o padrao
       do player; se ele mudar, o listener simplesmente para de gravar, sem
       quebrar nada em volta. */
    var vistosPanda = {};
    window.addEventListener("message", function (ev) {
      if (!ev.data || typeof ev.data !== "object") return;
      var m = ev.data.message || ev.data.event || "";
      var id = ev.data.videoId || ev.data.video_id || "panda";
      if (m === "panda_play" || m === "play") {
        if (!vistosPanda[id + "play"]) { vistosPanda[id + "play"] = true; marcar(id, "play", "panda"); }
      }
      if (m === "panda_timeupdate" || m === "timeupdate") {
        var d = Number(ev.data.duration || 0), c = Number(ev.data.currentTime || 0);
        if (!d) return;
        var pct = Math.floor((c / d) * 100);
        [25, 50, 75, 100].forEach(function (mk) {
          var k = id + mk;
          if (pct >= mk && !vistosPanda[k]) { vistosPanda[k] = true; marcar(id, String(mk), "panda"); }
        });
      }
      if (m === "panda_ended" || m === "ended") {
        var ke = id + "100";
        if (!vistosPanda[ke]) { vistosPanda[ke] = true; marcar(id, "100", "panda"); }
      }
    });
  })();

  /* ---------------------------------------------------------------------
     6. API pública para eventos manuais.
     Ex.: MCTrack.event('diagnostico_concluido', { nivel: 4, score: 84 })
     ------------------------------------------------------------------ */
  window.MCTrack = {
    event: enviar,
    origem: function () { return origem; },
    secaoAtual: function () { return secaoVisivel; }
  };
})();
