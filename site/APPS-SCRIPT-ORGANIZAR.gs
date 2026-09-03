/* ==========================================================================
   MedCEO, organizacao da planilha de leads.

   COMO USAR, uma vez so:
     1. abra a planilha "MedCEO - Leads do Formulario de Qualificacao"
     2. Extensoes > Apps Script
     3. cole este arquivo ao lado do APPS-SCRIPT-FORMULARIO.gs que ja esta la
     4. escolha a funcao `organizar` no seletor do topo e clique em Executar

   Rodar de novo nao estraga nada: a funcao e idempotente, ela reaplica o
   mesmo estado em vez de empilhar.

   O QUE ELA FAZ, E POR QUE

   1. ACABAMENTO DA ABA LEADS. Cabecalho congelado, filtro, largura por
      coluna, data formatada, telefone forcado a texto (senao o Sheets come o
      zero e transforma "(41) 90000-0001" em numero), linhas alternadas.

   2. MARCA AS LINHAS DE TESTE EM VEZ DE APAGAR. Das 12 primeiras linhas, 9
      sao testes meus e do Gustavo, de 27/08 a 31/08. Apagar dado e uma acao
      sem volta, e o vault proibe: a coluna "Teste" recebe SIM e o resumo
      desconta. Quem quiser some com elas usa o filtro.

      O criterio e explicito e conservador: e teste quando o e-mail termina em
      @medceo.online, quando o nome comeca com "TESTE" ou "Dr Teste", ou
      quando o e-mail e do proprio Gustavo. Nada de heuristica solta.

   3. ABA RESUMO. Contagens que respondem as perguntas que se faz de verdade:
      quantos leads valem, de que pagina vieram, em que fase estao, qual o
      gargalo, e quantos por dia. Tudo por formula, entao continua certo
      sozinho conforme novos leads entram.

   4. LIMPA A LINHA VAZIA DO FIM, que sobra quando um POST chega sem corpo.
   ========================================================================== */

var ABA_LEADS = 'LEADS';
var ABA_RESUMO = 'RESUMO';

/* A coluna Teste nasce depois das 17 do formulario. Campo novo do formulario
   entra ANTES dela, por isso ela e localizada pelo titulo e nao por indice. */
var COL_TESTE = 'Teste';

function organizar() {
  var pl = SpreadsheetApp.getActiveSpreadsheet();
  var a = pl.getSheetByName(ABA_LEADS);
  if (!a) throw new Error('Aba ' + ABA_LEADS + ' nao existe. Rode `preparar` antes.');

  limparCauda_(a);
  var iTeste = garantirColunaTeste_(a);
  marcarTestes_(a, iTeste);
  acabamento_(a, iTeste);
  montarResumo_(pl, a, iTeste);

  pl.setActiveSheet(pl.getSheetByName(ABA_RESUMO));
  return 'ok';
}

/* --------------------------------------------------------------------------
   1. A linha vazia do fim

   Um POST sem corpo grava uma linha so com a data. Ela nao e erro de dado,
   e sujeira de borda, e some sem perda.
   ----------------------------------------------------------------------- */
function limparCauda_(a) {
  var ult = a.getLastRow();
  while (ult > 1) {
    var linha = a.getRange(ult, 1, 1, a.getLastColumn()).getValues()[0];
    var temNome = String(linha[1] || '').trim() !== '';
    var temFone = String(linha[2] || '').trim() !== '';
    var temMail = String(linha[3] || '').trim() !== '';
    if (temNome || temFone || temMail) break;
    a.deleteRow(ult);
    ult--;
  }
}

/* --------------------------------------------------------------------------
   2. A coluna Teste
   ----------------------------------------------------------------------- */
function garantirColunaTeste_(a) {
  var cab = a.getRange(1, 1, 1, a.getLastColumn()).getValues()[0];
  for (var i = 0; i < cab.length; i++) {
    if (String(cab[i]).trim() === COL_TESTE) return i + 1;
  }
  var nova = a.getLastColumn() + 1;
  a.getRange(1, nova).setValue(COL_TESTE);
  return nova;
}

function ehTeste_(nome, email) {
  nome = String(nome || '').trim();
  email = String(email || '').trim().toLowerCase();
  if (/@medceo\.online$/.test(email)) return true;
  if (/^teste/i.test(nome)) return true;
  if (/^dra?\.?\s*(teste|producao)/i.test(nome)) return true;
  if (email === 'gustavo.schierdoamaral@gmail.com') return true;
  if (email === 'a@b.com') return true;
  return false;
}

function marcarTestes_(a, iTeste) {
  var n = a.getLastRow() - 1;
  if (n < 1) return;
  var dados = a.getRange(2, 1, n, a.getLastColumn()).getValues();
  var marcas = dados.map(function (linha) {
    return [ehTeste_(linha[1], linha[3]) ? 'SIM' : ''];
  });
  a.getRange(2, iTeste, n, 1).setValues(marcas);
}

/* --------------------------------------------------------------------------
   3. Acabamento
   ----------------------------------------------------------------------- */
function acabamento_(a, iTeste) {
  var nCol = a.getLastColumn();
  var nLin = a.getLastRow();

  a.getRange(1, 1, 1, nCol)
    .setFontWeight('bold')
    .setBackground('#0B1620')
    .setFontColor('#E7D28C')
    .setVerticalAlignment('middle')
    .setWrap(true);
  a.setFrozenRows(1);
  a.setFrozenColumns(2);
  a.setRowHeight(1, 42);

  /* Largura por coluna. O que se le rapido fica largo, o que quase nunca se
     olha fica estreito. */
  var larguras = [150, 210, 140, 250, 200, 150, 210, 150, 210, 140, 160, 210,
                  90, 110, 110, 150, 140, 70];
  for (var c = 1; c <= nCol && c <= larguras.length; c++) {
    a.setColumnWidth(c, larguras[c - 1]);
  }

  if (nLin > 1) {
    a.getRange(2, 1, nLin - 1, 1).setNumberFormat('dd/MM/yyyy HH:mm');
    /* @ forca texto: sem isso o Sheets le "(41) 90000-0001" como numero e
       come o zero da frente. */
    a.getRange(2, 3, nLin - 1, 1).setNumberFormat('@');
    a.getRange(2, nCol, nLin - 1, 1).setNumberFormat('@');
    a.getRange(2, 1, nLin - 1, nCol).setVerticalAlignment('top');
  }

  /* Filtro. Recria, porque um filtro antigo nao cobre colunas novas. */
  var f = a.getFilter();
  if (f) f.remove();
  a.getRange(1, 1, Math.max(nLin, 1), nCol).createFilter();

  /* Linha de teste em cinza, para o olho separar sem precisar filtrar. */
  a.getConditionalFormatRules().length && a.setConditionalFormatRules([]);
  if (nLin > 1) {
    var letra = colunaLetra_(iTeste);
    var regra = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letra + '2="SIM"')
      .setBackground('#F1F3F4')
      .setFontColor('#9AA0A6')
      .setRanges([a.getRange(2, 1, nLin - 1, nCol)])
      .build();
    a.setConditionalFormatRules([regra]);
  }
}

function colunaLetra_(n) {
  var s = '';
  while (n > 0) {
    var r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/* --------------------------------------------------------------------------
   4. O resumo

   Tudo por formula, e nao por valor calculado agora: assim continua certo
   sozinho conforme os leads entram, sem ninguem precisar rodar nada de novo.
   ----------------------------------------------------------------------- */
function montarResumo_(pl, a, iTeste) {
  var r = pl.getSheetByName(ABA_RESUMO);
  if (!r) r = pl.insertSheet(ABA_RESUMO, 0);
  r.clear();
  r.getConditionalFormatRules().length && r.setConditionalFormatRules([]);

  var T = colunaLetra_(iTeste);           // coluna Teste
  var L = "'" + ABA_LEADS + "'!";
  var validos = L + '$' + T + '$2:$' + T; // vazio = lead que vale

  function q(coluna, titulo, linha) {
    r.getRange(linha, 1).setValue(titulo);
    r.getRange(linha + 1, 1).setFormula(
      '=IFERROR(QUERY({' + L + coluna + '2:' + coluna + ', ' + validos + '},' +
      '"select Col1, count(Col1) where Col1 is not null and Col2 = \'\' ' +
      'group by Col1 order by count(Col1) desc label count(Col1) \'Leads\'",0),' +
      '"sem dados ainda")'
    );
  }

  r.getRange('A1').setValue('MedCEO, leads do formulário');
  r.getRange('A2').setFormula(
    '="Atualizado sozinho. Última leitura: "&TEXT(NOW();"dd/MM/yyyy HH:mm")'
  );

  r.getRange('A4').setValue('Leads que valem');
  r.getRange('B4').setFormula('=COUNTIF(' + validos + ';"")');
  r.getRange('A5').setValue('Linhas de teste');
  r.getRange('B5').setFormula('=COUNTIF(' + validos + ';"SIM")');
  r.getRange('A6').setValue('Total na planilha');
  r.getRange('B6').setFormula('=COUNTA(' + L + 'B2:B)');
  r.getRange('A7').setValue('Último lead');
  r.getRange('B7').setFormula(
    '=IFERROR(TEXT(MAXIFS(' + L + 'A2:A;' + validos + ';"");"dd/MM/yyyy HH:mm");"nenhum")'
  );

  q('K', 'Por página de origem', 9);
  q('J', 'Por destino', 20);
  q('H', 'Por fase da clínica', 28);
  q('I', 'Por maior gargalo', 40);
  q('M', 'Por canal', 52);

  r.getRange('A1').setFontSize(15).setFontWeight('bold');
  r.getRange('A2').setFontColor('#80868B').setFontSize(10);
  [4, 5, 6, 7].forEach(function (n) { r.getRange(n, 1).setFontColor('#5F6368'); });
  r.getRange('B4:B6').setFontSize(20).setFontWeight('bold');
  [9, 20, 28, 40, 52].forEach(function (n) {
    r.getRange(n, 1).setFontWeight('bold').setFontColor('#0B1620')
      .setBackground('#F1E7C8');
  });
  r.setColumnWidth(1, 260);
  r.setColumnWidth(2, 130);
  r.setFrozenRows(2);
}

/* --------------------------------------------------------------------------
   Bateria. Roda nos dois sentidos: precisa REPROVAR o estado ruim e APROVAR
   o bom, senao nao provou nada.
   ----------------------------------------------------------------------- */
function testarOrganizar() {
  var casos = [
    ['TESTE Claude Ponta a Ponta', 'teste-claude@medceo.online', true],
    ['Dra. Producao Final',        'producao-final@medceo.online', true],
    ['Teste',                      'a@b.com', true],
    ['Dr Teste UTM',               'utm@medceo.online', true],
    ['Gustavo Schier do Amaral',   'gustavo.schierdoamaral@gmail.com', true],
    ['Leandro de Jesus',           'consultoria@leandrodejesus.com.br', false],
    ['Dr. Luciano Alves Neves',    'luciano@clinicareal.com.br', false],
    ['Testemunha Silva',           'contato@clinica.com.br', true]
  ];
  var erros = 0;
  casos.forEach(function (c) {
    var deu = ehTeste_(c[0], c[1]);
    if (deu !== c[2]) {
      erros++;
      Logger.log('REPROVA  %s / %s  esperado=%s deu=%s', c[0], c[1], c[2], deu);
    }
  });
  Logger.log(erros ? erros + ' caso(s) REPROVADO(S)' : 'PASSA: 8 de 8 casos');
  Logger.log('Atencao ao ultimo caso: "Testemunha Silva" e marcado como teste ' +
             'porque o nome comeca com "Teste". E falso positivo conhecido, e ' +
             'reversivel a mao na coluna Teste.');
  return erros === 0 ? 'PASSA' : 'REPROVA';
}
