
import { Document } from "@/types/document";
import { UseToastReturn } from "@/hooks/use-toast";

interface UseHandleProcessErrorProps {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  upload: { completeUpload: () => void };
  clearTimeout: () => void;
  toast: UseToastReturn['toast'];
}

export const useHandleProcessError = ({
  setDocuments,
  upload,
  clearTimeout,
  toast
}: UseHandleProcessErrorProps) => {
  return (document: Document, error: Error, fileContent?: string) => {
    clearTimeout();
    upload.completeUpload();

    const errorMessage = error.message || "Erro desconhecido no processamento";

    setDocuments(prev => prev.map(doc =>
      doc.id === document.id
        ? {
            ...doc,
            processed: true,
            summary: `Erro no processamento: ${errorMessage}`,
            content: fileContent ? `Conteúdo parcial: ${fileContent.substring(0, 500)}...` : "Conteúdo não disponível",
            highlights: [],
            keyPoints: [{
              title: "Erro de processamento",
              description: errorMessage
            }]
          }
        : doc
    ));

    toast({
      variant: "destructive",
      title: "Erro ao analisar documento",
      description: errorMessage,
    });
  };
};
