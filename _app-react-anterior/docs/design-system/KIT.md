# MedCEO Kit — biblioteca de componentes

Componentes reutilizáveis em `src/components/kit/`, estilos em `src/kit.css`.
Importe sempre pelo barrel: `import { TextShimmer, Timeline } from "@/components/kit";`

## Inventário

| Componente | Papel |
| --- | --- |
| `MotionBlurText` | headline entrando palavra a palavra com blur→foco |
| `TextShimmer` | banda de luz percorrendo o texto (background-clip: text) |
| `TextEffect` | reveal composável por char / word / line com presets |
| `AnimatedText` | headline com máscara vertical e palavras em destaque |
| `PointerHighlight` | retângulo + cursor decorativo em torno de um trecho |
| `Magnetic` | atração do elemento em direção ao ponteiro |
| `ShineBorder` | borda em gradiente cônico animado (mask composite) |
| `BorderBeam` | ponto de luz percorrendo a borda (`offset-path`) |
| `HoverBorderGradient` | pill/botão com anel girando no hover |
| `MovingDotCard` | superfície com feixe orbitando a borda |
| `SpotlightMaskedGrid` / `RadialDarkBackground` / `BeamsBackground` / `NoiseOverlay` | fundos estáticos e de baixo custo |
| `FluidParticlesBackground` | canvas de partículas com atração pelo ponteiro |
| `FloatingPaths` | traçados SVG com `pathOffset` animado |
| `Timeline` | linha do tempo vertical com trilho e reveals sequenciais |
| `HowItWorks` | grade de passos numerados |
| `CardsStack` | pilha sticky com cartões que se sobrepõem no scroll |
| `ChapterScrubber` | trilho horizontal de capítulos (tablist acessível) |
| `ContainerScroll` | moldura 3D que "deita" conforme o scroll |
| `MarqueeCta` | marquee tipográfico + CTA |
| `TestimonialsSection` | grade de depoimentos |
| `Loader` | loader de três anéis com `role="status"` |
| `NotificationCenter` | lista com entrada/saída via `AnimatePresence` |
| `HistoryList` | ledger de histórico com pills de status |
| `MetricCard` | número grande com delta e legenda |
| `RadioCards` | radio group em formato de cartões |
| `FeatureGrid` | grade de features com divisórias hairline |
| `IntegrationsOrbit` | constelação de nós ao redor de um centro |
| `LogoCloud` | faixa de logos que acende no hover |

## Padrões de código aprendidos (e obrigatórios daqui pra frente)

1. **Motion só em `transform`, `opacity` e `filter`.** Nada de animar `top`, `height` ou `box-shadow` em área grande.
2. **`useReducedMotion()` em todo componente animado**, com estado final visível imediatamente. O CSS também zera durações e `animation` em `prefers-reduced-motion`.
3. **Bordas animadas via pseudo-elemento + `mask-composite: exclude`**, nunca via `background` no próprio card — o conteúdo mantém fundo legível.
4. **`@property --kit-shine-angle`** permite interpolar gradientes cônicos; é o truque por trás de shine border e hover border gradient.
5. **`offset-path` + `offset-distance`** é a forma barata de mover um ponto ao longo da borda (border beam) sem JS.
6. **Split de texto preserva semântica**: o texto completo fica em `aria-label` ou em `.kit-sr-only`; os fragmentos animados são `aria-hidden`.
7. **Stagger curto (0,04–0,08s) e durações 0,55–0,8s** com `cubic-bezier(0.23, 1, 0.32, 1)`. Consistência > variedade.
8. **Sticky/scroll usa `useScroll({ target, offset })`**, nunca listeners de scroll manuais.
9. **Canvas e efeitos de ponteiro são progressive enhancement**: nenhuma informação depende deles; sempre `aria-hidden`.
10. **Superfícies compartilham `.kit-surface`** (vidro fumê + hairline dourada) para manter material único no site inteiro.
11. **Alvos interativos ≥ 44px** e foco visível herdado dos tokens MedCEO.
12. **Tokens, nunca hex solto** nos componentes: as cores vivem em `src/kit.css` (`--kit-*`), derivadas de `--medceo-*`.
