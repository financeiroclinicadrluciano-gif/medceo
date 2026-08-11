import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { getPosts, SITE_URL } from "@/lib/blog/posts";

/**
 * O `<loc>` do sitemap precisa ser URL absoluta: o protocolo exige, e caminho
 * relativo ("/blog/...") faz o buscador descartar a entrada. O valor estava
 * vazio, então as 7 páginas que já existiam eram publicadas como caminho solto.
 * Com os 11 endereços do blog entrando aqui, entregar em formato inválido seria
 * o mesmo que não entregar.
 */
const BASE_URL = SITE_URL;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: {
          path: string;
          changefreq: string;
          priority: string;
          lastmod?: string;
        }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/metodo", changefreq: "monthly", priority: "0.8" },
          { path: "/mentoria", changefreq: "monthly", priority: "0.8" },
          { path: "/blog", changefreq: "daily", priority: "0.9" },
          { path: "/sobre", changefreq: "monthly", priority: "0.6" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/contato", changefreq: "monthly", priority: "0.6" },
          { path: "/webnar", changefreq: "monthly", priority: "0.6" },
          // O pilar do silo pesa mais que o satélite: é ele que precisa ser
          // descoberto e indexado primeiro para receber os links ascendentes.
          ...getPosts().map((post) => ({
            path: `/blog/${post.slug}`,
            changefreq: "monthly",
            priority: post.tipo === "pilar" ? "0.8" : "0.7",
            lastmod: post.data || undefined,
          })),
        ];
        const urls = entries.map((e) => {
          const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : "";
          return `  <url>\n    <loc>${BASE_URL}${e.path}</loc>${lastmod}\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`;
        });
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
