
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para validação de documentos
 * @returns Funções para validar documentos
 */
export const useDocumentValidation = () => {
  const { toast } = useToast();

  /**
   * Verifica se o arquivo tem um tamanho válido
   * @param file Arquivo a ser validado
   * @returns Boolean indicando se o arquivo é válido
   */
  const validateFileSize = (file: File): boolean => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    // Verificar o tamanho do arquivo - limitar a 2MB normalmente, mas permitir PDFs um pouco maiores
    const maxSize = isPdf ? 3 * 1024 * 1024 : 2 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: isPdf 
          ? "Por favor, selecione um PDF menor que 3MB para análise."
          : "Por favor, selecione um arquivo menor que 2MB para análise.",
      });
      return false;
    }
    
    return true;
  };

  /**
   * Verifica se a API key está configurada
   * @param isKeyConfigured Estado da API key
   * @returns Boolean indicando se a API key está configurada
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
