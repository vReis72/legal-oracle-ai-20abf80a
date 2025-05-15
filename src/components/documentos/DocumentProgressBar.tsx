
import React from 'react';

interface DocumentProgressBarProps {
  progress: number;
}

const DocumentProgressBar: React.FC<DocumentProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${progress}%` }}
      />
      <p className="text-sm text-muted-foreground mt-1">Progresso: {progress}%</p>
    </div>
  );
};

export default DocumentProgressBar;
