
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Document } from "@/types/document";
import { exportDocumentAsPdf } from "@/utils/pdfExport";
import { toast } from "sonner";

interface DocumentExportButtonProps {
  document: Document;
  disabled?: boolean;
}

const DocumentExportButton: React.FC<DocumentExportButtonProps> = ({ 
  document, 
  disabled = false 
}) => {
  const handleExport = () => {
    if (!document.processed || !document.summary) {
      toast.error("Não é possível exportar um documento não processado");
      return;
    }
    
    const success = exportDocumentAsPdf(document);
    
    if (success) {
      toast.success("Documento exportado com sucesso");
    } else {
      toast.error("Erro ao exportar documento");
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      disabled={disabled || !document.processed || !document.summary}
      title={!document.processed ? "Análise necessária antes de exportar" : "Exportar análise como PDF"}
    >
      <FileText className="mr-2" size={16} />
      Exportar PDF
    </Button>
  );
};

export default DocumentExportButton;
