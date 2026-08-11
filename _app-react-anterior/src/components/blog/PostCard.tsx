/**
 * Cartão de post na listagem: imagem, chapéu de categoria, manchete, dek e data.
 *
 * O chapéu é um selo sobre a imagem, e não uma linha de texto em caixa alta
 * antes do título: assim ele classifica o cartão sem virar um kicker acima da
 * manchete, que rouba a primeira leitura do olho.
 */

import { Link } from "@tanstack/react-router";

import type { Post } from "@/lib/blog/posts";

export default function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className="mc-blog-card">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="mc-blog-card-link">
        <div className="mc-blog-card-media">
          <img
            src={post.cover}
            alt={post.coverAlt}
            width={900}
            height={506}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
          <span className="mc-blog-card-hat">{post.silo}</span>
        </div>
        <div className="mc-blog-card-body">
          <h2>{post.titulo}</h2>
          <p className="mc-blog-card-dek">{post.dek}</p>
          <p className="mc-blog-card-meta">
            <time dateTime={post.data}>{post.dataLegivel}</time>
            <span aria-hidden="true"> · </span>
            {post.minutos} min de leitura
          </p>
        </div>
      </Link>
    </article>
  );
}
