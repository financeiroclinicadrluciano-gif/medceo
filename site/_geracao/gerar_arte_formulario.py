#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera a arte da coluna do formulario de qualificacao (qualifica.js).

A versao anterior usava a webnar-hero.jpg dentro de um retangulo de 340x500,
com fundo chapado abaixo dela: a foto terminava numa borda reta no meio da
coluna e o resto era cor solida. Aqui a arte ja nasce na proporcao da coluna,
para cobrir a altura inteira sem sobra.

Duas saidas, porque a coluna muda de forma:
  form-arte.webp        700x1500  a coluna vertical do PC
  form-arte-faixa.webp  1200x420  a faixa do topo no celular
"""
from PIL import Image
import pathlib

raiz = pathlib.Path.home() / "Repos-8D/medceo/site"
saida = raiz / "assets/medceo"


def recorta(src, dst, alvo_l, alvo_a, foco, q=82):
    im = Image.open(raiz / src).convert("RGB")
    L, A = im.size
    e = max(alvo_l / L, alvo_a / A)
    im = im.resize((round(L * e), round(A * e)), Image.LANCZOS)
    fx, fy = foco
    x = round((im.width - alvo_l) * fx)
    y = round((im.height - alvo_a) * fy)
    im.crop((x, y, x + alvo_l, y + alvo_a)).save(saida / dst, "WEBP", quality=q, method=6)
    n = (saida / dst).stat().st_size
    print("%-24s %dx%d  %.1f KB" % (dst, alvo_l, alvo_a, n / 1024))


# A equipe completa, que e o que "sala fechada so de medico" precisa mostrar.
# foco .50/.30 mantem os cinco rostos no terco superior do quadro vertical.
recorta("assets/medceo/servicos/medceo.jpg", "form-arte.webp", 700, 1500, (.50, .30))
recorta("assets/medceo/webnar-hero.jpg", "form-arte-faixa.webp", 1200, 420, (.50, .16))
