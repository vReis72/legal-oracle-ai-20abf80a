
import React from 'react';
import { FileText } from 'lucide-react';
import DocumentSection from './DocumentSection';

interface ContentSectionProps {
  content: string;
  expanded: boolean;
  onToggle: () => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({ content, expanded, onToggle }) => {
  return (
    <DocumentSection 
      title="Conteúdo Completo" 
      icon={FileText} 
      expanded={expanded} 
      onToggle={onToggle}
    >
      <p className="text-sm whitespace-pre-line leading-relaxed">
        {content}
      </p>
    </DocumentSection>
  );
};

export default ContentSection;
