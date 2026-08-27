/**
 * MedCEO — recebedor do formulário de qualificação.
 *
 * Grava uma linha na planilha a cada formulário respondido no site. O
 * formulário fica em site/qualifica.js e todo botão de WhatsApp do site abre
 * ele antes de liberar a conversa.
 *
 * COMO PUBLICAR, uma vez só
 *   1. Abra a planilha que vai guardar os leads.
 *   2. Extensões → Apps Script.
 *   3. Apague o conteúdo e cole este arquivo inteiro.
 *   4. Salve, depois rode a função `preparar` uma vez e autorize quando pedir.
 *   5. Implantar → Nova implantação → tipo "App da Web".
 *        Executar como                 : Eu
 *        Quem pode acessar             : Qualquer pessoa
 *   6. Copie a URL que termina em /exec e me mande.
 *
 * POR QUE "Qualquer pessoa"
 * O site é público e o visitante não tem conta Google. Com qualquer outra
 * opção o POST volta com uma tela de login e o lead se perde em silêncio.
 * O script só aceita gravar; ele não lê nem devolve nada da planilha.
 *
 * POR QUE doGet EXISTE
 * Para você conseguir testar a URL colando no navegador. Ele responde um
 * "ok" e não grava nada.
 */

var ABA = 'LEADS';

/* A ordem aqui é a ordem das colunas. Campo novo entra no fim da lista, nunca
   no meio: no meio, toda linha antiga passa a apontar para a coluna errada. */
var COLUNAS = [
  ['enviado_em',   'Data e hora'],
  ['nome',         'Nome'],
  ['fone',         'WhatsApp'],
  ['email',        'E-mail'],
  ['atuacao',      'Como atende'],
  ['equipe',       'Tamanho da equipe'],
  ['pilares',      'Frentes que já existem'],
  ['fase',         'Fase da clínica'],
  ['gargalo',      'Maior gargalo'],
  ['destino',      'Destino'],
  ['pagina',       'Página de origem'],
  ['botao',        'Botão clicado'],
  ['canal',        'Canal'],
  ['utm_source',   'utm_source'],
  ['utm_medium',   'utm_medium'],
  ['utm_campaign', 'utm_campaign'],
  ['fone_digitos', 'WhatsApp só dígitos']
];

/* Os valores chegam como código curto para não quebrar quando o texto da
   opção mudar no site. A tradução para português fica aqui, do lado de quem
   lê a planilha. Código que não estiver neste mapa aparece como veio, em vez
   de virar célula vazia. */
var ROTULOS = {
  clinica_propria: 'Tem clínica própria',
  consultorio:     'Consultório próprio',
  terceiros:       'Atende em espaço de terceiros',
  nao_atendendo:   'Não está atendendo',
  estudante:       'Estudante de medicina',

  '0':     'Sem equipe',
  '1a3':   '1 a 3 pessoas',
  '4a10':  '4 a 10 pessoas',
  '11a30': '11 a 30 pessoas',
  '30+':   'Mais de 30 pessoas',

  marketing:  'Marketing',
  comercial:  'Comercial',
  gestao:     'Gestão',
  financeiro: 'Financeiro',
  recepcao:   'Recepção',
  nenhum:     'Nenhuma',

  ate30:       'Até 30 mil',
  '30a80':     '30 a 80 mil',
  '80a200':    '80 a 200 mil',
  '200a500':   '200 a 500 mil',
  '500+':      'Acima de 500 mil',
  prefiro_nao: 'Preferiu não informar',

  dependencia: 'A clínica para quando ele para',
  margem:      'Fatura bem e sobra pouco',
  leads:       'Falta paciente entrando',
  conversao:   'Lead não vira consulta',
  equipe:      'Equipe não anda sozinha',
  tempo:       'Sem tempo',

  grupo:    'Grupo do WhatsApp',
  conversa: 'Conversa direta'
};

function traduzir(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  return String(valor).split(',').map(function (p) {
    var k = p.trim();
    return ROTULOS[k] || k;
  }).join(', ');
}

function aba_() {
  var pl = SpreadsheetApp.getActiveSpreadsheet();
  var a = pl.getSheetByName(ABA);
  if (!a) {
    a = pl.insertSheet(ABA);
    a.appendRow(COLUNAS.map(function (c) { return c[1]; }));
    a.getRange(1, 1, 1, COLUNAS.length)
      .setFontWeight('bold')
      .setBackground('#0B1620')
      .setFontColor('#E7D28C');
    a.setFrozenRows(1);
    a.setColumnWidth(1, 150);
    a.setColumnWidth(2, 190);
    a.setColumnWidth(3, 150);
    a.setColumnWidth(4, 220);
  }
  return a;
}

/** Rode uma vez, à mão, para criar a aba e autorizar o script. */
function preparar() {
  var a = aba_();
  Logger.log('Aba "%s" pronta, %s linhas.', ABA, a.getLastRow());
  return 'ok';
}

function doPost(e) {
  try {
    /* O site envia como text/plain para não disparar preflight, então o
       corpo chega em postData.contents e não em e.parameter. */
    var d = {};
    if (e && e.postData && e.postData.contents) {
      d = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      d = e.parameter;
    }

    var quando = d.enviado_em ? new Date(d.enviado_em) : new Date();

    var linha = COLUNAS.map(function (c) {
      var chave = c[0];
      if (chave === 'enviado_em') {
        return Utilities.formatDate(quando, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
      }
      /* Só as respostas de opção passam pela tradução. Nome, e-mail e URL
         vão como vieram: traduzir texto livre poderia trocar um pedaço da
         resposta por um rótulo por coincidência de palavra. */
      if (['atuacao', 'equipe', 'pilares', 'fase', 'gargalo', 'destino'].indexOf(chave) > -1) {
        return traduzir(d[chave]);
      }
      /* apóstrofo à frente do telefone: sem ele a planilha tenta somar o
         número e o zero do DDD desaparece */
      if (chave === 'fone_digitos' && d[chave]) return "'" + d[chave];
      return d[chave] === undefined ? '' : String(d[chave]);
    });

    aba_().appendRow(linha);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    /* O erro vai para a própria planilha, numa aba separada. Log do Apps
       Script some com o tempo e ninguém abre; linha na planilha fica. */
    try {
      var pl = SpreadsheetApp.getActiveSpreadsheet();
      var le = pl.getSheetByName('ERROS') || pl.insertSheet('ERROS');
      le.appendRow([
        new Date(),
        String(err),
        e && e.postData ? String(e.postData.contents).slice(0, 900) : ''
      ]);
    } catch (e2) {}

    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, erro: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('MedCEO: recebedor do formulario no ar. Use POST para gravar.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Bateria de teste, nos dois sentidos.
 *
 * Ela precisa aprovar o envio bom e REPROVAR o ruim. Teste que só sabe
 * passar não provou nada: rode, confira o log, e apague as linhas de teste
 * da planilha depois.
 */
function testar() {
  var antes = aba_().getLastRow();

  doPost({ postData: { contents: JSON.stringify({
    enviado_em: new Date().toISOString(),
    nome: 'TESTE Dr. Fulano', email: 'teste@exemplo.com', fone: '(41) 99999-0000',
    fone_digitos: '41999990000',
    atuacao: 'clinica_propria', equipe: '4a10',
    pilares: 'marketing, comercial', fase: '80a200', gargalo: 'margem',
    destino: 'grupo', pagina: '/webnar2', botao: 'Quero entrar no grupo',
    canal: 'pago', utm_source: 'ig', utm_medium: 'cpc', utm_campaign: 'teste'
  })}});

  /* corpo quebrado: tem que cair no catch e gravar em ERROS, sem derrubar */
  doPost({ postData: { contents: '{isto nao e json' } });

  var depois = aba_().getLastRow();
  var pl = SpreadsheetApp.getActiveSpreadsheet();
  var erros = pl.getSheetByName('ERROS');

  Logger.log('linhas LEADS antes=%s depois=%s (esperado +1)', antes, depois);
  Logger.log('bom gravou      : %s', depois === antes + 1 ? 'PASSA' : 'REPROVA');
  Logger.log('ruim foi p/ ERROS: %s', (erros && erros.getLastRow() > 0) ? 'PASSA' : 'REPROVA');
  Logger.log('traducao        : %s', traduzir('marketing, comercial'));
  return 'veja o log em Execuções';
}
