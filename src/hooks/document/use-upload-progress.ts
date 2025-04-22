
import { useState } from 'react';

/**
 * Hook para gerenciar o progresso de upload de arquivos
 * @returns Funções e estados para controlar o progresso de upload
 */
export const useUploadProgress = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadIntervalId, setUploadIntervalId] = useState<number | null>(null);

  /**
   * Simula o progresso de upload com base no tipo de arquivo
   * @param isPdf Se o arquivo é um PDF
   * @returns ID do intervalo para limpeza posterior
   */
  const simulateUploadProgress = (isPdf: boolean) => {
    let progress = 0;
    setUploading(true);
    setUploadProgress(0);
    
    // Limpar qualquer intervalo existente primeiro
    if (uploadIntervalId !== null) {
      clearInterval(uploadIntervalId);
    }
    
    const interval = window.setInterval(() => {
      // Progresso mais lento para PDFs para dar impressão de processamento mais complexo
      const increment = isPdf ? 2 : 3;
      progress += increment;
      
      // Nunca chega a 100% até o processamento terminar
      // E limitamos a 95% para garantir que o processamento seja visível
      if (progress < 95) {
        setUploadProgress(progress);
      }
      
      // Limite de segurança - se ainda estiver rodando após muito tempo,
      // forçamos a conclusão para evitar loop infinito
      if (progress >= 200) {
        console.log("Forçando conclusão do upload após tempo limite");
        clearInterval(interval);
        completeUpload();
      }
    }, 100);
    
    // Armazenar o ID para limpeza posterior
    setUploadIntervalId(interval);
    
    return interval;
  };

  /**
   * Finaliza o progresso de upload
   */
  const completeUpload = () => {
    // Limpar o intervalo se existir
    if (uploadIntervalId !== null) {
      clearInterval(uploadIntervalId);
      setUploadIntervalId(null);
    }
    
    setUploadProgress(100);
    
    // Pequeno delay antes de mostrar como concluído
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
    }, 500);
  };

  /**
   * Cancela o progresso de upload
   */
  const cancelUpload = () => {
    // Limpar o intervalo se existir
    if (uploadIntervalId !== null) {
      clearInterval(uploadIntervalId);
      setUploadIntervalId(null);
    }
    
    setUploading(false);
    setUploadProgress(0);
  };

  /**
   * Retorna o status atual do upload baseado no progresso
   */
  const getStatusMessage = () => {
    if (uploadProgress < 30) return "Enviando documento...";
    if (uploadProgress < 70) return "Processando documento...";
    if (uploadProgress < 100) return "Finalizando análise...";
    return "Análise concluída";
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
