import { defineMcp } from "@lovable.dev/mcp-js";

import getDiagnosticQuestions from "./tools/get-diagnostic-questions";
import getMethodPillars from "./tools/get-method-pillars";
import scoreDiagnostic from "./tools/score-diagnostic";

export default defineMcp({
  name: "medceo-lp",
  title: "MedCEO LP",
  version: "0.1.0",
  instructions:
    "Ferramentas públicas do MedCEO: use `get_diagnostic_questions` para obter as 20 perguntas do Diagnóstico de Maturidade Empresarial para clínicas, `score_diagnostic` para calcular o nível (1 a 5) e os gargalos a partir das respostas, e `get_method_pillars` para consultar os seis pilares do Método MedCEO.",
  tools: [getDiagnosticQuestions, scoreDiagnostic, getMethodPillars],
});
