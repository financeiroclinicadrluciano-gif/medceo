# Motion e acessibilidade — MedCEO Nocturne

## Princípio

Motion é uma ferramenta de direção editorial. Cada animação deve cumprir pelo menos uma função:

1. indicar entrada ou mudança de estado;
2. explicar progressão ou sequência;
3. orientar o olhar até uma ação;
4. manter continuidade espacial entre dois estados.

Se a animação não cumpre uma dessas funções, remova-a.

## Tokens oficiais

| Papel | Duração | Uso |
| --- | --- | --- |
| Fast | `--medceo-duration-fast` — 150ms | hover, foco visual e resposta direta |
| Base | `--medceo-duration-base` — 240ms | botão, controle, expansão curta |
| Slow | `--medceo-duration-slow` — 400ms | troca de painel ou mídia |
| Editorial | `--medceo-duration-editorial` — 820ms | entrada de seção e revelação principal |

| Curva | Token | Uso |
| --- | --- | --- |
| Standard | `--medceo-ease-standard` | estados previsíveis de UI |
| Entrance | `--medceo-ease-entrance` | elemento entrando em cena |
| Exit | `--medceo-ease-exit` | elemento saindo |
| Premium | `--medceo-ease-premium` | entradas editoriais com desaceleração |
| Weighted | `--medceo-ease-weighted` | movimento protagonista, usado uma vez por sequência |

Não crie durações ou curvas próximas apenas para “variar”. A consistência dá peso ao sistema.

## Padrões permitidos

### Entrada editorial

- Propriedades: `opacity` e `transform`.
- Deslocamento recomendado: curto, entre 12px e 24px.
- Duração: `slow` ou `editorial`.
- Stagger: curto e limitado; não atrase a leitura de um bloco longo.
- O elemento deve ocupar seu espaço final desde o primeiro frame para evitar layout shift.

### Hover e press

- Hover: deslocamento máximo de `2px`, mudança de borda, brilho ou material.
- Press: retorno para a posição original ou redução mínima de escala.
- Não dependa de hover para revelar texto, preço, prova ou CTA.
- Em dispositivos sem hover, o conteúdo e a hierarquia devem permanecer completos.

### Corte de Direção

- A diagonal de 8° pode ser revelada por escala horizontal ou clip curto.
- Não anime a linha continuamente.
- Não atravesse texto ou fotografia durante a animação.
- Use apenas uma revelação principal do corte por dobra.

### Narrativa sticky

- Use sticky somente quando o scroll realmente controla uma sequência.
- Todo estado deve ser compreensível isoladamente.
- Não aplique `transform`, `filter`, `perspective`, `contain: paint` ou `overflow: hidden/auto` em ancestrais do elemento sticky sem testar o comportamento, pois isso pode alterar o containing block ou interromper o sticky.
- Em telas baixas ou mobile, prefira fluxo vertical simples se o sticky comprimir conteúdo.
- O scroll vertical do documento nunca pode ser capturado ou bloqueado.

### Marquee e carrossel

- Conteúdo essencial não pode existir apenas no slide ativo.
- Para mouse/trackpad, ofereça pausa no hover e no foco quando houver reprodução automática.
- Para touch, permita gesto horizontal sem bloquear o scroll vertical.
- Use scroll snap como fallback simples e previsível.
- Controles manuais precisam de rótulo acessível, estado de foco e alvo mínimo de 44px.
- Não inicie múltiplas animações contínuas na mesma viewport.

### Modal e formulário

- Ao abrir modal, mova o foco para o conteúdo ou primeiro controle significativo.
- Prenda o foco dentro do modal e devolva-o ao acionador ao fechar.
- Fechamento por `Escape` deve funcionar.
- Erros de formulário devem ser associados ao campo e anunciados; não dependa apenas de cor ou animação.
- Animações de erro não podem sacudir continuamente nem atrasar a mensagem textual.

## `prefers-reduced-motion`

O sistema CSS já redefine as quatro durações para `0ms` em:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --medceo-duration-fast: 0ms;
    --medceo-duration-base: 0ms;
    --medceo-duration-slow: 0ms;
    --medceo-duration-editorial: 0ms;
  }
}
```

Além dos tokens, cada componente deve:

- interromper autoplay, marquee e parallax;
- remover scroll suave e efeitos vinculados ao ponteiro;
- exibir imediatamente o estado final de entradas;
- trocar narrativa sticky animada por estados estáticos ou fluxo vertical quando necessário;
- preservar toda informação, ordem de leitura e ação;
- evitar transições residuais codificadas com valores literais.

Exemplo de fallback:

```css
@media (prefers-reduced-motion: reduce) {
  .motion-entry,
  .motion-marquee-track {
    animation: none !important;
    transition-duration: 0ms !important;
    transform: none !important;
  }

  .motion-marquee-track {
    overflow-x: auto;
    scroll-snap-type: x proximity;
  }
}
```

## Performance

- Anime preferencialmente `transform` e `opacity`.
- Não anime blur, box-shadow grande, background-position de textura pesada ou filtros sobre áreas extensas.
- Use `will-change` apenas pouco antes da animação e remova depois; não aplique globalmente.
- Imagens devem reservar espaço para evitar layout shift.
- `IntersectionObserver` é preferível a listeners de scroll para entradas simples.
- Para motion vinculado ao scroll, atualize no `requestAnimationFrame` e limite leituras/escritas de layout.
- Texturas como grid, scanline e vinheta são estáticas; não precisam mover para parecerem materiais.

## Acessibilidade visual e estrutural

- Teste contraste de texto, ícones, bordas de controle e foco nos estados reais, incluindo fotografia de fundo.
- O papel técnico usa texto `--medceo-text-on-light`; o darkroom usa `--medceo-text-on-dark`.
- Texto muted não deve ser usado em instrução necessária, erro, label ou CTA.
- Foco de teclado deve usar `--medceo-focus-ring-color`, largura e offset do sistema.
- Não remova outline sem substituição equivalente.
- A ordem visual deve acompanhar a ordem do DOM.
- Elementos decorativos e texturas devem usar `aria-hidden="true"` quando forem elementos reais.
- Imagens informativas precisam de `alt` objetivo; retratos não devem receber descrições especulativas.
- Números precisam de unidade e contexto textual, não apenas tamanho ou cor.

## Touch e responsividade

- Alvos interativos: mínimo `--medceo-size-touch-min` (`44px`).
- Espaçamento deve evitar toques acidentais entre controles.
- Não use parallax baseado em ponteiro como requisito de compreensão.
- Não esconda controles necessários até hover.
- Respeite zoom do navegador e texto ampliado.
- Teste alturas pequenas de viewport, não apenas larguras comuns.

## QA obrigatório

### Teclado

- [ ] É possível navegar em ordem lógica com `Tab` e `Shift+Tab`.
- [ ] Todo controle tem foco visível.
- [ ] Modal abre, contém foco, fecha por `Escape` e devolve foco.
- [ ] Carrossel ou marquee possui controles alcançáveis quando aplicável.

### Motion reduzido

- [ ] Entradas aparecem imediatamente.
- [ ] Autoplay, marquee, parallax e pointer tracking param.
- [ ] Sticky narrativo não impede acesso aos estados.
- [ ] Nenhum conteúdo ou CTA desaparece.

### Touch

- [ ] Alvos têm no mínimo 44px.
- [ ] Swipe horizontal não bloqueia scroll vertical.
- [ ] Nenhuma informação depende de hover.

### Visual

- [ ] Texto sobre foto permanece legível.
- [ ] Textura não atravessa rostos nem reduz leitura.
- [ ] A diagonal de 8° não cruza conteúdo importante.
- [ ] Estados de erro, sucesso e foco não dependem apenas de cor.

### Técnica

- [ ] Não há overflow horizontal involuntário.
- [ ] Não há layout shift perceptível na entrada de mídia.
- [ ] Build SSR/TypeScript termina sem erro.
- [ ] Console não apresenta erro durante navegação e envio do formulário.

