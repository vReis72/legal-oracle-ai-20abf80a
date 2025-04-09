
import { DocumentAnalysis, DocumentType } from './documentTypes';

/**
 * Gera uma resposta de erro para um documento PDF
 * @param warning Mensagem de aviso (opcional)
 * @returns Análise com mensagem de erro
 */
export const createPdfErrorAnalysis = (warning?: string): DocumentAnalysis => {
  return {
    summary: warning || "O conteúdo extraído do PDF está completamente ilegível e corrompido.",
    highlights: [],
    keyPoints: [
      {
        title: "PDF com problemas de extração",
        description: "O arquivo PDF pode ter sido digitalizado como imagem ou estar em um formato que não permite extração de texto."
      },
      {
        title: "Recomendações",
        description: "Tente converter o PDF para texto usando uma ferramenta de OCR ou use um arquivo que contenha texto selecionável."
      }
    ],
    content: "Conteúdo ilegível - não foi possível extrair texto processável deste documento."
  };
};

/**
 * Gera uma resposta de erro genérica
 * @param fileName Nome do arquivo com problema
 * @param isPdf Se o arquivo é um PDF
 * @param errorMessage Mensagem de erro opcional
 * @returns Análise com mensagem de erro
 */
export const createGenericErrorAnalysis = (
  fileName: string, 
  isPdf: boolean,
  errorMessage?: string
): DocumentAnalysis => {
  return {
    summary: isPdf 
      ? 'Não foi possível analisar completamente o PDF. Talvez seja devido à forma como o texto está armazenado no arquivo.'
      : 'Não foi possível analisar o documento. Tente novamente ou use um arquivo menor.',
    highlights: [],
    keyPoints: [
      {
        title: 'Erro na Análise',
        description: isPdf 
          ? 'O PDF pode estar protegido, ser uma digitalização ou ter outro formato que dificulta a extração de texto. Tente um PDF com texto selecionável.'
          : `Ocorreu um problema durante a análise. ${errorMessage || 'Verifique sua chave API e o formato do arquivo.'}`
      }
    ],
    content: `Documento ${fileName} não pôde ser processado completamente.\n\n[Documento truncado devido a erro no processamento]`
  };
};
