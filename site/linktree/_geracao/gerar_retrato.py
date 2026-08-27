#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Refaz o retrato do fundo do linktree do MedCEO.

Defeito reportado pelo Gustavo em 26/08: "o rosto do dr esta ali no meio do
nada bem aleatorio". A causa e geometrica, nao de gosto, e sao duas:

1. A luciano-bg.jpg tem a cabeca colada no topo do quadro. Numa caixa de
   700x1080 a figura cabia inteira em altura, o rosto ficava no terco superior
   sem nada abaixo dele, e a mascara vertical ainda apagava o cabelo. Sobrava
   um rosto solto no ar. Correcao: o quadro ganha ambiente acima da cabeca e a
   figura fica colada na base, para nascer do rodape da tela.

2. O rosto caia em x=405 de uma caixa de 700, ou seja 58%, exatamente onde a
   mascara horizontal comeca a dissolver E onde a coluna de texto comeca
   (a folha abre em x=430 numa tela de 2000). Rosto e leitura disputavam a
   mesma faixa. Correcao: ROSTO_ALVO abaixo posiciona o rosto em 28% da
   largura, bem dentro da area solida da mascara e a esquerda do texto.

O ambiente e cor amostrada do proprio fundo da foto, NUNCA um pedaco dela
esticado: a primeira tentativa esticou a faixa do topo e o cabelo dele virou
uma segunda cabeca fantasma acima da real.
"""
from PIL import Image, ImageDraw, ImageFilter
import pathlib

raiz = pathlib.Path.home() / "Repos-8D/medceo/site"
saida = raiz / "linktree/img/identidade.webp"

L, A = 900, 1400            # quadro final
ROSTO_ALVO = 0.28           # onde o centro do rosto cai na largura do quadro
ESCALA = 0.78               # tamanho da figura em relacao a foto original

# medidos na luciano-bg.jpg (1920x1080)
FIG = (1030, 30, 1920, 1080)   # a figura, da mao ao ombro direito
ROSTO_X = 1480                 # centro do rosto na foto original

orig = Image.open(raiz / "assets/medceo/luciano-bg.jpg").convert("RGB")

fig = orig.crop(FIG)
fig = fig.resize((round(fig.width * ESCALA), round(fig.height * ESCALA)), Image.LANCZOS)
ox = round(L * ROSTO_ALVO - (ROSTO_X - FIG[0]) * ESCALA)
oy = A - fig.height

# ambiente: duas cores medias do fundo azul da foto, longe da cabeca
def media(caixa):
    return orig.crop(caixa).resize((1, 1), Image.LANCZOS).getpixel((0, 0))

topo, base = media((905, 40, 1120, 300)), media((905, 500, 1120, 900))
quadro = Image.new("RGB", (L, A))
d = ImageDraw.Draw(quadro)
for y in range(A):
    t = y / (A - 1)
    d.line([(0, y), (L, y)],
           fill=tuple(round(topo[i] + (base[i] - topo[i]) * t) for i in range(3)))

# a figura entra com alfa que some nos 200px de cima, para o cabelo se
# dissolver no ambiente em vez de terminar numa linha reta
alfa = Image.new("L", fig.size, 255)
da = ImageDraw.Draw(alfa)
for i in range(200):
    da.line([(0, i), (fig.width, i)], fill=int(255 * (i / 200) ** 1.6))
# e some tambem nos 140px da direita, senao a borda do recorte vira uma linha
# vertical visivel contra o ambiente
for i in range(140):
    x = fig.width - 1 - i
    for y in range(fig.height):
        a = alfa.getpixel((x, y))
        alfa.putpixel((x, y), min(a, int(255 * (i / 140) ** 1.4)))
quadro.paste(fig, (ox, oy), alfa.filter(ImageFilter.GaussianBlur(2)))

quadro.save(saida, "WEBP", quality=82, method=6)
print("identidade.webp %dx%d  %.1f KB  figura em (%d,%d) %dx%d  rosto em x=%d (%.0f%%)"
      % (L, A, saida.stat().st_size / 1024, ox, oy, fig.width, fig.height,
         L * ROSTO_ALVO, 100 * ROSTO_ALVO))
