
import React from 'react';

interface ImagePreviewProps {
  src: string;
  alt: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-32 mb-2">
        <img 
          src={src} 
          alt={alt} 
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};

export default ImagePreview;
