/**
 * Inventario dos posts do blog MedCEO.
 *
 * ARQUIVO GERADO. Nao editar a mao.
 * Fonte: 04-DELIVERY/blogs-seo-medceo-natua-2026-08-07/posts/*.md
 * Gerador: scripts/gerar_dados_medceo.py
 *
 * O corpo dos posts nao mora aqui: ele fica em src/content/blog/*.md e e
 * carregado por import.meta.glob em tempo de build. Este manifesto existe
 * para dar tipo ao slug e travar o build quando um post some ou e renomeado.
 */

/** Slugs publicados. Link interno para valor fora desta uniao nao compila. */
export type PostSlug =
  | "valuation-clinica-saida-socio"
  | "parcelamento-clinica-margem"
  | "maturidade-empresarial-medica-5-estagios"
  | "margem-lucro-clinica-medica"
  | "indicadores-clinica-faixa-referencia"
  | "diagnostico-gestao-clinica"
  | "custo-no-show-clinica"
  | "custo-hora-clinica"
  | "clinica-dependente-do-dono"
  | "agenda-cheia-prejuizo-clinica";

export type PostResumo = {
  slug: PostSlug;
  titulo: string;
  tipo: string;
  silo: string;
  data: string;
  palavras: number;
  minutos: number;
};

export const MANIFEST: readonly PostResumo[] = [
  {
    slug: "valuation-clinica-saida-socio",
    titulo: "Sócio quer sair e o valor da clínica muda conforme quem produz a receita",
    tipo: "satelite",
    silo: "O dinheiro da clínica",
    data: "2026-08-08",
    palavras: 1397,
    minutos: 7,
  },
  {
    slug: "parcelamento-clinica-margem",
    titulo: "Parcelamento em 12 vezes consome a margem antes de qualquer desconto na tabela",
    tipo: "satelite",
    silo: "O dinheiro da clínica",
    data: "2026-08-08",
    palavras: 1155,
    minutos: 6,
  },
  {
    slug: "maturidade-empresarial-medica-5-estagios",
    titulo:
      "Maturidade empresarial médica: os 5 estágios de uma clínica (e como saber em qual a sua está)",
    tipo: "pilar",
    silo: "Maturidade e dependência do dono",
    data: "2026-08-08",
    palavras: 1393,
    minutos: 7,
  },
  {
    slug: "margem-lucro-clinica-medica",
    titulo: "Clínica cresce em faturamento e perde margem em 4 pontos da própria operação",
    tipo: "pilar",
    silo: "O dinheiro da clínica",
    data: "2026-08-08",
    palavras: 2678,
    minutos: 13,
  },
  {
    slug: "indicadores-clinica-faixa-referencia",
    titulo: "Clínica mede ocupação, no-show e margem sem ter faixa de referência nenhuma",
    tipo: "satelite",
    silo: "Maturidade e dependência do dono",
    data: "2026-08-08",
    palavras: 1437,
    minutos: 7,
  },
  {
    slug: "diagnostico-gestao-clinica",
    titulo: "Seven Gestão publica modelo de 4 níveis e ninguém no mercado responde",
    tipo: "satelite",
    silo: "Maturidade e dependência do dono",
    data: "2026-08-08",
    palavras: 1232,
    minutos: 6,
  },
  {
    slug: "custo-no-show-clinica",
    titulo: "Paciente falta e a cadeira vazia cobra 3 custos que ninguém lança na planilha",
    tipo: "satelite",
    silo: "O dinheiro da clínica",
    data: "2026-08-08",
    palavras: 1290,
    minutos: 6,
  },
  {
    slug: "custo-hora-clinica",
    titulo: "Médico calcula o preço da consulta sem saber quanto custa a própria hora",
    tipo: "satelite",
    silo: "O dinheiro da clínica",
    data: "2026-08-08",
    palavras: 1233,
    minutos: 6,
  },
  {
    slug: "clinica-dependente-do-dono",
    titulo: "Clínica dependente do dono trava em 4 pontos quando ele sai da rotina",
    tipo: "satelite",
    silo: "Maturidade e dependência do dono",
    data: "2026-08-08",
    palavras: 1390,
    minutos: 7,
  },
  {
    slug: "agenda-cheia-prejuizo-clinica",
    titulo: "Agenda cheia esconde prejuízo em 3 sinais que aparecem antes do caixa",
    tipo: "satelite",
    silo: "Maturidade e dependência do dono",
    data: "2026-08-08",
    palavras: 1278,
    minutos: 6,
  },
] as const;
