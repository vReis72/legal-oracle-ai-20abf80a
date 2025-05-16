import React from 'react';
import { FileText } from "lucide-react";

interface PdfPreviewProps {
  previewImage: string | null;
  fileName: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ previewImage, fileName }) => {
  // If we have a preview image, show it
  if (previewImage) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-full h-32 mb-2">
          <img 
            src={previewImage} 
            alt={`Primeira página de ${fileName}`}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
    );
  }
  
  // Otherwise show a file icon
  return (
    <div className="flex flex-col items-center">
      <FileText size={64} className="text-blue-500 mb-2" />
    </div>
  );
};

export default PdfPreview;
