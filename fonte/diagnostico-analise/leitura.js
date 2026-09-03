/* Leitura do que o médico escreveu com as próprias palavras.

   O formulário tem quatro campos abertos: gargalos, desejo, prioridade_agora e
   clareza_desejada. Um quiz ignora esses campos. Esta análise faz duas coisas
   com eles.

   1. DEVOLVE A FRASE DELE, entre aspas, na tela. Nada convence um médico de que
      ele foi lido como ver a própria frase de volta. Só recorta, nunca reescreve:
      texto reescrito por máquina soa como máquina, e ele reconhece na hora.

   2. CLASSIFICA por termo, para ligar o que ele escreveu ao eixo que os números
      já apontaram. Quando o texto e os números batem, a análise diz isso, e essa
      convergência é o achado mais forte que a tela pode ter.

   O classificador é deliberadamente humilde: acerta ou fica calado. Ele nunca
   afirma "seu problema é comercial" a partir de uma palavra solta. Ele diz "você
   escreveu X, e os seus números mostram Y".
*/

/* Termos por eixo. Vocabulário de médico dono de clínica, não de consultor.
   Sem acento nas chaves: a comparação roda sobre o texto já normalizado. */
var TERMOS = {
  comercial: [
    "orcamento", "orcamentos", "fechar", "fecha", "fechamento", "converter",
    "conversao", "vender", "venda", "vendas", "comercial", "lead", "leads",
    "whatsapp", "secretaria", "recepcao", "recepcionista", "retorno",
    "follow up", "followup", "nao volta", "some", "sumiu", "perco paciente",
    "paciente nao fecha", "preco", "caro", "desconto", "negociar",
  ],
  marketing: [
    "marketing", "instagram", "rede social", "redes sociais", "trafego",
    "anuncio", "anuncios", "meta ads", "google", "divulgacao", "post",
    "conteudo", "seguidores", "aparecer", "ser visto", "captacao",
    "atrair", "agenda vazia", "poucos pacientes", "movimento",
  ],
  gestao: [
    "processo", "processos", "protocolo", "padronizar", "organizar",
    "organizacao", "planilha", "sistema", "controle", "financeiro",
    "margem", "custo", "custos", "lucro", "caixa", "indicador",
    "indicadores", "numero", "numeros", "relatorio", "prontuario",
    "agendamento", "no show", "falta", "estoque",
  ],
  pessoas: [
    "equipe", "time", "funcionario", "funcionarios", "colaborador",
    "contratar", "contratacao", "treinar", "treinamento", "demiti",
    "rotatividade", "turnover", "lideranca", "liderar", "delegar",
    "delego", "autonomia", "cobrar", "engajamento", "socio", "socia",
  ],
  tempo: [
    "tempo", "sem tempo", "corrido", "correria", "cansado", "cansaco",
    "exausto", "esgotado", "burnout", "sobrecarga", "sobrecarregado",
    "apagar incendio", "apagando incendio", "urgencia", "final de semana",
    "fim de semana", "ferias", "familia", "filho", "filhos", "noite",
    "madrugada", "nao paro", "nao consigo parar", "sozinho", "tudo em mim",
    "depende de mim", "passa por mim", "gargalo sou eu",
  ],
};

/* Como cada tema do texto se chama na tela, e a qual PILAR ele conversa.

   Os pilares sao os quatro da mentoria (Mentalidade, Comercial, Marketing,
   Gestao), e nao uma taxonomia propria: se a tela chamar de "operacao" o que a
   aula de segunda chama de "mentalidade", o medico recebe dois mapas do mesmo
   territorio. Marketing tem `pilar` mas nao tem nota, porque o formulario nao
   pergunta nada de captacao, e isso a tela declara em vez de estimar. */
var NOME_EIXO = {
  comercial: { rot: "o comercial", pilar: "comercial" },
  marketing: { rot: "a captação", pilar: "marketing" },
  gestao: { rot: "a gestão e os números", pilar: "gestao" },
  pessoas: { rot: "a equipe e a delegação", pilar: "mentalidade" },
  tempo: { rot: "o seu tempo", pilar: "mentalidade" },
};

function normalizar(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

/* Conta quantos termos DISTINTOS de cada eixo aparecem, e guarda quais foram.

   O descarte de termo contido em outro existe por um erro de contagem medido:
   "orcamento" casa dentro de "orcamentos", e um unico "orcamentos" no texto
   valia 2 pontos. Isso inflava o eixo com mais variacoes na lista, nao o eixo
   que o medico mais citou, e a convergencia final apontava para o lugar errado. */
function classificar(texto) {
  var n = normalizar(texto);
  var achados = [];
  Object.keys(TERMOS).forEach(function (eixo) {
    var casou = TERMOS[eixo].filter(function (termo) {
      return n.indexOf(termo) !== -1;
    });
    casou = casou.filter(function (termo) {
      return !casou.some(function (outro) {
        return outro !== termo && outro.indexOf(termo) !== -1;
      });
    });
    if (casou.length) {
      achados.push({ eixo: eixo, peso: casou.length, termos: casou });
    }
  });
  achados.sort(function (a, b) {
    return b.peso - a.peso;
  });
  return achados;
}

/* Recorta a frase mais representativa, sem reescrever nada.
   Prefere a frase que carrega mais termos; empate vai para a mais longa, que
   costuma ser a que tem a cena. Corta em 190 caracteres no espaço, para não
   partir palavra. */
function frase(texto, limite) {
  limite = limite || 190;
  var bruto = String(texto || "").trim();
  if (!bruto) return "";

  var partes = bruto
    .split(/(?<=[.!?])\s+|\n+/)
    .map(function (s) {
      return s.trim();
    })
    .filter(function (s) {
      return s.length > 24;
    });
  if (!partes.length) partes = [bruto];

  var melhor = partes[0];
  var melhorPeso = -1;
  partes.forEach(function (p) {
    var peso = classificar(p).reduce(function (s, a) {
      return s + a.peso;
    }, 0);
    if (peso > melhorPeso || (peso === melhorPeso && p.length > melhor.length)) {
      melhor = p;
      melhorPeso = peso;
    }
  });

  melhor = melhor.replace(/\s+/g, " ").trim();
  if (melhor.length > limite) {
    var corte = melhor.slice(0, limite);
    var esp = corte.lastIndexOf(" ");
    melhor = (esp > 60 ? corte.slice(0, esp) : corte).replace(/[,;:]$/, "") + "...";
  }
  return melhor;
}

/* O achado central: o texto dele e os números dele apontam para o mesmo lugar? */
function convergencia(respostas, pilares) {
  var doTexto = classificar(
    [respostas.gargalos, respostas.desejo, respostas.prioridade_agora, respostas.clareza_desejada].join(" ")
  );
  if (!doTexto.length) return null;

  var topo = doTexto[0];
  var alvo = NOME_EIXO[topo.eixo];
  if (!alvo) return null;

  var medido = pilares[alvo.pilar];

  /* Marketing cai aqui: o medico escreveu sobre captacao e o formulario nao tem
     como medir isso. Nao e um achado fraco, e um achado honesto, e a tela usa
     essa informacao para dizer o que a sessao vai levantar. */
  if (!medido) {
    return { tema: topo.eixo, rot: alvo.rot, pilar: alvo.pilar, semMedida: true, bate: false };
  }

  /* `bate` significa: o pilar sobre o qual ele escreveu e o MENOR de todos, ou
     empata com o menor. Antes bastava nota <= 2, e a tela chegou a afirmar
     "Comercial e justamente o pilar mais baixo" com Mentalidade em 20% contra
     Comercial em 40%. A frase era falsa e o leitor via a contradicao na barra
     logo abaixo. */
  var menor = Object.keys(pilares).reduce(function (m, k) {
    return pilares[k].nota < m ? pilares[k].nota : m;
  }, Infinity);

  return {
    tema: topo.eixo,
    rot: alvo.rot,
    pilar: alvo.pilar,
    nota: medido.nota,
    semMedida: false,
    bate: medido.nota === menor,
    baixo: medido.nota <= 2,
    termos: topo.termos.slice(0, 4),
  };
}

module.exports = {
  TERMOS: TERMOS,
  NOME_EIXO: NOME_EIXO,
  normalizar: normalizar,
  classificar: classificar,
  frase: frase,
  convergencia: convergencia,
};
