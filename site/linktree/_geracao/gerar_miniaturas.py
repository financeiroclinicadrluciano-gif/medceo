#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera as imagens do linktree do MedCEO a partir do acervo real do site.

Cada card recebe uma foto DIFERENTE e que bate com o assunto. A queixa do
Gustavo em 2026-08-26 foi de foto repetida e recorte cortando cabeca, entao
o foco vertical de cada recorte esta declarado aqui e conferido no print.
"""
from PIL import Image
import pathlib, os

os.chdir(pathlib.Path.home() / "Repos-8D/medceo/site")
saida = pathlib.Path("linktree/img")
saida.mkdir(parents=True, exist_ok=True)


def recorta(src, dst, alvo_l, alvo_a, foco, q=80):
    im = Image.open(src).convert("RGB")
    L, A = im.size
    escala = max(alvo_l / L, alvo_a / A)
    nl, na = round(L * escala), round(A * escala)
    im = im.resize((nl, na), Image.LANCZOS)
    fx, fy = foco
    x, y = round((nl - alvo_l) * fx), round((na - alvo_a) * fy)
    im = im.crop((x, y, x + alvo_l, y + alvo_a))
    im.save(saida / dst, "WEBP", quality=q, method=6)
    n = (saida / dst).stat().st_size
    print("%-20s %6.1f KB" % (dst, n / 1024))
    return n


# 320px cobre 112px de render em tela 2x com folga
MINI = [
    ("assets/medceo/servicos/medceo.jpg",     "mentoria.webp",    (.50, .34)),
    ("assets/medceo/servicos/medmanager-zoom.png", "servicos.webp", (.50, .50)),
    ("assets/medceo/servicos/medscale.jpg",   "pilares.webp",     (.50, .30)),
    ("assets/medceo/servicos/medlab.jpg",     "diagnostico.webp", (.50, .40)),
    ("blog/capas/IMG_7115.jpg",               "blog.webp",        (.47, .30)),
    # miniatura quadrada do convite, para a fila de cards do PC
    ("assets/medceo/servicos/aulas-semanais.jpg", "comunidade-mini.webp", (.54, .16)),
]

tot = sum(recorta(s, d, 320, 320, f) for s, d, f in MINI)
# 4:5, o formato de post que o olho ja conhece, e altura para o texto respirar
tot += recorta("assets/medceo/servicos/aulas-semanais.jpg", "comunidade.webp", 860, 1075, (.53, .50))
tot += recorta("assets/medceo/hero-bg.jpg", "fundo.webp", 1600, 900, (.50, .50), q=72)
tot += recorta("assets/medceo/luciano-bg.jpg", "identidade.webp", 1000, 1300, (.74, .30))
print("TOTAL %.1f KB" % (tot / 1024))
