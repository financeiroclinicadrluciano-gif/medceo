import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { buildResult, pillarMeta, questions } from "@/lib/diagnostic-data";

export default defineTool({
  name: "score_diagnostic",
  title: "Calcular resultado do diagnóstico",
  description:
    "Calcula o nível de maturidade empresarial (1 a 5) a partir das 20 respostas do diagnóstico MedCEO. Cada resposta deve ser 1, 3 ou 5, conforme a pontuação das alternativas retornadas por get_diagnostic_questions.",
  inputSchema: {
    answers: z
      .array(
        z.object({
          questionId: z.number().int().describe("Id da pergunta (1 a 20)."),
          score: z.number().int().describe("Pontuação da alternativa escolhida: 1, 3 ou 5."),
        }),
      )
      .describe("As 20 respostas do diagnóstico."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ answers }) => {
    const map: Record<number, number> = {};
    for (const answer of answers) {
      if (![1, 3, 5].includes(answer.score)) {
        throw new ToolError(
          `Pontuação inválida (${answer.score}) na pergunta ${answer.questionId}. Use 1, 3 ou 5.`,
        );
      }
      map[answer.questionId] = answer.score;
    }

    const missing = questions.filter((q) => ![1, 3, 5].includes(map[q.id])).map((q) => q.id);
    if (missing.length > 0) {
      throw new ToolError(
        `Respostas faltando ou inválidas para as perguntas: ${missing.join(", ")}.`,
      );
    }

    const result = buildResult(map);
    const total = questions.reduce((sum, q) => sum + map[q.id], 0);
    const payload = {
      totalScore: total,
      level: result.level,
      title: result.title,
      subtitle: result.subtitle,
      description: result.description,
      actions: result.actions,
      bottlenecks: result.bottlenecks.map((item) => ({
        pillar: item.pillar,
        pillarLabel: pillarMeta[item.pillar].label,
        score: item.score,
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
