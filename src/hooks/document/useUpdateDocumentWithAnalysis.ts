
import { Document } from "@/types/document";
import { UseToastReturn } from "@/hooks/use-toast";

interface UseUpdateDocumentWithAnalysisProps {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  toast: UseToastReturn['toast'];
}

export const useUpdateDocumentWithAnalysis = ({
  setDocuments,
  toast
}: UseUpdateDocumentWithAnalysisProps) => {
  return (document: Document, analysis: any) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === document.id
        ? {
            ...doc,
            processed: true,
            content: analysis.content || "Conteúdo não disponível",
            summary: analysis.summary || "Resumo não disponível",
            highlights: analysis.highlights || [],
            keyPoints: analysis.keyPoints || []
          }
        : doc
    ));

    toast({
      variant: "default",
      title: "Documento processado",
      description: analysis.summary?.includes("[Aviso") || analysis.keyPoints?.some((kp: any) => kp.title?.includes("Aviso"))
        ? "O documento foi analisado, mas com algumas limitações."
        : "O documento foi analisado com sucesso.",
    });
  };
};
