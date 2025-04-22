
import { useToast as useShadcnToast } from '@/hooks/use-toast';

/**
 * Hook para validação de documentos
 */
export const useDocumentValidation = () => {
  // Hook chamado diretamente no corpo do componente (regra do React)
  const { toast } = useShadcnToast();

  /**
   * Verifica se o arquivo tem um tamanho válido
   */
  const validateFileSize = (file: File): boolean => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
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
   * Verifica se a API key está configurada
   */
  const validateApiKey = (isKeyConfigured: boolean): boolean => {
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
