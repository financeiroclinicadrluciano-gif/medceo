# Handoff Lovable — MedCEO Diagnóstico

## Estado do projeto

Este repositório já é um projeto Lovable nativo. A evidência técnica está em:

- `.lovable/project.json` com o template `tanstack_start_ts_current`;
- `@lovable.dev/vite-tanstack-config` no projeto;
- React 19 + TanStack Start + Vite 8 + Tailwind 4 em modo CSS-first;
- `components.json` configurado para shadcn sem RSC.

O Lovable não importa um repositório GitHub arbitrário como projeto novo. Neste caso, a sincronização funciona porque o projeto já foi criado/conectado pelo Lovable. Por padrão, a sincronização acompanha a branch default do repositório; confirme no seletor do Lovable que a branch ativa é `main` antes e depois do merge.

Documentação oficial: <https://docs.lovable.dev/integrations/github>

## Como abrir a nova versão no Lovable

1. Revisar e aprovar a Pull Request do redesign.
2. Fazer merge da PR na branch `main`.
3. Abrir o projeto MedCEO já existente no Lovable.
4. Confirmar que a branch ativa no seletor do Lovable é `main`.
5. Aguardar a sincronização GitHub → Lovable.
6. Confirmar no painel que o último commit da `main` está presente.

Não crie um novo projeto vazio e tente importar este ZIP: esse fluxo não é suportado pelo Lovable.

## Como executar localmente

```bash
bun install
bun run dev
```

Validações antes de publicar:

```bash
bun x tsc --noEmit
bun run lint
bun run build
```

## Arquitetura editável

- `src/routes/index.tsx`: conteúdo, ordem das dobras e metadados.
- `src/styles.css`: layout responsivo e sistema visual da landing.
- `src/components/landing/`: componentes interativos customizados.
- `src/components/DiagnosticModal.tsx`: as 20 perguntas e a lógica do resultado.
- `src/brand/tokens/`: cores, tipografia, espaços, efeitos e fontes oficiais.
- `src/assets/medceo/`: fotografia, prova social e fundos.

## Componentes integrados

Os componentes foram adaptados para produção, em vez de copiar demos inteiros:

- `SplitText`: headline revelada por linhas, sem dependência de medição do DOM.
- `CanvasText`: uma palavra editorial com canvas 2D, pausado fora da viewport.
- `SpotlightSurface`: luz sutil em cards de filtro, sem WebGL.
- `TiltSurface`: profundidade limitada no case do Dr. Luiz, desligada em touch/reduced motion.
- `AnimatedCaseStudy`: padrão de testimonial animado sem inventar depoimento em primeira pessoa.
- `MethodPillarsMarquee`: seis retratos editoriais em esteira contínua no desktop, com pausa acessível e `scroll-snap` manual em touch/reduced motion.
- `DottedGlowBackground`: canvas leve no CTA final, pausado fora da viewport.
- O retrato do hero usa AVIF responsivo com fallback PNG, reduzindo a transferência principal sem perder transparência.
- Os retratos de Dr. Luciano, Gustavo, Marcos, Alessandra, Michele e Amanda ficam em `src/assets/medceo/method-pillars/`, dimensionados para a área real de uso.

## Regras de conteúdo e conversão

- Apenas o botão da última dobra abre o diagnóstico.
- Os demais CTAs comerciais poderão apontar para WhatsApp quando o número internacional for definido.
- `PENDENTE`: número do WhatsApp em formato país + DDD + número, somente dígitos.
- O case Dr. Luiz permanece como informação individual: R$ 80 mil → R$ 200 mil em aproximadamente três meses, trabalhando um pilar.
- A variação correta é `+150%` e `2,5x` o patamar anterior; não usar `+3x`.
- Nenhum resultado é apresentado como garantia.

## Publicação paralela no OpenAI Sites

`.openai/hosting.json` e `scripts/stage-sites-build.mjs` pertencem à publicação no OpenAI Sites. O Lovable os ignora; eles devem permanecer no repositório enquanto os dois canais forem usados.
