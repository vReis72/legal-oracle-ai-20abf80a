
import React from 'react';
import { FileUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadProgress: number;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  onFileUpload, 
  uploading, 
  uploadProgress 
}) => {
  // Determinar mensagem de status com base no progresso
  const getStatusMessage = () => {
    if (uploadProgress < 50) return "Enviando documento...";
    if (uploadProgress < 100) return "Processando documento...";
    return "Finalizando análise...";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Análise de Documentos Jurídicos</CardTitle>
        <CardDescription>
          Faça upload de pareceres, autos de infração e licenças para análise automática.
          Para melhores resultados, use arquivos de texto simples (.txt) menor que 2MB.
          Arquivos PDF podem não funcionar corretamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <label 
            htmlFor="file-upload" 
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-all",
              uploading ? "border-primary" : "border-muted"
            )}
          >
            {!uploading ? (
              <>
                <FileUp className="h-10 w-10 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Arraste documentos ou clique para fazer upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos recomendados: TXT (melhor opção), DOCX, PDF* (max. 2MB)
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  *PDFs podem ter resultados imprecisos devido à extração de texto
                </p>
              </>
            ) : (
              <div className="w-full px-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{getStatusMessage()}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {uploadProgress < 100 ? 
                    "Analisando o conteúdo do documento..." : 
                    "Finalizando o processamento..."
                  }
                </p>
              </div>
            )}
            <input 
              id="file-upload" 
              type="file" 
              accept=".pdf,.docx,.txt" 
              className="hidden" 
              onChange={onFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;
