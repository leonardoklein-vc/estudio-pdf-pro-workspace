/**
 * @Namespace PDFPRO
 * @Version 12.3.0 - Production Ready (PRO) - Otimizado e Corrigido
 * Controller central do ecossistema do Estúdio PDF.
 */

var PDF_SERVER_CONTEXT = {
  LIBRARY_NAME: "Lib_PDF_Manager",
  DEFAULT_CONFIG: {
    hostAppName: "Estúdio PDF Core",
    maxFileSizeMb: 35,
    allowedMimeTypes: ["application/pdf"],
    enableDriveSync: true,
    debugMode: false,
    theme: "modern",
    destinationFolderId: null // Opcional: ID da pasta onde salvar
  }
};

function doGet(e) {
  // Verifica se o pedido é para o modo pdf standalone
  if (e.parameter && e.parameter.mode === 'pdf') {
    return HtmlService.createTemplateFromFile('pdf_standalone')
      .evaluate()
      .setTitle('Estúdio PDF')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function getPdfComponent(customConfig) {
  var config = _mergeConfiguration(customConfig);
  try {
    var uiTemplate  = HtmlService.createTemplateFromFile('pdf_ui');
    var jsTemplate  = HtmlService.createTemplateFromFile('pdf_script');
    var cssContent  = HtmlService.createHtmlOutputFromFile('pdf_style').getContent();
    
    uiTemplate.config = config;
    jsTemplate.config = config;
    
    // 1. UI com escopo
    var uiCompiled = '<div class="estudio-pdf-scope">' + uiTemplate.evaluate().getContent() + '</div>';
    
    // 2. JS puro
    var jsCompiled = jsTemplate.evaluate().getContent();
    
    // 3. Ponte
    var clientBridge = "<script>window.PDF_STUDIO_CONFIG = " + JSON.stringify(config) + ";</script>";
    
    // 4. Retorno final limpo
    return cssContent + uiCompiled + clientBridge + jsCompiled;
    
  } catch (error) {
    _logCriticalError("getPdfComponent", error);
    return _renderFallbackUI(error);
  }
}

// 🟢 ENTRADA DO FRONT-END (Roteador Global)
function pdfStudioGlobalRouter(action, payload) {
  return handleApiRequest(action, payload);
}

/**
 * Roteador central de requisições vindo do front-end
 */
function handleApiRequest(action, payload) {
  try {
    if (!action) throw new Error("Ação de API não especificada.");
    
    switch (action) {
      case "SAVE_PDF_TO_DRIVE":  
        return _apiSavePdfToDrive(payload);
        
      case "CONVERT_PDF_OFFICE": 
        return _apiConvertPdfToOffice(payload); // PDF -> Word
        
      case "CONVERT_TO_PDF":     
        return _apiConvertFileToPdf(payload);   // Word/Excel/Img -> PDF
        
      case "LOG_CLIENT_METRICS": 
        return { success: true };
        
      default: 
        throw new Error("Ação desconhecida: " + action);
    }
  } catch (error) {
    console.error("Erro em handleApiRequest [" + action + "]:", error);
    return { success: false, error: error.message || error.toString() };
  }
}

/* ==========================================================================
   MÉTODOS PRIVADOS DA API
   ========================================================================== */

function _mergeConfiguration(customConfig) {
  var activeConfig = {};
  for (var key in PDF_SERVER_CONTEXT.DEFAULT_CONFIG) activeConfig[key] = PDF_SERVER_CONTEXT.DEFAULT_CONFIG[key];
  if (customConfig && typeof customConfig === 'object') {
    for (var prop in customConfig) if (customConfig.hasOwnProperty(prop)) activeConfig[prop] = customConfig[prop];
  }
  return activeConfig;
}

function _apiSavePdfToDrive(payload) {
  if (!payload.base64Data) throw new Error("Parâmetro 'base64Data' ausente.");
  var fileName = payload.fileName || "Export_" + new Date().getTime() + ".pdf";
  var base64Clean = payload.base64Data.split(",")[1] || payload.base64Data;
  var blob = Utilities.newBlob(Utilities.base64Decode(base64Clean), "application/pdf", fileName);
  
  var targetFolder = payload.folderId ? DriveApp.getFolderById(payload.folderId) : DriveApp.getRootFolder();
  var createdFile = targetFolder.createFile(blob);
  
  return { success: true, fileId: createdFile.getId(), fileUrl: createdFile.getUrl(), fileName: createdFile.getName() };
}

/**
 * 🟢 CORRIGIDO: Converte PDF para Office (Apenas DOCX suportado via OCR do Google)
 */
function _apiConvertPdfToOffice(payload) {
  if (!payload.fileData) throw new Error("Parâmetro 'fileData' ausente.");
  
  var format = payload.format; 
  var fileName = payload.fileName || 'Documento_Convertido';
  var base64Clean = payload.fileData.split(",")[1] || payload.fileData;
  
  var pdfBlob = Utilities.newBlob(Utilities.base64Decode(base64Clean), 'application/pdf', fileName + '.pdf');

  if (format === 'docx') {
    // 1. Envia para o Drive forçando a conversão com OCR para Documento Google
    var resource = {
      title: 'TEMP_CONV_' + fileName,
      mimeType: 'application/vnd.google-apps.document'
    };
    
    // ATENÇÃO: A API Advanced Drive (Drive.Files) deve estar ativada nos Serviços do Apps Script!
    var tempFile = Drive.Files.insert(resource, pdfBlob);
    var tempDocId = tempFile.id;

    // 2. Faz o download do arquivo no formato Word (.docx) usando UrlFetchApp
    var exportUrl = "https://docs.google.com/feeds/download/documents/export/Export?id=" + tempDocId + "&exportFormat=docx";
    var options = {
      headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(exportUrl, options);
    var docxBlob = response.getBlob();

    // 3. Limpeza definitiva
    Drive.Files.remove(tempDocId);

    // 4. Retorna para o Front
    return {
      success: true,
      fileBase64: Utilities.base64Encode(docxBlob.getBytes()),
      extension: 'docx'
    };
  } else {
    return {
      success: false,
      error: "O Google converte nativamente apenas para Word (DOCX). Formato " + format.toUpperCase() + " não suportado nesta versão."
    };
  }
}

/**
 * 🟢 CORRIGIDO: Converte Word/Excel/PowerPoint/Imagens para PDF
 */
function _apiConvertFileToPdf(payload) {
  if (!payload.fileData) throw new Error("Parâmetro 'fileData' ausente.");
  
  var base64Clean = payload.fileData.split(",")[1] || payload.fileData;
  var fileName = payload.fileName.toLowerCase();
  
  var sourceMime = 'application/octet-stream';
  var targetGoogleMime = 'application/vnd.google-apps.document'; // Padrão para Word e Imagens
  
  // Mapeamento correto de MimeTypes
  if (fileName.indexOf('.doc') > -1 || fileName.indexOf('.docx') > -1) {
    sourceMime = fileName.indexOf('.docx') > -1 ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/msword';
    targetGoogleMime = 'application/vnd.google-apps.document';
  } 
  else if (fileName.indexOf('.xls') > -1 || fileName.indexOf('.xlsx') > -1) {
    sourceMime = fileName.indexOf('.xlsx') > -1 ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/vnd.ms-excel';
    targetGoogleMime = 'application/vnd.google-apps.spreadsheet'; // 🟢 Agora Planilhas não quebram
  } 
  else if (fileName.indexOf('.ppt') > -1 || fileName.indexOf('.pptx') > -1) {
    sourceMime = fileName.indexOf('.pptx') > -1 ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/vnd.ms-powerpoint';
    targetGoogleMime = 'application/vnd.google-apps.presentation'; // 🟢 Agora Apresentações não quebram
  } 
  else if (fileName.indexOf('.jpg') > -1 || fileName.indexOf('.jpeg') > -1) {
    sourceMime = 'image/jpeg';
  } 
  else if (fileName.indexOf('.png') > -1) {
    sourceMime = 'image/png';
  }

  var blob = Utilities.newBlob(Utilities.base64Decode(base64Clean), sourceMime, payload.fileName);
  
  // Converte para o Workspace correspondente
  var file = Drive.Files.insert({
    title: 'TEMP_CONV_' + payload.fileName,
    mimeType: targetGoogleMime 
  }, blob);
  
  // Extrai o PDF nativo
  var pdfBlob = DriveApp.getFileById(file.id).getAs('application/pdf');
  
  // Limpeza Permanente
  Drive.Files.remove(file.id);
  
  return { 
    success: true, 
    fileBase64: Utilities.base64Encode(pdfBlob.getBytes()) 
  };
}

function _logCriticalError(methodName, error) { 
  console.error("Lib_PDF_Manager Erro [" + methodName + "]: " + error); 
}

function _renderFallbackUI(error) {
  return "<div style='padding:20px; background:#fef2f2; border:1px solid #fee2e2; border-radius:8px; color:#991b1b;'>" +
         "<strong>Erro na Lib PDF:</strong> " + error.toString() + "</div>";
}
