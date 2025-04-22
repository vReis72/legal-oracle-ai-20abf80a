
import { Document } from '@/types/document';
import { processDocument, determineDocumentType } from '@/services/documentService';
import { readFileContent, createTimeoutPromise } from './use-file-reader';
import { useDocumentValidation } from './use-document-validation';
import { useProcessingTimeout } from './use-processing-timeout';

interface UseProcessFileProps {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>;
  toast: ReturnType<typeof import('@/hooks/use-toast').useToast>['toast'];
  upload: ReturnType<typeof import('./use-upload-progress').useUploadProgress>;
  isKeyConfigured: boolean;
}

/**
 * Lógica isolada de processamento de arquivo
 */
export const useProcessFile = ({
  setDocuments,
  setSelectedDocument,
  toast,
  upload,
  isKeyConfigured,
}: UseProcessFileProps) => {
  const { validateFileSize, validateApiKey } = useDocumentValidation();
  const { setOrReplaceTimeout, clear: clearTimeout } = useProcessingTimeout();

  /**
   * Função para processar arquivo
   */
  const processFile = async (file: File) => {
    if (!validateFileSize(file)) return;
    if (!validateApiKey(isKeyConfigured)) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const documentType = determineDocumentType(file.name);
    const uploadInterval = upload.simulateUploadProgress(isPdf);

    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: documentType,
      uploadDate: new Date(),
      processed: false
    };

    setDocuments(prev => [newDocument, ...prev]);
    setSelectedDocument(newDocument);

    // Timeout handler
    setOrReplaceTimeout(() => {
      console.log('Timeout de segurança global acionado');
      clearInterval(uploadInterval);
      upload.completeUpload();
      setDocuments(prev => prev.map(doc =>
        doc.id === newDocument.id
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

    let fileContent: string | undefined;
    try {
      fileContent = await Promise.race([
        readFileContent(file),
        createTimeoutPromise(isPdf ? 30000 : 20000)
      ]);
    } catch (error) {
      console.error("Erro ou timeout na leitura do arquivo:", error);
      clearInterval(uploadInterval);
      upload.completeUpload();
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
      clearTimeout();
      toast({
        variant: "destructive",
        title: "Erro na leitura",
        description: isPdf
          ? "Não foi possível ler o conteúdo do PDF. O arquivo pode estar protegido ou danificado."
          : "Não foi possível ler o conteúdo do arquivo."
      });
      return;
    }

    // Verificação de conteúdo nulo ou mínimo
    if (!fileContent || fileContent.trim().length < 50) {
      console.log("Conteúdo do arquivo muito pequeno ou vazio");
      clearInterval(uploadInterval);
      upload.completeUpload();
      setDocuments(prev => prev.map(doc =>
        doc.id === newDocument.id
          ? {
            ...doc,
            processed: true,
            summary: "Documento vazio ou com conteúdo mínimo",
            content: fileContent || "Sem conteúdo",
            highlights: [],
            keyPoints: [{
              title: "Documento vazio",
              description: isPdf
                ? "O PDF não contém texto extraível. Pode ser uma digitalização sem OCR."
                : "O arquivo não contém texto suficiente para análise."
            }]
          }
          : doc
      ));
      clearTimeout();
      toast({
        variant: "default",
        title: "Documento sem conteúdo",
        description: isPdf
          ? "O PDF parece não conter texto extraível. Verifique se é uma digitalização sem OCR."
          : "O arquivo contém muito pouco texto para análise."
      });
      return;
    }

    const limitedContent = fileContent.length > 10000
      ? fileContent.substring(0, 10000)
      : fileContent;

    try {
      const analysis = await processDocument(limitedContent, file.name, documentType);
      clearTimeout();
      clearInterval(uploadInterval);
      upload.completeUpload();
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

      toast({
        title: "Documento processado",
        description: isPdf && (analysis.summary?.includes("PDF") || analysis.keyPoints?.some(kp => kp.title?.includes("PDF")))
          ? "O PDF foi analisado, mas com algumas limitações na extração de texto."
          : "O documento foi analisado com sucesso.",
      });
    } catch (error) {
      console.error("Erro no processamento:", error);
      clearInterval(uploadInterval);
      upload.completeUpload();
      setDocuments(prev => prev.map(doc =>
        doc.id === newDocument.id
          ? {
              ...doc,
              processed: true,
              summary: "Erro durante a análise do documento",
              content: limitedContent.substring(0, 1000) + "\n\n[Conteúdo truncado devido a erro]",
              highlights: [],
              keyPoints: [{
                title: "Erro na análise",
                description: "Ocorreu um erro ao analisar o documento. Tente novamente."
              }]
            }
          : doc
      ));
      clearTimeout();
      toast({
        variant: "destructive",
        title: "Erro na análise",
        description: "Não foi possível completar a análise do documento.",
      });
    }
  };

  return { processFile };
};
