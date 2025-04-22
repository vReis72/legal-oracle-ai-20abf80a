
import { Document } from "@/types/document";
import { UseToastReturn } from "@/hooks/use-toast";

interface UseSetupProcessingTimeoutProps {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  toast: UseToastReturn['toast'];
  upload: { completeUpload: () => void };
  setOrReplaceTimeout: (callback: () => void, ms: number) => void;
}

export const useSetupProcessingTimeout = ({
  setDocuments,
  toast,
  upload,
  setOrReplaceTimeout
}: UseSetupProcessingTimeoutProps) => {
  return (document: Document, uploadInterval: number) => {
    setOrReplaceTimeout(() => {
      console.log('Timeout de segurança acionado');
      clearInterval(uploadInterval);
      upload.completeUpload();

      setDocuments(prev => prev.map(doc =>
        doc.id === document.id
          ? {
              ...doc,
              processed: true,
              summary: "O processamento do documento demorou muito e foi interrompido.",
              content: "O tempo limite para processamento foi excedido. Tente novamente com um documento menor ou em formato texto.",
              highlights: [],
              keyPoints: [{
                title: "Erro no processamento",
                description: "O tempo limite para análise foi excedido."
              }]
            }
          : doc
      ));

      toast({
        variant: "destructive",
        title: "Tempo limite excedido",
        description: "O processamento do documento demorou muito. Tente novamente com um documento menor.",
      });
    }, 45000);
  };
};
