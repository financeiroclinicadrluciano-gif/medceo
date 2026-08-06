import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { pillarMeta, questions, type PillarKey } from "@/lib/diagnostic-data";

const pillarKeys = ["diagnostico", "margem", "comercial", "operacao", "escala"] as const;

export default defineTool({
  name: "get_diagnostic_questions",
  title: "Perguntas do diagnóstico MedCEO",
  description:
    "Lista as 20 perguntas do Diagnóstico de Maturidade Empresarial MedCEO, com as três alternativas de cada pergunta e a pontuação (1, 3 ou 5) de cada alternativa. Pode ser filtrado por pilar.",
  inputSchema: {
    pillar: z
      .enum(pillarKeys)
      .optional()
      .describe("Filtra as perguntas por pilar: diagnostico, margem, comercial, operacao ou escala."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ pillar }) => {
    const selected = pillar ? questions.filter((q) => q.pillar === (pillar as PillarKey)) : questions;
    const items = selected.map((q) => ({
      id: q.id,
      pillar: q.pillar,
      pillarLabel: pillarMeta[q.pillar].label,
      question: q.question,
      options: q.options.map((option) => ({
        text: option.text,
        score: option.score,
        description: option.description,
      })),
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { count: items.length, questions: items },
    };
  },
});
