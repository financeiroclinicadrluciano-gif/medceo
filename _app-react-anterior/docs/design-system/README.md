# MedCEO Nocturne — Design System

Referência de implementação do sistema visual MedCEO para interfaces digitais. O objetivo é construir uma presença executiva, editorial e cinematográfica sem perder legibilidade, velocidade ou clareza de conversão.

## 1. Ideia central

**Executive darkroom**: o site se comporta como uma sala de decisão. O fundo escuro cria concentração; o papel técnico organiza diagnóstico e evidência; o metal dourado sinaliza direção; o vidro fumê contém interfaces e ações.

A linguagem deve parecer composta em camadas, como uma peça editorial finalizada no Photoshop, mas é implementada com CSS leve e componentes semânticos.

### Assinatura: Corte de Direção

O elemento proprietário do sistema é um corte diagonal de **8°**. Ele representa direção, avanço e escolha.

Use o corte para:

- conduzir o olhar entre título, prova e ação;
- recortar uma borda, placa, imagem ou transição de superfície;
- criar um único gesto memorável em uma dobra;
- reforçar progresso em indicadores ou linhas técnicas.

Não use o corte:

- em todos os cartões ao mesmo tempo;
- sobre rostos, números ou textos;
- como padrão de fundo dominante;
- junto de várias formas decorativas concorrentes.

Regra prática: **uma aplicação principal do Corte de Direção por dobra**.

## 2. Fontes de verdade

Os tokens usados pelo site vivem em:

- `src/brand/tokens/colors.css`
- `src/brand/tokens/effects.css`
- `src/brand/tokens/typography.css`
- `src/brand/tokens/spacing.css`

O arquivo `tokens.json` nesta pasta espelha os valores essenciais para ferramentas, handoff e reconstrução no Lovable. Em caso de divergência durante a manutenção do site, os arquivos CSS são a fonte executável.

## 3. Materiais do sistema

### Darkroom executivo

- Base: `--medceo-color-night` e `--medceo-color-obsidian`.
- Função: foco, autoridade, profundidade e continuidade entre dobras.
- Pode receber grade técnica, scanlines e vinheta em opacidade baixa.
- Nunca use preto puro como única camada; a profundidade vem da combinação de navy, luz recortada e sombra.

### Papel técnico

- Base: `--medceo-material-paper`.
- Função: diagnóstico, entregáveis, documentos, critérios e leitura longa.
- Texto sobre papel usa `--medceo-text-on-light`.
- Prefira bordas finas, marcas de registro e hierarquia editorial; evite cartões arredondados de aplicativo.

### Metal dourado

- Base: `--medceo-material-metal`.
- Função: ação principal, número decisivo, régua ou linha de direção.
- O dourado é um material de precisão, não uma cor de preenchimento dominante.
- Não aplique em parágrafos, grandes fundos ou múltiplos CTAs concorrentes.

### Vidro fumê

- Base: `--medceo-material-glass`, `--medceo-surface-glass` e `--medceo-blur-glass`.
- Função: conter navegação, formulários, CTAs e informações sobre fotografia.
- Deve manter borda e contraste suficientes mesmo quando `backdrop-filter` não estiver disponível.

## 4. Paleta operacional

| Papel | Token | Uso |
| --- | --- | --- |
| Fundo profundo | `--medceo-color-obsidian` | extremidades, vinheta e contraste máximo |
| Fundo principal | `--medceo-color-night` | base contínua da página |
| Superfície | `--medceo-color-navy` | blocos editoriais e enquadramentos |
| Elevação | `--medceo-color-navy-2` | cartões, vidro e estados elevados |
| Luz fria | `--medceo-color-navy-3` | foco e profundidade controlada |
| Decisão | `--medceo-color-gold` | CTA, índice e linha de direção |
| Metal claro | `--medceo-color-gold-soft` | highlight e hover |
| Papel | `--medceo-color-paper` | texto principal no escuro e dossiers |
| Papel secundário | `--medceo-color-paper-2` | texto secundário e bordas claras |
| Tinta | `--medceo-color-ink` | texto sobre papel |

As cores de feedback (`success`, `warning`, `error`, `info`) comunicam estado. Elas não substituem a cor de marca.

## 5. Tipografia

### Display editorial

- Família: `--medceo-font-serif` ou `--medceo-font-serif-alt`.
- Uso: tese, headline, número principal e frases de autoridade.
- Peso preferencial: regular.
- Tracking: `--medceo-ls-display` em títulos grandes.
- Escala: tokens `3xl`, `4xl`, `display`, `hero` e `jumbo`.

### Texto executivo

- Família: `--medceo-font-sans`.
- Uso: corpo, explicação, listas e navegação.
- Peso: regular a semibold.
- Linha longa deve permanecer confortável; limite o texto corrido a aproximadamente 60–72 caracteres por linha.

### Interface

- Família: `--medceo-font-ui`.
- Uso: botões, formulários, rótulos e mensagens de estado.

### Índices e métricas

- Família: `--medceo-font-mono`.
- Uso: etapas, índices, marcadores técnicos e números auxiliares.
- Não use mono em parágrafos ou headlines emocionais.

### Eyebrow

- Caixa alta.
- Tamanho `xs` ou `sm`.
- Tracking `--medceo-ls-wide` ou `--medceo-ls-wider`.
- Cor dourada ou papel secundário, conforme hierarquia.

## 6. Composição e espaçamento

- Container máximo: `--medceo-size-container` (`1280px`).
- Respiro lateral: `--medceo-page-x`.
- Respiro vertical entre dobras: `--medceo-section`.
- A composição é assimétrica, mas o alinhamento interno é rigoroso.
- Use uma grade principal e permita que apenas um elemento protagonista rompa a grade.
- Cantos são discretos: `2px` a `8px` na maioria das superfícies.
- Áreas interativas devem ter no mínimo `44px`.

## 7. Receitas de componentes

### CTA primário

- Fundo com material metálico.
- Texto em navy profundo.
- Forma firme, de baixo raio, com um único recorte diagonal.
- Hover: metal mais claro e deslocamento máximo de `2px`.
- Foco: anel dourado visível, independente do hover.

### CTA secundário

- Fundo transparente ou vidro fumê.
- Borda `--medceo-border-on-dark-strong`.
- Texto em papel.
- Nunca deve competir em brilho com o CTA primário.

### Dossier

- Superfície papel ou navy.
- Cabeçalho com índice mono e eyebrow.
- Título serifado; corpo em sans.
- Régua fina e uma marca de registro ou Corte de Direção.
- Sem sombra macia genérica de dashboard.

### Métrica

- Número protagonista em serif ou mono, de acordo com a narrativa.
- Unidade e contexto sempre visíveis.
- Não publicar número sem fonte aprovada no conteúdo do projeto.
- A cor dourada destaca uma conclusão, não todos os valores.

### Fotografia

- Uma pessoa ou evidência por composição principal.
- Tratamento com vinheta, luz recortada e contraste controlado.
- Preserve pele e identidade; texturas nunca devem atravessar o rosto.
- Texto deve ocupar a área vazia preparada na imagem ou usar placa de vidro fumê.

### Navegação

- Compacta, com fundo profundo ou vidro fumê.
- Estado ativo indicado por linha, índice ou mudança de peso.
- Evite cápsulas repetidas e ícones sem rótulo quando a ação não for óbvia.

## 8. Motion

Motion deve explicar hierarquia e progresso. As durações e easings oficiais estão em `effects.css`; regras completas estão em `MOTION-ACCESSIBILITY.md`.

Princípios:

- entrada editorial: opacidade + deslocamento curto;
- hover: resposta rápida e discreta;
- scroll narrativo: apenas quando a sequência depende do progresso;
- conteúdo essencial sempre disponível sem animação;
- `prefers-reduced-motion` é requisito, não melhoria opcional.

## 9. Regras anti-“cara de IA”

- Não empilhar efeitos de bibliotecas diferentes na mesma dobra.
- Não transformar todo conteúdo em cartões iguais.
- Não usar glow como substituto de hierarquia.
- Não usar gradiente colorido genérico, glassmorphism excessivo ou cantos muito arredondados.
- Não esconder prova, texto ou CTA atrás de hover ou carrossel.
- Não adicionar métricas, depoimentos, credenciais ou cases sem fonte aprovada.
- Não usar ícones decorativos onde tipografia e composição resolvem melhor.
- Repetição deve vir dos tokens; personalidade deve vir da composição.

## 10. Checklist de implementação

- [ ] Somente tokens MedCEO foram usados para cor, espaço, raio e motion.
- [ ] Cada dobra tem um protagonista visual claro.
- [ ] Há no máximo uma aplicação principal do corte de 8° por dobra.
- [ ] Dourado ocupa uma parcela pequena e intencional da composição.
- [ ] Texto sobre fotografia permanece legível em todos os breakpoints.
- [ ] Conteúdo essencial funciona sem hover, animação ou JavaScript.
- [ ] Touch targets têm pelo menos `44px`.
- [ ] Foco de teclado é visível.
- [ ] `prefers-reduced-motion` foi testado.
- [ ] Desktop, tablet e celular foram revisados visualmente.
- [ ] Nenhuma informação factual foi criada pelo design.

## 11. Uso no Lovable

1. Mantenha os quatro arquivos CSS de tokens como base global.
2. Use `tokens.json` apenas como espelho para gerar variáveis ou conferir valores.
3. Cole o conteúdo de `LOVABLE-PROMPT.md` no projeto conectado.
4. Solicite alterações por dobra, preservando conteúdo, rotas, formulários e comportamento existentes.
5. Revise o resultado com este README e com o checklist de motion/acessibilidade.

