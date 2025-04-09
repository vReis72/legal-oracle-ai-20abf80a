
import { useState } from 'react';

/**
 * Hook para gerenciar o progresso de upload de arquivos
 * @returns Funções e estados para controlar o progresso de upload
 */
export const useUploadProgress = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Simula o progresso de upload com base no tipo de arquivo
   * @param isPdf Se o arquivo é um PDF
   * @returns ID do intervalo para limpeza posterior
   */
  const simulateUploadProgress = (isPdf: boolean) => {
    let progress = 0;
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      // Progresso mais lento para PDFs para dar impressão de processamento mais complexo
      const increment = isPdf ? 3 : 5;
      progress += increment;
      setUploadProgress(Math.min(progress, 99)); // Não chega a 100% até o processamento terminar
      
      if (progress >= 99) {
        clearInterval(interval);
      }
    }, 100);
    
    return interval;
  };

  /**
   * Finaliza o progresso de upload
   */
  const completeUpload = () => {
    setUploadProgress(100);
    
    // Pequeno delay antes de mostrar como concluído
    setTimeout(() => {
      setUploading(false);
    }, 500);
  };

  /**
   * Cancela o progresso de upload
   */
  const cancelUpload = () => {
    setUploading(false);
    setUploadProgress(0);
  };

  /**
   * Retorna o status atual do upload baseado no progresso
   */
  const getStatusMessage = () => {
    if (uploadProgress < 50) return "Enviando documento...";
    if (uploadProgress < 100) return "Processando documento...";
    return "Finalizando análise...";
  };

  return {
    uploading,
    uploadProgress,
    simulateUploadProgress,
    completeUpload,
    cancelUpload,
    getStatusMessage
  };
};
