"""Junta os cinco modulos da analise num bloco unico, pronto para o site.

Os modulos foram escritos como CommonJS para eu poder testar cada um com node.
No navegador nao existe require, entao aqui as linhas de require e de
module.exports saem, e as referencias qualificadas (M.pontuar, N.PILARES...)
viram os nomes locais. A ordem importa: motor antes de contas, niveis antes de
passos, porque cada um usa o anterior.
"""
import pathlib
import re

BASE = pathlib.Path(
    "/private/tmp/claude-501/-Users-gustavoschier-Desktop-Projeto-8D---Elias-Maman/"
    "25414e68-1547-4198-a9bf-512a8dbdf9a4/scratchpad/analise"
)
SAIDA = BASE / "bloco-analise.js"

# ordem de dependencia, e o prefixo que cada um usava nos outros
ORDEM = [
    "motor.js",
    "niveis.js",
    "leitura.js",
    "passos.js",
    "contas.js",
    "extras.js",   # usa mil, FAT e QUEDA de contas.js e motor.js
    "secoes.js",   # usa tudo acima, e o secao() de render.js
    "render.js",
]

# M.foo -> foo, e assim por diante. Os modulos nao tem nome repetido entre si.
PREFIXOS = {"M.": "", "N.": "", "L.": "", "P.": "", "C.": "", "R.": ""}

partes = []
for nome in ORDEM:
    t = (BASE / nome).read_text(encoding="utf-8")

    # fora os require e o module.exports
    t = re.sub(r"^var [A-Z] = require\([^)]+\);\n", "", t, flags=re.M)
    t = re.sub(r"^var [A-Z] = require\([^)]+\);\n", "", t, flags=re.M)
    t = re.sub(r"module\.exports = \{[^}]*\};\n?", "", t, flags=re.S)

    # M.pontuar -> pontuar. So prefixo de letra unica seguido de ponto e nome.
    for pref in PREFIXOS:
        t = re.sub(r"\b" + re.escape(pref) + r"(?=[A-Za-z_])", "", t)

    partes.append("/* ===== " + nome + " ===== */\n" + t.strip() + "\n")

bloco = "\n\n".join(partes)

# checagens que provam a consolidacao, em vez de supor
assert "require(" not in bloco, "sobrou require"
assert "module.exports" not in bloco, "sobrou module.exports"
assert "P.ORDEM" not in bloco and "M.FAT" not in bloco, "sobrou referencia qualificada"

SAIDA.write_text(bloco, encoding="utf-8")

print("bloco gerado:", SAIDA.name)
print("linhas:", bloco.count("\n"))
print("funcoes:", len(re.findall(r"^function ", bloco, flags=re.M)))
