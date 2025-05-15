
import { useState } from 'react';
import { Document } from '@/types/document';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { analyzeWithOpenAI } from '@/services/openaiService';
import { splitTextIntoChunks, parseAnalysisResult } from '@/utils/textProcessing';

export const useDocumentAnalysis = (
  document: Document,
  onAnalysisComplete: (updatedDocument: Document) => void,
  apiKey: string
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Process document through the OpenAI API
  const processDocument = async () => {
    if (!document.content) {
      toast.error("Documento sem conteúdo para análise");
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);
    setAnalysisError(null);

    try {
      console.log("Iniciando análise do documento com conteúdo:", document.content.substring(0, 100) + "...");
      
      let analysisResult = "";
      
      // Check if text needs to be split (over 8000 chars)
      if (document.content.length > 8000) {
        // Split text into manageable chunks
        const chunks = splitTextIntoChunks(document.content);
        setProgress(30);
        
        // Process each chunk
        const chunkResults: string[] = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunkResult = await analyzeWithOpenAI(chunks[i], apiKey);
          chunkResults.push(chunkResult);
          setProgress(30 + ((i + 1) / chunks.length * 40));
        }
        
        // Combine results
        analysisResult = chunkResults.join("\n\n");
        
        // Final analysis of combined results if needed
        if (analysisResult.length > 8000) {
          analysisResult = await analyzeWithOpenAI(analysisResult.substring(0, 8000) + 
            "\n\n[Nota: Este é um resumo de múltiplas partes do documento. Forneça uma análise consolidada.]", apiKey);
        }
      } else {
        // Process the entire document at once
        analysisResult = await analyzeWithOpenAI(document.content, apiKey);
        setProgress(70);
      }

      // Parse the OpenAI response
      setProgress(85);
      
      const { summary, highlights, keyPoints } = parseAnalysisResult(analysisResult);
      
      // Update document with analysis results
      const analyzedDocument: Document = {
        ...document,
        id: document.id || uuidv4(),
        processed: true,
        summary: summary || analysisResult,
        highlights,
        keyPoints
      };
      
      // Complete
      setProgress(100);
      onAnalysisComplete(analyzedDocument);
      toast.success("Análise do documento concluída com sucesso!");
    } catch (error) {
      console.error("Erro na análise do documento:", error);
      setAnalysisError(`Ocorreu um erro durante a análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      toast.error("Erro ao analisar o documento. Por favor, tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    progress,
    analysisError,
    processDocument
  };
};
