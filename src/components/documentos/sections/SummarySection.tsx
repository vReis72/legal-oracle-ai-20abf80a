
import React from 'react';
import { PencilRuler } from 'lucide-react';
import DocumentSection from './DocumentSection';

interface SummarySectionProps {
  summary: string;
  expanded: boolean;
  onToggle: () => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary, expanded, onToggle }) => {
  return (
    <DocumentSection 
      title="Resumo Executivo" 
      icon={PencilRuler} 
      expanded={expanded} 
      onToggle={onToggle}
    >
      <p className="text-sm leading-relaxed">
        {summary}
      </p>
    </DocumentSection>
  );
};

export default SummarySection;
