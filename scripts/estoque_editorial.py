"""Alarme de estoque editorial do MedCEO.

Existe por causa de 17/08/2026. O blog ficou quatro dias sem publicar nada e
ninguem percebeu, porque todos os sinais estavam verdes: o cron rodou todo dia,
o deploy passou, o teste de fumaca confirmou o site no ar. Nenhum deles mede a
unica coisa que faltava, que era ter texto agendado para o dia seguinte.

Publicar o que esta agendado e automatico. Escrever, nao. Quando o estoque
acaba, o sistema inteiro continua dizendo "tudo certo" enquanto o blog para.
Este script e o que quebra esse silencio.

Roda num job separado de proposito: se falhar, o deploy do dia continua
acontecendo e o que fica vermelho e so o aviso. Workflow agendado que falha
gera email, e e esse email o alarme.
"""

import datetime
import pathlib
import re
import sys

MINIMO_DIAS = 3  # menos que isso ja e hora de escrever

RAIZ = pathlib.Path(__file__).resolve().parent.parent
POSTS = RAIZ / "conteudo" / "blog"

datas = []
for arq in sorted(POSTS.glob("*.md")):
    m = re.search(r"^data: *([\d-]+)\s*$", arq.read_text(encoding="utf-8"), re.M)
    if m:
        datas.append((m[1], arq.stem))

if not datas:
    print("nao encontrei nenhuma data em conteudo/blog, formato mudou?")
    sys.exit(1)

hoje = datetime.date.today().isoformat()
futuros = sorted(d for d, _ in datas if d > hoje)
publicados = [d for d, _ in datas if d <= hoje]

print(f"hoje: {hoje}")
print(f"posts publicados: {len(publicados)}")
print(f"posts agendados para os proximos dias: {len(futuros)}")
if futuros:
    print(f"proximas datas: {', '.join(futuros)}")

if not futuros:
    print()
    print("ESTOQUE ZERADO. Nao existe nenhum post agendado para depois de hoje.")
    print("O blog para a partir de amanha, e todos os outros sinais continuarao")
    print("verdes, porque a automacao publica mas nao escreve.")
    sys.exit(1)

if len(futuros) < MINIMO_DIAS:
    print()
    print(f"ESTOQUE BAIXO: {len(futuros)} post(s) agendado(s), minimo {MINIMO_DIAS}.")
    print(f"O blog para em {futuros[-1]} se nada novo for escrito.")
    sys.exit(1)

print()
print(f"ok: estoque suficiente ate {futuros[-1]}")
