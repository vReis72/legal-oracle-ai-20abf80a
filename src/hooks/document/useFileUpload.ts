
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo para upload.");
      return;
    }
    
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptedFormats = ['pdf', 'docx', 'txt'];
    
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      toast.error("Formato de arquivo não suportado. Por favor, use PDF, DOCX ou TXT.");
      return;
    }

    setIsUploading(true);
    
    try {
      toast.info("Processando documento...");
      
      // Extract text from the document using the refactored utility
      const extractedText = await extractTextFromFile(selectedFile, {
        verbose: true,
        showToasts: true,
        timeout: 60000 // Increased timeout for large documents
      });
      
      // Validate extracted content
      const validation = validateExtractedContent(extractedText, selectedFile.type);
      if (!validation.valid) {
        throw new Error(validation.errorMessage);
      }
      
      const trimmedText = extractedText.trim();
      console.log("Texto extraído e limpo, tamanho:", trimmedText.length, "caracteres");
      console.log("Texto extraído do documento:", trimmedText.substring(0, 300) + "...");
      
      // Create document object
      const document: Document = {
        id: uuidv4(),
        name: selectedFile.name,
        type: fileExtension,
        uploadDate: new Date(),
        processed: false,
        content: trimmedText
      };
      
      console.log("Documento criado com sucesso:", document);
      console.log("ID do documento:", document.id);
      console.log("Nome do documento:", document.name);
      console.log("Tamanho do conteúdo:", document.content?.length || 0);
      
      // Call the callback with the processed document
      onDocumentProcessed(document);
      toast.success("Documento carregado com sucesso!");
      
      // Reset the file input
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro no processamento do documento:", error);
      let errorMessage = "Erro desconhecido";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Erro ao processar o documento: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    selectedFile,
    handleFileChange,
    handleUpload
  };
};
