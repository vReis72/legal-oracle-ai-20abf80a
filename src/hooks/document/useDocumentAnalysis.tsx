
import { useState } from 'react';
import { Document } from '@/types/document';
import { useDocumentAnalysisState } from './useDocumentAnalysisState';
import { 
  validateDocumentAndApiKey, 
  processLargeDocument, 
  processSmallDocument, 
  handleProcessingError, 
  createAnalyzedDocument,
  ProcessorState 
} from './processors';

/**
 * Hook para análise de documentos com OpenAI
 * 
 * @param document Documento a ser analisado
 * @param onAnalysisComplete Callback chamado quando a análise é concluída
 * @param apiKey Chave da API OpenAI
 * @returns Hook para gerenciar o estado e análise de documentos
 */
export const useDocumentAnalysis = (
  document: Document,
  onAnalysisComplete: (analyzedDocument: Document) => void,
  apiKey: string | null
) => {
  const [documentContent] = useState<string>(document.content || '');
  const {
    isAnalyzing,
    setIsAnalyzing,
    progress,
    setProgress,
    analysisError,
    setAnalysisError,
    retryAttempts,
    setRetryAttempts,
    MAX_RETRIES
  } = useDocumentAnalysisState();
  
  /**
   * Processa o documento utilizando a API OpenAI
   */
  const processDocument = async () => {
    if (!apiKey) {
      setAnalysisError("Chave da API OpenAI não configurada. Configure nas configurações.");
      return;
    }
    
    // Reset previous error state
    setAnalysisError(null);
    setIsAnalyzing(true);
    setProgress(10);
    
    try {
      // Validates document content and API key
      if (!validateDocumentAndApiKey(document, apiKey, setAnalysisError)) {
        setIsAnalyzing(false);
        return;
      }
      
      console.log("Iniciando análise do documento");
      console.log(`Conteúdo do documento: ${documentContent.substring(0, 200)}...`);
      console.log(`Tamanho do conteúdo: ${documentContent.length} caracteres`);
      
      let analysisResult;
      
      // Determine which processing method to use based on content length
      if (documentContent.length > 4000) {
        console.log("Documento grande detectado. Iniciando processamento em partes...");
        analysisResult = await processLargeDocument(documentContent, apiKey, setProgress);
      } else {
        console.log("Documento pequeno. Processando de uma vez...");
        analysisResult = await processSmallDocument(documentContent, apiKey, setProgress);
      }
      
      setProgress(90);
      console.log("Análise concluída com sucesso");
      
      // Creates an updated document with analysis results
      const updatedDocument = createAnalyzedDocument(document, analysisResult);
      
      // Finishes the process and calls the completion callback
      setProgress(100);
      setIsAnalyzing(false);
      onAnalysisComplete(updatedDocument);
    } catch (error) {
      // Handle error processing using the dedicated function
      const processorState: ProcessorState = {
        setIsAnalyzing, 
        setProgress, 
        setAnalysisError,
        retryAttempts,
        setRetryAttempts,
        MAX_RETRIES
      };
      handleProcessingError(error, processorState, processDocument);
    }
  };
  
  return {
    isAnalyzing,
    progress,
    analysisError,
    processDocument
  };
};
