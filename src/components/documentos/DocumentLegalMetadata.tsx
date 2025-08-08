import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LegalMetadata {
  documentType?: string;
  processNumber?: string;
  court?: string;
  judge?: string;
  date?: string;
  parties?: Array<{name: string; role: string}>;
  lawyers?: string[];
}

interface DocumentLegalMetadataProps {
  metadata?: LegalMetadata;
}

const DocumentLegalMetadata: React.FC<DocumentLegalMetadataProps> = ({ metadata }) => {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏛️ Informações Processuais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metadata.documentType && (
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">📂 Tipo:</span>
            <span className="text-sm">{metadata.documentType}</span>
          </div>
        )}
        
        {metadata.processNumber && (
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">🔢 Processo:</span>
            <span className="text-sm font-mono">{metadata.processNumber}</span>
          </div>
        )}
        
        {metadata.court && (
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">🏛️ Tribunal:</span>
            <span className="text-sm">{metadata.court}</span>
          </div>
        )}
        
        {metadata.judge && (
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">⚖️ Magistrado:</span>
            <span className="text-sm">{metadata.judge}</span>
          </div>
        )}
        
        {metadata.date && (
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">📅 Data:</span>
            <span className="text-sm">{metadata.date}</span>
          </div>
        )}
        
        {metadata.parties && metadata.parties.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">👥 Partes:</span>
            <div className="text-sm space-y-1">
              {metadata.parties.map((party, index) => (
                <div key={index}>
                  <span className="font-medium">{party.role}:</span> {party.name}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {metadata.lawyers && metadata.lawyers.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">👨‍💼 Advogados:</span>
            <div className="text-sm">
              {metadata.lawyers.join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentLegalMetadata;