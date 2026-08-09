import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import SiteLayout from "@/components/site/SiteLayout";
import PostChrome from "@/components/blog/PostChrome";
import PostFaq from "@/components/blog/PostFaq";
import ShareRow from "@/components/blog/ShareRow";
import { parsePost, renderBlocks } from "@/lib/blog/markdown";
import {
  AUTHOR,
  AUTHOR_SCHEMA,
  getPost,
  getRelated,
  PROFESSIONAL_SERVICE_SCHEMA,
  SITE_URL,
  type Post,
} from "@/lib/blog/posts";
import "@/blog.css";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    if (!getPost(params.slug)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) return {};

    const parsed = parsePost(post.body);
    const graph: Record<string, unknown>[] = [
      {
        "@type": "Article",
        mainEntityOfPage: { "@type": "WebPage", "@id": post.url },
        headline: post.titulo,
        description: post.metaDescription,
        inLanguage: "pt-BR",
        datePublished: post.dataISO,
        dateModified: post.dataISO,
        articleSection: post.silo,
        keywords: post.keyword,
        wordCount: post.palavras,
        image: `${SITE_URL}${post.cover}`,
        author: AUTHOR_SCHEMA,
        publisher: { "@id": `${SITE_URL}/#medceo` },
        isPartOf: { "@type": "Blog", name: "Blog MedCEO", url: `${SITE_URL}/blog` },
      },
      PROFESSIONAL_SERVICE_SCHEMA,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.titulo, item: post.url },
        ],
      },
    ];

    if (parsed.faq.length > 0) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: parsed.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      });
    }

    return {
      meta: [
        { title: `${post.titulo} | MedCEO` },
        { name: "description", content: post.metaDescription },
        { name: "author", content: post.autor },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: post.titulo },
        { property: "og:description", content: post.metaDescription },
        { property: "og:url", content: post.url },
        { property: "og:image", content: `${SITE_URL}${post.cover}` },
        { property: "article:published_time", content: post.dataISO },
        { property: "article:section", content: post.silo },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.titulo },
        { name: "twitter:description", content: post.metaDescription },
        { name: "twitter:image", content: `${SITE_URL}${post.cover}` },
      ],
      links: [{ rel: "canonical", href: post.url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
        },
      ],
    };
  },
  component: BlogPostPage,
  notFoundComponent: PostNotFound,
});

function PostNotFound() {
  return (
    <SiteLayout active="/blog">
      <section className="mc-v3-hero">
        <div className="mc-container">
          <h1>Este texto não existe (ainda).</h1>
          <p className="mc-v3-lead">
            O endereço pode ter mudado ou o post ainda não foi publicado. A lista completa está no
            blog.
          </p>
          <div className="mc-v3-actions">
            <Link className="mc-v3-btn" to="/blog">
              Ver todos os textos
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const post = getPost(slug);
  if (!post) return <PostNotFound />;
  return <PostView post={post} />;
}

function PostView({ post }: { post: Post }) {
  const parsed = parsePost(post.body);
  const related = getRelated(post);

  return (
    <SiteLayout active="/blog">
      <div className="mc-blog">
        <PostChrome title={post.titulo} headings={parsed.headings} shareUrl={post.url} />

        <section className="mc-blog-post-hero">
          <div className="mc-blog-column">
            <p className="mc-blog-breadcrumb">
              <Link to="/">Início</Link>
              <span aria-hidden="true"> › </span>
              <Link to="/blog">Blog</Link>
              <span aria-hidden="true"> › </span>
              {post.silo}
            </p>
            <h1>{post.titulo}</h1>
            <p className="mc-blog-dek">{post.dek}</p>
            <p className="mc-blog-byline">
              Por <a href="#autor">{post.autor}</a> · MedCEO
            </p>
            <p className="mc-blog-timestamp">
              <time dateTime={post.data}>{post.dataLegivel}</time>
              <span aria-hidden="true"> · </span>
              {post.minutos} min de leitura · {post.palavras.toLocaleString("pt-BR")} palavras
            </p>
            <ShareRow title={post.titulo} url={post.url} />
          </div>
        </section>

        <section className="mc-blog-cover">
          <div className="mc-blog-column">
            <img
              src={post.cover}
              alt={post.coverAlt}
              width={1200}
              height={675}
              fetchPriority="high"
              decoding="async"
            />
            {post.coverLegenda ? <p className="mc-blog-caption">{post.coverLegenda}</p> : null}
          </div>
        </section>

        <div className="mc-blog-paper">
          <div className="mc-blog-column">
            <article className="mc-blog-article" id="mc-blog-body">
              {renderBlocks(parsed.blocks)}

              {parsed.faq.length > 0 ? (
                <>
                  <h2 className="mc-blog-section-title" id="perguntas-frequentes">
                    Perguntas frequentes
                  </h2>
                  <PostFaq items={parsed.faq} />
                </>
              ) : null}

              <Link className="mc-blog-cta" to="/diagnostico">
                <p className="mc-blog-cta-label">Diagnóstico DOC365</p>
                <p className="mc-blog-cta-title">
                  Descubra em qual dos 5 estágios de maturidade sua clínica está
                </p>
                <p className="mc-blog-cta-support">
                  São 20 perguntas, cerca de 5 minutos, e o resultado sai na hora: estágio, gargalo
                  principal e os três próximos passos.
                </p>
              </Link>

              {post.fontes.length > 0 ? (
                <section className="mc-blog-sources">
                  <h2>Fontes deste texto</h2>
                  <ul>
                    {post.fontes.map((fonte) => (
                      <li key={fonte}>{fonte}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {related.length > 0 ? (
                <>
                  <h2 className="mc-blog-section-title">Leia também</h2>
                  <ul className="mc-blog-related">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link to="/blog/$slug" params={{ slug: item.slug }}>
                          {item.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <div className="mc-blog-author" id="autor">
                <img src={AUTHOR.photo} alt={AUTHOR.photoAlt} width={96} height={96} />
                <div>
                  <p className="mc-blog-author-name">{AUTHOR.name}</p>
                  <p className="mc-blog-author-role">
                    {AUTHOR.role} · {AUTHOR.credential}
                  </p>
                  <p className="mc-blog-author-bio">{AUTHOR.bio}</p>
                </div>
              </div>

              <ul className="mc-blog-tags">
                <li>{post.silo}</li>
                <li>{post.keyword}</li>
                <li>Gestão de clínicas</li>
              </ul>
            </article>
          </div>
        </div>

        <p className="mc-blog-disclaimer">
          Conteúdo educativo para médicos donos de clínica. Os valores usados em exemplos vêm de
          caso hipotético declarado no próprio texto e não servem como referência de mercado.
          Decisões tributárias e societárias devem ser validadas com o seu contador.
        </p>
      </div>
    </SiteLayout>
  );
}
