
import React from 'react';
import { FileUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadProgress: number;
  getStatusMessage?: () => string;
  gptModel: 'gpt-3.5-turbo' | 'gpt-4-turbo';
  setGptModel: (model: 'gpt-3.5-turbo' | 'gpt-4-turbo') => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  onFileUpload, 
  uploading, 
  uploadProgress,
  getStatusMessage = () => {
    if (uploadProgress < 50) return "Enviando documento...";
    if (uploadProgress < 100) return "Processando documento...";
    return "Finalizando análise...";
  },
  gptModel,
  setGptModel
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Análise de Documentos Jurídicos</CardTitle>
        <CardDescription>
          Faça upload de pareceres, autos de infração e licenças para análise automática.<br />
          Aceitamos arquivos PDF, DOCX e TXT.
        </CardDescription>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-3">Tipo de análise:</span>
          <button
            className={cn(
              "px-2 py-1 rounded-md text-xs border",
              gptModel === 'gpt-3.5-turbo' ? "bg-eco-primary text-white border-eco-primary" : "bg-muted"
            )}
            onClick={() => setGptModel('gpt-3.5-turbo')}
            disabled={uploading}
            type="button"
          >
            ⚡ Rápido (GPT-3.5)
          </button>
          <button
            className={cn(
              "px-2 py-1 rounded-md text-xs border",
              gptModel === 'gpt-4-turbo' ? "bg-eco-primary text-white border-eco-primary" : "bg-muted"
            )}
            onClick={() => setGptModel('gpt-4-turbo')}
            disabled={uploading}
            type="button"
          >
            🧠 Profundo (GPT-4)
          </button>
        </div>
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
                  Formatos aceitos: PDF, DOCX, TXT (max. 3MB)
                </p>
                <p className="text-xs text-amber-600 font-medium mt-0.5">
                  Para PDFs, certifique-se que o texto seja selecionável
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
      <CardFooter className="px-6 py-3 bg-muted/20 border-t text-xs text-center text-muted-foreground">
        <div className="w-full">
          <p>Melhor performance: <span className="font-medium">TXT</span> &gt; <span className="font-medium">DOCX</span> &gt; <span className="font-medium">PDF</span></p>
          <p className="mt-1">PDFs podem ter problemas de extração se o texto não for selecionável</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentUploader;
