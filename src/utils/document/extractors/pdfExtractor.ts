
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";
import { isPdfWorkerConfigured, configurePdfWorker } from '../../pdf/pdfWorkerConfig';
import { createLogger } from '../logger';
import { TextExtractionOptions, TextExtractionResult } from '../types';

/**
 * Extrai texto de um arquivo PDF
 * @param file Arquivo PDF
 * @param options Opções de extração de texto
 * @returns Resultado da extração de texto
 */
export const extractTextFromPDF = async (
  file: File, 
  options: TextExtractionOptions = {}
): Promise<TextExtractionResult> => {
  const { timeout = 30000 } = options;
  const logger = createLogger(options);
  
  logger.info(`Iniciando extração de texto do PDF: ${file.name}`);
  
  try {
    // Configuração simplificada e robusta do worker
    if (!isPdfWorkerConfigured()) {
      logger.info("Worker não configurado, configurando...");
      const result = configurePdfWorker({ 
        verbose: false, 
        showToasts: false 
      });
      
      if (!result.success) {
        logger.error("Falha ao configurar worker:", result.error);
        throw new Error("Falha ao configurar processador de PDF. Tente recarregar a página.");
      }
      
      logger.info(`Worker configurado: ${result.workerSrc}`);
    } else {
      logger.info("Worker PDF.js já configurado");
    }
    
    // Carrega arquivo como ArrayBuffer
    logger.info("Carregando arquivo como ArrayBuffer...");
    const arrayBuffer = await file.arrayBuffer();
    logger.info(`ArrayBuffer carregado, tamanho: ${arrayBuffer.byteLength} bytes`);
    
    // Valida ArrayBuffer
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("ArrayBuffer vazio ou inválido");
    }
    
    // Cria tarefa de carregamento do PDF com configuração aprimorada
    logger.info("Criando tarefa de carregamento do PDF...");
    let loadingTask;
    try {
      loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/cmaps/',
        cMapPacked: true,
        disableStream: false,
        disableAutoFetch: true,
        isEvalSupported: true
      });
      logger.info("Tarefa de carregamento do PDF criada com sucesso");
    } catch (pdfError) {
      logger.error("Erro ao criar tarefa de carregamento do PDF", pdfError);
      throw new Error("Falha ao iniciar o carregamento do PDF");
    }
    
    // Aguarda carregamento do PDF com timeout
    logger.info("Aguardando carregamento do PDF...");
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout ao carregar PDF")), timeout)
      )
    ]);
    
    logger.info(`PDF carregado com sucesso. Número de páginas: ${pdfDoc.numPages}`);
    
    // Verifica se o PDF tem páginas
    if (pdfDoc.numPages <= 0) {
      throw new Error("O PDF não contém páginas");
    }
    
    // Extrai texto de todas as páginas
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      logger.info(`Extraindo texto da página ${i}/${pdfDoc.numPages}...`);
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      // Valida conteúdo de texto
      if (!textContent || !textContent.items || !textContent.items.length) {
        logger.warn(`Página ${i}: Nenhum conteúdo de texto encontrado`);
        continue;
      }
      
      // Une itens de texto com espaçamento adequado
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(' ');
        
      fullText += pageText + '\n\n';
      
      // Log de amostra de texto extraído
      if (pageText.length > 0 && options.verbose) {
        logger.info(`Página ${i}: extraídos ${pageText.length} caracteres`);
        logger.info(`Amostra: "${pageText.substring(0, 50)}..."`);
      } else if (pageText.length === 0) {
        logger.warn(`Página ${i}: texto extraído está vazio`);
      }
    }
    
    // Valida texto extraído
    if (!fullText || fullText.trim().length === 0) {
      throw new Error("Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem digitalizada.");
    }
    
    logger.info(`Extração concluída. Total: ${fullText.length} caracteres`);
    
    return {
      success: true,
      text: fullText,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  } catch (error) {
    logger.error("Erro na extração de texto do PDF", error);
    
    // Cria mensagem de erro baseada no tipo de erro
    let errorMessage = "Erro desconhecido";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Adiciona mensagens específicas para erros comuns
      if (errorMessage.includes("Timeout")) {
        errorMessage = "O processamento do PDF demorou muito tempo. O arquivo pode ser muito grande ou complexo.";
      } else if (errorMessage.includes("password")) {
        errorMessage = "Este PDF está protegido por senha e não pode ser processado.";
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("worker")) {
        errorMessage = "Falha ao carregar o processador de PDF. Verifique sua conexão com a internet ou recarregue a página.";
      }
    }
    
    return {
      success: false,
      error: `Falha ao extrair texto do PDF: ${errorMessage}`,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  }
};
