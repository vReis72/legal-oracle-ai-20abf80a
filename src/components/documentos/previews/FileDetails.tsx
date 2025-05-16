
import React from 'react';

interface FileDetailsProps {
  name: string;
  size: number;
}

const FileDetails: React.FC<FileDetailsProps> = ({ name, size }) => {
  const fileSizeKB = (size / 1024).toFixed(1);
  
  return (
    <>
      <p className="text-sm text-center font-medium mt-2 truncate max-w-full">
        {name}
      </p>
      <p className="text-xs text-muted-foreground">
        {fileSizeKB} KB
      </p>
    </>
  );
};

export default FileDetails;
