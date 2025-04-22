
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for document validation
 * @returns Functions to validate documents
 */
export const useDocumentValidation = () => {
  // Always call the hook directly - this is the proper way to use hooks
  const { toast } = useToast();

  /**
   * Verifies if the file has a valid size
   * @param file File to be validated
   * @returns Boolean indicating if the file is valid
   */
  const validateFileSize = (file: File): boolean => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    // Limite ainda mais reduzido para garantir processamento
    const maxSize = isPdf ? 2 * 1024 * 1024 : 1 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: isPdf 
          ? "Por favor, selecione um PDF menor que 2MB para análise."
          : "Por favor, selecione um arquivo menor que 1MB para análise.",
      });
      return false;
    }
    
    return true;
  };

  /**
   * Verifies if the API key is configured
   * @param isKeyConfigured API key state
   * @returns Boolean indicating if the API key is configured
   */
  const validateApiKey = (isKeyConfigured: boolean): boolean => {
    // Verificamos tanto o contexto quanto o localStorage
    if (!isKeyConfigured) {
      toast({
        variant: "destructive",
        title: "API Key não configurada",
        description: "Configure sua chave da API OpenAI antes de fazer upload de documentos.",
      });
      return false;
    }
    
    return true;
  };

  return {
    validateFileSize,
    validateApiKey
  };
};
