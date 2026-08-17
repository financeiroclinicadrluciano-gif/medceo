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
