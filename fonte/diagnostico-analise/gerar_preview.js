/* Gera a prévia da análise.

   Usa o BLOCO CONSOLIDADO, não os módulos: é ele que vai para o site, e testar
   os módulos deixaria a consolidação sem verificação. Um dos perfis é a Dra.
   Marina Prado, o mesmo caso de exemplo do deck comercial, para que a tela e a
   reunião possam ser comparadas lado a lado.
*/

var fs = require("fs");
var path = require("path");

var src = fs.readFileSync(path.join(__dirname, "bloco-analise.js"), "utf8");
var montarAnalise = new Function(src + "; return montarAnalise;")();

var PERFIS = {
  marina: {
    nome: "Dra. Marina Prado",
    telefone: "(41) 98888-7777",
    email: "marina@exemplo.com",
    especialidade: "Dermatologia",
    clinica: "Clínica Prado",
    cidade: "Curitiba",
    gargalos:
      "Meu maior problema hoje é tempo. Eu atendo o dia inteiro e ainda fico até " +
      "tarde resolvendo coisa da clínica, tudo passa por mim. A secretária manda os " +
      "orçamentos no WhatsApp, mas muita gente não volta e ninguém faz follow up.",
    equipe: "1a3",
    decisor: "sim",
    faturamento: "50a80",
    margem: "financeiro",
    conversao: "3a4",
    queda_ferias: "40a60",
    desejo:
      "Queria ter contratado alguém para tocar a operação e nunca consegui parar " +
      "para fazer o processo de contratação direito.",
    prioridade_agora:
      "Porque eu perdi o aniversário da minha filha trabalhando e não quero repetir isso.",
    clareza_desejada: "Saber por onde começar sem quebrar a clínica no meio do caminho.",
    horario_preferido: "noite",
    info_extra: "",
  },
  estruturada: {
    nome: "Dr. Paulo Menezes",
    especialidade: "Oftalmologia",
    clinica: "Instituto Menezes",
    cidade: "Florianópolis",
    gargalos:
      "A clínica roda bem, temos processo e indicador. O que me incomoda é que o " +
      "marketing não traz o paciente certo, vem muita gente buscando preço.",
    equipe: "8a15",
    decisor: "socio",
    socio_participa: "sim",
    faturamento: "150a300",
    margem: "sim",
    conversao: "7a8",
    queda_ferias: "10a25",
    desejo: "Abrir a segunda unidade, e travei porque não sei se a margem aguenta.",
    prioridade_agora: "Apareceu um ponto comercial bom e tenho 60 dias para decidir.",
    clareza_desejada: "Se a clínica está pronta para a segunda unidade.",
    horario_preferido: "manha",
    info_extra: "",
  },
  sozinho: {
    nome: "Dr. Rafael Lima",
    especialidade: "Nutrologia",
    clinica: "Consultório Rafael Lima",
    cidade: "Maringá",
    gargalos: "Sou eu e mais ninguém. Atendo, respondo, cobro e ainda faço o financeiro.",
    equipe: "so_eu",
    decisor: "sim",
    faturamento: "ate25",
    margem: "nao",
    conversao: "nao_sei",
    queda_ferias: "60mais",
    desejo: "Contratar a primeira secretária, mas não sei se o caixa aguenta.",
    prioridade_agora: "Recusei três pacientes na semana passada por falta de agenda.",
    clareza_desejada: "Se dá para contratar alguém agora.",
    horario_preferido: "tarde",
    info_extra: "",
  },
};

var css = fs.readFileSync(path.join(__dirname, "estilo.css"), "utf8");
var base = fs.readFileSync(path.join(__dirname, "base.css"), "utf8");

Object.keys(PERFIS).forEach(function (k) {
  var html =
    "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>Prévia, " + k + "</title>" +
    "<link href='https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300..500;1,300..400&family=Poppins:wght@300;400&family=JetBrains+Mono:wght@300;400&display=swap' rel='stylesheet'>" +
    "<style>" + base + "\n" + css + "</style></head><body>" +
    "<div class='an-wrap'>" + montarAnalise(PERFIS[k]) + "</div>" +
    "</body></html>";
  fs.writeFileSync(path.join(__dirname, "previa-" + k + ".html"), html);
  console.log("gerado: previa-" + k + ".html  (" + Math.round(html.length / 1024) + " KB)");
});
