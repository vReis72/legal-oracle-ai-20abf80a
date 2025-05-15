
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Document } from '@/types/document';

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId?: string;
  onSelectDocument: (document: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  selectedDocumentId, 
  onSelectDocument 
}) => {
  // Function to format file type display
  const formatFileType = (type: string): string => {
    return type.toUpperCase();
  };

  // Function to get document status
  const getDocumentStatus = (document: Document) => {
    if (document.processed) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          Analisado
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" />
        Pendente
      </Badge>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Documento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data de Upload</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nenhum documento encontrado
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow 
                key={doc.id}
                className={`cursor-pointer hover:bg-muted/50 ${doc.id === selectedDocumentId ? 'bg-muted' : ''}`}
                onClick={() => onSelectDocument(doc)}
              >
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell>{formatFileType(doc.type)}</TableCell>
                <TableCell>{doc.uploadDate.toLocaleDateString()}</TableCell>
                <TableCell>{getDocumentStatus(doc)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentList;
