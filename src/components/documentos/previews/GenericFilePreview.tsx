
import React from 'react';
import { FileText, File, FileImage } from "lucide-react";

interface GenericFilePreviewProps {
  fileType: string;
  iconSize?: number;
}

const GenericFilePreview: React.FC<GenericFilePreviewProps> = ({ 
  fileType, 
  iconSize = 64 
}) => {
  // Determine which icon to show based on file type
  let IconComponent = File;
  let iconColor = "text-gray-500";
  
  if (fileType === 'text/plain') {
    IconComponent = FileText;
    iconColor = "text-blue-500";
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    IconComponent = FileText;
    iconColor = "text-blue-600";
  } else if (fileType.startsWith('image/')) {
    IconComponent = FileImage;
    iconColor = "text-green-500";
  }

  return (
    <div className="flex flex-col items-center">
      <IconComponent size={iconSize} className={`${iconColor} mb-2`} />
    </div>
  );
};

export default GenericFilePreview;
