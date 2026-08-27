#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera o hero do /webnar com o Dr. Luciano na faixa que o texto nao ocupa.

Pedido do Gustavo em 2026-08-26: "deixe o dr luciano no centro nessa pagina,
ele tem que ser o destaque".

A causa do problema e a mesma do retrato do /linktree: geometria, nao gosto.
A webnar-hero.jpg tem 1080x880 e o Dr. Luciano no centro dela, em x=520 (48%).
Num hero de tela cheia o `cover` escala pela largura e nao corta na horizontal,
entao ele cai em 48% da tela, exatamente atras da coluna de texto, que vai de
x=80 a x=840 numa tela de 1920. Ele ficava coberto, e quem sobrava visivel eram
as duas pessoas da direita.

Aqui a foto e recomposta num quadro 1920x1080: ela e escalada pela altura e
ancorada a direita, o que leva o rosto dele para ROSTO_ALVO da largura, dentro
da faixa livre. A esquerda recebe a propria parede da foto, espelhada e
escurecida, que e onde o texto vai por cima.
"""
from PIL import Image, ImageDraw, ImageFilter
import pathlib

raiz = pathlib.Path.home() / "Repos-8D/medceo/site/assets/medceo"
saida = raiz / "webnar-hero-wide.jpg"

L, A = 1920, 1080
ROSTO_ALVO = 0.63          # onde o rosto do Dr. Luciano cai na largura do quadro
ROSTO_X = 520              # posicao dele na webnar-hero.jpg (1080x880)

orig = Image.open(raiz / "webnar-hero.jpg").convert("RGB")
grupo = orig.resize((round(orig.width * A / orig.height), A), Image.LANCZOS)
esc = A / orig.height
ox = round(L * ROSTO_ALVO - ROSTO_X * esc)

# A esquerda recebe a parede da propria foto: a FAIXA DO TOPO, que e o unico
# recorte sem ninguem, esticada na vertical. A primeira tentativa espelhou os
# 150px da borda esquerda, que contem uma pessoa, e o preenchimento virou um
# rosto borrado de meia tela. A segunda usou 118px de altura e ainda pegou o
# cabelo do Dr. Luciano, que comeca em y=85. Preenchimento de fundo nao pode
# conter nenhum pedaco de figura.
parede = orig.crop((0, 0, orig.width, 78))
parede = parede.resize((max(ox, 1) + 80, A), Image.LANCZOS).filter(ImageFilter.GaussianBlur(7))
quadro = Image.new("RGB", (L, A), (10, 13, 18))
quadro.paste(parede, (0, 0))

# o grupo entra com a borda esquerda dissolvida, para nao virar uma emenda reta
alfa = Image.new("L", grupo.size, 255)
da = ImageDraw.Draw(alfa)
for i in range(150):
    da.line([(i, 0), (i, grupo.height)], fill=int(255 * (i / 150) ** 1.5))
quadro.paste(grupo, (ox, 0), alfa.filter(ImageFilter.GaussianBlur(3)))

quadro.save(saida, "JPEG", quality=84, optimize=True, progressive=True)
print("webnar-hero-wide.jpg %dx%d  %.1f KB  grupo em x=%d  rosto em x=%d (%.0f%%)"
      % (L, A, saida.stat().st_size / 1024, ox, L * ROSTO_ALVO, 100 * ROSTO_ALVO))
