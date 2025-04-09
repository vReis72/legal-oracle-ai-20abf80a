
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
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Análise de Documentos Ambientais</CardTitle>
        <CardDescription>
          Faça upload de pareceres, autos de infração e licenças para análise automática.
          Para melhores resultados, use arquivos de texto de até 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <label 
            htmlFor="file-upload" 
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-all",
              uploading && "border-eco-primary"
            )}
          >
            {!uploading ? (
              <>
                <FileUp className="h-10 w-10 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Arraste documentos ou clique para fazer upload</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT (max. 5MB)</p>
              </>
            ) : (
              <div className="w-full px-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadProgress < 100 ? "Enviando documento..." : "Analisando documento..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                {uploadProgress === 100 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Estamos analisando seu documento. Isso pode levar até 45 segundos.
                  </p>
                )}
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
