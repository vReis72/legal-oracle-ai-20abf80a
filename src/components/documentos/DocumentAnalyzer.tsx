
import React from 'react';
import { Document } from '@/types/document';
import DocumentProgressBar from './DocumentProgressBar';
import DocumentMetadata from './DocumentMetadata';
import DocumentStatus from './DocumentStatus';
import DocumentSummary from './DocumentSummary';
import DocumentKeyPoints from './DocumentKeyPoints';
import DocumentConclusion from './DocumentConclusion';
import { useDocumentAnalysis } from '@/hooks/document/useDocumentAnalysis';
import { useApiKey } from '@/context/ApiKeyContext';
import ErrorMessage from '../ai/ErrorMessage'; 

interface DocumentAnalyzerProps {
  document: Document;
  onAnalysisComplete: (updatedDocument: Document) => void;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({ 
  document, 
  onAnalysisComplete
}) => {
  // Obter a chave API do contexto em vez de receber como prop
  const { apiKey } = useApiKey();
  
  const {
    isAnalyzing,
    progress,
    analysisError,
    processDocument
  } = useDocumentAnalysis(document, onAnalysisComplete, apiKey);

  // Adicionar log para depuração do conteúdo do documento
  console.log("Document content in DocumentAnalyzer:", document.content?.substring(0, 100));

  const renderAnalysisResults = () => {
    if (!document.processed && !document.content) return null;

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
          content={document.content} 
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
      
      {renderAnalysisResults()}
    </div>
  );
};

export default DocumentAnalyzer;
