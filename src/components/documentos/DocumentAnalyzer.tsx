import React, { useEffect } from 'react';
import { Document } from '@/types/document';
import DocumentProgressBar from './DocumentProgressBar';
import DocumentMetadata from './DocumentMetadata';
import DocumentStatus from './DocumentStatus';
import DocumentSummary from './DocumentSummary';
import DocumentKeyPoints from './DocumentKeyPoints';
import DocumentConclusion from './DocumentConclusion';
import DocumentLegalMetadata from './DocumentLegalMetadata';
import { useDocumentAnalysis } from '@/hooks/document/useDocumentAnalysis';
import { useGlobalApiKey } from '@/hooks/globalApiKey/GlobalApiKeyContext';
import ErrorMessage from '../ai/ErrorMessage'; 

interface DocumentAnalyzerProps {
  document: Document;
  onAnalysisComplete: (updatedDocument: Document) => void;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({ 
  document, 
  onAnalysisComplete
}) => {
  // Usar o novo sistema de chave API global
  const { globalApiKey } = useGlobalApiKey();
  
  const {
    isAnalyzing,
    progress,
    analysisError,
    processDocument
  } = useDocumentAnalysis(document, onAnalysisComplete, globalApiKey);

  // Adicionar log para depuração do conteúdo do documento
  useEffect(() => {
    console.log("DocumentAnalyzer - documento recebido:");
    console.log("  ID:", document.id);
    console.log("  Nome:", document.name);
    console.log("  Processado:", document.processed);
    console.log("  Conteúdo presente?", !!document.content);
    console.log("  Tamanho do conteúdo:", document.content?.length || 0, "caracteres");
    console.log("  Primeiros 100 caracteres do conteúdo:", document.content?.substring(0, 100));
    console.log("  Últimos 100 caracteres do conteúdo:", document.content?.substring((document.content?.length || 0) - 100) || "");
  }, [document]);

  const renderAnalysisResults = () => {
    if (!document.processed && !document.content) return null;

    console.log("DocumentAnalyzer - renderAnalysisResults - passando conteúdo para DocumentSummary:");
    console.log("  Summary presente?", !!document.summary);
    console.log("  Conteúdo presente?", !!document.content);
    console.log("  Tamanho do conteúdo:", document.content?.length || 0, "caracteres");
    console.log("  Primeiros 100 caracteres do conteúdo:", document.content?.substring(0, 100));

    return (
      <div className="mt-6 space-y-6">
        <DocumentStatus 
          isProcessed={document.processed} 
          hasContent={!!document.content}
          isAnalyzing={isAnalyzing}
          analysisError={null}
        />
        <DocumentSummary 
          summary={document.summary || ''} 
          content={document.content || ''} 
        />
        {document.processed && document.keyPoints && (
          <DocumentKeyPoints keyPoints={document.keyPoints} />
        )}
        {document.processed && document.conclusion && (
          <DocumentConclusion conclusion={document.conclusion} />
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <DocumentMetadata 
        document={document}
        isAnalyzing={isAnalyzing}
        onAnalyze={processDocument}
      />
      
      {/* Display error message */}
      {analysisError && (
        <ErrorMessage error={analysisError} onRetry={processDocument} />
      )}
      
      {/* Display status messages */}
      {!document.processed && (
        <DocumentStatus 
          isProcessed={document.processed} 
          hasContent={!!document.content}
          isAnalyzing={isAnalyzing}
          analysisError={analysisError}
        />
      )}
      
      {isAnalyzing && <DocumentProgressBar progress={progress} />}
      
      {/* Display legal metadata if available */}
      {document.legalMetadata && (
        <DocumentLegalMetadata metadata={document.legalMetadata} />
      )}
      
      {renderAnalysisResults()}
    </div>
  );
};

export default DocumentAnalyzer;
