
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Document } from '@/types/document';
import EmptyDocumentState from './sections/EmptyDocumentState';
import LoadingDocumentState from './sections/LoadingDocumentState';
import DocumentHeader from './DocumentHeader';
import SummarySection from './sections/SummarySection';
import HighlightsSection from './sections/HighlightsSection';
import KeyPointsSection from './sections/KeyPointsSection';
import ContentSection from './sections/ContentSection';

interface DocumentDetailProps {
  document: Document | null;
}

const DocumentDetail: React.FC<DocumentDetailProps> = ({ document }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  if (!document) {
    return <EmptyDocumentState />;
  }

  if (!document.processed) {
    return <LoadingDocumentState document={document} />;
  }
  
  // Verificar se o documento tem um erro de processamento
  const hasError = document.summary?.includes("ilegível") || 
                  document.summary?.includes("corrompido") ||
                  document.summary?.includes("sem sentido") ||
                  document.summary?.includes("extraído") ||
                  document.summary?.includes("Não foi possível");
                  
  const isPdf = document.name.toLowerCase().endsWith('.pdf');
  
  if (hasError) {
    return <EmptyDocumentState 
      errorState={true} 
      errorMessage={document.summary}
      isPdf={isPdf}
    />;
  }

  return (
    <div>
      <DocumentHeader document={document} />

      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-6">
          <SummarySection 
            summary={document.summary || ''} 
            expanded={expandedSection === 'resumo'}
            onToggle={() => toggleSection('resumo')}
          />

          <HighlightsSection 
            highlights={document.highlights || []} 
            expanded={expandedSection === 'highlights'}
            onToggle={() => toggleSection('highlights')}
          />

          <KeyPointsSection 
            keyPoints={document.keyPoints || []} 
            expanded={expandedSection === 'keypoints'}
            onToggle={() => toggleSection('keypoints')}
          />

          <ContentSection 
            content={document.content || ''} 
            expanded={expandedSection === 'content'}
            onToggle={() => toggleSection('content')}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default DocumentDetail;
