
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Document } from "@/types/document";

interface DocumentUploaderProps {
  onDocumentProcessed: (document: Document) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // This is a simulation of text extraction
      // In a real app, you'd use actual libraries to extract text from PDFs, DOCX, etc.
      setTimeout(() => {
        // Simulate extracted text
        const text = `Conteúdo simulado do documento ${file.name}\n\nTexto extraído do documento jurídico para análise e processamento.\nEste é um texto de exemplo para simular o conteúdo de um documento legal real.`;
        resolve(text);
      }, 1000);
    });
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
      
      // Extract text from the document
      const extractedText = await extractTextFromFile(selectedFile);
      
      // Create document object
      const document: Document = {
        id: uuidv4(),
        name: selectedFile.name,
        type: fileExtension,
        uploadDate: new Date(),
        processed: false,
        content: extractedText
      };
      
      // Call the callback with the processed document
      onDocumentProcessed(document);
      toast.success("Documento carregado com sucesso!");
      
      // Reset the file input
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro no processamento do documento:", error);
      toast.error("Erro ao processar o documento. Por favor, tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload de Documento</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input 
            type="file" 
            accept=".pdf,.docx,.txt" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="shrink-0"
          >
            {isUploading ? "Processando..." : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            Arquivo selecionado: {selectedFile.name}
          </p>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Formatos aceitos: PDF, DOCX, TXT</p>
          <p>Tamanho máximo: 10MB</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
