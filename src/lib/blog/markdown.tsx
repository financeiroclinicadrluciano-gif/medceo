/**
 * Markdown → React para os posts do blog.
 *
 * Cobre exatamente o que os posts do vault usam: h2/h3, parágrafo, lista,
 * tabela com cabeçalho, citação, negrito, ênfase, código e link. Nada além
 * disso é aceito de propósito: markdown desconhecido aparece como texto, não
 * como HTML injetado. Não existe `dangerouslySetInnerHTML` em nenhum ponto.
 */

import { Fragment, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { getPostSlugs } from "./posts";

export type Heading = { id: string; label: string };
export type FaqPair = { question: string; answer: string };

type Block =
  | { kind: "heading"; level: 2 | 3; id: string; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "quote"; text: string };

export type ParsedPost = {
  blocks: Block[];
  headings: Heading[];
  faq: FaqPair[];
};

const FAQ_TITLE = "perguntas frequentes";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function stripInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*`]/g, "")
    .trim();
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparator(line: string): boolean {
  return /^\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes("-");
}

export function parsePost(body: string): ParsedPost {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const headings: Heading[] = [];
  const faq: FaqPair[] = [];

  let inFaq = false;
  let pendingQuestion: string | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (!text) return;

    if (inFaq) {
      const question = text.match(/^\*\*(.+?)\*\*$/);
      if (question) {
        pendingQuestion = question[1].trim();
      } else if (pendingQuestion) {
        faq.push({ question: pendingQuestion, answer: stripInline(text) });
        pendingQuestion = null;
      }
      return;
    }
    blocks.push({ kind: "paragraph", text });
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      continue;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const text = stripInline(heading[2]);
      const wasFaq = inFaq;
      inFaq = text.toLowerCase() === FAQ_TITLE;
      if (wasFaq && !inFaq) pendingQuestion = null;
      if (inFaq) continue;

      const level = heading[1].length === 2 ? 2 : 3;
      const id = slugify(text);
      blocks.push({ kind: "heading", level, id, text });
      if (level === 2) headings.push({ id, label: text });
      continue;
    }

    if (trimmed.startsWith("|") && !inFaq) {
      const next = lines[index + 1]?.trim() ?? "";
      if (isSeparator(next)) {
        flushParagraph();
        const head = splitRow(trimmed);
        const rows: string[][] = [];
        let cursor = index + 2;
        while (cursor < lines.length && lines[cursor].trim().startsWith("|")) {
          rows.push(splitRow(lines[cursor].trim()));
          cursor += 1;
        }
        blocks.push({ kind: "table", head, rows });
        index = cursor - 1;
        continue;
      }
    }

    if (trimmed.startsWith("> ") && !inFaq) {
      flushParagraph();
      blocks.push({ kind: "quote", text: trimmed.slice(2).trim() });
      continue;
    }

    const bullet = trimmed.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (bullet && !inFaq) {
      flushParagraph();
      const ordered = /\d/.test(bullet[1]);
      const items: string[] = [bullet[2]];
      let cursor = index + 1;
      while (cursor < lines.length) {
        const nextMatch = lines[cursor].trim().match(/^([-*]|\d+\.)\s+(.*)$/);
        if (!nextMatch) break;
        items.push(nextMatch[2]);
        cursor += 1;
      }
      blocks.push({ kind: "list", ordered, items });
      index = cursor - 1;
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return { blocks, headings, faq };
}

/** Converte negrito, ênfase, código e link em nós React. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let count = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${count}`;
    count += 1;

    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const parts = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      nodes.push(parts ? renderLink(parts[1], parts[2], key) : token);
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderLink(label: string, href: string, key: string): ReactNode {
  const internal = href.match(/^\/blog\/([a-z0-9-]+)\/?$/);
  if (internal) {
    // Link para post que ainda não foi publicado vira texto puro: melhor uma
    // frase inteira do que um link que devolve 404 para o leitor e para o robô.
    if (!getPostSlugs().has(internal[1])) return <Fragment key={key}>{label}</Fragment>;
    return (
      <Link key={key} to="/blog/$slug" params={{ slug: internal[1] }} className="mc-blog-link">
        {label}
      </Link>
    );
  }

  // O CTA dos posts é escrito no vault como URL absoluta. Dentro do próprio
  // site ele vira navegação interna: mesma página de destino, sem recarregar
  // o documento e sem sair para o domínio público.
  const diagnostic = href.match(/^https?:\/\/medceo\.online(\/diagnostico\/?)$/);
  if (diagnostic) {
    return (
      <Link key={key} to="/diagnostico" className="mc-blog-link">
        {label}
      </Link>
    );
  }

  const isExternal = /^https?:\/\//.test(href);
  return (
    <a
      key={key}
      href={href}
      className="mc-blog-link"
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {label}
    </a>
  );
}

export function renderBlocks(blocks: Block[]): ReactNode {
  return blocks.map((block, index) => {
    const key = `b${index}`;

    switch (block.kind) {
      case "heading":
        return block.level === 2 ? (
          <h2 key={key} id={block.id}>
            {block.text}
          </h2>
        ) : (
          <h3 key={key} id={block.id}>
            {block.text}
          </h3>
        );

      case "paragraph":
        return <p key={key}>{inline(block.text, key)}</p>;

      case "quote":
        return (
          <blockquote key={key} className="mc-blog-quote">
            <p>{inline(block.text, key)}</p>
          </blockquote>
        );

      case "list":
        return block.ordered ? (
          <ol key={key} className="mc-blog-list">
            {block.items.map((item, i) => (
              <li key={`${key}-${i}`}>{inline(item, `${key}-${i}`)}</li>
            ))}
          </ol>
        ) : (
          <ul key={key} className="mc-blog-list">
            {block.items.map((item, i) => (
              <li key={`${key}-${i}`}>{inline(item, `${key}-${i}`)}</li>
            ))}
          </ul>
        );

      case "table":
        return (
          <div key={key} className="mc-blog-table-wrap" tabIndex={0} role="group">
            <table>
              <thead>
                <tr>
                  {block.head.map((cell, i) => (
                    <th key={`${key}-h${i}`} scope="col">
                      {inline(cell, `${key}-h${i}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={`${key}-r${r}`}>
                    {row.map((cell, c) => (
                      <td key={`${key}-r${r}c${c}`}>{inline(cell, `${key}-r${r}c${c}`)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  });
}
