
import { Document } from '@/types/document';

export function setProcessedDocumentAnalysis(
  newDocument: Document,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  analysis: any
) {
  setDocuments(prev => prev.map(doc =>
    doc.id === newDocument.id
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
}
