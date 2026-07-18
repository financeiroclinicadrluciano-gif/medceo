# MedCEO Nocturne — kit para Lovable

Este pacote contém a landing MedCEO, o diagnóstico funcional e o design system editável.

## Como usar

Este projeto já está conectado ao Lovable pelo GitHub. A forma suportada de atualizar o projeto é sincronizar a branch `main` do repositório `financeiroclinicadrluciano-gif/medceo`.

O ZIP e esta pasta servem como backup, handoff e referência para o chat do projeto existente; não criam um novo projeto Lovable por importação direta.

## Rotas

- `/`: landing e diagnóstico.
- `/design-system`: manual visual vivo MedCEO Nocturne.

## Arquivos principais

- `src/routes/index.tsx`: conteúdo e estrutura da landing.
- `src/nocturne.css`: direção de arte aplicada à landing.
- `src/routes/design-system.tsx`: página viva do sistema.
- `src/design-system.css`: estilos da página do sistema.
- `src/brand/tokens/`: tokens oficiais.
- `docs/design-system/`: documentação e prompt pronto para Lovable.
- `docs/LOVABLE-HANDOFF.md`: instruções completas de sincronização e manutenção.

## Executar

```bash
bun install
bun run dev
```

## Validar

```bash
bun x tsc --noEmit
bun run lint
bun run build
```

Não invente métricas, cases, credenciais ou número de WhatsApp. Pendências sem fonte devem permanecer marcadas como `PENDENTE`.
