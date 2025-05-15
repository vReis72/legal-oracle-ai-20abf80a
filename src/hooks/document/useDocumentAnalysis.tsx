
import { useState } from 'react';
import { Document } from '@/types/document';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export const useDocumentAnalysis = (
  document: Document,
  onAnalysisComplete: (updatedDocument: Document) => void,
  apiKey: string
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Function to split text into chunks if it's too large
  const splitTextIntoChunks = (text: string, chunkSize: number = 7500): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  };

  // Real function to analyze document with OpenAI
  const analyzeWithOpenAI = async (text: string): Promise<string> => {
    if (!apiKey) {
      throw new Error("API key não fornecida. Configure sua chave OpenAI nas configurações.");
    }

    console.log("Enviando conteúdo para análise OpenAI...");
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de documentos jurídicos brasileiros. Analise este documento e forneça um resumo detalhado, destacando os pontos mais importantes e relevantes. Não mencione em sua análise que o documento é simulado ou fictício.'
            },
            {
              role: 'user',
              content: `Analise o seguinte documento jurídico e forneça: 
              1. Um resumo detalhado 
              2. Os principais destaques com sua importância (alta, média, baixa)
              3. Os pontos-chave com título e descrição
              
              IMPORTANTE: Este é um documento real que precisa de análise profissional. NÃO mencione que o documento é fictício ou simulado em sua análise.
              
              DOCUMENTO:
              ${text}`
            }
          ],
          temperature: 0.2,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro na API OpenAI:", errorData);
        throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("Resposta vazia da API");
      }
      
      console.log("Resposta da API OpenAI recebida com sucesso");
      return content;
    } catch (error) {
      console.error("Falha na chamada da API OpenAI:", error);
      throw error;
    }
  };

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
      // Log para verificar se o conteúdo está sendo processado
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
          const chunkResult = await analyzeWithOpenAI(chunks[i]);
          chunkResults.push(chunkResult);
          setProgress(30 + ((i + 1) / chunks.length * 40));
        }
        
        // Combine results
        analysisResult = chunkResults.join("\n\n");
        
        // Final analysis of combined results if needed
        if (analysisResult.length > 8000) {
          analysisResult = await analyzeWithOpenAI(analysisResult.substring(0, 8000) + 
            "\n\n[Nota: Este é um resumo de múltiplas partes do documento. Forneça uma análise consolidada.]");
        }
      } else {
        // Process the entire document at once
        analysisResult = await analyzeWithOpenAI(document.content);
        setProgress(70);
      }

      // Parse the OpenAI response to extract summary, highlights, and key points
      setProgress(85);
      
      // Extração de dados da resposta da OpenAI
      let summary = "";
      const highlights: Array<{text: string; page: number; importance: string}> = [];
      const keyPoints: Array<{title: string; description: string}> = [];
      
      // Tentar extrair o resumo (primeira seção até encontrar ## ou linha vazia)
      const parts = analysisResult.split(/(?:##|#)/);
      if (parts.length > 0) {
        summary = parts[0].trim();
      }
      
      // Procurar por destaques no texto
      const highlightsMatch = analysisResult.match(/(?:Destaques|Principais Destaques|Pontos Importantes):([\s\S]*?)(?=##|#|$)/i);
      if (highlightsMatch && highlightsMatch[1]) {
        const highlightsText = highlightsMatch[1].trim();
        const highlightItems = highlightsText.split(/\n-|\n•|\n\d+\./);
        
        highlightItems.forEach(item => {
          const trimmedItem = item.trim();
          if (!trimmedItem) return;
          
          let importance = "média";
          if (trimmedItem.toLowerCase().includes("alta") || trimmedItem.toLowerCase().includes("importante")) {
            importance = "alta";
          } else if (trimmedItem.toLowerCase().includes("baixa")) {
            importance = "baixa";
          }
          
          highlights.push({
            text: trimmedItem.replace(/\(.*?\)/, "").trim(),
            page: 1, // Assumimos página 1 já que não temos informação de página
            importance
          });
        });
      }
      
      // Procurar por pontos-chave no texto
      const keyPointsMatch = analysisResult.match(/(?:Pontos-Chave|Pontos Chave|Principais Pontos):([\s\S]*?)(?=##|#|$)/i);
      if (keyPointsMatch && keyPointsMatch[1]) {
        const keyPointsText = keyPointsMatch[1].trim();
        const keyPointItems = keyPointsText.split(/\n-|\n•|\n\d+\./);
        
        keyPointItems.forEach(item => {
          const trimmedItem = item.trim();
          if (!trimmedItem) return;
          
          const titleMatch = trimmedItem.match(/^(.*?)(?::|–|-)(.*)$/);
          if (titleMatch) {
            keyPoints.push({
              title: titleMatch[1].trim(),
              description: titleMatch[2].trim()
            });
          } else if (trimmedItem) {
            keyPoints.push({
              title: trimmedItem.split(' ').slice(0, 3).join(' ') + "...",
              description: trimmedItem
            });
          }
        });
      }
      
      // Se não conseguirmos extrair adequadamente, usar o texto completo como resumo
      if (!summary && analysisResult) {
        summary = analysisResult;
      }
      
      // Se não conseguimos extrair destaques, criar pelo menos um destaque padrão
      if (highlights.length === 0 && analysisResult) {
        const firstSentence = analysisResult.split('.')[0];
        if (firstSentence) {
          highlights.push({
            text: firstSentence.trim() + ".",
            page: 1,
            importance: "alta"
          });
        }
      }
      
      // Se não conseguimos extrair pontos-chave, criar pelo menos um ponto-chave padrão
      if (keyPoints.length === 0 && analysisResult) {
        keyPoints.push({
          title: "Análise Jurídica",
          description: analysisResult.substring(0, 200) + "..."
        });
      }
      
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
