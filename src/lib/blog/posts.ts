/**
 * Fonte de dados do blog MedCEO.
 *
 * Os posts são arquivos markdown versionados em `src/content/blog/`. O Vite os
 * carrega em tempo de build com `import.meta.glob(..., eager)`, então a rota
 * chega ao navegador sem nenhuma chamada de rede e sem segredo em runtime.
 * Ver a justificativa completa no corpo do PR.
 *
 * Regra de marca: este site é MedCEO (B2B, médico dono de clínica). Só entra
 * post com `marca: medceo`. Post da Natuá nunca é publicado aqui.
 */

import {
  readObjectList,
  readString,
  readStringList,
  splitFrontmatter,
  type Frontmatter,
} from "./frontmatter";
import { MANIFEST } from "./manifest";

const SITE_URL = "https://medceo.online";

/** Texto alternativo das fotos do acervo próprio, escrito olhando cada imagem. */
const COVER_ALT: Record<string, string> = {
  "DSC00199-2.jpg":
    "Corredor de espera da clínica com três poltronas pretas de encosto curvo, televisão na parede e piso claro.",
  "DSC00192-2.jpg":
    "Parede azul-marinho da recepção com prateleiras de livros de gestão e negócios, jardim vertical e estação de café.",
  "DSC00213-2.jpg":
    "Sala de atendimento com mesa branca em L, cadeira de escritório, calculadora sobre a mesa e orquídea no balcão.",
  "DSC00208-2.jpg":
    "Mesa de vidro com cadeira de escritório e poltrona de couro em sala de atendimento com armários cinza.",
  "IMG_0223.jpg":
    "Dr. Luciano Alves Neves de terno bege e óculos redondos, braços cruzados, diante de parede verde com quadro geométrico.",
};

const FALLBACK_COVER = "DSC00192-2.jpg";

/**
 * Autor dos posts.
 *
 * O nome completo é "Alves Neves", não "Alves": em conteúdo de saúde e gestão
 * médica, credencial de autor é sinal de qualidade, e o nome do schema `Person`
 * precisa bater com o da assinatura visível. Fonte canônica do vault 8D:
 * `00-SISTEMA/DADOS-OFICIAIS-NATUA.md`.
 */
export const AUTHOR = {
  name: "Dr. Luciano Alves Neves",
  role: "Médico, dono de clínica e fundador do MedCEO",
  bio: "Criou o método DOC365 dentro da própria operação, com processo, indicador e sucessão. Escreve sobre gestão para quem já tem agenda cheia e quer estrutura.",
  photo: "/blog/capas/IMG_0223.jpg",
  photoAlt: COVER_ALT["IMG_0223.jpg"],
  credential: "CRM/PR 45049",
};

/**
 * Contato próprio do MedCEO.
 *
 * Não é o mesmo da Natuá de propósito. São marcas, públicos e NAPs diferentes
 * (MedCEO fala com médico dono de clínica; Natuá, com paciente). Repetir o
 * endereço e o telefone da clínica aqui enfraqueceria o sinal local das duas.
 * Por isso o schema abaixo declara alcance e canal, e nenhum endereço postal.
 */
export const MEDCEO_WHATSAPP = "https://wa.me/554184875688";

/** Nó `Person` reaproveitado por todos os schemas de post. */
export const AUTHOR_SCHEMA = {
  "@type": "Person",
  name: AUTHOR.name,
  honorificPrefix: "Dr.",
  jobTitle: AUTHOR.role,
  identifier: AUTHOR.credential,
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "Registro profissional",
    recognizedBy: { "@type": "Organization", name: "Conselho Regional de Medicina do Paraná" },
    identifier: AUTHOR.credential,
  },
} as const;

/**
 * O serviço que o blog sustenta. Só declara o que é verificável: nome, site,
 * alcance, canal de contato real e quem presta.
 */
export const PROFESSIONAL_SERVICE_SCHEMA = {
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#medceo`,
  name: "MedCEO",
  url: SITE_URL,
  description:
    "Mentoria de gestão para médicos donos de clínica, com diagnóstico de maturidade, margem, processo comercial e redução da dependência do dono.",
  serviceType: "Mentoria e consultoria em gestão de clínicas médicas",
  areaServed: { "@type": "Country", name: "Brasil" },
  availableLanguage: "pt-BR",
  founder: AUTHOR_SCHEMA,
  provider: AUTHOR_SCHEMA,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Atendimento comercial",
    url: MEDCEO_WHATSAPP,
    availableLanguage: "pt-BR",
  },
} as const;

export type PostLink = { slug: string; ancora: string };

export type Post = {
  slug: string;
  titulo: string;
  dek: string;
  metaDescription: string;
  keyword: string;
  silo: string;
  tipo: string;
  data: string;
  dataISO: string;
  dataLegivel: string;
  autor: string;
  cover: string;
  coverAlt: string;
  coverLegenda: string;
  linksInternos: PostLink[];
  fontes: string[];
  body: string;
  palavras: number;
  minutos: number;
  url: string;
};

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function formatDate(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${Number(day)} de ${MONTHS[Number(month) - 1]} de ${year}`;
}

function countWords(body: string): number {
  return body.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

function normalizeAuthor(nome: string): string {
  const limpo = nome.trim();
  if (!limpo) return AUTHOR.name;
  return /^dr\.?\s+luciano\s+alves$/i.test(limpo) ? AUTHOR.name : limpo;
}

function toPost(data: Frontmatter, body: string, fileSlug: string): Post | null {
  if (readString(data, "marca").toLowerCase() !== "medceo") return null;

  const slug = readString(data, "slug", fileSlug);
  const cover = readString(data, "imagem_capa", FALLBACK_COVER);
  const palavras = countWords(body);
  const dataISO = readString(data, "data", "");

  return {
    slug,
    titulo: readString(data, "titulo"),
    dek: readString(data, "dek"),
    metaDescription: readString(data, "meta_description", readString(data, "dek")),
    keyword: readString(data, "keyword"),
    silo: readString(data, "silo", "Gestão de clínicas"),
    tipo: readString(data, "tipo", "satelite"),
    data: dataISO,
    dataISO: dataISO ? `${dataISO}T08:00:00-03:00` : "",
    dataLegivel: formatDate(dataISO),
    // Trava de nome. O frontmatter trazia "Dr. Luciano Alves", sem o sobrenome,
    // enquanto o nó `Person` do schema assina "Dr. Luciano Alves Neves": duas
    // grafias do mesmo autor na mesma página derrubam o sinal de credencial. O
    // markdown já foi corrigido na fonte; esta função é a rede para o caso de
    // um post novo voltar com a forma curta. Nome oficial:
    // `00-SISTEMA/DADOS-OFICIAIS-NATUA.md`.
    autor: normalizeAuthor(readString(data, "autor", AUTHOR.name)),
    cover: `/blog/capas/${cover}`,
    coverAlt: COVER_ALT[cover] ?? COVER_ALT[FALLBACK_COVER],
    coverLegenda: readString(data, "imagem_capa_legenda"),
    linksInternos: readObjectList(data, "links_internos")
      .filter((item): item is PostLink => Boolean(item.slug && item.ancora))
      .map((item) => ({ slug: item.slug, ancora: item.ancora })),
    fontes: readStringList(data, "fontes"),
    body,
    palavras,
    minutos: Math.max(1, Math.round(palavras / 200)),
    url: `${SITE_URL}/blog/${slug}`,
  };
}

const files = import.meta.glob("../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const TODOS_OS_POSTS: Post[] = Object.entries(files)
  .map(([path, source]) => {
    const { data, body } = splitFrontmatter(source);
    const fileSlug = path.split("/").pop()!.replace(/\.md$/, "");
    return toPost(data, body, fileSlug);
  })
  .filter((post): post is Post => post !== null)
  .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : a.slug.localeCompare(b.slug)));

/**
 * Publicacao escalonada.
 * O repositorio guarda os 10 posts; o site so exibe os que ja atingiram a data.
 * Publicar tudo no mesmo minuto le como descarga de conteudo; distribuido, le
 * como crescimento. A data do proprio post decide, sem cron e sem backend.
 *
 * Por que sao funcoes, e nao arrays prontos: este site roda em Cloudflare
 * Workers, e la o relogio nao existe durante a avaliacao do escopo global do
 * modulo — `new Date()` devolve a epoca Unix ate a primeira requisicao chegar.
 * Com o filtro rodando na carga do modulo, `hoje` virava "1970-01-01", todo
 * post ficava com data maior que isso e o blog publicava a pagina anunciando
 * "0 textos publicados", com os 10 markdowns presentes no bundle. Chamando por
 * requisicao, a data e a real.
 */
const hojeISO = (): string => new Date().toISOString().slice(0, 10);

/** Posts que ja atingiram a data de publicacao. Avaliado por requisicao. */
export const getPosts = (): Post[] => TODOS_OS_POSTS.filter((post) => post.data <= hojeISO());

/** Posts ainda no futuro. Ficam no repositorio, fora do site. */
export const getPostsAgendados = (): Post[] =>
  TODOS_OS_POSTS.filter((post) => post.data > hojeISO());

/** Slugs publicados, usado para nao linkar post que ainda nao existe no ar. */
export const getPostSlugs = (): Set<string> => new Set(getPosts().map((post) => post.slug));

/**
 * Trava de build: o manifesto é gerado pelo script do vault
 * (`scripts/gerar_dados_medceo.py`), que é quem valida link morto, capa
 * inexistente e travessão. Se o markdown em `src/content/blog/` for editado à
 * mão sem passar pelo script, os dois conjuntos divergem e o build para aqui,
 * em vez de publicar um blog que ninguém validou.
 *
 * Compara contra `TODOS_OS_POSTS`, nunca contra `posts`: o manifesto lista os
 * 10 posts do repositório, enquanto `posts` só traz os que já chegaram na data.
 * Comparar contra o conjunto filtrado faria o build quebrar sozinho todo dia em
 * que houvesse post agendado, que é justamente o normal aqui.
 */
const todosOsSlugs = new Set(TODOS_OS_POSTS.map((post) => post.slug));
const manifestSlugs = MANIFEST.map((item) => item.slug as string);
const faltando = manifestSlugs.filter((slug) => !todosOsSlugs.has(slug));
const sobrando = [...todosOsSlugs].filter((slug) => !manifestSlugs.includes(slug));
if (faltando.length > 0 || sobrando.length > 0) {
  throw new Error(
    "Blog fora de sincronia com o manifesto. Rode scripts/gerar_dados_medceo.py. " +
      `No manifesto e sem markdown: [${faltando.join(", ")}]. ` +
      `Com markdown e fora do manifesto: [${sobrando.join(", ")}].`,
  );
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}

/** Posts do mesmo silo, que é a régua de densidade topical do blog. */
export function getRelated(post: Post, limit = 3): Post[] {
  const declared = post.linksInternos
    .map((link) => getPost(link.slug))
    .filter((item): item is Post => Boolean(item) && item!.slug !== post.slug);

  const sameSilo = getPosts().filter(
    (item) => item.silo === post.silo && item.slug !== post.slug && !declared.includes(item),
  );

  return [...declared, ...sameSilo].slice(0, limit);
}

export { SITE_URL };
