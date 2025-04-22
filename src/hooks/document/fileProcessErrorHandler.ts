
import { Document } from '@/types/document';

export function handleFileReadError(
  newDocument: Document,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  clearIntervalFn: () => void,
  completeUpload: () => void,
  clearTimeoutFn: () => void,
  toast: (args: any) => void,
  isPdf: boolean
) {
  clearIntervalFn();
  completeUpload();
  setDocuments(prev => prev.map(doc =>
    doc.id === newDocument.id
      ? {
          ...doc,
          processed: true,
          summary: "Não foi possível ler o conteúdo do documento.",
          content: "O arquivo pode estar corrompido, protegido ou em um formato não suportado.",
          highlights: [],
          keyPoints: [{
            title: "Erro na leitura",
            description: "Não foi possível extrair texto do documento."
          }]
        }
      : doc
  ));
  clearTimeoutFn();
  toast({
    variant: "default",
    title: "Erro na leitura",
    description: isPdf
      ? "Não foi possível ler o conteúdo do PDF. O arquivo pode estar protegido ou danificado."
      : "Não foi possível ler o conteúdo do arquivo."
  });
}

export function handleProcessError(
  newDocument: Document,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  clearIntervalFn: () => void,
  completeUpload: () => void,
  clearTimeoutFn: () => void,
  fileContent: string | undefined,
  toast: (args: any) => void
) {
  clearIntervalFn();
  completeUpload();
  setDocuments(prev => prev.map(doc =>
    doc.id === newDocument.id
      ? {
          ...doc,
          processed: true,
          summary: "Erro durante a análise do documento",
          content: fileContent?.substring(0, 1000) + "\n\n[Conteúdo truncado devido a erro]" || "Erro no processamento",
          highlights: [],
          keyPoints: [{
            title: "Erro na análise",
            description: "Ocorreu um erro ao analisar o documento. Tente novamente."
          }]
        }
      : doc
  ));
  clearTimeoutFn();
  toast({
    variant: "destructive",
    title: "Erro na análise",
    description: "Não foi possível completar a análise do documento.",
  });
}
