
import React from 'react';
import { Document } from '@/types/document';
import DocumentProgressBar from './DocumentProgressBar';
import DocumentMetadata from './DocumentMetadata';
import DocumentStatus from './DocumentStatus';
import DocumentSummary from './DocumentSummary';
import DocumentHighlights from './DocumentHighlights';
import DocumentKeyPoints from './DocumentKeyPoints';
import { useDocumentAnalysis } from '@/hooks/document/useDocumentAnalysis';

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
  const {
    isAnalyzing,
    progress,
    analysisError,
    processDocument
  } = useDocumentAnalysis(document, onAnalysisComplete, apiKey);

  const renderAnalysisResults = () => {
    if (!document.processed || !document.summary) return null;

    return (
      <div className="mt-6 space-y-6">
        <DocumentStatus 
          isProcessed={document.processed} 
          hasContent={!!document.content}
          isAnalyzing={isAnalyzing}
          analysisError={null}
        />
        <DocumentSummary summary={document.summary} />
        <DocumentHighlights highlights={document.highlights} />
        <DocumentKeyPoints keyPoints={document.keyPoints} />
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
