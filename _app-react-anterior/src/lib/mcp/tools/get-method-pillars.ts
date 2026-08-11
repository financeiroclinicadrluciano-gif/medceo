import { defineTool } from "@lovable.dev/mcp-js";

const pillars = [
  {
    number: "01",
    name: "Dr. Luciano",
    role: "Mentalidade CEO",
    thesis:
      "De médico indispensável a CEO capaz de liderar, decidir e desenhar um negócio que cresce.",
    topics: ["Liderança", "Mentalidade", "Tomada de decisões", "Modelos de negócio"],
  },
  {
    number: "02",
    name: "Gustavo",
    role: "Marketing",
    thesis: "Transformar visibilidade em demanda mensurável — e demanda em receita previsível.",
    topics: ["Visibilidade", "Análise de dados e indicadores", "Aquisição de pacientes"],
  },
  {
    number: "03",
    name: "Marcos",
    role: "Comercial",
    thesis: "Tirar a venda do improviso e criar um processo comercial replicável para clínicas.",
    topics: ["Scripts comerciais para clínicas", "Análise de dados e indicadores", "Conversão"],
  },
  {
    number: "04",
    name: "Alessandra",
    role: "Gestão",
    thesis: "Construir cultura, elevar performance e reter gente boa sem centralizar tudo no dono.",
    topics: ["Cultura", "Gestão de pessoas", "Performance de equipe"],
  },
  {
    number: "05",
    name: "Michele",
    role: "Projetos",
    thesis:
      "Fazer a IA sair do discurso e virar execução: projetos com dono, prazo e critério de sucesso.",
    topics: ["IA para clínicas", "IA aplicada à gestão e análise", "Gestão de projetos"],
  },
  {
    number: "06",
    name: "Amanda",
    role: "Filmmaker",
    thesis:
      "Transformar conhecimento médico em conteúdo que prende atenção e sustenta posicionamento.",
    topics: ["Gravação de conteúdo: equipamentos e técnicas", "Posicionamento", "Conteúdo"],
  },
] as const;

export default defineTool({
  name: "get_method_pillars",
  title: "Pilares do Método MedCEO",
  description:
    "Retorna os seis pilares do Método MedCEO (Mentalidade CEO, Marketing, Comercial, Gestão, Projetos e Filmmaker), com o responsável, a tese e os temas de cada pilar.",
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(pillars, null, 2) }],
    structuredContent: { pillars },
  }),
});
