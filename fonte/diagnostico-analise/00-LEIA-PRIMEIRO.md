# A análise do diagnóstico, código-fonte

O que o médico vê quando termina os cinco passos em `medceo.online/diagnostico`.

## O que roda em produção não é esta pasta

O que vai ao ar é o bloco consolidado dentro de `site/diagnostico.js`. Esta
pasta tem os módulos de origem, separados para poderem ser testados um a um com
`node`. **Editar `site/diagnostico.js` à mão faz o próximo `consolidar.py`
apagar a edição.** O caminho é sempre: editar aqui, consolidar, integrar.

```bash
cd fonte/diagnostico-analise
node gerar_preview.js          # gera previa-marina.html e mais dois perfis
python3 consolidar.py          # junta os módulos num bloco só
```

O `consolidar.py` aponta para caminhos de scratchpad de sessão. Ao rodar de
novo, ajustar `BASE` para esta pasta.

## Os módulos, na ordem em que dependem uns dos outros

| Arquivo | O que faz |
|---|---|
| `motor.js` | Faixas viram número, e as respostas viram nota de 1 a 5 por pilar |
| `niveis.js` | Os 5 níveis, os 4 pilares e a classificação por sintoma |
| `leitura.js` | Lê os campos de texto livre, recorta a frase e classifica o tema |
| `passos.js` | Os 3 próximos passos, escolhidos pelo pilar mais fraco |
| `contas.js` | As contas em reais, com a conta à mostra |
| `extras.js` | 9 indicadores, 4 ferramentas de bolso, 4 entregáveis, o cenário |
| `secoes.js` | Sumário, régua dos níveis, indicadores, ferramentas, entregáveis |
| `render.js` | Monta o HTML e define a ordem das 14 seções |
| `estilo.css` | O visual, mobile primeiro, com o bloco `@media print` do PDF |

## As decisões que não são óbvias no código

**A nomenclatura dos níveis é a da Aula 1**, não a do quiz que rodava nesta URL
até 03/09. Médico Autônomo, Clínica Dependente do Dono, Clínica com Receita Sem
Governança, Clínica Estruturada, Clínica Escalável. A lista antiga (Improviso,
Organização, Gestão, Previsibilidade, Escala) está superada: se a tela usar
ela, o médico recebe um nome na terça e ouve outro na aula de segunda.

**O nível sai do sintoma, não da média.** Uma faixa de nota mandava para
"Médico Autônomo" quem tem 1 a 3 pessoas na equipe, contradizendo o resumo do
próprio nível na tela. Ter uma pessoa já é ter equipe, e ter equipe sem delegar
é a definição do nível 2.

**Marketing não recebe nota.** O formulário não tem uma única pergunta de
captação. A tela declara isso e usa a lacuna para explicar o que a sessão
levanta, em vez de estimar um número que os dados não sustentam.

**Toda conta mostra a conta.** Duas delas são as mesmas do deck comercial
(`Duas-Clinicas/fonte/gerar-deck.py`, função `calcula`): `FAT * QUEDA / 100` e
`10 - FECHA`. Herdar a fórmula é o que faz a tela e a reunião contarem a mesma
história com o mesmo número.

**O cenário é aritmética declarada, nunca previsão.** A publicidade médica veda
promessa de resultado, e o texto diz isso com todas as letras.

**A única régua externa usada é a meta de margem líquida do programa**, que
está escrita em `PROGRAMA-MEDCEO-12-MESES.md:161` como 30%. Ela é meta do
programa, não média de mercado, e a tela diz isso com todas as letras. Na
prática ela só vira número para quem respondeu que acompanha a margem: sobre a
faixa de R$ 50 mil a R$ 80 mil, a tela toma o meio, R$ 65 mil, e mostra
`65 × 0,30 = R$ 19,5 mil` por mês, arredondado para R$ 20 mil.

**Nenhuma outra régua é usada, porque nenhuma outra existe.** Não há corte
oficial de "conversão boa" ou "queda aceitável" em lugar nenhum do vault, e
inventar um seria número sem fonte. No lugar disso a tela usa **valor
marginal**: quanto vale UM ponto a mais, na clínica dele, com o volume que ele
já tem. Se ele fecha 3,5 em 10 e fatura R$ 65 mil, então `65 ÷ 3,5 = R$ 18,6
mil` é o que cada fechamento responde, e é o que um a mais vale. Matemática
sobre os dados dele, sem comparação com clínica nenhuma.

## Armadilhas já pagas, para não repetir

**Colisão de escopo.** O bloco vive dentro de uma IIFE própria porque, sem ela,
o `var PASSOS` da análise sobrescreveu o `var PASSOS` dos cinco passos do
formulário. JavaScript não reclama de `var` repetido: o formulário
simplesmente parou de achar os próprios campos, sem erro nenhum até o clique.

**Especificidade.** Um `.an p { margin: 0 }` (0,1,1) vencia `.capa-nivel`
(0,1,0), e 30px de margem escritos e publicados chegavam computados como 0px.
A página já zera `p` no `index.html` com especificidade de tipo, que perde para
qualquer classe. Antes de escrever regra que não aplica, medir o computado e a
lista de regras que miram a propriedade.

**Cache de asset.** `diagnostico.js` está em `ASSETS_VERSIONADOS`, em
`scripts/gerar_blog.py`. Sem o `?v=<hash>` na URL, o cache de borda serve a
versão anterior e a mudança não chega em ninguém.
