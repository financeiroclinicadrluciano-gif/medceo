import { createFileRoute } from "@tanstack/react-router";

import SiteLayout from "@/components/site/SiteLayout";
import PostCard from "@/components/blog/PostCard";
import { getPosts, PROFESSIONAL_SERVICE_SCHEMA, SITE_URL } from "@/lib/blog/posts";
import "@/blog.css";

const TITLE = "Blog MedCEO — gestão, margem e maturidade de clínica médica";
const DESCRIPTION =
  "Textos com conta aberta, tabela e fonte declarada sobre margem, hora clínica, no-show, valuation e dependência do dono. Escritos dentro de uma operação real.";

export const Route = createFileRoute("/blog/")({
  head: () => {
    // Avaliado por requisicao, nunca no escopo do modulo: em Cloudflare
    // Workers o relogio so existe depois que a requisicao chega.
    const posts = getPosts();
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Blog",
                name: "Blog MedCEO",
                description: DESCRIPTION,
                url: `${SITE_URL}/blog`,
                inLanguage: "pt-BR",
                publisher: { "@id": `${SITE_URL}/#medceo` },
                blogPost: posts.map((post) => ({
                  "@type": "BlogPosting",
                  headline: post.titulo,
                  datePublished: post.dataISO,
                  url: post.url,
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
                  { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
                ],
              },
              PROFESSIONAL_SERVICE_SCHEMA,
            ],
          }),
        },
      ],
    };
  },
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const posts = getPosts();

  return (
    <SiteLayout active="/blog">
      <div className="mc-blog">
        <section className="mc-blog-index-hero">
          <div className="mc-container">
            <h1>
              Gestão de clínica com a <em>conta à mostra</em>.
            </h1>
            <p className="mc-v3-lead">
              Cada texto abre o número, mostra a fonte e termina com o que fazer na segunda-feira.
              Sem promessa de faturamento e sem benchmark inventado: onde não há dado auditado, está
              escrito que não há.
            </p>
            <p className="mc-blog-index-count">
              {posts.length} {posts.length === 1 ? "texto publicado" : "textos publicados"}
            </p>
          </div>
        </section>

        <section className="mc-container">
          <div className="mc-blog-grid">
            {posts.map((post, index) => (
              <PostCard key={post.slug} post={post} priority={index < 2} />
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
