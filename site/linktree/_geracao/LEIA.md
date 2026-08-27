# Geração das imagens do /linktree

Os dois scripts abaixo produzem tudo que está em `linktree/img/`. Precisam do
Pillow e resolvem os caminhos a partir de `~/Repos-8D/medceo/site`, então rodam
de qualquer diretório. Leem o acervo real de `site/assets/medceo/` e
`site/blog/capas/`, sem depender de nada fora deste repositório.

```bash
python3 ~/Repos-8D/medceo/site/linktree/_geracao/gerar_miniaturas.py
```

```bash
python3 ~/Repos-8D/medceo/site/linktree/_geracao/gerar_retrato.py
```

## Por que existem

Duas queixas do Gustavo em 2026-08-26 viraram regra de geração:

**"imagens duplicadas e com recorte errado, cortando cabeça"** — a versão
anterior repetia a mesma fotografia da equipe em três cards e cortava a testa
do Dr. Luciano em outros três. Cada card agora tem uma foto diferente, o foco
vertical de cada recorte está declarado no código, e a conferência é uma folha
de contato olhada antes de publicar, não uma inspeção do CSS.

**"o rosto do dr está ali no meio do nada bem aleatório"** — a causa era
geométrica. A `luciano-bg.jpg` tem a cabeça colada no topo do quadro, então
numa caixa de 700x1080 a figura cabia inteira em altura e o rosto ficava no
terço superior sem corpo abaixo. O `gerar_retrato.py` monta um quadro com 41%
de ambiente acima da cabeça e a figura colada na base, e posiciona o rosto em
28% da largura por `ROSTO_ALVO`, para ele não cair na faixa onde a coluna de
texto começa.

## Regra que se generaliza

**Figura de fundo precisa de chão e precisa de faixa própria.** Sem chão ela
paira; sem faixa própria ela briga com a leitura. As duas coisas se resolvem no
arquivo, não no CSS: máscara em cima de um enquadramento errado apaga a parte
que dava contexto e deixa o pedaço solto.
