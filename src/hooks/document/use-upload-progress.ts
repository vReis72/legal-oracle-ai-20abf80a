
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
    
    // Configurar tempo máximo de 2 minutos para PDFs, 1 minuto para outros arquivos
    const maxTime = isPdf ? 120000 : 60000;
    setMaxProgressTime(maxTime);
    
    const interval = window.setInterval(() => {
      // Progresso mais lento para PDFs para dar impressão de processamento mais complexo
      const increment = isPdf ? 1 : 2;
      progress += increment;
      
      // Nunca chega a 100% até o processamento terminar
      // E limitamos a 95% para garantir que o processamento seja visível
      if (progress < 95) {
        setUploadProgress(progress);
      } else {
        // Se já atingiu 95%, vamos garantir que o upload não fica preso
        if (progress >= 200) {
          console.log("Forçando conclusão do upload após tempo limite");
          clearInterval(interval);
          completeUpload();
        }
      }
    }, 200); // Reduzimos a velocidade para dar mais feedback visual
    
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
    }, 800); // Aumentamos para melhor feedback visual
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
    if (uploadProgress < 30) return "Enviando documento...";
    if (uploadProgress < 60) return "Processando documento...";
    if (uploadProgress < 90) return "Analisando conteúdo...";
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
