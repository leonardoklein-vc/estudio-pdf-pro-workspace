// =========================================================================
// 1. INICIALIZAÇÃO E ROTEAMENTO DE PÁGINAS
// =========================================================================
function doGet(e) {
  // Verifica se o utilizador está a tentar aceder à página administrativa
  var paginaAcessada = e.parameter.page;
  
  if (paginaAcessada === 'admin') {
    return HtmlService.createTemplateFromFile('Admin').evaluate()
      .setTitle('Painel Geral Admin • SAMIS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  // Rota padrão: Carrega o Estúdio PDF
  var template = HtmlService.createTemplateFromFile('Index');
  template.estudioPdfComponent = PDFPRO.getPdfComponent({
    hostAppName: "Estúdio PDF Pro",
    maxFileSizeMb: 50,
    theme: "modern"
  });
  
  return template.evaluate()
    .setTitle('Estúdio PDF Pro')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function pdfStudioGlobalRouter(action, payload) {
  return PDFPRO.handleApiRequest(action, payload);
}

// =========================================================================
// 2. MOTOR DE MONITORIZAÇÃO EM TEMPO REAL (PROPERTIES SERVICE)
// =========================================================================
/**
 * Regista o ping do utilizador diretamente nas propriedades do Script
 */
function registrarSessaoAtiva(ferramentaAtual) {
  try {
    var email = Session.getActiveUser().getEmail() || "utilizador.anonimo@hcpa.edu.br";
    var agora = new Date().getTime();
    
    var scriptProperties = PropertiesService.getScriptProperties();
    var sessoesAtuaisStr = scriptProperties.getProperty('SESSÕES_ATIVAS') || '{}';
    var sessoes = JSON.parse(sessoesAtuaisStr);
    
    // Atualiza ou insere a atividade do utilizador
    sessoes[email] = {
      timestamp: agora,
      ferramenta: ferramentaAtual
    };
    
    // Limpeza preventiva: remove registos com mais de 2 minutos de inatividade
    for (var usr in sessoes) {
      if (agora - sessoes[usr].timestamp > 120000) {
        delete sessoes[usr];
      }
    }
    
    // Grava de volta no banco interno
    scriptProperties.setProperty('SESSÕES_ATIVAS', JSON.stringify(sessoes));
    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * Lê o banco interno e devolve a lista de quem está online para o painel Admin
 */
function obterUtilizadoresOnline() {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var sessoesAtuaisStr = scriptProperties.getProperty('SESSÕES_ATIVAS') || '{}';
    var sessoes = JSON.parse(sessoesAtuaisStr);
    var agora = new Date().getTime();
    var listaUtilizadores = [];
    
    for (var email in sessoes) {
      // Considera online quem enviou ping nos últimos 90 segundos
      if (agora - sessoes[email].timestamp < 90000) {
        listaUtilizadores.push({
          email: email,
          ferramenta: sessoes[email].ferramenta,
          ultimoPing: new Date(sessoes[email].timestamp).toLocaleTimeString('pt-BR')
        });
      }
    }
    return { success: true, dados: listaUtilizadores };
  } catch(err) {
    return { success: false, error: err.message };
  }
}
