
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Document } from "@/types/document";
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

interface DocumentUploaderProps {
  onDocumentProcessed: (document: Document) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      console.log("Arquivo selecionado:", file.name, "tipo:", file.type, "tamanho:", file.size, "bytes");
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    console.log("Iniciando extração REAL de texto do PDF:", file.name);
    
    try {
      // Carregar o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Carregar o documento PDF
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log(`PDF carregado com ${pdf.numPages} páginas`);
      
      // Extrair texto de todas as páginas
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Unir todos os itens de texto com espaços apropriados
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
          
        fullText += pageText + '\n\n';
        console.log(`Página ${i}: extraídos ${pageText.length} caracteres`);
      }
      
      console.log("Extração real concluída. Total:", fullText.length, "caracteres");
      console.log("Primeiros 200 caracteres do texto real:", fullText.substring(0, 200));
      
      return fullText;
    } catch (error) {
      console.error("Erro ao extrair texto do PDF:", error);
      throw new Error(`Falha ao extrair texto do PDF: ${error}`);
    }
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    // Nota: Extração real de DOCX requereria bibliotecas adicionais
    // Esta é uma função placeholder que notifica o usuário
    toast.error("Extração de texto de arquivos DOCX ainda não implementada");
    throw new Error("Extração de texto de DOCX não implementada");
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log("Iniciando extração REAL de texto do arquivo:", file.name);
    
    // Para arquivos de texto, podemos ler o conteúdo diretamente
    if (file.type === 'text/plain') {
      try {
        console.log("Lendo arquivo de texto real");
        const text = await file.text();
        console.log("Texto real extraído do arquivo TXT, primeiros 100 caracteres:", text.substring(0, 100));
        return text;
      } catch (error) {
        console.error("Erro ao ler arquivo de texto:", error);
        throw new Error("Falha ao ler o arquivo de texto");
      }
    }
    
    // Para PDFs, usar nossa função de extração real
    if (file.type === 'application/pdf') {
      return extractTextFromPDF(file);
    }
    
    // Para DOCX, usar nossa função para DOCX (ainda não implementada)
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return extractTextFromDocx(file);
    }
    
    // Se chegou aqui, o tipo de arquivo não é suportado
    throw new Error(`Formato de arquivo não suportado: ${file.type}`);
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
      
      // Extract text from the document - usando nosso método real
      const extractedText = await extractTextFromFile(selectedFile);
      
      // Verify we have actual content
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error("O texto extraído é muito curto ou vazio. Verifique o documento.");
      }
      
      console.log("Texto extraído do documento:", extractedText.substring(0, 300) + "...");
      console.log("Tamanho total do texto extraído:", extractedText.length, "caracteres");
      
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
      console.log("ID do documento:", document.id);
      console.log("Nome do documento:", document.name);
      console.log("Conteúdo COMPLETO do documento:", document.content?.substring(0, 500) + "...");
      
      // Call the callback with the processed document
      onDocumentProcessed(document);
      toast.success("Documento carregado com sucesso!");
      
      // Reset the file input
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro no processamento do documento:", error);
      toast.error(`Erro ao processar o documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
