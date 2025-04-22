
import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar o progresso de upload de arquivos
 * @returns Funções e estados para controlar o progresso de upload
 */
export const useUploadProgress = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadIntervalId, setUploadIntervalId] = useState<number | null>(null);
  const [maxProgressTime, setMaxProgressTime] = useState<number>(0);

  // Efeito para garantir que o upload não fica preso
  useEffect(() => {
    // Se estiver carregando, configurar um timeout de segurança
    if (uploading && maxProgressTime > 0) {
      const safetyTimeout = setTimeout(() => {
        console.log("Segurança: forçando conclusão do upload após tempo limite global");
        completeUpload();
      }, maxProgressTime);
      
      // Limpeza ao desmontar
      return () => clearTimeout(safetyTimeout);
    }
  }, [uploading, maxProgressTime]);

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
    
    // Configurar tempo máximo reduzido para 60 segundos para PDFs, 30 segundos para outros arquivos
    const maxTime = isPdf ? 60000 : 30000;
    setMaxProgressTime(maxTime);
    
    // Acelerar o progresso visual para evitar sensação de lentidão
    const interval = window.setInterval(() => {
      // Progresso mais rápido para PDFs e outros documentos
      const increment = isPdf ? 3 : 5;
      progress += increment;
      
      // Nunca chega a 100% até o processamento terminar
      if (progress < 95) {
        setUploadProgress(progress);
      } else if (progress >= 150) {
        // Se já passou muito tempo em 95%, força a conclusão
        console.log("Forçando conclusão do upload após tempo limite");
        clearInterval(interval);
        completeUpload();
      }
    }, 150); // Mais frequente para feedback visual melhor
    
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
    setMaxProgressTime(0);
    
    // Pequeno delay antes de mostrar como concluído
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
    }, 500); // Reduzido para resposta mais rápida
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
    setMaxProgressTime(0);
  };

  /**
   * Retorna o status atual do upload baseado no progresso
   */
  const getStatusMessage = () => {
    if (uploadProgress < 20) return "Enviando documento...";
    if (uploadProgress < 50) return "Processando documento...";
    if (uploadProgress < 80) return "Analisando conteúdo...";
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
