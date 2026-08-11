/**
 * `/diagnostico` existe porque é o endereço que os posts do blog usam como CTA.
 *
 * O diagnóstico em si é um modal na home, não uma página própria: quem responde
 * as 20 perguntas faz isso dentro de `DiagnosticModal`, aberto pelo botão da
 * seção `#diagnostico`. Sem esta rota, `medceo.online/diagnostico` devolve 404
 * (verificado por HTTP em 09/08/2026) e os 10 posts apontariam para o vazio.
 *
 * A correção mais enxuta é redirecionar para a seção que já existe, em vez de
 * duplicar o fluxo do diagnóstico em uma segunda página que precisaria ser
 * mantida em paralelo. Redirect não entra no sitemap de propósito.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/diagnostico")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "diagnostico" });
  },
});
