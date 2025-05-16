
/**
 * Core functionality for analysis results 
 */
import { extractSection } from './sectionExtractor';
import { processKeyPoints } from './keyPointParser';

/**
 * Type definition for the analysis result structure
 */
export interface AnalysisResult {
  summary: string;
  keyPoints: Array<{title: string; description: string}>;
  conclusion: string;
}

/**
 * Default values for when sections can't be extracted
 */
export const DEFAULT_VALUES = {
  summary: "Não foi possível extrair um resumo do documento.",
  keyPoints: [{
    title: "Análise Insuficiente",
    description: "Não foi possível identificar pontos-chave específicos neste documento."
  }],
  conclusion: "Não é possível extrair uma conclusão definitiva do documento fornecido."
};

/**
 * Creates an empty result object with default structure
 */
export const createEmptyResult = (): AnalysisResult => ({
  summary: "",
  keyPoints: [],
  conclusion: ""
});

/**
 * Ensures all sections have values, using defaults if needed
 */
export function ensureCompleteSections(result: AnalysisResult): void {
  if (!result.summary) {
    console.warn("Using default summary value");
    result.summary = DEFAULT_VALUES.summary;
  }
  
  if (result.keyPoints.length === 0) {
    console.warn("Using default key points");
    result.keyPoints = [...DEFAULT_VALUES.keyPoints];
  }
  
  if (!result.conclusion) {
    console.warn("Using default conclusion value");
    result.conclusion = DEFAULT_VALUES.conclusion;
  }
}
