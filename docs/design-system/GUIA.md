# Guia prático — MedCEO Nocturne + MedCEO Kit

Referência de composição para novas dobras e páginas. Catálogo vivo: `/kit`.

## 1. Tokens

Nunca escreva hex solto num componente. Toda cor, sombra, duração e espaçamento
vem de variável.

| Papel | Token | Uso |
| --- | --- | --- |
| Fundo profundo | `--medceo-color-night` | base de página |
| Superfície | `--medceo-color-navy` / `navy2` | cards, painéis |
| Direção | `--medceo-color-gold` | acento, borda, índice, CTA |
| Direção suave | `--medceo-color-gold-soft` | destaque em título, hover |
| Texto | `--medceo-color-paper` / `paper-2` | corpo e secundário |

Camada kit: `--kit-accent`, `--kit-border`, `--kit-radius`, `--kit-ease`,
`--kit-duration` — todas derivam dos tokens acima.

## 2. Tipografia

- **Display** (serifada, `clamp(2.4rem … 4.6rem)`) — a tese da dobra. Uma por seção.
- **Heading** (serifada, `clamp(1.5rem … 2.25rem)`) — capítulo interno.
- **Body** (sans, `clamp(0.94rem … 1.125rem)`) — argumento, máximo 60ch.
- **Label** (sans, `0.6875rem`, tracking `0.28em`, uppercase) — eyebrow, índice, metadado.

Serifada nunca em parágrafo longo; sans nunca na tese.

## 3. Espaçamento

Escala de 4px, com ritmo crescente:

- `4 / 8 / 12` — dentro do componente;
- `16 / 24 / 32` — entre elementos de um bloco;
- `48 / 64 / 88` — entre blocos de uma dobra;
- `clamp(88px, 10vw, 168px)` (`--medceo-space-section`) — entre dobras.

Container padrão: `width: min(100% - 2 * clamp(20px, 5vw, 64px), 1240px)`.

## 4. Hierarquia da dobra

```tsx
<section className="mc-section">
  <p className="mc-eyebrow">Label</p>      {/* índice */}
  <h2>Tese em uma frase</h2>               {/* serifada */}
  <p>Argumento de apoio (máx. 60ch)</p>    {/* sans */}
  <Componente />                            {/* prova ou ação */}
  <span className="mc-section-index">01 / FILTRO</span>
</section>
```

Uma dobra = um argumento = um protagonista visual.

## 5. Composições prontas

**Hero fotográfico**
`media` + `wash` (gradiente de proteção) + `NoiseOverlay` + texto na área negativa +
corte de 8° na saída. No máximo uma camada animada extra (`BeamsBackground`).

**Bloco de prova**
`MetricCard` dentro de `MovingDotCard`, ou `HistoryList` para sequência.
Número sempre com unidade e legenda de origem.

**Bloco de decisão**
`RadioCards` ou `ChapterScrubber` + CTA em `Magnetic`. Um único CTA primário por dobra.

**Fechamento**
`MarqueeCta` decorativo (aria-hidden) seguido do bloco de conversão com
`SpotlightMaskedGrid` e corte de 8° invertido no topo.

## 6. Motion

Quatro durações (`fast 150 / base 240 / slow 400 / editorial 820`) e cinco curvas.
Não invente valores intermediários. Anime `transform`, `opacity` e `filter`.
Toda animação respeita `prefers-reduced-motion` — verifique em `/kit` com o
botão “Simular prefers-reduced-motion”.

## 7. Checklist antes de publicar

- [ ] Nenhuma cor fora de token.
- [ ] Uma borda animada e no máximo duas camadas de fundo animadas por dobra.
- [ ] Alvos interativos ≥ 44px com foco visível.
- [ ] Texto sobre foto legível em mobile (wash conferido em 390px).
- [ ] Sem overflow horizontal em 360–1920px.
- [ ] Estado reduzido preserva todo conteúdo e CTA.
