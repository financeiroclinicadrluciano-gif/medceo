#!/usr/bin/env python3
"""
Gera o blog estático do MedCEO no visual do site novo (.dc.html compilado).

Lê os markdown de `src/content/blog/` do repo do app e escreve:
  build/blog/index.html          — a listagem
  build/blog/<slug>/index.html   — cada post
  build/blog/capas/*             — as imagens
  build/sitemap.xml              — todas as rotas

Regra de publicação (mesma do app): só entra `marca: medceo` e só aparece post
com `data` <= hoje. Post agendado fica fora da listagem e do sitemap.
"""
import re, shutil, html, pathlib, datetime

# Caminhos relativos ao repositório: o mesmo script roda na máquina e no CI.
RAIZ = pathlib.Path(__file__).resolve().parent.parent
CONTEUDO = RAIZ / "conteudo"
BUILD = RAIZ / "site"
SITE = "https://medceo.online"
HOJE = datetime.date.today()

FONTES = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
          '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300;1,400'
          '&family=Poppins:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">')

CSS = """
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#05070A;color:#EAE2CF;font-family:'Poppins',system-ui,sans-serif;font-size:15px;font-weight:300;line-height:1.7;letter-spacing:.02em;-webkit-font-smoothing:antialiased}
a{color:#D9BE7E;text-decoration:none}
a:hover{color:#EFE0BB}
img{display:block;max-width:100%}
:focus-visible{outline:1px solid #C3A14E;outline-offset:4px}
::selection{background:rgba(195,161,78,.28);color:#F6F3EC}
.wrap{width:100%;max-width:1240px;margin-inline:auto;padding-inline:28px}
/* topo */
.top{position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(195,161,78,.14);background:rgba(5,7,10,.82);backdrop-filter:blur(20px) saturate(1.2)}
.top .wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 24px;padding-block:14px}
.top nav{display:flex;flex-wrap:wrap;gap:22px}
.top nav a{color:rgba(234,226,207,.58);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding-block:6px;border-bottom:1px solid transparent;transition:color .3s,border-color .3s}
.top nav a:hover,.top nav a[aria-current]{color:#EAE2CF;border-color:rgba(195,161,78,.5)}
.brand{display:inline-flex;align-items:center;gap:14px}
.brand img{height:26px;width:auto;object-fit:contain}
.brand small{color:rgba(217,190,126,.82);font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.28em;line-height:1.5;text-transform:uppercase}
/* cabecalho */
.head{padding:clamp(64px,9vh,104px) 0 clamp(30px,4vh,44px)}
.eyebrow{display:inline-flex;align-items:center;gap:14px;color:#C3A14E;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase}
.eyebrow::before{content:"";width:32px;height:1px;background:#C3A14E}
h1{margin:20px 0 0;max-width:20ch;font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.1rem,4.4vw,3.4rem);font-weight:300;letter-spacing:-.035em;line-height:1.05;text-wrap:balance}
.lede{max-width:62ch;margin-top:20px;color:rgba(234,226,207,.62);font-size:15.5px;line-height:1.72}
/* listagem */
.posts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:clamp(20px,2.6vw,30px);padding-bottom:clamp(72px,10vh,112px)}
.card{display:grid;grid-template-rows:auto 1fr;overflow:hidden;border:1px solid rgba(195,161,78,.16);border-radius:12px;background:#080B0F;transition:transform .45s cubic-bezier(.16,1,.3,1),border-color .45s ease,box-shadow .45s ease}
.card:hover{transform:translateY(-4px);border-color:rgba(195,161,78,.4);box-shadow:0 18px 40px rgba(1,3,5,.5)}
.card img{width:100%;height:196px;object-fit:cover;filter:saturate(.72) contrast(1.05)}
.card .body{display:grid;align-content:start;gap:12px;padding:26px 26px 30px}
.card .silo{color:rgba(195,161,78,.8);font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.22em;text-transform:uppercase}
.card h2{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:400;letter-spacing:-.02em;line-height:1.24;color:#EAE2CF}
.card p{margin:0;color:rgba(234,226,207,.6);font-size:13.5px;line-height:1.62}
.card time{color:rgba(234,226,207,.42);font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase}
/* artigo */
article{padding-bottom:clamp(72px,10vh,112px)}
.capa{margin:clamp(30px,4vh,46px) 0 0;border-radius:12px;overflow:hidden;border:1px solid rgba(195,161,78,.16)}
.capa img{width:100%;height:clamp(260px,42vh,460px);object-fit:cover;filter:saturate(.72) contrast(1.05)}
.capa figcaption{padding:14px 20px;background:#080B0F;color:rgba(234,226,207,.5);font-size:12.5px;line-height:1.6}
.prosa{max-width:68ch;margin-top:clamp(34px,5vh,52px)}
.prosa p{margin:0 0 22px;color:rgba(234,226,207,.78);font-size:16.5px;line-height:1.78}
.prosa h2{margin:44px 0 16px;max-width:26ch;font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.5rem,2.6vw,2rem);font-weight:400;letter-spacing:-.025em;line-height:1.16;color:#F6F3EC}
.prosa h3{margin:34px 0 12px;font-family:'Playfair Display',Georgia,serif;font-size:1.25rem;font-weight:400;color:#EAE2CF}
.prosa ul,.prosa ol{margin:0 0 22px;padding-left:22px;color:rgba(234,226,207,.76)}
.prosa li{margin-bottom:10px;line-height:1.7}
.prosa blockquote{margin:30px 0;padding:22px 26px;border-left:1px solid #C3A14E;background:rgba(195,161,78,.05);color:rgba(234,226,207,.9);font-family:'Playfair Display',serif;font-size:1.15rem;font-style:italic;line-height:1.5}
.prosa strong{color:#EAE2CF;font-weight:500}
.prosa table{width:100%;margin:0 0 26px;border-collapse:collapse;font-size:14px}
.prosa th,.prosa td{padding:12px 14px;border-bottom:1px solid rgba(234,226,207,.12);text-align:left}
.prosa th{color:#C3A14E;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
.meta{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:24px;color:rgba(234,226,207,.5);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
/* cta */
.cta{margin-top:clamp(48px,7vh,72px);padding:clamp(30px,4vw,46px);border:1px solid rgba(195,161,78,.22);border-radius:12px;background:radial-gradient(680px 320px at 18% 0%,rgba(195,161,78,.12),transparent 66%),#080B0F}
.cta h2{margin:0 0 12px;max-width:24ch;font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.4rem,2.4vw,1.9rem);font-weight:300;letter-spacing:-.03em;line-height:1.14}
.cta p{margin:0 0 22px;max-width:56ch;color:rgba(234,226,207,.62);font-size:14.5px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:56px;padding:14px 32px;border:1px solid rgba(217,190,126,.5);border-radius:999px;background:linear-gradient(180deg,rgba(217,190,126,.16),rgba(195,161,78,.06));color:#EFE0BB;font-family:'Poppins',sans-serif;font-size:14px;font-weight:500;transition:border-color .5s,background .5s,transform .5s cubic-bezier(.16,1,.3,1)}
.btn:hover{border-color:#D9BE7E;background:linear-gradient(180deg,rgba(217,190,126,.26),rgba(195,161,78,.1));transform:translateY(-2px);color:#EFE0BB}
/* rodape */
footer{border-top:1px solid rgba(195,161,78,.12);background:#080B0F;padding:36px 0 32px}
footer .wrap{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;color:rgba(234,226,207,.5);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.001ms!important}}
"""

MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]


def ler_frontmatter(txt):
    partes = txt.split("---", 2)
    if len(partes) < 3:
        return {}, txt
    fm, corpo = partes[1], partes[2]
    dados, chave = {}, None
    for linha in fm.split("\n"):
        if not linha.strip():
            continue
        m = re.match(r"^([a-z_]+):\s*(.*)$", linha)
        if m:
            chave = m.group(1)
            valor = m.group(2).strip()
            dados[chave] = valor if valor else []
        elif linha.startswith((" ", "-")) and chave:
            item = linha.strip().lstrip("- ").strip()
            if item:
                if not isinstance(dados.get(chave), list):
                    dados[chave] = []
                dados[chave].append(item)
    return dados, corpo


def md_para_html(md):
    """Markdown -> HTML. Cobre o que os posts usam: títulos, listas, tabelas,
    citações, negrito, itálico, links e código inline."""
    md = md.strip()
    blocos, saida = re.split(r"\n{2,}", md), []

    def inline(t):
        t = html.escape(t, quote=False)
        t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', t)
        t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
        t = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", t)
        t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
        return t

    for b in blocos:
        b = b.strip()
        if not b:
            continue
        if b.startswith("### "):
            saida.append(f"<h3>{inline(b[4:])}</h3>")
        elif b.startswith("## "):
            saida.append(f"<h2>{inline(b[3:])}</h2>")
        elif b.startswith("# "):
            saida.append(f"<h2>{inline(b[2:])}</h2>")
        elif b.startswith(">"):
            texto = " ".join(l.lstrip("> ").strip() for l in b.split("\n"))
            saida.append(f"<blockquote>{inline(texto)}</blockquote>")
        elif b.startswith("|") and "\n" in b:
            linhas = [l for l in b.split("\n") if l.strip().startswith("|")]
            if len(linhas) >= 2:
                cel = lambda l: [c.strip() for c in l.strip().strip("|").split("|")]
                cab = cel(linhas[0])
                corpo_linhas = [cel(l) for l in linhas[2:]]
                t = "<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in cab) + "</tr></thead><tbody>"
                for lin in corpo_linhas:
                    t += "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in lin) + "</tr>"
                saida.append(t + "</tbody></table>")
        elif re.match(r"^[-*] ", b):
            itens = "".join(f"<li>{inline(l[2:].strip())}</li>" for l in b.split("\n") if re.match(r"^[-*] ", l))
            saida.append(f"<ul>{itens}</ul>")
        elif re.match(r"^\d+\. ", b):
            itens = "".join(f"<li>{inline(re.sub(chr(94)+chr(92)+'d+. ','',l).strip())}</li>" for l in b.split("\n") if re.match(r"^\d+\. ", l))
            saida.append(f"<ol>{itens}</ol>")
        else:
            saida.append(f"<p>{inline(b)}</p>")
    return "\n".join(saida)


def data_br(iso):
    try:
        d = datetime.date.fromisoformat(iso)
        return f"{d.day} de {MESES[d.month - 1]} de {d.year}"
    except Exception:
        return iso


def topo(ativo=""):
    def cls(n):
        return ' aria-current="page"' if n == ativo else ""
    return f"""<header class="top"><div class="wrap">
<a class="brand" href="/"><img src="/assets/medceo/logo.png" alt="MedCEO"><span aria-hidden="true" style="width:1px;height:20px;background:rgba(195,161,78,.26)"></span><small>Gabinete do<br>diagnóstico</small></a>
<nav><a href="/#problema">Problema</a><a href="/#metodo">Método</a><a href="/#time">Time</a><a href="/blog"{cls('blog')}>Blog</a><a href="/webnar">Aulas</a><a href="/diagnostico">Diagnóstico</a></nav>
</div></header>"""


RODAPE = """<footer><div class="wrap"><a href="/">← Voltar ao site MedCEO</a><small>© 2026 MedCEO · CRM/PR 45049 · Curitiba, PR</small></div></footer>"""


def pagina(titulo, desc, corpo, canonical, ativo="", extra_head=""):
    return f"""<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(titulo)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{html.escape(titulo)}"><meta property="og:description" content="{html.escape(desc)}">
<meta property="og:type" content="article"><meta property="og:url" content="{canonical}">
{FONTES}{extra_head}
<style>{CSS}</style>
</head><body>
{topo(ativo)}
{corpo}
{RODAPE}
<script src="/tracking.js" defer></script>
</body></html>"""


# ---------------------------------------------------------------- carregar
posts = []
for arq in sorted((CONTEUDO / "blog").glob("*.md")):
    fm, corpo = ler_frontmatter(arq.read_text(encoding="utf-8"))
    if fm.get("marca") != "medceo":
        continue
    try:
        data = datetime.date.fromisoformat(str(fm.get("data", "")))
    except Exception:
        continue
    posts.append({"fm": fm, "corpo": corpo, "data": data, "slug": fm.get("slug", arq.stem),
                  "publicado": data <= HOJE})

posts.sort(key=lambda p: p["data"], reverse=True)
publicados = [p for p in posts if p["publicado"]]

# ---------------------------------------------------------------- escrever
blog = BUILD / "blog"
if blog.exists():
    shutil.rmtree(blog)
blog.mkdir(parents=True)
shutil.copytree(CONTEUDO / "capas", blog / "capas")

# posts
for p in publicados:
    fm = p["fm"]
    capa = fm.get("imagem_capa", "DSC00192-2.jpg")
    corpo_html = md_para_html(p["corpo"])
    art = f"""<main><div class="wrap head">
<p class="eyebrow">{html.escape(str(fm.get('silo','Blog MedCEO')))}</p>
<h1>{html.escape(str(fm.get('titulo','')))}</h1>
<p class="lede">{html.escape(str(fm.get('dek','')))}</p>
<p class="meta"><span>{html.escape(str(fm.get('autor','Dr. Luciano Alves Neves')))}</span><time datetime="{p['data']}">{data_br(str(p['data']))}</time></p>
</div>
<article class="wrap">
<figure class="capa"><img src="/blog/capas/{capa}" alt="{html.escape(str(fm.get('imagem_capa_legenda','')))[:120]}" loading="lazy">
<figcaption>{html.escape(str(fm.get('imagem_capa_legenda','')))}</figcaption></figure>
<div class="prosa">{corpo_html}</div>
<section class="cta">
<h2>Onde está o gargalo da sua clínica?</h2>
<p>Vinte perguntas, cinco minutos. No fim você recebe o nível de maturidade, o gargalo prioritário e três próximos passos.</p>
<a class="btn" href="/diagnostico">Fazer o diagnóstico <span aria-hidden="true">→</span></a>
</section>
</article></main>"""
    # json.dumps escapa aspas e apostrofo corretamente. A versao anterior usava
    # repr() + replace("'", '"'), que quebrava o JSON em qualquer titulo com
    # apostrofo (ex.: "d'agua") e derrubava o rich snippet em silencio.
    import json as _json
    ld_dados = {
        "@context": "https://schema.org", "@type": "Article",
        "headline": str(fm.get("titulo", "")),
        "datePublished": str(p["data"]),
        "author": {"@type": "Person", "name": "Dr. Luciano Alves Neves"},
        "publisher": {"@type": "Organization", "name": "MedCEO"},
        "mainEntityOfPage": f"{SITE}/blog/{p['slug']}",
    }
    ld = '<script type="application/ld+json">' + _json.dumps(ld_dados, ensure_ascii=False) + "</script>"
    destino = blog / p["slug"]
    destino.mkdir(parents=True, exist_ok=True)
    (destino / "index.html").write_text(
        pagina(f"{fm.get('titulo','')} | MedCEO", str(fm.get("meta_description", "")), art,
               f"{SITE}/blog/{p['slug']}", "blog", ld), encoding="utf-8")

# listagem
cards = ""
for p in publicados:
    fm = p["fm"]
    cards += f"""<a class="card" href="/blog/{p['slug']}">
<img src="/blog/capas/{fm.get('imagem_capa','DSC00192-2.jpg')}" alt="" loading="lazy">
<div class="body"><span class="silo">{html.escape(str(fm.get('silo','MedCEO')))}</span>
<h2>{html.escape(str(fm.get('titulo','')))}</h2>
<p>{html.escape(str(fm.get('dek',''))[:150])}</p>
<time datetime="{p['data']}">{data_br(str(p['data']))}</time></div></a>"""

lista = f"""<main><div class="wrap head">
<p class="eyebrow">Blog MedCEO</p>
<h1>Gestão de clínica, sem fórmula pronta</h1>
<p class="lede">Margem, comercial, operação e escala — escrito por quem toca uma clínica de verdade, não por quem só estuda o assunto.</p>
</div>
<div class="wrap"><div class="posts">{cards}</div></div></main>"""
(blog / "index.html").write_text(
    pagina("Blog | MedCEO", "Textos sobre gestão, margem, comercial e escala para médicos donos de clínica.",
           lista, f"{SITE}/blog", "blog"), encoding="utf-8")

# sitemap
urls = [f"{SITE}/", f"{SITE}/diagnostico", f"{SITE}/webnar", f"{SITE}/blog"]
urls += [f"{SITE}/blog/{p['slug']}" for p in publicados]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">\n'.replace(
    "www.sitemap.org", "www.sitemaps.org")
for u in urls:
    sm += f"  <url><loc>{u}</loc></url>\n"
sm += "</urlset>\n"
(BUILD / "sitemap.xml").write_text(sm, encoding="utf-8")

print(f"posts encontrados: {len(posts)} | publicados: {len(publicados)} | agendados: {len(posts)-len(publicados)}")
for p in publicados:
    print(f"  {p['data']}  {p['slug']}")
print(f"sitemap: {len(urls)} urls")
