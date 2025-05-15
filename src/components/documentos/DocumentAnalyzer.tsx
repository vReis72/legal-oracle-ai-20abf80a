
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Loader2, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Document } from '@/types/document';
import { toast } from "sonner";

interface DocumentAnalyzerProps {
  document: Document;
  onAnalysisComplete: (updatedDocument: Document) => void;
  apiKey: string;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({ 
  document, 
  onAnalysisComplete,
  apiKey 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Function to split text into chunks if it's too large
  const splitTextIntoChunks = (text: string, chunkSize: number = 7500): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  };

  // Simulated function to analyze document with OpenAI
  const analyzeWithOpenAI = async (text: string): Promise<string> => {
    // This would normally call the OpenAI API
    // For now, we'll simulate a response
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `Resumo gerado para o documento "${document.name}".\n\nEste é um resumo simulado do conteúdo jurídico que seria gerado por uma chamada real à API da OpenAI. O resumo incluiria os principais pontos do documento, análises relevantes e recomendações baseadas no conteúdo.`;
  };

  // Process document through the OpenAI API
  const processDocument = async () => {
    if (!document.content) {
      toast.error("Documento sem conteúdo para análise");
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);

    try {
      let summary = "";
      
      // Check if text needs to be split (over 8000 chars)
      if (document.content.length > 8000) {
        // Split text into manageable chunks
        const chunks = splitTextIntoChunks(document.content);
        setProgress(30);
        
        // Process each chunk
        const chunkSummaries: string[] = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunkSummary = await analyzeWithOpenAI(chunks[i]);
          chunkSummaries.push(chunkSummary);
          setProgress(30 + ((i + 1) / chunks.length * 40));
        }
        
        // Combine summaries
        summary = chunkSummaries.join("\n\n");
        
        // Final summarization of combined summaries if needed
        if (summary.length > 8000) {
          summary = await analyzeWithOpenAI(summary.substring(0, 8000));
        }
      } else {
        // Process the entire document at once
        summary = await analyzeWithOpenAI(document.content);
        setProgress(70);
      }

      // Generate key points and highlights (simulated)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(90);
      
      // Update document with analysis results
      const analyzedDocument: Document = {
        ...document,
        processed: true,
        summary,
        highlights: [
          { text: "Ponto importante 1 do documento", page: 1, importance: "alta" },
          { text: "Ponto importante 2 do documento", page: 2, importance: "média" },
          { text: "Ponto importante 3 do documento", page: 3, importance: "baixa" }
        ],
        keyPoints: [
          { title: "Consideração Principal", description: "Descrição detalhada do ponto principal do documento." },
          { title: "Aspecto Legal Relevante", description: "Análise do aspecto legal mais importante encontrado no texto." },
          { title: "Recomendação", description: "Sugestão baseada na análise do conteúdo do documento." }
        ]
      };
      
      // Complete
      setProgress(100);
      onAnalysisComplete(analyzedDocument);
      toast.success("Análise do documento concluída com sucesso!");
    } catch (error) {
      console.error("Erro na análise do documento:", error);
      toast.error("Erro ao analisar o documento. Por favor, tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        <p className="text-sm text-muted-foreground mt-1">Progresso: {progress}%</p>
      </div>
    );
  };

  const renderAnalysisResults = () => {
    if (!document.processed || !document.summary) return null;

    return (
      <div className="mt-6 space-y-6">
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Análise Concluída
          </h3>
          <p className="text-sm text-muted-foreground">
            O documento foi analisado com sucesso. Veja abaixo os resultados.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Resumo do Documento</h3>
          <p className="whitespace-pre-line">{document.summary}</p>
        </div>

        {document.highlights && document.highlights.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Destaques</h3>
            <ul className="list-disc pl-5 space-y-2">
              {document.highlights.map((highlight, index) => (
                <li key={index}>
                  <span className="font-medium">{highlight.text}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    (Página {highlight.page}, Importância: {highlight.importance})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {document.keyPoints && document.keyPoints.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="key-points">
              <AccordionTrigger>Pontos-Chave</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {document.keyPoints.map((point, index) => (
                    <div key={index} className="border-b pb-2 last:border-b-0">
                      <h4 className="font-medium">{point.title}</h4>
                      <p className="text-sm">{point.description}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {document.name}
        </h2>
        
        {!document.processed && (
          <Button 
            onClick={processDocument} 
            disabled={isAnalyzing || !document.content}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : "Analisar Documento"}
          </Button>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <p>Tipo: {document.type.toUpperCase()}</p>
        <p>Data de Upload: {document.uploadDate.toLocaleDateString()}</p>
      </div>
      
      {document.content && !document.processed && !isAnalyzing && (
        <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-md mb-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <div>
              <h3 className="font-medium text-amber-800">Documento não analisado</h3>
              <p className="text-sm text-amber-700">
                Este documento ainda não foi analisado. Clique no botão "Analisar Documento" para iniciar o processamento.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isAnalyzing && renderProgressBar()}
      
      {renderAnalysisResults()}
    </div>
  );
};

export default DocumentAnalyzer;
