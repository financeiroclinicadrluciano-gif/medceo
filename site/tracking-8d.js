/* Tracking 8D — GA4 + eventos de conversão
 * Um arquivo, dois sites. A marca vem de window.SITE_MARCA (natua | medceo).
 * Envia tudo para a mesma propriedade GA4 via a tag GT-PJWWKM65, com o
 * parametro site_marca em todo evento — é ele que separa Natua de MedCEO
 * nos relatorios, independente de dominio ou subdominio.
 */
(function () {
  var MARCA = window.SITE_MARCA || 'desconhecido';
  var TAG = 'GT-PJWWKM65';

  // ---- carga do gtag ----
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  if (!document.querySelector('script[src*="gtag/js?id=' + TAG + '"]')) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TAG;
    document.head.appendChild(s);
  }
  gtag('js', new Date());
  // site_marca vai em TODO evento desta pagina
  gtag('config', TAG, {
    site_marca: MARCA,
    send_page_view: true
  });
  gtag('set', { site_marca: MARCA });

  function ev(nome, params) {
    params = params || {};
    params.site_marca = MARCA;
    params.pagina = location.pathname;
    try { gtag('event', nome, params); } catch (e) {}
  }
  window.track8d = ev;

  // ---- 1. cliques em WhatsApp (o CTA que mais importa) ----
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var texto = (a.innerText || a.textContent || '').trim().slice(0, 80);

    if (/wa\.me|api\.whatsapp|whatsapp\.com/i.test(href)) {
      ev('clique_whatsapp', {
        destino: href.slice(0, 200),
        texto_botao: texto,
        secao: secaoDe(a)
      });
      return;
    }
    // link externo
    if (/^https?:\/\//i.test(href) && href.indexOf(location.hostname) === -1) {
      ev('clique_externo', { destino: href.slice(0, 200), texto_botao: texto });
      return;
    }
    // CTA interno (botao ou link com cara de acao)
    if (a.matches('button, .btn, [class*="cta"], [class*="button"]') ||
        /agend|quero|falar|consulta|diagn|inscre|come(c|ç)ar|saber mais/i.test(texto)) {
      ev('clique_cta', { texto_botao: texto, destino: href.slice(0, 120), secao: secaoDe(a) });
    }
  }, true);

  // botao que nao é link
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button');
    if (!b) return;
    var texto = (b.innerText || b.textContent || '').trim().slice(0, 80);
    if (!texto) return;
    ev('clique_botao', { texto_botao: texto, secao: secaoDe(b) });
  }, true);

  function secaoDe(el) {
    var s = el.closest && el.closest('section, header, footer, [id]');
    if (!s) return '';
    return (s.id || s.getAttribute('data-secao') || s.tagName || '').toString().slice(0, 40);
  }

  // ---- 2. envio de formulario ----
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.tagName !== 'FORM') return;
    ev('envio_formulario', { form_id: f.id || f.name || 'sem_id' });
  }, true);

  // ---- 3. profundidade de scroll (25/50/75/100) ----
  var marcos = [25, 50, 75, 100], vistos = {};
  function checarScroll() {
    var h = document.documentElement;
    var total = (h.scrollHeight - h.clientHeight);
    if (total <= 0) return;
    var pct = Math.round((h.scrollTop || document.body.scrollTop) / total * 100);
    marcos.forEach(function (m) {
      if (pct >= m && !vistos[m]) { vistos[m] = 1; ev('scroll_' + m); }
    });
  }
  var t;
  window.addEventListener('scroll', function () {
    clearTimeout(t); t = setTimeout(checarScroll, 200);
  }, { passive: true });

  // ---- 4. tempo engajado na pagina (ao sair) ----
  var inicio = Date.now();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      var seg = Math.round((Date.now() - inicio) / 1000);
      if (seg > 3) ev('tempo_na_pagina', { segundos: seg });
    }
  });

  // ---- 5. clique em telefone/email ----
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (a) ev('clique_contato', { tipo: a.href.split(':')[0], destino: a.href.slice(0, 80) });
  }, true);
})();
