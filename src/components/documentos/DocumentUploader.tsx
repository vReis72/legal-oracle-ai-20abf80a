
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Document } from "@/types/document";
import { useFileUpload } from "@/hooks/document/useFileUpload";
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker, isPdfWorkerConfigured, preloadPdfWorker } from "@/utils/pdf/pdfWorkerConfig";
import DocumentFilePreview from './DocumentFilePreview';
import { toast } from "sonner";

interface DocumentUploaderProps {
  onDocumentProcessed: (document: Document) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const { isUploading, selectedFile, handleFileChange, handleUpload } = useFileUpload({ 
    onDocumentProcessed 
  });

  const handleNormalUpload = () => handleUpload(false);
  const handleOcrUpload = () => handleUpload(true);

  // Pré-carrega o worker do PDF.js para garantir disponibilidade
  useEffect(() => {
    // Executa várias tentativas para configurar o worker com diferentes estratégias
    const configWorker = async () => {
      console.log("Iniciando pré-carregamento do worker PDF.js...");
      
      // Primeira tentativa com configuração básica
      const workerResult = configurePdfWorker({
        verbose: true,
        showToasts: false, // Evita mostrar toast na primeira tentativa
        useLocalWorker: true // Tenta usar worker local primeiro
      });
      
      if (workerResult.success) {
        console.log("Worker do PDF.js configurado com sucesso:", workerResult.workerSrc);
        if (workerResult.workerSrc === 'fake-worker') {
          console.warn("Usando worker fake. O processamento de PDFs pode ser mais lento.");
          toast.warning("O processador de PDF está operando em modo limitado. Alguns recursos podem ser mais lentos.");
        }
      } else {
        console.error("Primeira tentativa falhou:", workerResult.error);
        
        // Segunda tentativa com CDNs alternativos
        const secondAttempt = configurePdfWorker({
          verbose: true,
          showToasts: false,
          customCdnUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
        });
        
        if (secondAttempt.success) {
          console.log("Segunda tentativa bem-sucedida:", secondAttempt.workerSrc);
        } else {
          console.error("Segunda tentativa falhou:", secondAttempt.error);
          
          // Terceira tentativa com worker fake como último recurso
          const lastAttempt = configurePdfWorker({
            verbose: true,
            showToasts: true
          });
          
          if (!lastAttempt.success) {
            toast.error("Falha ao configurar o processador de PDF. A visualização pode estar comprometida.");
          }
        }
      }
    };
    
    // Inicia configuração do worker
    configWorker();
    
    // Tenta carregar o worker novamente após 2 segundos se a primeira tentativa falhar
    const retryTimeout = setTimeout(() => {
      if (!isPdfWorkerConfigured()) {
        console.log("Tentando recarregar worker após timeout...");
        configWorker();
      }
    }, 2000);
    
    return () => clearTimeout(retryTimeout);
  }, []);

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload de Documento</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input 
            type="file" 
            accept=".pdf,.txt" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="flex gap-2 shrink-0">
            <Button 
              onClick={handleNormalUpload} 
              disabled={!selectedFile || isUploading}
              variant="outline"
            >
              {isUploading ? "Processando..." : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Normal
                </>
              )}
            </Button>
            {selectedFile?.name.endsWith('.pdf') && (
              <Button 
                onClick={handleOcrUpload} 
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Processando..." : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload OCR
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* File preview component */}
        {selectedFile && (
          <div className="mt-4">
            <DocumentFilePreview file={selectedFile} />
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Formatos aceitos: PDF, TXT</p>
          <p>Tamanho máximo: 10MB</p>
          <p><strong>Upload Normal:</strong> Extrai texto primeiro (pode falhar com worker)</p>
          <p><strong>Upload OCR:</strong> Usa OCR nativo do GPT-4o (recomendado para PDFs)</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
