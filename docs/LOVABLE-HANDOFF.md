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
npm install
npm run dev
```

Validações antes de publicar:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Arquitetura editável

- `src/routes/index.tsx`: conteúdo, ordem das dobras e metadados.
- `src/routes/design-system.tsx`: página viva do sistema em `/design-system`.
- `src/styles.css`: arquitetura, layout responsivo e comportamento da landing.
- `src/coffee-v2.css`: direção editorial aplicada à VSL e à dobra de autoridade.
- `src/case-evolution.css`: comparação visual e storytelling responsável do case Dr. Luiz.
- `src/pillars-experience.css`: atlas dos seis pilares em scroll-linked desktop e mobile.
- `src/design-system.css`: apresentação visual isolada do design system.
- `src/components/landing/`: componentes interativos customizados.
- `src/components/DiagnosticModal.tsx`: as 20 perguntas e a lógica do resultado.
- `src/brand/tokens/`: cores, tipografia, espaços, efeitos e fontes oficiais.
- `src/assets/medceo/`: fotografia, prova social e fundos.
- `docs/design-system/`: fundamentos, tokens, prompt para Lovable e regras de movimento/acessibilidade.

## Componentes integrados

Os componentes foram adaptados para produção, em vez de copiar demos inteiros. A versão Nocturne removeu efeitos decorativos sobrepostos e concentrou a experiência em uma assinatura visual única:

- `SplitText`: headline revelada por linhas, sem dependência de medição do DOM.
- `CaseEvolution`: transformação R$ 80 mil → R$ 200 mil em uma composição única, com contexto, 01/06 pilar e ressalva de resultado individual.
- `MethodPillarsExperience`: seis retratos editoriais em uma rail sticky no desktop e em uma sequência vertical vinculada ao scroll no mobile.
- `Corte de Direção`: eixo de 8° usado em chanfros, hairlines e transições como assinatura do sistema.
- Materiais CSS: darkroom, metal dourado escovado, papel técnico e vidro fumê, sem WebGL ou canvas decorativo.
- O retrato do hero usa AVIF responsivo com fallback PNG, reduzindo a transferência principal sem perder transparência.
- Os retratos de Dr. Luciano, Gustavo, Marcos, Alessandra, Michele e Amanda ficam em `src/assets/medceo/method-pillars/`, dimensionados para a área real de uso.

## Design system MedCEO Nocturne

A página `/design-system` é o manual visual executável. Ela demonstra:

- conceito e princípios;
- paleta e tipografia;
- materiais e superfícies;
- botões, campos, chips e indicadores;
- direção fotográfica;
- movimento, touch e `prefers-reduced-motion`.

Ao pedir alterações no Lovable, use `docs/design-system/LOVABLE-PROMPT.md` como instrução-base e preserve os tokens de `src/brand/tokens/`.

## Regras de conteúdo e conversão

- O CTA da primeira dobra e a ação do cabeçalho ficam ocultos nos primeiros cinco minutos da sessão e aparecem depois desse período.
- O botão da última dobra permanece como acesso direto ao diagnóstico.
- Os demais CTAs comerciais poderão apontar para WhatsApp quando o número internacional for definido.
- `PENDENTE`: número do WhatsApp em formato país + DDD + número, somente dígitos.
- O case Dr. Luiz permanece como informação individual: R$ 80 mil → R$ 200 mil em aproximadamente três meses, trabalhando um pilar.
- A interface comunica o avanço informado de `+R$ 120 mil` e identifica Mentalidade CEO como `01/06`; não transforma o case em causalidade ou garantia.
- Nenhum resultado é apresentado como garantia.

## Ordem atual da landing

1. VSL e promessa principal;
2. filtro de adequação;
3. case Dr. Luiz;
4. seis pilares do Método MedCEO;
5. autoridade Dr. Luciano e Natuá;
6. diagnóstico final.

## Knowledge e skills Lovable

O pacote complementar `Lovable-Quality-System-2026-07-20` contém:

- Workspace Knowledge universal;
- Project Knowledge específico MedCEO;
- cinco skills importáveis individualmente por ZIP;
- instruções e smoke tests.

Essas camadas complementam o repositório. O Project Knowledge MedCEO prevalece quando uma regra específica de marca divergir de um padrão universal.

## Publicação paralela no OpenAI Sites

`.openai/hosting.json` e `scripts/stage-sites-build.mjs` pertencem à publicação no OpenAI Sites. O Lovable os ignora; eles devem permanecer no repositório enquanto os dois canais forem usados.
