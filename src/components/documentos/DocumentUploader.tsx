import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
import { Document } from "@/types/document";

interface DocumentUploaderProps {
  onDocumentProcessed: (document: Document) => void;
}

// Configuração global do worker do PDF.js
const configurePdfWorker = () => {
  try {
    // Opção 1: Usar CDN com versão específica (mais confiável)
    const pdfWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    console.log(`PDF.js Worker configurado via CDN unpkg: versão ${pdfjsLib.version}`);
    return true;
  } catch (error) {
    console.error("Erro na configuração do worker:", error);
    return false;
  }
};

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workerConfigured, setWorkerConfigured] = useState(false);

  // Configurar o worker do PDF.js quando o componente é montado
  useEffect(() => {
    const success = configurePdfWorker();
    setWorkerConfigured(success);
    
    if (success) {
      console.log("Worker do PDF.js configurado com sucesso na montagem do componente");
    } else {
      console.error("Falha ao configurar worker do PDF.js na montagem do componente");
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      console.log("Arquivo selecionado:", file.name, "tipo:", file.type, "tamanho:", file.size, "bytes");
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    console.log("Iniciando extração de texto do PDF:", file.name);
    
    try {
      if (!workerConfigured) {
        console.log("Worker não configurado, tentando configurar novamente...");
        const success = configurePdfWorker();
        if (!success) {
          throw new Error("Não foi possível configurar o worker do PDF.js");
        }
      }
      
      // Carregar o arquivo como ArrayBuffer
      console.log("Carregando arquivo como ArrayBuffer...");
      const arrayBuffer = await file.arrayBuffer();
      console.log("ArrayBuffer carregado, tamanho:", arrayBuffer.byteLength, "bytes");
      
      // Verificar se temos um ArrayBuffer válido
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error("ArrayBuffer vazio ou inválido");
      }
      
      // Carregar o documento PDF com manipulação de erro mais explícita
      console.log("Carregando documento PDF...");
      let loadingTask;
      try {
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        console.log("Tarefa de carregamento do PDF criada com sucesso");
      } catch (pdfError) {
        console.error("Erro ao criar tarefa de carregamento do PDF:", pdfError);
        throw new Error("Falha ao iniciar o carregamento do PDF");
      }
      
      // Aguardar promessa ser resolvida com timeout
      console.log("Aguardando promessa do PDF ser resolvida...");
      const pdfDoc = await Promise.race([
        loadingTask.promise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout ao carregar PDF")), 30000)
        )
      ]);
      
      console.log(`PDF carregado com sucesso. Número de páginas: ${pdfDoc.numPages}`);
      
      // Se o PDF não tem páginas, lançar erro
      if (pdfDoc.numPages <= 0) {
        throw new Error("O PDF não contém páginas");
      }
      
      // Extrair texto de todas as páginas
      let fullText = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        console.log(`Extraindo texto da página ${i}...`);
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        // Verificar se o conteúdo é válido
        if (!textContent || !textContent.items || !textContent.items.length) {
          console.warn(`Página ${i}: Nenhum conteúdo de texto encontrado`);
          continue;
        }
        
        // Unir todos os itens de texto com espaços apropriados
        const pageText = textContent.items
          .map((item: any) => item.str || "")
          .join(' ');
          
        fullText += pageText + '\n\n';
        console.log(`Página ${i}: extraídos ${pageText.length} caracteres`);
        
        // Mostrar amostra do texto extraído
        if (pageText.length > 0) {
          console.log(`Amostra do texto da página ${i}: "${pageText.substring(0, 50)}..."`);
        } else {
          console.warn(`Página ${i}: texto extraído está vazio`);
        }
      }
      
      // Verificar se conseguimos extrair algum texto
      if (!fullText || fullText.trim().length === 0) {
        console.error("Nenhum texto extraído do PDF");
        throw new Error("Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem digitalizada.");
      }
      
      console.log("Extração concluída. Total:", fullText.length, "caracteres");
      console.log("Amostra do texto extraído:", fullText.substring(0, 200));
      
      return fullText;
    } catch (error) {
      console.error("Erro detalhado ao extrair texto do PDF:", error);
      
      // Mensagem de erro mais informativa baseada no tipo de erro
      if (error instanceof Error) {
        if (error.message.includes("Timeout")) {
          throw new Error("O processamento do PDF demorou muito tempo. O arquivo pode ser muito grande ou complexo.");
        }
        if (error.message.includes("password")) {
          throw new Error("Este PDF está protegido por senha e não pode ser processado.");
        }
        throw new Error(`Falha ao extrair texto do PDF: ${error.message}`);
      }
      
      throw new Error("Erro desconhecido ao processar o PDF");
    }
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    // Nota: Extração real de DOCX requereria bibliotecas adicionais
    // Esta é uma função placeholder que notifica o usuário
    toast.error("Extração de texto de arquivos DOCX ainda não implementada");
    throw new Error("Extração de texto de DOCX não implementada");
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log("Iniciando extração de texto do arquivo:", file.name);
    
    // Para arquivos de texto, podemos ler o conteúdo diretamente
    if (file.type === 'text/plain') {
      try {
        console.log("Lendo arquivo de texto...");
        const text = await file.text();
        console.log("Texto extraído do arquivo TXT, tamanho:", text.length, "caracteres");
        console.log("Amostra:", text.substring(0, 100));
        return text;
      } catch (error) {
        console.error("Erro ao ler arquivo de texto:", error);
        throw new Error("Falha ao ler o arquivo de texto");
      }
    }
    
    // Para PDFs, usar nossa função de extração melhorada
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
      
      // Extract text from the document - usando nosso método melhorado
      const extractedText = await extractTextFromFile(selectedFile);
      
      // Verify we have actual content with mais flexibilidade
      if (!extractedText) {
        throw new Error("Nenhum texto foi extraído do documento. Verifique se o arquivo não está corrompido.");
      }
      
      const trimmedText = extractedText.trim();
      console.log("Texto extraído e limpo, tamanho:", trimmedText.length, "caracteres");
      
      // Ser mais flexível com o limite mínimo de caracteres para PDFs que podem ser digitalizações
      if (trimmedText.length < 10) { // Reduzido de 50 para 10
        throw new Error("O texto extraído é muito curto. O documento pode ser uma digitalização ou imagem.");
      }
      
      console.log("Texto extraído do documento:", trimmedText.substring(0, 300) + "...");
      console.log("Tamanho total do texto extraído:", trimmedText.length, "caracteres");
      
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
