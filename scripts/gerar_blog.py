#!/usr/bin/env python3
"""
Gera o blog estático do MedCEO no mesmo visual da home (`site/index.html`).

Lê os markdown de `conteudo/blog/` e escreve:
  site/blog/index.html          — a listagem
  site/blog/<slug>/index.html   — cada post
  site/blog/capas/*             — as imagens
  site/blog/feed.xml            — RSS dos posts publicados
  site/sitemap.xml              — todas as rotas

Regra de publicação (mesma do app): só entra `marca: medceo` e só aparece post
com `data` <= hoje. Post agendado fica fora da listagem, do feed e do sitemap —
e também fora de qualquer link interno, para não gerar 404.
"""
import re, json, shutil, html, pathlib, datetime, hashlib

# Caminhos relativos ao repositório: o mesmo script roda na máquina e no CI.
RAIZ = pathlib.Path(__file__).resolve().parent.parent
CONTEUDO = RAIZ / "conteudo"
BUILD = RAIZ / "site"
SITE = "https://medceo.online"
HOJE = datetime.date.today()

# As capas sao 1200x800 (3:2), recortadas do original com ancora no alto para
# nao decapitar retrato. Declarar width/height evita
# reflow de layout enquanto a imagem carrega.
CAPA_W, CAPA_H = 1200, 800

FONTES = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
          '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300;1,400'
          '&family=Poppins:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">')

# O CSS espelha os tokens da home: mesmo reset, mesmo corpo, mesmo topo e mesmo
# rodapé. Onde a home usa style inline, aqui vira classe — o valor é o mesmo.
CSS = """
*,*::before,*::after{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth;scroll-padding-top:76px;-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:#05070A;color:#EAE2CF;font-family:'Poppins',system-ui,sans-serif;font-size:15px;font-weight:300;line-height:1.7;letter-spacing:.02em;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:clip}
a{color:#D9BE7E;text-decoration:none}
a:hover{color:#EFE0BB}
img{display:block;max-width:100%}
:focus-visible{outline:1px solid #C3A14E;outline-offset:4px}
::selection{background:rgba(195,161,78,.28);color:#F6F3EC}
.wrap{width:100%;max-width:1240px;margin-inline:auto;padding-inline:28px}
.pular{position:fixed;z-index:1000;top:12px;left:12px;padding:12px 18px;background:#EAE2CF;color:#05070A;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;transform:translateY(-240%)}
.pular:focus{transform:none;color:#05070A}
.progresso{position:fixed;z-index:200;top:0;left:0;height:1px;width:0%;background:linear-gradient(90deg,#8C6F2E,#D9BE7E);box-shadow:0 0 12px rgba(195,161,78,.5)}
/* topo — mesmos valores da home */
.top{position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(195,161,78,.14);background:rgba(5,7,10,.72);backdrop-filter:blur(20px) saturate(1.2);-webkit-backdrop-filter:blur(20px) saturate(1.2)}
.top nav.principal{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 24px;width:100%;max-width:1240px;margin-inline:auto;padding:14px 28px}
.navwide{display:none;flex:1 1 auto;align-items:center;justify-content:center;gap:30px;white-space:nowrap}
/* Botao do menu, igual ao da home. Nasce escondido e so aparece abaixo de
   1120px; as tres barras viram X por transformacao. */
.hamburguer{display:none;place-content:center;gap:5px;flex:0 0 auto;width:42px;height:42px;
  padding:0;border:1px solid rgba(195,161,78,.3);border-radius:10px;background:transparent;
  cursor:pointer;-webkit-tap-highlight-color:transparent;transition:border-color .3s ease}
.hamburguer:hover,.hamburguer[aria-expanded="true"]{border-color:rgba(195,161,78,.55)}
.hamburguer span{display:block;width:17px;height:1.5px;border-radius:2px;background:#E8CE8E;
  transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .2s ease}
.hamburguer[aria-expanded="true"] span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
.hamburguer[aria-expanded="true"] span:nth-child(2){opacity:0}
.hamburguer[aria-expanded="true"] span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
@media (min-width:1120px){.navwide{display:flex}}
.navwide a{color:rgba(234,226,207,.58);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding-block:8px;border-bottom:1px solid transparent;transition:color .3s,border-color .3s}
.navwide a:hover,.navwide a[aria-current]{color:#EAE2CF;border-color:rgba(195,161,78,.5)}
@media (max-width:1119px){
  html{scroll-padding-top:118px}
  /* Mesma correcao da home: a tira de links com rolagem lateral saiu, porque
     seis itens lado a lado num celular nao e o padrao esperado e ainda deixa
     metade fora da tela sem avisar. */
  .top nav.principal{justify-content:flex-start;gap:8px 12px;padding-bottom:8px}
  .pilula{margin-left:auto}
  .hamburguer{display:inline-grid}
  .navwide{order:3;flex:1 0 100%;display:none;flex-direction:column;align-items:stretch;gap:0;
    margin-top:6px;padding:2px 0 6px;border-top:1px solid rgba(195,161,78,.16)}
  .top[data-aberto] .navwide{display:flex}
  .navwide a{min-height:48px;display:flex;align-items:center;font-size:10px;padding-block:0;
    border-bottom:1px solid rgba(234,226,207,.06);border-top:0}
  .navwide a:last-child{border-bottom:0}
}
/* A 375px a primeira linha do topo somava 320px de conteudo para 319 de espaco,
   e o botao caia sozinho para a linha de baixo. Um pixel. A pilula encolhe aqui
   pelos mesmos valores que a home ja usa nessa largura. */
@media (max-width:430px){
  .top nav.principal{padding-inline:20px}
  .brand img{height:23px}
  .pilula{min-height:38px;padding-inline:14px;font-size:8.5px}
}
.brand{display:inline-flex;flex:0 0 auto;align-items:center;gap:14px}
.brand img{height:26px;width:auto;object-fit:contain;object-position:left}
.brand small{color:rgba(217,190,126,.82);font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.28em;line-height:1.5;text-transform:uppercase}
.pilula{position:relative;display:inline-flex;flex:0 0 auto;align-items:center;gap:8px;min-height:44px;padding:0 20px;border:1px solid rgba(195,161,78,.34);border-radius:999px;color:#D9BE7E;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;white-space:nowrap;transition:background .4s,border-color .4s,color .4s}
.pilula:hover{border-color:rgba(217,190,126,.7);background:rgba(195,161,78,.08);color:#EFE0BB}
/* cabecalho */
/* padding-block, nao `padding`: a versao anterior usava o atalho `padding:X 0 Y`
   depois de `.wrap{padding-inline:28px}` e zerava a margem lateral. No desktop
   isso passava despercebido porque o .wrap fica centrado; em 360px o H1 e o
   texto de apoio encostavam em x=0. */
.head{padding-block:clamp(48px,7vh,92px) clamp(30px,4vh,44px)}
.migalhas{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;margin:0 0 18px;color:rgba(234,226,207,.42);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
.migalhas a{color:rgba(234,226,207,.6);display:inline-flex;align-items:center;min-height:44px}
.migalhas a:hover{color:#EFE0BB}
/* align-items:flex-start para que o filete acompanhe a PRIMEIRA linha quando o
   silo quebra em duas — em 360px ele ficava centrado entre as duas linhas. */
.eyebrow{display:inline-flex;align-items:flex-start;gap:14px;margin:0;max-width:34ch;color:#C3A14E;font-family:'JetBrains Mono',monospace;font-size:10px;line-height:1.8;letter-spacing:.3em;text-transform:uppercase}
.eyebrow::before{content:"";flex:0 0 auto;width:32px;height:1px;margin-top:.85em;background:#C3A14E}
h1{margin:20px 0 0;max-width:20ch;font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.1rem,4.4vw,3.4rem);font-weight:300;letter-spacing:-.035em;line-height:1.05;text-wrap:balance}
.lede{max-width:62ch;margin:20px 0 0;color:rgba(234,226,207,.72);font-size:16px;line-height:1.75}
/* listagem */
.posts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:clamp(20px,2.6vw,30px);padding-bottom:clamp(48px,6vh,72px)}
.card{display:grid;grid-template-rows:auto 1fr;overflow:hidden;border:1px solid rgba(195,161,78,.16);border-radius:12px;background:#080B0F;transition:transform .45s cubic-bezier(.16,1,.3,1),border-color .45s ease,box-shadow .45s ease}
.card:hover{transform:translateY(-4px);border-color:rgba(195,161,78,.4);box-shadow:0 18px 40px rgba(1,3,5,.5)}
.card img{width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;filter:saturate(.72) contrast(1.05)}
.card .body{display:grid;align-content:start;gap:12px;padding:26px 26px 30px}
.card .silo{color:rgba(195,161,78,.8);font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.22em;text-transform:uppercase}
.card h2{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:400;letter-spacing:-.02em;line-height:1.24;color:#EAE2CF}
.card p{margin:0;color:rgba(234,226,207,.68);font-size:14px;line-height:1.62}
.card time{color:rgba(234,226,207,.5);font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase}
/* artigo */
/* min-width:0 e o que impede a tabela de esticar a pagina inteira.
   O article e item de um grid (.wrap), e item de grid nasce com min-width:auto:
   ele se recusa a ficar menor que o conteudo minimo. Uma tabela de 512px dentro
   de um post fazia o article ir para 512px numa tela de 390, e com ele o texto
   TODO, que passava a sair pela direita cortado. O overflow-x:auto do .rolagem
   nao adiantava nada, porque quem estava esticando era o pai dele. Medido:
   scrollWidth 540 contra innerWidth 390, e 390 assim que min-width vai a 0. */
article{padding-bottom:clamp(48px,6vh,72px);min-width:0}
/* A capa usava 680px centrada enquanto a coluna de leitura usa 68ch: duas
   larguras diferentes, centradas de formas diferentes, e a imagem nunca
   comecava onde o texto comeca. Agora ela herda a largura da prosa e alinha
   pela esquerda, como o resto do artigo. */
.capa{max-width:68ch;margin:clamp(30px,4vh,46px) 0 0;border-radius:12px;overflow:hidden;border:1px solid rgba(195,161,78,.16)}
.capa img{display:block;width:100%;height:auto;filter:saturate(.86) contrast(1.03)}
.capa figcaption{padding:14px 20px;background:#080B0F;color:rgba(234,226,207,.62);font-size:13.5px;line-height:1.65}
/* No post de fundo claro o #080B0F virava uma tarja preta grudada embaixo de
   uma foto clara. Aqui ela vira continuacao da pagina, separada por filete. */
body.claro .capa figcaption{background:transparent;color:rgba(23,20,13,.62);
  padding:12px 2px 0;border-top:1px solid rgba(23,20,13,.1)}
body.claro .capa{border-color:rgba(23,20,13,.12);border-radius:12px 12px 0 0}
.prosa{max-width:68ch;margin-top:clamp(34px,5vh,52px);overflow-wrap:anywhere}
.prosa p{margin:0 0 22px;color:rgba(234,226,207,.78);font-size:16.5px;line-height:1.78}
.prosa h2{margin:44px 0 16px;max-width:26ch;font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.5rem,2.6vw,2rem);font-weight:400;letter-spacing:-.025em;line-height:1.16;color:#F6F3EC}
.prosa h3{margin:34px 0 12px;max-width:34ch;font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.15rem,1.9vw,1.35rem);font-weight:400;letter-spacing:-.015em;line-height:1.3;color:#EAE2CF}
.prosa ul,.prosa ol{margin:0 0 22px;padding-left:22px;color:rgba(234,226,207,.78)}
.prosa li{margin-bottom:10px;font-size:16.5px;line-height:1.78}
.prosa li::marker{color:rgba(195,161,78,.8)}
.prosa blockquote{margin:30px 0;padding:22px 26px;border-left:2px solid #C3A14E;background:rgba(195,161,78,.05);color:rgba(234,226,207,.92);font-family:'Playfair Display',serif;font-size:1.22rem;font-style:italic;line-height:1.5}
.prosa blockquote p{margin:0;color:inherit;font:inherit}
.prosa strong{color:#EAE2CF;font-weight:500}
.prosa a{border-bottom:1px solid rgba(217,190,126,.35);transition:border-color .3s,color .3s}
.prosa a:hover{border-color:#D9BE7E}
.prosa code{padding:2px 6px;border:1px solid rgba(195,161,78,.2);border-radius:4px;background:rgba(195,161,78,.07);color:#E6D8AE;font-family:'JetBrains Mono',monospace;font-size:.86em;overflow-wrap:anywhere}
/* tabela: rola dentro da propria caixa. Sem isso, a tabela de 583px empurrava
   a pagina inteira para 611px em tela de 360px e o Chrome mobile reduzia o
   corpo do texto de 16,5px para 9,7px por shrink-to-fit. */
.rolagem{overflow-x:auto;min-width:0;max-width:100%;margin:0 0 26px;-webkit-overflow-scrolling:touch;border-bottom:1px solid rgba(234,226,207,.08)}
.rolagem:focus-visible{outline:1px solid #C3A14E;outline-offset:2px}
.prosa table{width:100%;min-width:32rem;margin:0;border-collapse:collapse;font-size:14px}
.prosa th,.prosa td{padding:12px 14px;border-bottom:1px solid rgba(234,226,207,.12);text-align:left;overflow-wrap:normal}
.prosa th{color:#C3A14E;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap}
.meta{display:flex;flex-wrap:wrap;gap:10px 22px;margin:24px 0 0;color:rgba(234,226,207,.55);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
/* fontes e leitura relacionada */
.bloco{max-width:68ch;margin-top:clamp(40px,5vh,56px);padding-top:26px;border-top:1px solid rgba(195,161,78,.16)}
.bloco h2{margin:0 0 16px;color:rgba(195,161,78,.85);font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:400;letter-spacing:.26em;text-transform:uppercase}
.bloco ul{margin:0;padding:0;list-style:none;display:grid;gap:2px}
.bloco li{margin:0;color:rgba(234,226,207,.62);font-size:14px;line-height:1.7}
.bloco.relacionados a{display:block;padding:12px 0;min-height:44px;border-bottom:1px solid rgba(234,226,207,.07);font-size:15px;line-height:1.5}
/* cta */
.cta{margin-top:clamp(48px,7vh,72px);padding:clamp(30px,4vw,46px);border:1px solid rgba(195,161,78,.22);border-radius:12px;background:radial-gradient(680px 320px at 18% 0%,rgba(195,161,78,.12),transparent 66%),#080B0F}
.cta h2{margin:0 0 12px;max-width:24ch;font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.4rem,2.4vw,1.9rem);font-weight:300;letter-spacing:-.03em;line-height:1.14;color:#F6F3EC}
.cta p{margin:0 0 22px;max-width:56ch;color:rgba(234,226,207,.68);font-size:14.5px}
.cta{display:flex;flex-direction:column;align-items:flex-start}
@media(min-width:620px){.cta{display:block}.cta .btn+.btn{margin-left:12px}}
.btn--ghost{border-color:rgba(234,226,207,.28);background:transparent;color:rgba(234,226,207,.86)}
.btn--ghost:hover{border-color:#D9BE7E;background:rgba(195,161,78,.08);color:#F6F3EC}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:56px;padding:14px 32px;border:1px solid rgba(217,190,126,.5);border-radius:999px;background:linear-gradient(180deg,rgba(217,190,126,.16),rgba(195,161,78,.06));color:#EFE0BB;font-family:'Poppins',sans-serif;font-size:14px;font-weight:500;transition:border-color .5s,background .5s,transform .5s cubic-bezier(.16,1,.3,1)}
.btn:hover{border-color:#D9BE7E;background:linear-gradient(180deg,rgba(217,190,126,.26),rgba(195,161,78,.1));transform:translateY(-2px);color:#EFE0BB}
/* ---- post em duas colunas: texto a esquerda, contexto a direita --------
   A coluna da direita responde as tres perguntas que o leitor faz depois do
   texto: quem escreveu, o que mais tem para ler e como falar com a gente. */
/* O padding-bottom nao e decoracao: sem ele o ultimo botao do post encosta
   no rodape, e a pagina salta de creme para preto no pixel seguinte. Ele
   tambem absorve a diferenca de altura entre as duas colunas, que a 1440px
   media 48px e formava um degrau exatamente sobre essa linha. */
.post{display:grid;gap:clamp(30px,4vh,48px);padding-bottom:clamp(56px,8vh,104px)}
@media(min-width:1040px){
  .post{grid-template-columns:minmax(0,1fr) 336px;gap:clamp(38px,4vw,64px);align-items:start}
  .lateral{position:sticky;top:96px}
}
.lateral{display:grid;gap:18px;min-width:0}
.lat{padding:24px 22px;border:1px solid rgba(195,161,78,.2);border-radius:14px;background:rgba(10,13,18,.72)}
.lat__titulo{margin:0 0 18px;color:rgba(234,226,207,.6);font-family:'JetBrains Mono',monospace;
  font-size:8.5px;font-weight:400;letter-spacing:.28em;text-transform:uppercase;text-align:center}
/* Sobre o autor */
.lat--autor{text-align:center}
.lat--autor .foto{overflow:hidden;width:118px;height:118px;margin:0 auto 16px;border-radius:50%;
  border:1px solid rgba(195,161,78,.4);background:#04060a}
.lat--autor .foto img{width:100%;height:100%;object-fit:cover;object-position:center 20%}
.lat--autor .nome{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:21px;
  font-style:italic;font-weight:500;color:#F6F3EC}
.lat--autor .papel{margin:8px 0 0;color:#D9BE7E;font-family:'JetBrains Mono',monospace;
  font-size:9px;letter-spacing:.2em;text-transform:uppercase}
.lat--autor .bio{margin:16px 0 0;color:rgba(234,226,207,.68);font-size:13.5px;line-height:1.66}
.lat--autor .bio b{color:#EFE0BB;font-weight:500}
.lat__botao{display:flex;align-items:center;justify-content:center;gap:10px;min-height:48px;
  margin-top:20px;padding:0 18px;border:1px solid rgba(195,161,78,.4);border-radius:6px;
  color:#EFE0BB;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;
  text-transform:uppercase;transition:background .35s ease,border-color .35s ease}
.lat__botao:hover{border-color:#D9BE7E;background:rgba(195,161,78,.1);color:#F6F3EC}
.lat__botao svg{flex:0 0 auto}
/* Posts recentes */
.lat__post{display:grid;grid-template-columns:76px minmax(0,1fr);gap:14px;align-items:center;
  padding:12px 0;border-bottom:1px solid rgba(234,226,207,.08)}
.lat__post:last-child{border-bottom:0;padding-bottom:0}
.lat__post:first-of-type{padding-top:0}
.lat__post .mini{overflow:hidden;aspect-ratio:3/2;border-radius:6px;background:rgba(234,226,207,.05)}
.lat__post .mini img{width:100%;height:100%;object-fit:cover}
.lat__post h3{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:14.5px;
  font-style:italic;font-weight:500;line-height:1.35;color:#EFE8D8}
.lat__post:hover h3{color:#F6F3EC}
.lat__post time{display:block;margin-top:6px;color:rgba(217,190,126,.8);
  font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em}
/* Categorias */
.lat__cat{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:52px;
  margin-bottom:8px;padding:12px 16px;border:1px solid rgba(234,226,207,.09);border-radius:8px;
  color:rgba(234,226,207,.86);font-size:14px;transition:border-color .3s ease,background .3s ease}
.lat__cat:last-child{margin-bottom:0}
.lat__cat:hover{border-color:rgba(195,161,78,.4);background:rgba(195,161,78,.06)}
.lat__cat b{flex:0 0 auto;min-width:30px;padding:4px 0;border-radius:5px;
  background:rgba(234,226,207,.09);color:rgba(234,226,207,.7);
  font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:400;text-align:center}
/* CTA da lateral */
.lat--cta{text-align:center;
  background:radial-gradient(420px 220px at 50% 0%,rgba(195,161,78,.14),transparent 70%),rgba(10,13,18,.8)}
.lat--cta h2{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-style:italic;
  font-weight:400;line-height:1.24;color:#F6F3EC}
.lat--cta h2 em{color:#D9BE7E;font-style:italic}
.lat--cta p{margin:14px 0 0;color:rgba(234,226,207,.66);font-size:13.5px;line-height:1.62}

/* rodape — mesma estrutura da home */
footer{position:relative;overflow:hidden;border-top:1px solid rgba(195,161,78,.14);background:#080B0F;padding:72px 0 28px}
footer .grao{position:absolute;inset:0;opacity:.4;background-image:radial-gradient(rgba(195,161,78,.16) 1px,transparent 1px);background-size:30px 30px;-webkit-mask-image:radial-gradient(70% 60% at 20% 0%,#000,transparent);mask-image:radial-gradient(70% 60% at 20% 0%,#000,transparent);pointer-events:none}
footer .colunas{position:relative;display:grid;gap:36px}
@media (min-width:900px){footer .colunas{grid-template-columns:1.4fr .8fr .8fr 1fr}}
footer .rotulo{display:block;color:rgba(195,161,78,.8);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.24em;text-transform:uppercase}
footer .sobre p{margin:16px 0 0;max-width:38ch;color:rgba(234,226,207,.68);font-size:13.5px;line-height:1.72;letter-spacing:.015em}
footer .sobre .gab{margin:0;color:rgba(195,161,78,.8);font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.28em;text-transform:uppercase}
footer .sobre img{height:24px;width:auto;margin-bottom:18px;object-fit:contain;object-position:left}
footer nav,footer .contato{display:grid;gap:6px;align-content:start;min-width:0}
footer nav a,footer .contato a{display:flex;align-items:center;min-height:44px;color:rgba(234,226,207,.62);font-size:13.5px;transition:color .3s}
footer nav a:hover,footer .contato a:hover{color:#EFE0BB}
footer .legal{position:relative;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;margin-top:52px;padding-top:22px;border-top:1px solid rgba(234,226,207,.07);color:rgba(234,226,207,.58);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.001ms!important}html{scroll-behavior:auto}}

/* ===================== leitura em tema claro =====================
   Pedido do Gustavo: a pagina do post fica clara para facilitar a leitura; a
   listagem e o resto do site continuam escuros. As cores sao as mesmas que a
   home ja usa nas secoes sec--ivory, entao a identidade nao muda: papel
   #EFEBE2, tinta #17140D e o dourado escurecido para ter contraste no claro. */
body.claro{background:#EFEBE2;background-image:none;color:#17140D}
body.claro .prosa{color:#2A2419}
body.claro h1,body.claro .prosa h2,body.claro .prosa h3,body.claro .bloco h2{color:#17140D}
body.claro .lede,body.claro .prosa p{color:rgba(23,20,13,.78)}
body.claro .meta,body.claro .migalhas{color:rgba(23,20,13,.55)}
body.claro .migalhas a{color:rgba(23,20,13,.7)}
body.claro .eyebrow{color:#8C6F2E}
body.claro .eyebrow::before{background:#8C6F2E}
body.claro .capa{border-color:rgba(23,20,13,.14)}
body.claro .capa img{filter:none}
body.claro figcaption{color:rgba(23,20,13,.6)}
body.claro .prosa a{color:#7A5F22;text-decoration-color:rgba(122,95,34,.45)}
body.claro .prosa a:hover{color:#5E4816}
body.claro .prosa strong,body.claro .prosa b{color:#17140D}
/* A lista ficava com a cor do tema ESCURO no tema claro: .prosa ul/ol define
   rgba(234,226,207,.78), um bege claro, e nenhuma regra de body.claro
   sobrescrevia. Medido no post publicado: contraste 1,08 contra o fundo
   #EFEBE2, ou seja texto invisivel. Aparecia so o trecho em <strong>, que tem
   cor propria, e o resto da frase sumia. */
body.claro .prosa ul,body.claro .prosa ol{color:rgba(23,20,13,.78)}
body.claro .prosa li::marker{color:#8C6F2E}
body.claro .prosa blockquote{border-left-color:#C3A14E;color:#2A2419}
body.claro .prosa table th,body.claro .prosa table td{border-color:rgba(23,20,13,.14)}
body.claro .prosa table thead th{background:rgba(23,20,13,.05);color:#6B5320}
body.claro .prosa table tbody tr:nth-child(even){background:rgba(23,20,13,.028)}
body.claro .prosa code{background:rgba(23,20,13,.06);color:#3A3122}
body.claro .bloco{border-top-color:rgba(23,20,13,.14)}
body.claro .bloco.relacionados a{color:#3A3122;border-bottom-color:rgba(23,20,13,.1)}
body.claro .bloco.relacionados a:hover{color:#17140D}
body.claro .bloco ul li{color:rgba(23,20,13,.7)}
/* A barra lateral e o CTA continuam escuros de proposito: dao contraste e
   marcam o que e leitura e o que e chamada. */
body.claro .lat{background:#12161D;border-color:rgba(195,161,78,.28)}
body.claro .cta{background:#12161D;border-color:rgba(195,161,78,.28)}
body.claro .cta h2{color:#F6F3EC}
body.claro .cta p{color:rgba(234,226,207,.72)}
"""

MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
         "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
MESES_RFC = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

avisos = []


WA_CONTATO = ("https://wa.me/5541984875688?text=Ol%C3%A1%2C+vim+pelo+blog+do+MedCEO"
              "+e+quero+falar+com+o+time.")


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


def limpar_aspas(v):
    """O frontmatter é escrito à mão e mistura valor com e sem aspas."""
    s = str(v).strip()
    if len(s) >= 2 and s[0] == s[-1] and s[0] in "\"'":
        s = s[1:-1]
    return s.replace('\\"', '"')


def md_para_html(md, slugs_vivos=None, origem=""):
    """Markdown -> HTML. Cobre o que os posts usam: títulos, listas, tabelas,
    citações, negrito, itálico, links e código inline.

    `slugs_vivos` são os posts já publicados. Link do corpo para um post ainda
    agendado vira texto simples: o texto foi escrito contando com o link, mas
    entregar um 404 ao leitor é pior do que entregar a frase sem link.
    """
    md = md.strip()
    blocos, saida = re.split(r"\n{2,}", md), []
    vivos = slugs_vivos if slugs_vivos is not None else set()

    def link(m):
        texto, destino = m.group(1), m.group(2)
        if destino.startswith("/blog/"):
            slug = destino.strip("/").split("/")[-1]
            if slug not in vivos:
                avisos.append(f"{origem}: link para post ainda agendado virou texto — /blog/{slug}")
                return texto
        return f'<a href="{destino}">{texto}</a>'

    def inline(t):
        t = html.escape(t, quote=False)
        t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, t)
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
            # O H1 da página é o título do post; título de nível 1 no corpo
            # viraria um segundo H1 e quebraria a ordem dos headings.
            saida.append(f"<h2>{inline(b[2:])}</h2>")
        elif b.startswith(">"):
            texto = " ".join(l.lstrip("> ").strip() for l in b.split("\n"))
            saida.append(f"<blockquote><p>{inline(texto)}</p></blockquote>")
        elif b.startswith("|") and "\n" in b:
            linhas = [l for l in b.split("\n") if l.strip().startswith("|")]
            if len(linhas) >= 2:
                cel = lambda l: [c.strip() for c in l.strip().strip("|").split("|")]
                cab = cel(linhas[0])
                corpo_linhas = [cel(l) for l in linhas[2:]]
                t = "<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in cab) + "</tr></thead><tbody>"
                for lin in corpo_linhas:
                    t += "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in lin) + "</tr>"
                t += "</tbody></table>"
                # A caixa de rolagem contém a tabela larga em vez de deixá-la
                # empurrar a página. tabindex torna o scroll alcançável pelo
                # teclado, exigência do WCAG 2.1.11 para conteúdo rolável.
                saida.append('<div class="rolagem" role="region" aria-label="Tabela, role para o lado" '
                             f'tabindex="0">{t}</div>')
        elif re.match(r"^[-*] ", b):
            itens = "".join(f"<li>{inline(l[2:].strip())}</li>" for l in b.split("\n") if re.match(r"^[-*] ", l))
            saida.append(f"<ul>{itens}</ul>")
        elif re.match(r"^\d+\. ", b):
            linhas_numeradas = (l for l in b.split("\n") if re.match(r"^\d+\. ", l))
            itens = "".join("<li>" + inline(re.sub(r"^\d+\. ", "", l).strip()) + "</li>"
                            for l in linhas_numeradas)
            saida.append(f"<ol>{itens}</ol>")
        else:
            saida.append(f"<p>{inline(b)}</p>")
    return "\n".join(saida)


def montar_lateral(atual, publicados, por_slug):
    """Coluna da direita do post: autor, leitura recente, categorias e contato.

    Os recentes e as categorias vem da lista de publicados, entao a lateral nao
    envelhece sozinha — post novo entra aqui no mesmo build.
    """
    recentes = ""
    vizinhos = [q for q in publicados if q["slug"] != atual["slug"]][:3]
    for q in vizinhos:
        fmq = q["fm"]
        capa_q = limpar_aspas(fmq.get("imagem_capa", "DSC00192-2.jpg"))
        recentes += (
            f'<a class="lat__post" href="/blog/{q["slug"]}">'
            f'<span class="mini"><img src="/blog/capas/{capa_q}" alt="" width="{CAPA_W}" '
            f'height="{CAPA_H}" loading="lazy" decoding="async"></span>'
            f'<span><h3>{html.escape(limpar_aspas(fmq.get("titulo", "")))}</h3>'
            f'<time datetime="{q["data"]}">{data_br(str(q["data"]))}</time></span></a>')

    contagem = {}
    for q in publicados:
        nome = limpar_aspas(q["fm"].get("silo", "Blog MedCEO"))
        contagem[nome] = contagem.get(nome, 0) + 1
    categorias = "".join(
        f'<a class="lat__cat" href="/blog">{html.escape(nome)}<b>{n}</b></a>'
        for nome, n in sorted(contagem.items(), key=lambda x: (-x[1], x[0])))

    return f"""<aside class="lateral" data-section="barra-lateral">
<section class="lat lat--autor">
<p class="lat__titulo">Sobre o autor</p>
<div class="foto"><img src="/assets/medceo/pilar-luciano.jpg" alt="Dr. Luciano Alves Neves" width="1200" height="1600" loading="lazy" decoding="async"></div>
<p class="nome">Dr. Luciano Alves Neves</p>
<p class="papel">Médico · CEO · Fundador da Natuá</p>
<p class="bio">Mais de <b>17 anos</b> à frente da própria clínica, em Curitiba. Cada processo do MedCEO foi testado primeiro na operação dele, com paciente marcado e equipe contratada.</p>
<a class="lat__botao" href="https://www.instagram.com/medico_ceo/" target="_blank" rel="noopener">
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle></svg>
Seguir @medico_ceo</a>
</section>
<section class="lat">
<p class="lat__titulo">Posts recentes</p>
{recentes}
</section>
<section class="lat">
<p class="lat__titulo">Categorias</p>
{categorias}
</section>
<section class="lat lat--cta">
<h2>Diagnóstico <em>gratuito</em><br>da sua clínica</h2>
<p>Vinte perguntas, cinco minutos. Você sai com o gargalo nomeado e o próximo passo definido.</p>
<a class="lat__botao" href="/diagnostico">Fazer o diagnóstico</a>
<a class="lat__botao" href="{WA_CONTATO}" target="_blank" rel="noopener">Falar com o time</a>
</section>
</aside>"""


def resumir(txt, limite=150):
    """Corta no espaço anterior ao limite. O corte cru em 150 caracteres
    deixava o card terminando em `faixa de referência p`."""
    t = txt.strip()
    if len(t) <= limite:
        return t
    corte = t[:limite].rsplit(" ", 1)[0].rstrip(" ,;:.—-")
    return corte + "…"


def data_br(iso):
    try:
        d = datetime.date.fromisoformat(iso)
        return f"{d.day} de {MESES[d.month - 1]} de {d.year}"
    except Exception:
        return iso


def data_rfc(d):
    return f"{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d.weekday()]}, {d.day:02d} {MESES_RFC[d.month-1]} {d.year} 09:00:00 -0300"


LINKS_NAV = [("/#topo", "Home"), ("/#time", "Mentores"), ("/#resultado", "Resultado"), ("/servicos", "Serviços"), ("/blog", "Blog"),
             ("/webnar", "Grupo")]


def topo(ativo=""):
    """Mesmo topo da home: nav larga escondida abaixo de 1120px e Diagnóstico
    como pílula. A home esconde os links no mobile — o blog fazia o contrário e
    empilhava 6 links de 10px com 29px de altura de toque."""
    def link_nav(href, rot):
        atual = ' aria-current="page"' if rot.lower() == ativo else ""
        externo = ' target="_blank" rel="noopener"' if href.startswith("https://") else ""
        return f'<a href="{href}"{atual}{externo}>{rot}</a>'

    itens = "".join(link_nav(href, rot) for href, rot in LINKS_NAV)
    return f"""<header class="top" data-section="topo"><nav class="principal" aria-label="Navegação principal">
<a class="brand" href="/" aria-label="MedCEO, início"><img src="/assets/medceo/logo.png" alt="MedCEO" width="118" height="26"></a>
<div class="navwide" id="navlinks">{itens}</div>
<a class="pilula" href="/diagnostico">Diagnóstico</a>
<button class="hamburguer" type="button" data-menu aria-expanded="false"
        aria-controls="navlinks" aria-label="Abrir menu de navegação"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button>
</nav></header>"""


RODAPE = """<footer data-section="rodape">
<div aria-hidden="true" class="grao"></div>
<div class="wrap colunas">
  <div class="sobre">
    <a href="/" aria-label="MedCEO, início"><img src="/assets/medceo/logo.png" alt="MedCEO" width="108" height="24"></a>
    <p class="gab">Gabinete do diagnóstico</p>
    <p>Diagnóstico, direção e execução para médicos donos de clínica. Método criado dentro de uma operação real.</p>
  </div>
  <nav aria-label="Seções">
    <span class="rotulo">Navegar</span>
    <a href="/#problema">O problema</a><a href="/#time">Pilares</a><a href="/#quem">Quem conduz</a><a href="/#faq">FAQ</a>
  </nav>
  <nav aria-label="Páginas">
    <span class="rotulo">Páginas</span>
    <a href="/blog">Blog</a><a href="/diagnostico">Diagnóstico</a><a href="/webnar">Aulas semanais</a><a href="/blog/feed.xml">RSS</a>
  </nav>
  <div class="contato">
    <span class="rotulo">Contato</span>
    <a href="https://wa.me/5541984875688?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20mentoria%21" target="_blank" rel="noreferrer">WhatsApp do time</a>
    <a href="https://natuamedspa.com.br/" target="_blank" rel="noreferrer">Natuá MedSpa</a>
    <a href="https://www.instagram.com/medico_ceo/" target="_blank" rel="noreferrer">Instagram do MedCEO</a>
    <a href="https://www.instagram.com/dr.lucianoalvesneves/" target="_blank" rel="noreferrer">Instagram do Dr. Luciano</a>
  </div>
</div>
<div class="wrap legal">
  <small>© 2026 MedCEO · Conteúdo informativo. Nenhuma promessa de faturamento.</small>
  <small>CRM/PR 45049 · Curitiba, PR</small>
</div>
</footer>"""

# Barra de leitura: a home tem a mesma faixa dourada no topo, movida por
# site.js. O blog não carrega site.js, então leva a versão curta aqui.
MENU = """<script>
/* Menu do topo no celular. O estado mora no data-aberto do header e no
   aria-expanded do botao, para CSS e leitor de tela lerem a mesma coisa.
   Fecha ao escolher um link, com Escape, e ao voltar para desktop. */
(function(){
var b=document.querySelector('[data-menu]');var t=document.querySelector('.top');
if(!b||!t)return;var p=document.getElementById(b.getAttribute('aria-controls'));if(!p)return;
function d(a){t.toggleAttribute('data-aberto',a);b.setAttribute('aria-expanded',a?'true':'false');
b.setAttribute('aria-label',a?'Fechar menu de navegação':'Abrir menu de navegação')}
b.addEventListener('click',function(){d(b.getAttribute('aria-expanded')!=='true')});
p.addEventListener('click',function(e){if(e.target.closest('a'))d(false)});
document.addEventListener('keydown',function(e){
if(e.key==='Escape'&&b.getAttribute('aria-expanded')==='true'){d(false);b.focus()}});
addEventListener('resize',function(){if(innerWidth>=1120)d(false)},{passive:true});
})();
</script>"""


PROGRESSO = """<script>
(function(){var b=document.querySelector('[data-progresso]');if(!b)return;var t=0;
function p(){if(t)return;t=requestAnimationFrame(function(){t=0;var h=document.documentElement;
var m=h.scrollHeight-h.clientHeight;b.style.width=(m>0?Math.min(100,h.scrollTop/m*100):0)+'%'})}
addEventListener('scroll',p,{passive:true});addEventListener('resize',p,{passive:true});p()})();
</script>"""


def pagina(titulo, desc, corpo, canonical, ativo="", extra_head="", og_tipo="website",
           og_imagem=None, barra=False, claro=False):
    imagem = og_imagem or f"{SITE}/assets/medceo/hero-bg.jpg"
    return f"""<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(titulo)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#05070A">
<link rel="canonical" href="{canonical}">
<link rel="icon" type="image/png" sizes="256x256" href="/assets/medceo/logo-icone.png">
<link rel="apple-touch-icon" href="/assets/medceo/logo-icone.png">
<link rel="alternate" type="application/rss+xml" title="Blog MedCEO" href="{SITE}/blog/feed.xml">
<meta property="og:site_name" content="MedCEO"><meta property="og:locale" content="pt_BR">
<meta property="og:title" content="{html.escape(titulo)}"><meta property="og:description" content="{html.escape(desc)}">
<meta property="og:type" content="{og_tipo}"><meta property="og:url" content="{canonical}">
<meta property="og:image" content="{imagem}"><meta property="og:image:width" content="{CAPA_W}"><meta property="og:image:height" content="{CAPA_H}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(titulo)}"><meta name="twitter:description" content="{html.escape(desc)}">
<meta name="twitter:image" content="{imagem}">
{FONTES}{extra_head}
<style>{CSS}</style>
<!-- GA4 --><script>window.SITE_MARCA='medceo';window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('set',{{site_marca:'medceo'}});gtag('config','GT-PJWWKM65',{{site_marca:'medceo'}});</script><script async src="https://www.googletagmanager.com/gtag/js?id=GT-PJWWKM65"></script>
</head><body{' class="claro"' if claro else ''}>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
{'<div aria-hidden="true" data-progresso class="progresso"></div>' if barra else ''}
{topo(ativo)}
{corpo}
{RODAPE}
{PROGRESSO if barra else ''}
{MENU}
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
    posts.append({"fm": fm, "corpo": corpo, "data": data, "slug": limpar_aspas(fm.get("slug", arq.stem)),
                  "publicado": data <= HOJE, "arquivo": arq.name})

posts.sort(key=lambda p: p["data"], reverse=True)
publicados = [p for p in posts if p["publicado"]]
por_slug = {p["slug"]: p for p in publicados}

for p in posts:
    for campo in ("titulo", "meta_description", "dek", "silo", "imagem_capa"):
        if not str(p["fm"].get(campo, "")).strip():
            avisos.append(f"{p['arquivo']}: frontmatter sem `{campo}`")

# ---------------------------------------------------------------- escrever
blog = BUILD / "blog"
if blog.exists():
    shutil.rmtree(blog)
blog.mkdir(parents=True)
shutil.copytree(CONTEUDO / "capas", blog / "capas")

# posts
for p in publicados:
    fm = p["fm"]
    capa = limpar_aspas(fm.get("imagem_capa", "DSC00192-2.jpg"))
    titulo = limpar_aspas(fm.get("titulo", ""))
    seo_titulo = limpar_aspas(fm.get("seo_title", "")) or f"{titulo} | MedCEO"
    dek = limpar_aspas(fm.get("dek", ""))
    silo = limpar_aspas(fm.get("silo", "Blog MedCEO"))
    autor = limpar_aspas(fm.get("autor", "Dr. Luciano Alves Neves"))
    legenda = limpar_aspas(fm.get("imagem_capa_legenda", ""))
    desc = limpar_aspas(fm.get("meta_description", "")) or dek
    # O alt descreve a cena; o crédito da foto é da legenda, não do alt.
    alt = re.sub(r"\s*Foto:.*$", "", legenda).strip()[:125] or titulo

    corpo_html = md_para_html(p["corpo"], set(por_slug), p["arquivo"])

    # Leitura relacionada: só entra post já publicado. Linkar um agendado seria
    # 404 no dia em que a página é lida.
    relacionados = ""
    itens_rel = []
    for lk in (fm.get("links_internos") or []):
        m = re.match(r"^slug:\s*(\S+)$", str(lk))
        if m:
            itens_rel.append({"slug": m.group(1), "ancora": ""})
        elif itens_rel:
            a = re.match(r"^ancora:\s*(.+)$", str(lk))
            if a:
                itens_rel[-1]["ancora"] = limpar_aspas(a.group(1))
    vivos = [i for i in itens_rel if i["slug"] in por_slug and i["slug"] != p["slug"]]
    if vivos:
        li = "".join(
            f'<li><a href="/blog/{i["slug"]}">{html.escape(i["ancora"] or limpar_aspas(por_slug[i["slug"]]["fm"].get("titulo","")))}</a></li>'
            for i in vivos)
        relacionados = f'<section class="bloco relacionados" data-section="leitura-relacionada"><h2>Continue por aqui</h2><ul>{li}</ul></section>'

    # Fontes: o que está marcado [PENDENTE] não vira texto publicado — vira
    # aviso de build. Fonte incompleta na tela é pior que fonte ausente.
    brutas = fm.get("fontes") or []
    if isinstance(brutas, str):
        brutas = [brutas]
    fontes_ok, pendentes = [], []
    for f in brutas:
        f = limpar_aspas(f)
        (pendentes if f.upper().startswith("[PENDENTE]") else fontes_ok).append(f)
    for f in pendentes:
        avisos.append(f"{p['arquivo']}: fonte [PENDENTE] não publicada — {f[:90]}")
    bloco_fontes = ""
    if fontes_ok:
        bloco_fontes = ('<section class="bloco" data-section="fontes"><h2>Fontes</h2><ul>'
                        + "".join(f"<li>{html.escape(f)}</li>" for f in fontes_ok) + "</ul></section>")

    lateral = montar_lateral(p, publicados, por_slug)

    art = f"""<main id="conteudo"><div class="wrap head">
<nav class="migalhas" aria-label="Trilha"><a href="/">MedCEO</a><span aria-hidden="true">/</span><a href="/blog">Blog</a></nav>
<p class="eyebrow">{html.escape(silo)}</p>
<h1>{html.escape(titulo)}</h1>
<p class="lede">{html.escape(dek)}</p>
<p class="meta"><span>{html.escape(autor)}</span><time datetime="{p['data']}">Publicado em {data_br(str(p['data']))}</time>{f'<span>Atualizado em {data_br(str(fm.get("data_atualizacao")))}</span>' if fm.get("data_atualizacao") and str(fm.get("data_atualizacao")) != str(p["data"]) else ''}</p>
</div>
<div class="wrap post">
<article data-section="corpo-do-post">
<figure class="capa"><img src="/blog/capas/{capa}" alt="{html.escape(alt)}" width="{CAPA_W}" height="{CAPA_H}" fetchpriority="high" decoding="async">
<figcaption>{html.escape(legenda)}</figcaption></figure>
<div class="prosa">{corpo_html}</div>
{relacionados}
{bloco_fontes}
<section class="cta" data-section="cta-fim-do-post">
<h2>Onde está o gargalo da sua clínica?</h2>
<p>Vinte perguntas, cinco minutos. No fim você recebe o nível de maturidade, o gargalo prioritário e três próximos passos. Prefere conversar? Fale direto com o time no WhatsApp.</p>
<a class="btn" href="/diagnostico">Fazer o diagnóstico <span aria-hidden="true">→</span></a>
<a class="btn btn--ghost" href="{WA_CONTATO}" target="_blank" rel="noopener">Falar com a gente</a>
</section>
</article>
{lateral}
</div></main>"""

    url = f"{SITE}/blog/{p['slug']}"
    img_abs = f"{SITE}/blog/capas/{capa}"
    # json.dumps escapa aspas e apóstrofo corretamente. A versão anterior usava
    # repr() + replace("'", '"'), que quebrava o JSON em qualquer título com
    # apóstrofo (ex.: "d'agua") e derrubava o rich snippet em silêncio.
    ld_dados = [{
        "@context": "https://schema.org", "@type": "Article",
        "headline": titulo[:110],
        "description": desc,
        "image": [img_abs],
        "datePublished": str(p["data"]),
        "dateModified": str(fm.get("data_atualizacao") or p["data"]),
        "inLanguage": "pt-BR",
        "articleSection": silo,
        "author": {"@type": "Person", "name": autor,
                   "url": "https://www.instagram.com/dr.lucianoalvesneves/"},
        "publisher": {"@type": "Organization", "name": "MedCEO", "url": SITE,
                      "sameAs": ["https://www.instagram.com/medico_ceo/"],
                      "logo": {"@type": "ImageObject", "url": f"{SITE}/assets/medceo/logo.png"}},
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
    }, {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "MedCEO", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{SITE}/blog"},
            {"@type": "ListItem", "position": 3, "name": titulo, "item": url},
        ],
    }]
    ld = "".join('<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + "</script>"
                 for d in ld_dados)
    ld += (f'<meta property="article:published_time" content="{p["data"]}">'
           f'<meta property="article:modified_time" content="{fm.get("data_atualizacao") or p["data"]}">'
           f'<meta property="article:author" content="{html.escape(autor)}">'
           f'<meta property="article:section" content="{html.escape(silo)}">')

    destino = blog / p["slug"]
    destino.mkdir(parents=True, exist_ok=True)
    (destino / "index.html").write_text(
        pagina(seo_titulo, desc, art, url, "blog", ld,
               claro=True,
               og_tipo="article", og_imagem=img_abs, barra=True), encoding="utf-8")

# listagem
cards = ""
for p in publicados:
    fm = p["fm"]
    cards += f"""<a class="card" href="/blog/{p['slug']}">
<img src="/blog/capas/{limpar_aspas(fm.get('imagem_capa','DSC00192-2.jpg'))}" alt="" width="{CAPA_W}" height="{CAPA_H}" loading="lazy" decoding="async">
<div class="body"><span class="silo">{html.escape(limpar_aspas(fm.get('silo','MedCEO')))}</span>
<h2>{html.escape(limpar_aspas(fm.get('titulo','')))}</h2>
<p>{html.escape(resumir(limpar_aspas(fm.get('dek',''))))}</p>
<time datetime="{p['data']}">{data_br(str(p['data']))}</time></div></a>"""

lista = f"""<main id="conteudo"><div class="wrap head">
<p class="eyebrow">Blog MedCEO</p>
<h1>Gestão de clínica, sem fórmula pronta</h1>
<p class="lede">Margem, comercial, operação e escala, escrito por quem toca uma clínica de verdade e não por quem só estuda o assunto.</p>
</div>
<div class="wrap"><div class="posts">{cards}</div></div>
<div class="wrap"><section class="cta" data-section="cta-listagem">
<h2>Antes de ler mais, saiba onde você está</h2>
<p>Vinte perguntas, cinco minutos. No fim você recebe o nível de maturidade, o gargalo prioritário e três próximos passos, e sabe qual desses textos ler primeiro.</p>
<a class="btn" href="/diagnostico">Fazer o diagnóstico <span aria-hidden="true">→</span></a>
</section></div></main>"""

ld_lista = [{
    "@context": "https://schema.org", "@type": "Blog",
    "name": "Blog MedCEO", "url": f"{SITE}/blog", "inLanguage": "pt-BR",
    "description": "Textos sobre gestão, margem, comercial e escala para médicos donos de clínica.",
    "publisher": {"@type": "Organization", "name": "MedCEO", "url": SITE},
    "blogPost": [{"@type": "BlogPosting", "headline": limpar_aspas(p["fm"].get("titulo", ""))[:110],
                  "url": f"{SITE}/blog/{p['slug']}", "datePublished": str(p["data"])} for p in publicados],
}, {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "MedCEO", "item": f"{SITE}/"},
        {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{SITE}/blog"},
    ],
}]
(blog / "index.html").write_text(
    pagina("Blog | MedCEO", "Textos sobre gestão, margem, comercial e escala para médicos donos de clínica.",
           lista, f"{SITE}/blog", "blog",
           "".join('<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + "</script>"
                   for d in ld_lista)), encoding="utf-8")

# RSS
itens_rss = ""
for p in publicados:
    fm = p["fm"]
    itens_rss += (f"  <item>\n    <title>{html.escape(limpar_aspas(fm.get('titulo','')))}</title>\n"
                  f"    <link>{SITE}/blog/{p['slug']}</link>\n"
                  f"    <guid isPermaLink=\"true\">{SITE}/blog/{p['slug']}</guid>\n"
                  f"    <pubDate>{data_rfc(p['data'])}</pubDate>\n"
                  f"    <category>{html.escape(limpar_aspas(fm.get('silo','')))}</category>\n"
                  f"    <description>{html.escape(limpar_aspas(fm.get('dek','')))}</description>\n  </item>\n")
ultima = publicados[0]["data"] if publicados else HOJE
(blog / "feed.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n'
    "  <title>Blog MedCEO</title>\n"
    f"  <link>{SITE}/blog</link>\n"
    f'  <atom:link href="{SITE}/blog/feed.xml" rel="self" type="application/rss+xml" />\n'
    "  <description>Textos sobre gestão, margem, comercial e escala para médicos donos de clínica.</description>\n"
    "  <language>pt-BR</language>\n"
    f"  <lastBuildDate>{data_rfc(ultima)}</lastBuildDate>\n" + itens_rss +
    "</channel>\n</rss>\n", encoding="utf-8")

# sitemap
fixas = [(f"{SITE}/", None), (f"{SITE}/diagnostico", None), (f"{SITE}/webnar", None),
         (f"{SITE}/blog", ultima)]
urls = fixas + [
    (f"{SITE}/blog/{p['slug']}", p["fm"].get("data_atualizacao") or p["data"])
    for p in publicados
]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u, mod in urls:
    sm += f"  <url><loc>{u}</loc>" + (f"<lastmod>{mod}</lastmod>" if mod else "") + "</url>\n"
sm += "</urlset>\n"
(BUILD / "sitemap.xml").write_text(sm, encoding="utf-8")

print(f"posts encontrados: {len(posts)} | publicados: {len(publicados)} | agendados: {len(posts)-len(publicados)}")
for p in publicados:
    print(f"  {p['data']}  {p['slug']}")
for p in posts:
    if not p["publicado"]:
        print(f"  [agendado] {p['data']}  {p['slug']}")
print(f"sitemap: {len(urls)} urls | rss: {len(publicados)} itens")

# --------------------------------------------------------------------------
# dobra do blog na home
#
# Escrita aqui, e nao a mao no index.html, porque a versao manual desalinhava do
# blog a cada publicacao: chegou a anunciar data antiga e um titulo que o post
# nao tinha mais. A lista abaixo e escolha editorial, nao ordem cronologica.
# --------------------------------------------------------------------------
DESTAQUES_HOME = [
    "maturidade-empresarial-medica-5-estagios",
    "clinica-dependente-do-dono",
    "agenda-cheia-prejuizo-clinica",
    "margem-lucro-clinica-medica",
    "custo-hora-clinica",
]

_por_slug = {p["slug"]: p for p in publicados}
_faltando = [s for s in DESTAQUES_HOME if s not in _por_slug]
_home = BUILD / "index.html"

if _faltando:
    avisos.append("dobra do blog na home nao atualizada, post nao publicado: "
                  + ", ".join(_faltando))
elif not _home.exists():
    avisos.append("dobra do blog na home nao atualizada, site/index.html nao encontrado")
else:
    _html = _home.read_text(encoding="utf-8")
    _ini = _html.find("<!-- dobra: blog -->")
    _fim = _html.find("<!-- dobra:", _ini + 20) if _ini != -1 else -1
    _a = _html.find('<div class="blogwrap">', _ini) if _ini != -1 else -1
    if _ini == -1 or _fim == -1 or _a == -1 or _a > _fim:
        avisos.append("dobra do blog na home nao atualizada, marcadores nao localizados")
    else:
        _cards = []
        for _slug in DESTAQUES_HOME:
            _p = _por_slug[_slug]
            _capa = limpar_aspas(_p["fm"].get("imagem_capa", "DSC00192-2.jpg"))
            _tit = html.escape(limpar_aspas(_p["fm"].get("titulo", _slug)))
            _cards.append(
                f'            <a class="bitem" href="/blog/{_slug}">\n'
                f'              <span class="bitem__img"><img src="/blog/capas/{_capa}" alt="" '
                f'width="{CAPA_W}" height="{CAPA_H}" loading="lazy" decoding="async"></span>\n'
                f"              <span><h4>{_tit}</h4></span>\n"
                f"            </a>"
            )
        _novo = ('        <div class="blogwrap">\n'
                 '          <div class="blist" data-reveal style="--d:1">\n'
                 + "\n".join(_cards)
                 # sem espaco no fim: o texto que segue _b ja traz a propria
                 # indentacao, e repetir aqui faria o arquivo crescer a cada build
                 + "\n          </div>\n        </div>")
        _b = _html.rfind("</div>", _a, _fim)
        _b = _html.rfind("</div>", _a, _b) + len("</div>")
        _antes = _html
        _html = _html[:_a] + _novo.lstrip() + _html[_b:]
        # o <style> da home nao pode mudar: a dobra e conteudo, nao design
        _st = lambda t: t[t.find("<style>"):t.find("</style>")]
        if _st(_antes) != _st(_html):
            avisos.append("dobra do blog na home NAO gravada: a edicao tocaria o <style>")
        else:
            _home.write_text(_html, encoding="utf-8")
            print(f"dobra do blog na home: {len(DESTAQUES_HOME)} posts sincronizados")

if avisos:
    print("\navisos de conteúdo (não bloqueiam o build):")
    for a in avisos:
        print(f"  ! {a}")

# O carimbo de versao vem por ultimo de proposito: qualquer etapa que
# reescreva HTML depois dele apagaria as URLs versionadas. Ja aconteceu: o
# carimbo das capas rodava antes da reescrita da dobra do blog e a home saia com
# as URLs sem versao.
# --------------------------------------------------------------------------
# versao dos assets de codigo na URL
#
# Os dois arquivos vao com cache longo. Com URL fixa, quem ja visitou o site
# continua executando a versao antiga mesmo depois do deploy, porque o HTML
# chega novo (max-age=0) e o asset nao. Foi assim que o botao do menu apareceu
# na tela sem funcionar (site.js, sete dias de cache) e e a mesma armadilha que
# o site-layout.css corria com a versao 20260813b escrita a mao: data digitada
# so muda quando alguem lembra de mudar, e ninguem lembra.
#
# A versao e o hash do conteudo. A URL muda sozinha quando o arquivo muda, e nao
# muda quando ele nao muda.
# --------------------------------------------------------------------------
ASSETS_VERSIONADOS = [
    ("site.js", r'src="/site\.js(?:\?v=[^"]*)?"', 'src="/site.js?v={v}"'),
    # tracking.js entrou nesta lista em 26/08. O blog ja carregava o arquivo,
    # mas com URL fixa: as 20 paginas do blog serviam a versao de 117 linhas,
    # de antes do Pixel da Meta, e o pixel nunca disparava ali. O comentario
    # acima ja descrevia esta armadilha para o site.js; faltava o tracking.js
    # estar coberto por ela.
    ("tracking.js", r'src="/tracking\.js(?:\?v=[^"]*)?"',
     'src="/tracking.js?v={v}"'),
    ("site-layout.css", r'href="/site-layout\.css(?:\?v=[^"]*)?"',
     'href="/site-layout.css?v={v}"'),
]
for _nome, _padrao, _molde in ASSETS_VERSIONADOS:
    _arq = BUILD / _nome
    if not _arq.exists():
        avisos.append(f"{_nome} nao encontrado, versao de cache nao carimbada")
        continue
    _v = hashlib.sha256(_arq.read_bytes()).hexdigest()[:10]
    _tocadas = 0
    for _pag in BUILD.rglob("*.html"):
        _t = _pag.read_text(encoding="utf-8")
        _novo = re.sub(_padrao, _molde.format(v=_v), _t)
        if _novo != _t:
            _pag.write_text(_novo, encoding="utf-8")
            _tocadas += 1
    if _tocadas:
        print(f"{_nome}?v={_v} carimbado em {_tocadas} pagina(s)")

# --------------------------------------------------------------------------
# versao das capas na URL
#
# As capas vao com cache de um ano e immutable. Sem versao na URL, trocar a
# imagem nao chega em quem ja visitou o blog: o navegador nem pergunta. Foi o
# que aconteceu ao reenquadrar as capas em 17/08, e o mesmo erro do site.js no
# mesmo dia. A versao e o hash do proprio arquivo, entao a URL acompanha o
# conteudo.
# --------------------------------------------------------------------------
_capas_dir = blog / "capas"
if not _capas_dir.exists():
    avisos.append("pasta de capas nao encontrada, versao de cache nao carimbada")
else:
    _v = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()[:10]
          for p in _capas_dir.iterdir() if p.is_file()}
    _tocadas = 0
    for _pag in BUILD.rglob("*.html"):
        _t = _pag.read_text(encoding="utf-8")
        _novo = _t
        for _nome, _h in _v.items():
            _novo = re.sub(
                r"(/blog/capas/" + re.escape(_nome) + r")(?:\?v=[0-9a-f]+)?",
                r"\1?v=" + _h, _novo)
        if _novo != _t:
            _pag.write_text(_novo, encoding="utf-8")
            _tocadas += 1
    # o feed e o sitemap tambem citam capa; xml nao aceita & solto, mas ?v= sim
    for _xml in [BUILD / "blog" / "feed.xml"]:
        if not _xml.exists():
            continue
        _t = _xml.read_text(encoding="utf-8")
        _novo = _t
        for _nome, _h in _v.items():
            _novo = re.sub(
                r"(/blog/capas/" + re.escape(_nome) + r")(?:\?v=[0-9a-f]+)?",
                r"\1?v=" + _h, _novo)
        if _novo != _t:
            _xml.write_text(_novo, encoding="utf-8")
            _tocadas += 1
    if _tocadas:
        print(f"capas versionadas por hash em {_tocadas} arquivo(s)")


