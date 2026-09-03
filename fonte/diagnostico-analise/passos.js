/* Os próximos passos.

   No diagnóstico anterior os três passos vinham do NÍVEL: todo médico de nível 2
   recebia os mesmos três. Aqui eles vêm do PILAR mais fraco dele.

   Cada passo respeita três limites, e é isso que os torna executáveis:
   não contratar ninguém, não comprar nada, e caber numa semana. Passo que
   depende de orçamento não é passo, é intenção.

   Os passos de Mentalidade e Gestão herdam as ferramentas de bolso que o deck
   comercial já entrega em cada pilar (gerar-deck.py, slides 6 a 9): a conta do
   percentual que vem da própria agenda, e a auditoria das conversas de preço.
*/

var PASSOS = {
  mentalidade: [
    {
      o: "Marque no calendário, agora, um dia inteiro fora nas próximas quatro semanas.",
      porque:
        "Você estimou de cabeça o que a sua ausência causa. Um dia real mostra a " +
        "causa, que é o que dá para consertar, e é curto o bastante para não " +
        "assustar ninguém.",
      quando: "5 minutos para marcar, 1 dia para descobrir",
    },
    {
      o: "Antes desse dia, escreva quem decide o quê na sua ausência, com nome e limite de valor.",
      porque:
        "A queda de faturamento quando o dono sai quase nunca é falta de " +
        "competência da equipe. É falta de autorização, e autorização se escreve.",
      quando: "40 minutos",
    },
    {
      o: "Anote por três dias toda decisão que passou por você, com o tempo que levou.",
      porque:
        "A lista separa o que só você pode decidir do que virou hábito de passar " +
        "por você. Os dois grupos costumam ter tamanhos bem diferentes do que se " +
        "imagina antes de contar.",
      quando: "3 dias, anotando na hora",
    },
  ],
  comercial: [
    {
      o: "Conte, por sete dias, quantas pessoas pediram orçamento e quantas fecharam.",
      porque:
        "Você já estimou a taxa. Contar de verdade transforma a estimativa em " +
        "número, e é o número que mostra em qual etapa a pessoa some.",
      quando: "7 dias, uma linha por pedido",
    },
    {
      o: "Pegue 20 conversas de preço dos últimos 30 dias e leia o que foi respondido.",
      porque:
        "É a auditoria que o pilar Comercial faz na mentoria. Na maior parte das " +
        "clínicas a perda não é objeção de preço, é silêncio depois do valor, e " +
        "isso só aparece relendo o que foi escrito.",
      quando: "Uma hora com o WhatsApp aberto",
    },
    {
      o: "Defina quem responde, em quanto tempo, e o que se faz quando a pessoa não responde.",
      porque:
        "Sem uma regra de retorno escrita, o retorno depende de alguém lembrar. " +
        "E ninguém lembra numa terça cheia.",
      quando: "Uma conversa de 40 minutos com a recepção",
    },
  ],
  gestao: [
    {
      o: "Levante quanto sobrou de fato no último mês fechado: entrou menos saiu, incluindo a sua retirada.",
      porque:
        "Enquanto a margem for estimativa, investir é apostar. Um mês fechado já " +
        "tira você do escuro, e a meta do programa é 30% de margem líquida.",
      quando: "Meio dia com o extrato e as contas do mês",
    },
    {
      o: "Separe, dentro desse número, o que é despesa fixa e o que varia por atendimento.",
      porque:
        "É essa divisão que responde quanto sobra de cada paciente novo, e " +
        "portanto quanto você pode investir para trazer um sem perder dinheiro.",
      quando: "Duas horas, depois do passo 1",
    },
    {
      o: "Verifique se conta pessoal e conta da clínica ainda se misturam em algum ponto.",
      porque:
        "Enquanto se misturam, nenhum dos dois números é confiável, e a clínica " +
        "parece mais lucrativa ou menos lucrativa do que de fato é.",
      quando: "Uma hora olhando o cartão e a conta corrente",
    },
  ],
};

var N = require("./niveis.js");

/* Escolhe o pilar mais fraco. Empate resolve pela ordem em que um pilar trava
   o outro: Gestão primeiro, porque sem margem não dá para escolher onde
   investir; depois Comercial, porque recuperar o que já chega é mais barato do
   que atrair; Mentalidade por último, que é o trabalho mais longo dos três. */
function proximosPassos(pilares) {
  var presentes = N.ORDEM_DESEMPATE.filter(function (k) {
    return pilares[k];
  });
  if (!presentes.length) return { pilar: null, passos: [] };

  var menor = Math.min.apply(
    null,
    presentes.map(function (k) {
      return pilares[k].nota;
    })
  );
  var pilar = presentes.filter(function (k) {
    return pilares[k].nota === menor;
  })[0];

  return { pilar: pilar, passos: PASSOS[pilar] || [] };
}

module.exports = { PASSOS: PASSOS, proximosPassos: proximosPassos };
