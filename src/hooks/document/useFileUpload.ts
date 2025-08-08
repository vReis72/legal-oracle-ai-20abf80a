
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Document } from '@/types/document';
import { extractTextFromFile } from '@/utils/document/textExtractor';
import { validateExtractedContent } from '@/utils/document/validation';

interface UseFileUploadProps {
  onDocumentProcessed: (document: Document) => void;
}

export const useFileUpload = ({ onDocumentProcessed }: UseFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      console.log("Arquivo selecionado:", file.name, "tipo:", file.type, "tamanho:", file.size, "bytes");
    }
  };

  const handleUpload = async (processImages: boolean = false) => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo para upload.");
      return;
    }
    
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptedFormats = ['pdf', 'txt'];
    
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      toast.error("Formato de arquivo não suportado. Por favor, use PDF ou TXT.");
      return;
    }

    // Limite de tamanho para evitar travamentos
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
      return;
    }

    setIsUploading(true);
    
    try {
      let extractedText = "";
      let originalFileData: string | undefined = undefined;
      
      if (processImages && fileExtension === 'pdf') {
        toast.info("Carregando PDF para análise híbrida (texto + imagens)...");
        
        // First extract text normally
        extractedText = await extractTextFromFile(selectedFile, {
          verbose: false,
          showToasts: false,
          timeout: 30000
        });
        
        // Then prepare for image analysis
        if (selectedFile.size < 5 * 1024 * 1024) { // 5MB limite para base64
          originalFileData = await fileToBase64(selectedFile);
        }
        
        console.log("PDF preparado para análise híbrida");
      } else {
        toast.info("Processando documento...");
        
        extractedText = await extractTextFromFile(selectedFile, {
          verbose: false, // Reduzir logs
          showToasts: false, // Evitar múltiplos toasts
          timeout: 30000 // Timeout menor
        });
        
        const validation = validateExtractedContent(extractedText, selectedFile.type);
        if (!validation.valid) {
          throw new Error(validation.errorMessage);
        }
      }
      
      const trimmedText = extractedText.trim();
      console.log("Texto processado, tamanho:", trimmedText.length, "caracteres");
      
      const document: Document = {
        id: uuidv4(),
        name: selectedFile.name,
        type: fileExtension,
        uploadDate: new Date(),
        processed: false,
        content: trimmedText,
        processImages,
        ...(originalFileData && { originalFileData })
      };
      
      console.log("Documento criado:", document.id, document.name);
      
      onDocumentProcessed(document);
      toast.success(processImages ? "PDF carregado para análise híbrida!" : "Documento carregado com sucesso!");
      
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro no processamento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao processar o documento: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return {
    isUploading,
    selectedFile,
    handleFileChange,
    handleUpload
  };
};
