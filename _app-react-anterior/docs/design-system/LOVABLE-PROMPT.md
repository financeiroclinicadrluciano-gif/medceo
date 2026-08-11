# Prompt de implementação — MedCEO Nocturne no Lovable

Copie o bloco abaixo para o Lovable conectado a este repositório.

---

Você está refinando a landing page MedCEO existente. Não reconstrua o projeto do zero e não altere o conteúdo aprovado, as rotas, o formulário, o modal, os links, a ordem das seções ou a lógica de conversão sem instrução explícita.

## Objetivo visual

Aplicar o design system **MedCEO Nocturne** com acabamento editorial e cinematográfico, como uma composição executiva finalizada no Photoshop, mas implementada com CSS leve, React semântico e boa performance.

A direção é **executive darkroom**:

- darkroom em obsidian e navy para foco e autoridade;
- papel técnico para diagnóstico, critérios, entregáveis e dossiers;
- metal dourado para decisão, progressão e CTA principal;
- vidro fumê para superfícies interativas sobre fundos escuros ou fotografia;
- fotografia tratada com vinheta, luz recortada e enquadramento editorial;
- assimetria controlada e grid rigoroso.

A assinatura visual é o **Corte de Direção**, uma diagonal de **8°**. Use no máximo uma aplicação principal por seção para conduzir o olhar. Nunca atravesse rostos, números ou texto.

## Fonte de verdade

Antes de alterar estilos, leia:

1. `docs/design-system/README.md`
2. `docs/design-system/tokens.json`
3. `docs/design-system/MOTION-ACCESSIBILITY.md`
4. `src/brand/tokens/colors.css`
5. `src/brand/tokens/effects.css`
6. `src/brand/tokens/typography.css`
7. `src/brand/tokens/spacing.css`

Use as variáveis `--medceo-*`. Não crie uma segunda paleta, uma segunda escala tipográfica ou novos valores arbitrários quando já existe token apropriado.

## Hierarquia visual

- Headlines e grandes números: Playfair Display ou Bodoni 72, peso regular.
- Corpo: Montserrat.
- Interface: Poppins.
- Índices e marcações técnicas: JetBrains Mono.
- Eyebrows: caixa alta, tracking amplo e uso contido de dourado.
- Dourado é material de decisão; não use como fundo amplo nem em todo texto.
- Cantos discretos, entre 2px e 8px na maioria das superfícies.
- Respiro generoso entre seções, com protagonista visual claro em cada dobra.

## Linguagem de componentes

### CTA primário

- Use o gradiente `--medceo-material-metal`.
- Texto em navy profundo.
- Forma firme e pouco arredondada.
- Um recorte diagonal pode reforçar o Corte de Direção.
- Hover discreto; foco de teclado sempre visível.

### Cards e dossiers

- Evite grade de cartões idênticos com aparência de template.
- Use composição editorial: índice mono, eyebrow, título serifado, régua fina e conteúdo sans.
- Para leitura e critérios, use papel técnico com texto em tinta.
- Para prova e autoridade, use navy/vidro com borda dourada de baixa opacidade.

### Fotografia

- Preserve a imagem fornecida e o enquadramento do rosto.
- Use `object-position` responsivo para evitar cortes ruins.
- Textura, grade e scanline não podem passar pelo rosto.
- Posicione o texto na área negativa da fotografia ou sobre vidro fumê com contraste suficiente.

### Motion

- Motion serve à leitura e ao progresso, não à decoração.
- Entrada: opacidade e deslocamento curto usando os tokens de duração/easing.
- Hover: no máximo 2px de deslocamento e mudança contida de material.
- Preserve a narrativa sticky existente sem aplicar `transform` ou `overflow` a ancestrais sticky.
- Marquee deve pausar para quem usa mouse, oferecer alternativa por touch e manter todos os conteúdos acessíveis.
- Implemente integralmente `prefers-reduced-motion` conforme `MOTION-ACCESSIBILITY.md`.

## Restrições

- Não invente métricas, resultados, depoimentos, credenciais, cargos ou cases.
- Não altere nomes, números ou afirmações existentes.
- Não adicione efeitos de biblioteca apenas para demonstrar componentes.
- Não use glow excessivo, glassmorphism genérico, gradiente roxo/azul, blobs, ícones decorativos ou cards excessivamente arredondados.
- Não esconda conteúdo essencial em hover, accordion, carrossel ou animação.
- Não use animação contínua em múltiplas áreas da mesma viewport.
- Não comprometa SSR, TypeScript, responsividade, navegação por teclado ou build.

## Responsividade

- Mobile não é uma versão comprimida do desktop.
- Empilhe texto e mídia na ordem narrativa correta.
- Use `--medceo-page-x` para respiro lateral.
- Touch targets devem ter pelo menos `44px`.
- Não deixe texto sobre áreas ocupadas da fotografia.
- Conteúdo horizontal deve ter scroll/snap acessível quando não couber, sem impedir o scroll vertical.

## Critérios de aceite

1. A identidade parece uma única direção de arte, não uma soma de demos de componentes.
2. Todos os valores visuais recorrentes usam tokens `--medceo-*`.
3. Cada seção tem um protagonista e no máximo um Corte de Direção principal.
4. O fluxo original continua funcional em desktop e celular.
5. Formulário, modal, links e CTAs funcionam por mouse, teclado e touch.
6. Todo conteúdo essencial permanece visível com JavaScript limitado e com motion reduzido.
7. Não há overflow horizontal involuntário.
8. O build TypeScript/SSR termina sem erro.
9. O resultado passa pelo checklist de `docs/design-system/README.md`.
10. Nenhuma informação factual foi criada ou modificada pelo design.

Antes de finalizar, compare desktop, tablet, celular e `prefers-reduced-motion`. Corrija primeiro hierarquia, legibilidade e fluxo; efeitos vêm por último.

---

