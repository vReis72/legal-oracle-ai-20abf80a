
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
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  // Max retry attempts before giving up
  const MAX_RETRIES = 2;

  // Process document through the OpenAI API
  const processDocument = async () => {
    if (!document.content) {
      toast.error("Documento sem conteúdo para análise");
      return;
    }

    if (!apiKey) {
      setAnalysisError("Chave da API OpenAI não configurada. Configure nas configurações.");
      toast.error("Chave da API OpenAI não configurada");
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);
    setAnalysisError(null);

    try {
      console.log(`Iniciando análise do documento (${document.content.length} caracteres)`);
      
      let analysisResult = "";
      
      // Check if text needs to be split (over 8000 chars)
      if (document.content.length > 8000) {
        // Split text into manageable chunks
        const chunks = splitTextIntoChunks(document.content);
        setProgress(30);
        
        if (chunks.length === 0) {
          throw new Error("Erro ao dividir o documento em partes menores");
        }
        
        // Process each chunk
        const chunkResults: string[] = [];
        for (let i = 0; i < chunks.length; i++) {
          try {
            console.log(`Processando chunk ${i+1} de ${chunks.length} (${chunks[i].length} caracteres)`);
            const chunkResult = await analyzeWithOpenAI(chunks[i], apiKey);
            chunkResults.push(chunkResult);
            setProgress(30 + ((i + 1) / chunks.length * 40));
          } catch (error) {
            console.error(`Erro ao processar chunk ${i+1}:`, error);
            
            // If we've already got some results, continue with what we have
            if (chunkResults.length > 0) {
              toast.warning(`Erro ao processar parte ${i+1} do documento. Continuando com partes já analisadas.`);
              break;
            } else {
              // If this is the first chunk and it failed, we need to throw
              throw error;
            }
          }
        }
        
        // Combine results
        analysisResult = chunkResults.join("\n\n");
        
        // Final analysis of combined results if needed
        if (analysisResult.length > 8000) {
          try {
            console.log("Realizando análise final dos resultados combinados");
            analysisResult = await analyzeWithOpenAI(analysisResult.substring(0, 8000) + 
              "\n\n[Nota: Este é um resumo de múltiplas partes do documento. Forneça uma análise consolidada.]", apiKey);
          } catch (error) {
            console.error("Erro na análise final:", error);
            // Continue with the concatenated results if final analysis fails
            toast.warning("Erro na análise final. Usando resultados parciais combinados.");
          }
        }
      } else {
        // Process the entire document at once
        try {
          analysisResult = await analyzeWithOpenAI(document.content, apiKey);
        } catch (error) {
          console.error("Erro ao analisar documento:", error);
          throw error;
        }
        setProgress(70);
      }

      // Parse the OpenAI response
      setProgress(85);
      
      if (!analysisResult) {
        throw new Error("Análise gerou resultado vazio");
      }
      
      const { summary, highlights, keyPoints, conclusion } = parseAnalysisResult(analysisResult);
      
      if (!summary) {
        console.warn("Processamento não gerou resumo adequado");
        toast.warning("O resumo gerado pode não ser ideal. Verifique os resultados.");
      }
      
      // Update document with analysis results
      const analyzedDocument: Document = {
        ...document,
        id: document.id || uuidv4(),
        processed: true,
        summary: summary || "Não foi possível gerar um resumo adequado para este documento.",
        highlights: highlights.length > 0 ? highlights : [{
          text: "Não foi possível extrair destaques relevantes.",
          page: 1,
          importance: "média"
        }],
        keyPoints: keyPoints.length > 0 ? keyPoints : [{
          title: "Análise Incompleta",
          description: "Não foi possível extrair pontos-chave deste documento."
        }],
        conclusion: conclusion || "Não foi possível gerar uma conclusão para este documento."
      };
      
      // Complete
      setProgress(100);
      onAnalysisComplete(analyzedDocument);
      toast.success("Análise do documento concluída com sucesso!");
    } catch (error) {
      console.error("Erro na análise do documento:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setAnalysisError(errorMessage);
      
      // Handle specific error types
      if (errorMessage.includes("API key")) {
        toast.error("Erro de autenticação na API OpenAI. Verifique sua chave API.");
      } else if (errorMessage.includes("limite") || errorMessage.includes("429")) {
        toast.error("Limite de requisições excedido. Tente novamente mais tarde.");
      } else if (retryAttempts < MAX_RETRIES && 
                (errorMessage.includes("conexão") || 
                 errorMessage.includes("Network") || 
                 errorMessage.includes("500"))) {
        // Auto-retry for connection issues
        setRetryAttempts(prev => prev + 1);
        toast.warning(`Erro de conexão. Tentando novamente (${retryAttempts + 1}/${MAX_RETRIES})...`);
        
        // Wait a moment before retrying
        setTimeout(() => {
          processDocument();
          return; // Exit early since we're retrying
        }, 3000);
      } else {
        toast.error("Erro ao analisar o documento. Por favor, tente novamente.");
      }
    } finally {
      if (retryAttempts >= MAX_RETRIES) {
        setRetryAttempts(0); // Reset retry counter for next attempt
      }
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
