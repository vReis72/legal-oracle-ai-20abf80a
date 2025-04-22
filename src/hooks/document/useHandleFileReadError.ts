
import { Document } from "@/types/document";
import { UseToastReturn } from "@/hooks/use-toast";

interface UseHandleFileReadErrorProps {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  upload: { completeUpload: () => void };
  clearTimeout: () => void;
  toast: UseToastReturn['toast'];
}

export const useHandleFileReadError = ({
  setDocuments,
  upload,
  clearTimeout,
  toast
}: UseHandleFileReadErrorProps) => {
  return (document: Document, error: Error) => {
    clearTimeout();
    upload.completeUpload();

    setDocuments(prev => prev.map(doc =>
      doc.id === document.id
        ? {
            ...doc,
            processed: true,
            summary: `Erro ao ler o arquivo: ${error.message}`,
            content: "Não foi possível ler o conteúdo do arquivo.",
            highlights: [],
            keyPoints: [{
              title: "Erro na leitura",
              description: "O arquivo pode estar corrompido ou em um formato não suportado."
            }]
          }
        : doc
    ));

    toast({
      variant: "destructive",
      title: "Erro ao processar documento",
      description: `Não foi possível ler o arquivo: ${error.message}`,
    });
  };
};
