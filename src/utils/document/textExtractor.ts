
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";
import { configurePdfWorker } from '../pdf/pdfWorkerConfig';

/**
 * Extrai texto de um arquivo PDF
 * @param file Arquivo PDF a ser processado
 * @returns Texto extraído do PDF
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log("Iniciando extração de texto do PDF:", file.name);
  
  try {
    // Verificar se o worker está configurado, caso contrário configurar
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      console.log("Worker não configurado, tentando configurar novamente...");
      const success = configurePdfWorker();
      if (!success) {
        throw new Error("Não foi possível configurar o worker do PDF.js");
      }
    }
    
    // Carregar o arquivo como ArrayBuffer
    console.log("Carregando arquivo como ArrayBuffer...");
    const arrayBuffer = await file.arrayBuffer();
    console.log("ArrayBuffer carregado, tamanho:", arrayBuffer.byteLength, "bytes");
    
    // Verificar se temos um ArrayBuffer válido
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("ArrayBuffer vazio ou inválido");
    }
    
    // Carregar o documento PDF com manipulação de erro mais explícita
    console.log("Carregando documento PDF...");
    let loadingTask;
    try {
      loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      console.log("Tarefa de carregamento do PDF criada com sucesso");
    } catch (pdfError) {
      console.error("Erro ao criar tarefa de carregamento do PDF:", pdfError);
      throw new Error("Falha ao iniciar o carregamento do PDF");
    }
    
    // Aguardar promessa ser resolvida com timeout
    console.log("Aguardando promessa do PDF ser resolvida...");
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout ao carregar PDF")), 30000)
      )
    ]);
    
    console.log(`PDF carregado com sucesso. Número de páginas: ${pdfDoc.numPages}`);
    
    // Se o PDF não tem páginas, lançar erro
    if (pdfDoc.numPages <= 0) {
      throw new Error("O PDF não contém páginas");
    }
    
    // Extrair texto de todas as páginas
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      console.log(`Extraindo texto da página ${i}...`);
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      // Verificar se o conteúdo é válido
      if (!textContent || !textContent.items || !textContent.items.length) {
        console.warn(`Página ${i}: Nenhum conteúdo de texto encontrado`);
        continue;
      }
      
      // Unir todos os itens de texto com espaços apropriados
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(' ');
        
      fullText += pageText + '\n\n';
      console.log(`Página ${i}: extraídos ${pageText.length} caracteres`);
      
      // Mostrar amostra do texto extraído
      if (pageText.length > 0) {
        console.log(`Amostra do texto da página ${i}: "${pageText.substring(0, 50)}..."`);
      } else {
        console.warn(`Página ${i}: texto extraído está vazio`);
      }
    }
    
    // Verificar se conseguimos extrair algum texto
    if (!fullText || fullText.trim().length === 0) {
      console.error("Nenhum texto extraído do PDF");
      throw new Error("Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem digitalizada.");
    }
    
    console.log("Extração concluída. Total:", fullText.length, "caracteres");
    console.log("Amostra do texto extraído:", fullText.substring(0, 200));
    
    return fullText;
  } catch (error) {
    console.error("Erro detalhado ao extrair texto do PDF:", error);
    
    // Mensagem de erro mais informativa baseada no tipo de erro
    if (error instanceof Error) {
      if (error.message.includes("Timeout")) {
        throw new Error("O processamento do PDF demorou muito tempo. O arquivo pode ser muito grande ou complexo.");
      }
      if (error.message.includes("password")) {
        throw new Error("Este PDF está protegido por senha e não pode ser processado.");
      }
      throw new Error(`Falha ao extrair texto do PDF: ${error.message}`);
    }
    
    throw new Error("Erro desconhecido ao processar o PDF");
  }
};

/**
 * Extrai texto de um arquivo DOCX (não implementado)
 * @param file Arquivo DOCX a ser processado
 */
export const extractTextFromDocx = async (file: File): Promise<string> => {
  // Nota: Extração real de DOCX requereria bibliotecas adicionais
  // Esta é uma função placeholder que notifica o usuário
  toast.error("Extração de texto de arquivos DOCX ainda não implementada");
  throw new Error("Extração de texto de DOCX não implementada");
};

/**
 * Extrai texto de diferentes tipos de arquivo
 * @param file Arquivo a ser processado (PDF, DOCX, TXT)
 * @returns Texto extraído do arquivo
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  console.log("Iniciando extração de texto do arquivo:", file.name);
  
  // Para arquivos de texto, podemos ler o conteúdo diretamente
  if (file.type === 'text/plain') {
    try {
      console.log("Lendo arquivo de texto...");
      const text = await file.text();
      console.log("Texto extraído do arquivo TXT, tamanho:", text.length, "caracteres");
      console.log("Amostra:", text.substring(0, 100));
      return text;
    } catch (error) {
      console.error("Erro ao ler arquivo de texto:", error);
      throw new Error("Falha ao ler o arquivo de texto");
    }
  }
  
  // Para PDFs, usar nossa função de extração melhorada
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file);
  }
  
  // Para DOCX, usar nossa função para DOCX (ainda não implementada)
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDocx(file);
  }
  
  // Se chegou aqui, o tipo de arquivo não é suportado
  throw new Error(`Formato de arquivo não suportado: ${file.type}`);
};
