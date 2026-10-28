/**
 * Worker do site MedCEO.
 *
 * O site é estático: HTML, CSS, JS e imagens ficam em `site/` e são servidos
 * pelo binding ASSETS. Este script existe para duas coisas que o binding
 * sozinho não faz: garantir o redirecionamento de rotas antigas e devolver
 * cabeçalhos de segurança.
 */

// Rotas do site React anterior que ainda podem estar indexadas ou em links
// externos. Sem isso elas viram 404 e a gente perde o que já tinha ranqueado.
const REDIRECIONAMENTOS = new Map([
  ["/metodo", "/#metodo"],
  ["/servico", "/servicos"],
  ["/servicos/", "/servicos"],
  ["/mentoria", "/#metodo"],
  ["/sobre", "/#quem"],
  ["/faq", "/#faq"],
  ["/contato", "/#diagnostico"],
  ["/como-funciona", "/#metodo"],
  ["/webinar", "/webnar"],
  ["/blog/parcelamento-clinica-margem", "/blog/so-consulta-tem-teto"],
  ["/blog/valuation-clinica-saida-socio", "/blog/jornada-do-paciente-clinica"],
  ["/blog/indicadores-clinica-faixa-referencia", "/blog/trabalhar-muito-ganhar-pouco"],
  ["/blog/diagnostico-gestao-clinica", "/blog/medico-modo-automatico"],
  ["/blog/custo-no-show-clinica", "/blog/clinica-roda-sem-o-dono"],
]);

// Link fixo com destino trocado à mão (302 sem cache). Vazio desde 27/10:
// o /assistir resolve sozinho em `liveDoDia`. Pôr "/assistir" aqui só para
// forçar um destino (ex.: o YouTube parar de mostrar a transmissão no /live).
// 27/10 15h: o /live do canal devolvia o teste antigo kRrGC6lxmPE (agendado
// em 20/10), então a aula de hoje vai fixa até a live acabar.
// Cada destino fixo tem validade: vencido, o /assistir volta a `liveDoDia` sozinho,
// para o link da semana passada nunca ficar preso no botão do WhatsApp.
const TEMPORARIOS = new Map([["/assistir", { url: "https://www.youtube.com/watch?v=pt0MGKG0-QE", ate: "2026-11-03T20:00:00Z" }]]);
const temporarioValido = (c) => { const t = TEMPORARIOS.get(c); return t && Date.now() < Date.parse(t.ate) ? t.url : null; };

// 27/10: o botão "Assistir à aula" do modelo de WhatsApp e o convite semanal
// apontam para medceo.online/assistir. O /live do canal mostra a transmissão
// agendada ou ao vivo; o canonical dela é o watch?v= da live da semana. Sem
// transmissão agendada, cai na aba de lives do canal, nunca num vídeo velho.
const CANAL = "UCl4QH2DnIt80TrVQF4Zt90g";
const SEM_LIVE = `https://www.youtube.com/channel/${CANAL}/streams`;

async function liveDoDia() {
  try {
    const r = await fetch(`https://www.youtube.com/channel/${CANAL}/live`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "pt-BR" },
      signal: AbortSignal.timeout(4000),
    });
    const html = await r.text();
    const id = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/);
    return id ? `https://www.youtube.com/watch?v=${id[1]}` : SEM_LIVE;
  } catch {
    return SEM_LIVE;
  }
}

// Os cabeçalhos de segurança e de cache moram em `site/_headers`: com Static
// Assets o binding responde antes deste script, então header definido aqui só
// chegava nas respostas que passam pelo worker (404 e redirect).

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const caminho = url.pathname.replace(/\/+$/, "") || "/";

    const destino = REDIRECIONAMENTOS.get(caminho);
    if (destino) {
      return Response.redirect(new URL(destino, url.origin).toString(), 301);
    }

    const temporario = temporarioValido(caminho) || (caminho === "/assistir" ? await liveDoDia() : null);
    if (temporario) {
      return new Response(null, {
        status: 302,
        headers: { Location: new URL(temporario, url.origin).toString(), "Cache-Control": "no-store" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
