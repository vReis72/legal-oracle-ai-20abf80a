
import { useState } from 'react';
import { Document } from '@/types/document';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { analyzeWithOpenAI } from '@/services/openai/documentAnalysis';
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
    if (!document || !document.id) {
      toast.error("Documento inválido");
      return;
    }
    
    if (!document.content) {
      toast.error("Documento sem conteúdo para análise");
      setAnalysisError("Documento não contém texto para análise. Verifique o arquivo.");
      return;
    }

    if (document.content.trim().length < 50) {
      toast.error("Texto do documento é muito curto para uma análise significativa");
      setAnalysisError("Conteúdo do documento insuficiente para análise (menos de 50 caracteres).");
      return;
    }

    if (!apiKey) {
      setAnalysisError("Chave da API OpenAI não configurada. Configure nas configurações.");
      toast.error("Chave da API OpenAI não configurada");
      return;
    }

    // Reset states
    setIsAnalyzing(true);
    setProgress(10);
    setAnalysisError(null);

    try {
      console.log(`Iniciando análise do documento (${document.content.length} caracteres)`);
      console.log(`Amostra do conteúdo: "${document.content.substring(0, 150)}..."`);
      
      let analysisResult = "";
      
      // Check if text needs to be split (over 8000 chars)
      if (document.content.length > 8000) {
        // Split text into manageable chunks
        const chunks = splitTextIntoChunks(document.content);
        console.log(`Documento dividido em ${chunks.length} partes para processamento`);
        setProgress(20);
        
        if (chunks.length === 0) {
          throw new Error("Erro ao dividir o documento em partes menores");
        }
        
        // Process each chunk
        const chunkResults: string[] = [];
        for (let i = 0; i < chunks.length; i++) {
          try {
            console.log(`Processando parte ${i+1} de ${chunks.length} (${chunks[i].length} caracteres)`);
            console.log(`Primeiros 100 caracteres do chunk ${i+1}: "${chunks[i].substring(0, 100)}..."`);
            const chunkResult = await analyzeWithOpenAI(chunks[i], apiKey);
            chunkResults.push(chunkResult);
            setProgress(30 + ((i + 1) / chunks.length * 40));
          } catch (error) {
            console.error(`Erro ao processar parte ${i+1}:`, error);
            
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
        console.log("Análises de partes combinadas com sucesso");
        console.log(`Resultado combinado tem ${analysisResult.length} caracteres`);
        
        // Final analysis of combined results if needed
        if (chunkResults.length > 1) {
          try {
            console.log("Realizando análise final dos resultados combinados");
            setProgress(75);
            analysisResult = await analyzeWithOpenAI(
              "Este é um resumo de múltiplas partes de um documento. Por favor forneça uma análise consolidada:\n\n" +
              analysisResult.substring(0, 7500), 
              apiKey
            );
            console.log(`Análise final tem ${analysisResult.length} caracteres`);
          } catch (error) {
            console.error("Erro na análise final:", error);
            // Continue with the concatenated results if final analysis fails
            toast.warning("Erro na análise final. Usando resultados parciais combinados.");
          }
        }
      } else {
        // Process the entire document at once
        try {
          console.log("Enviando documento completo para análise");
          console.log(`Texto para análise: ${document.content.substring(0, 200)}...`);
          setProgress(40);
          analysisResult = await analyzeWithOpenAI(document.content, apiKey);
          console.log(`Análise completa tem ${analysisResult.length} caracteres`);
          setProgress(75);
        } catch (error) {
          console.error("Erro ao analisar documento:", error);
          throw error;
        }
      }

      // Parse the OpenAI response
      setProgress(85);
      
      if (!analysisResult) {
        throw new Error("Análise gerou resultado vazio");
      }
      
      console.log("Processando resposta da análise...");
      console.log("Resposta completa recebida:", analysisResult);
      
      const { summary, keyPoints, conclusion } = parseAnalysisResult(analysisResult);
      
      // Log the parsed results for debugging
      console.log("Resumo extraído:", summary);
      console.log("Pontos-chave extraídos:", JSON.stringify(keyPoints, null, 2));
      console.log("Conclusão extraída:", conclusion);
      
      if (!summary) {
        console.warn("Processamento não gerou resumo adequado");
        toast.warning("O resumo gerado pode não ser ideal. Verifique os resultados.");
      }
      
      // Update document with analysis results
      const analyzedDocument: Document = {
        ...document,
        id: document.id || uuidv4(),
        processed: true,
        summary: summary || "Não foi possível gerar um resumo para este documento. O conteúdo pode não ser adequado para análise.",
        keyPoints: keyPoints.length > 0 ? keyPoints : [{
          title: "Análise Insuficiente",
          description: "Não foi possível extrair pontos-chave deste documento. O conteúdo pode não conter pontos definidos ou pode ser inadequado para análise."
        }],
        conclusion: conclusion || "Não é possível extrair uma conclusão definitiva do documento fornecido."
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
        toast.error(`Erro ao analisar o documento: ${errorMessage}. Por favor, tente novamente.`);
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
