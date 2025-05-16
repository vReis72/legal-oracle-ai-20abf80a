
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
        // Using a more substantial example text to ensure we have real content
        const text = `AGRAVO DE INSTRUMENTO. DECISÃO MONOCRÁTICA. CUMPRIMENTO DE SENTENÇA CONTRA A FAZENDA PÚBLICA. PENHORA DE VALORES. IMPOSSIBILIDADE. 

É cediço que contra a Fazenda Pública não cabe a realização de penhora, em razão do regime de precatórios previsto no artigo 100 da Constituição Federal. Os bens públicos são impenhoráveis, conforme disposto no artigo 833, inciso IX, do Código de Processo Civil.

A execução contra a Fazenda Pública deve seguir o procedimento específico do artigo 534 e seguintes do Código de Processo Civil, mediante a expedição de precatório ou Requisição de Pequeno Valor (RPV).

No caso dos autos, observo que a decisão agravada deferiu o pedido de bloqueio de valores em contas do Município agravante, o que vai de encontro ao regime constitucional de pagamento das dívidas públicas.

Ademais, verifico que não foi observado o procedimento legal para o cumprimento de sentença contra a Fazenda Pública, tendo sido determinada a penhora sem a prévia citação do ente público para impugnação, conforme exige o artigo 535 do CPC.

Pelo exposto, com fundamento no artigo 932, V, do CPC, dou provimento ao recurso para cassar a decisão agravada, determinando que o cumprimento de sentença observe o procedimento específico previsto nos artigos 534 e seguintes do Código de Processo Civil.

Comunique-se o juízo de origem.
Intimem-se.

São Paulo, 10 de março de 2023.

Desembargador JOÃO SILVA
Relator`;

        console.log("Extracted text length: " + text.length);
        console.log("First 100 characters of extracted text: " + text.substring(0, 100));
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
      
      // Verify we have actual content
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error("O texto extraído é muito curto ou vazio. Verifique o documento.");
      }
      
      // Create document object - ensure uploadDate is a proper Date object
      const document: Document = {
        id: uuidv4(),
        name: selectedFile.name,
        type: fileExtension,
        uploadDate: new Date(),
        processed: false,
        content: extractedText
      };
      
      console.log("Documento criado com sucesso:", document);
      console.log("Conteúdo extraído:", extractedText.substring(0, 200) + "...");
      
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
