/**
 * Leitor de front matter do blog.
 *
 * Os posts vivem em `src/content/blog/*.md` e são escritos à mão no vault 8D.
 * O subconjunto de YAML usado lá é pequeno e estável: escalares, listas de
 * escalares e listas de objetos rasos. Por isso não entra dependência nova —
 * um parser de ~70 linhas cobre 100% do formato e não adiciona superfície de
 * build. Se o formato crescer, trocar por uma lib é uma mudança local.
 */

export type FrontmatterValue = string | string[] | Record<string, string>[];
export type Frontmatter = Record<string, FrontmatterValue>;

function unquote(raw: string): string {
  const value = raw.trim();
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1).replace(/\\"/g, '"');
    }
  }
  return value;
}

/** Separa o bloco `---` do corpo markdown. */
export function splitFrontmatter(source: string): { data: Frontmatter; body: string } {
  const normalized = source.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { data: {}, body: normalized };
  }

  const end = normalized.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, body: normalized };
  }

  const head = normalized.slice(4, end);
  const body = normalized.slice(end + 4).replace(/^\n+/, "");
  return { data: parseBlock(head), body };
}

function parseBlock(head: string): Frontmatter {
  const lines = head.split("\n");
  const data: Frontmatter = {};

  let currentKey: string | null = null;
  let scalarList: string[] = [];
  let objectList: Record<string, string>[] = [];

  const flush = () => {
    if (!currentKey) return;
    if (objectList.length > 0) data[currentKey] = objectList;
    else if (scalarList.length > 0) data[currentKey] = scalarList;
    currentKey = null;
    scalarList = [];
    objectList = [];
  };

  for (const line of lines) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;

    const indented = /^\s/.test(line);
    const trimmed = line.trim();

    if (indented && currentKey) {
      if (trimmed.startsWith("- ")) {
        const item = trimmed.slice(2);
        const pair = item.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
        if (pair) objectList.push({ [pair[1]]: unquote(pair[2]) });
        else scalarList.push(unquote(item));
        continue;
      }
      const pair = trimmed.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (pair && objectList.length > 0) {
        objectList[objectList.length - 1][pair[1]] = unquote(pair[2]);
        continue;
      }
      // continuação de um escalar quebrado em várias linhas
      if (scalarList.length > 0) scalarList[scalarList.length - 1] += ` ${trimmed}`;
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!pair) continue;

    flush();
    const [, key, rawValue] = pair;
    if (rawValue.trim() === "") currentKey = key;
    else data[key] = unquote(rawValue);
  }

  flush();
  return data;
}

export function readString(data: Frontmatter, key: string, fallback = ""): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

export function readObjectList(data: Frontmatter, key: string): Record<string, string>[] {
  const value = data[key];
  return Array.isArray(value) && typeof value[0] === "object"
    ? (value as Record<string, string>[])
    : [];
}

export function readStringList(data: Frontmatter, key: string): string[] {
  const value = data[key];
  if (typeof value === "string") return [value];
  if (Array.isArray(value) && (value.length === 0 || typeof value[0] === "string")) {
    return value as string[];
  }
  return [];
}
