---
titulo: "Clínica do Simples emite NFS-e pelo padrão nacional a partir de novembro"
seo_title: "NFS-e obrigatória para clínicas: o que muda na rotina | MedCEO"
slug: nfse-obrigatoria-clinicas
marca: medceo
tipo: satelite
silo: Equipe e processos
keyword: nfs-e obrigatória clínicas
meta_description: A Resolução CGSN 191/2026 torna obrigatória a NFS-e de padrão nacional para ME e EPP do Simples a partir de 1º de novembro de 2026, pelo Emissor Nacional.
dek: O prazo já foi adiado uma vez, de setembro para novembro de 2026. Restam 43 dias corridos, e o risco real não é digitar a nota, é a nota que não sai.
data: 2026-09-19
autor: Dr. Luciano Alves Neves
palavras_alvo: 1700
imagem_capa: IMG_0212.jpg
imagem_capa_legenda: Dr. Luciano Alves Neves na clínica. A troca do sistema de emissão acontece no meio do fluxo de caixa, e é aí que ela cobra.
links_internos:
  - slug: prazo-recebimento-clinica
    ancora: o buraco entre receber e pagar
  - slug: jornada-do-paciente-clinica
    ancora: onde a jornada do paciente trava
  - slug: equipe-clinica-medica
    ancora: quando contratar deixa de ser custo
elemento_notavel: notícia
fontes:
  - Resolução CGSN nº 191, de 04/08/2026
  - Resolução CGSN nº 189, de 2026, revogada
  - Resolução CGSN nº 140/2018
  - Receita Federal, notícia de agosto de 2026 sobre a obrigatoriedade da NFS-e nacional
---

A partir de 1º de novembro de 2026, a clínica optante pelo Simples Nacional que presta serviço sujeito à nota fiscal de serviço passa a emitir pelo Emissor Nacional da NFS-e.

A regra é da Resolução CGSN nº 191, de 4 de agosto de 2026, que alterou a Resolução CGSN nº 140/2018. A emissão pode ser feita pela aplicação web do Emissor Nacional ou por integração via API.

Vale notar que essa mesma resolução revogou a Resolução CGSN nº 189/2026, que fixava o prazo em 1º de setembro. O prazo já andou uma vez, e quem se organizou pelo calendário antigo ganhou dois meses.

## O prazo é curto e a conta de dias é simples

De 19 de setembro a 1º de novembro são 43 dias corridos: 11 dias restantes de setembro, mais os 31 de outubro, mais o dia 1º.

Desses 43, treze caem em fim de semana. Tirando também o feriado nacional de 12 de outubro, restam **29 dias úteis** para testar, ajustar e treinar a recepção.

Vinte e nove dias úteis parecem muitos até você lembrar que a clínica não vai parar de atender durante eles. O tempo disponível para essa mudança é o tempo que sobra, e ele é bem menor.

## O custo não é digitar a nota, é a nota que não sai

A primeira reação de quase todo médico dono de clínica é calcular quanto tempo a recepção vai gastar com um sistema novo. É uma preocupação razoável, e a conta é menor do que parece.

Uma clínica com 300 notas por mês, a dois minutos por nota, gasta 600 minutos, ou 10 horas mensais. Uma recepcionista com salário de R$ 2.400, somando FGTS de 8%, provisão de 13º de 8,33% e provisão de férias com o terço de 11,11%, custa R$ 3.058,56 por mês.

Dividido por 176 horas, dá R$ 17,38 por hora. Dez horas custam **R$ 173,80 por mês**. É dinheiro, mas não é onde o problema mora.

O problema mora do outro lado. Essas mesmas 300 notas, com ticket médio de R$ 450, representam R$ 135 mil de receita por mês que depende de documento fiscal emitido.

| Cenário em novembro | Efeito |
|---|---|
| Emissão funcionando no dia 1º | rotina normal, R$ 173,80 de tempo de recepção no mês |
| Três dias úteis parados por falta de teste | 3 ÷ 22 de R$ 135.000, ou R$ 18.409 de receita sem nota naquele ciclo |
| Nota emitida com código de serviço errado | retificação, ISS recolhido a menor ou a maior, e retrabalho no fechamento |

R$ 18.409 de receita sem documento não significa dinheiro perdido, significa dinheiro atrasado. Para o particular, é o recibo que o paciente pede para o plano e não recebe. Para o convênio, é a fatura que não entra no ciclo e empurra o recebimento em 30 dias, exatamente o mecanismo descrito em [o buraco entre receber e pagar](/blog/prazo-recebimento-clinica).

## A objeção justa: meu sistema já emite nota

Você provavelmente tem um sistema de gestão que emite nota hoje, integrado ao portal da prefeitura, e a conclusão natural é que isso é problema do fornecedor.

Metade disso é verdade. A integração técnica é mesmo trabalho do fornecedor, e boa parte deles já está desenvolvendo a conexão com a API do Emissor Nacional.

A outra metade não é. A obrigação é da clínica, o CNPJ que responde é o seu, e se o fornecedor não entregar a integração até 31 de outubro, quem para de emitir nota é você, não ele.

Por isso a pergunta ao fornecedor precisa ser feita agora e precisa ter data na resposta. "Estamos trabalhando nisso" não é uma data. "A integração com o Emissor Nacional estará disponível na versão de 15 de outubro" é.

## O teste que resolve 90% do risco, e leva vinte minutos

Antes de 31 de outubro, alguém da clínica precisa emitir **uma nota de verdade** pelo Emissor Nacional, com o CNPJ real e um serviço real. Não uma simulação, não um vídeo de treinamento.

Ao emitir, confira quatro coisas, nesta ordem:

1. **O código de tributação nacional do serviço.** É o campo que substitui a lista municipal e o que mais gera erro na primeira emissão.
2. **A alíquota de ISS que o sistema aplicou.** Compare com a alíquota que a sua prefeitura cobra hoje na nota atual.
3. **O valor final da nota.** Ele precisa bater, centavo a centavo, com o que sairia no sistema antigo para o mesmo serviço.
4. **Quem consegue emitir.** Confira se a recepção tem acesso e certificado, ou se tudo depende de uma pessoa só.

O quarto item é o que costuma explodir na prática. Se a emissão depender de um único login que só o administrativo tem, a clínica criou um gargalo novo bem no meio do caixa, do tipo que aparece em [onde a jornada do paciente trava](/blog/jornada-do-paciente-clinica).

> Uma sexta-feira, cinco da tarde, a recepcionista com o paciente na frente dela e o Emissor Nacional pedindo um código de serviço que ninguém cadastrou. Esse é o cenário que os vinte minutos de teste evitam.

## Onde essa obrigação não chega

**Clínica no Lucro Presumido ou no Lucro Real.** A Resolução CGSN nº 191/2026 alcança microempresas e empresas de pequeno porte optantes pelo Simples Nacional. O calendário de obrigatoriedade da NFS-e nacional para os demais regimes segue `[PENDENTE]`, e deve ser confirmado junto ao contador e ao município.

**Serviço não sujeito a nota fiscal de serviço.** A obrigação alcança quem presta serviço sujeito à emissão desse documento, o que é o caso da esmagadora maioria das clínicas, mas não de toda receita.

**Regras de IBS e CBS.** Elas não entram agora. A própria Receita registra que as disposições sobre CBS e IBS se aplicam apenas a partir de 1º de janeiro de 2027, o que é assunto separado desta mudança.

E vale antecipar a decepção mais provável: o Emissor Nacional não vai deixar a clínica mais rápida em novembro. Ele padroniza o documento para o país inteiro, o que é bom no médio prazo e é atrito puro no primeiro mês.

## O que colocar na agenda ainda esta semana

A mudança é operacional, e mudança operacional que não vira tarefa com dono e data não acontece. São quatro linhas de agenda, e nenhuma delas é sua.

1. **Hoje:** mensagem ao fornecedor do sistema perguntando a data exata de disponibilidade da integração com o Emissor Nacional.
2. **Até 30 de setembro:** uma nota real emitida pelo Emissor Nacional, com os quatro itens do teste conferidos.
3. **Até 15 de outubro:** duas pessoas da recepção treinadas e com acesso próprio, não uma.
4. **Última semana de outubro:** um dia inteiro emitindo pelos dois caminhos em paralelo, comparando valores.

O quarto passo parece exagero e é o mais barato. Emitir em paralelo por um dia custa algumas horas de recepção, e é o que transforma uma virada de sistema em rotina em vez de emergência. O critério para decidir se isso justifica mão de obra extra está em [quando contratar deixa de ser custo](/blog/equipe-clinica-medica).

## Perguntas frequentes

**A partir de quando a NFS-e nacional é obrigatória para a minha clínica?**
A partir de 1º de novembro de 2026, para microempresas e empresas de pequeno porte optantes pelo Simples Nacional, conforme a Resolução CGSN nº 191, de 4 de agosto de 2026.

**O prazo não era setembro?**
Era. A Resolução CGSN nº 189/2026 fixava 1º de setembro de 2026 e foi expressamente revogada pela Resolução nº 191/2026, que levou o prazo para 1º de novembro.

**Posso continuar emitindo pelo sistema da prefeitura?**
A resolução determina que a emissão ocorra pelo Emissor Nacional da NFS-e, seja pela aplicação web, seja por integração via API. Confirme com o contador e com o seu município como fica o sistema municipal no seu caso específico.

**Preciso trocar o sistema de gestão da clínica?**
Não necessariamente. O que precisa existir é a integração do seu sistema com a API do Emissor Nacional, ou a emissão direta pela aplicação web. Peça ao fornecedor a data em que a integração estará pronta.

**E se eu não emitir pelo padrão nacional a partir de novembro?**
A obrigação é da clínica, e o efeito prático imediato é receita prestada sem documento fiscal válido, com impacto no ISS, no recebimento de convênio e no fechamento contábil do mês.

## O próximo passo é uma nota de teste

Emita uma nota real pelo Emissor Nacional esta semana e confira o código de tributação do serviço, a alíquota de ISS e o valor final. Vinte minutos agora valem mais que 29 dias úteis de intenção.

A decisão fiscal é do contador da sua clínica. Este texto explica o que muda na rotina e mostra a conta de tempo e de exposição, não substitui a consultoria de quem responde tecnicamente pela sua empresa. O diagnóstico de maturidade do MedCEO mede dependência do dono, margem e estrutura, e entrega o gargalo que trava a passagem de estágio. [Faça o diagnóstico da sua clínica](https://medceo.online/diagnostico).
