
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, FileType, FileText, AlertCircle } from "lucide-react";
import DocumentReader from '@/components/documentos/DocumentReader';
import ApiKeyCheck from '@/components/shared/ApiKeyCheck';

const Documentos = () => {
  return (
    <ApiKeyCheck>
      <div className="eco-container">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Análise de Documentos</h1>
          <p className="text-muted-foreground">
            Carregue e analise pareceres, autos de infração e documentos jurídicos
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Alert variant="default" className="bg-blue-50 border-blue-200 h-full">
            <FileText className="h-4 w-4 text-blue-500" />
            <AlertTitle>Recomendações para PDFs</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 text-sm mt-1">
                <li>Use PDFs criados digitalmente (não escaneados)</li>
                <li><strong>Certifique-se que o texto seja selecionável</strong></li>
                <li>Evite PDFs com proteção ou criptografia</li>
                <li>PDFs gerados diretamente de fontes digitais têm melhor desempenho</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <Alert variant="default" className="bg-amber-50 border-amber-200 h-full">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Problemas com PDFs?</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 text-sm mt-1">
                <li>PDFs escaneados como imagens não são processáveis</li>
                <li>Verifique se consegue selecionar o texto do seu PDF</li>
                <li>Documentos com OCR podem ter qualidade variável</li>
                <li>Em caso de erro, tente converter para DOCX antes de enviar</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <Alert variant="default" className="bg-green-50 border-green-200 h-full">
            <FileType className="h-4 w-4 text-green-500" />
            <AlertTitle>Formatos recomendados</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">Para melhores resultados use arquivos nos formatos:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-green-100 px-2 py-1 rounded text-xs">TXT (melhor performance)</span>
                <span className="bg-green-100 px-2 py-1 rounded text-xs">DOCX</span>
                <span className="bg-green-100 px-2 py-1 rounded text-xs">PDF com texto selecionável</span>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        
        <DocumentReader />
      </div>
    </ApiKeyCheck>
  );
};

export default Documentos;
