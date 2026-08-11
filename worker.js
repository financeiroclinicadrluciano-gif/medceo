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
  ["/mentoria", "/#metodo"],
  ["/sobre", "/#quem"],
  ["/faq", "/#faq"],
  ["/contato", "/#diagnostico"],
  ["/como-funciona", "/#metodo"],
  ["/webinar", "/webnar"],
]);

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

    return env.ASSETS.fetch(request);
  },
};
