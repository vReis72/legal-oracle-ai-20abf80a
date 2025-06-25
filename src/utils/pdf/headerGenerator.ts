
import { jsPDF } from "jspdf";
import { PdfGenerationOptions, HeaderImageConfig } from "./types";

/**
 * Adds header image to PDF document
 */
export const addPdfHeader = (
  pdf: jsPDF, 
  options: PdfGenerationOptions,
  onComplete: (newYPos: number) => void,
  onError?: () => void
): void => {
  try {
    // Create a canvas to load and resize the image
    const canvas = window.document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const headerConfig: HeaderImageConfig = {
      maxHeaderHeight: 25,
      maxHeaderWidth: options.contentWidth,
      imagePath: '/lovable-uploads/e43cb0ab-56fb-452f-8d60-8f85dbc5268d.png'
    };
    
    img.onload = () => {
      // Calculate proportional dimensions for header
      const aspectRatio = img.width / img.height;
      
      let headerWidth = headerConfig.maxHeaderWidth;
      let headerHeight = headerWidth / aspectRatio;
      
      if (headerHeight > headerConfig.maxHeaderHeight) {
        headerHeight = headerConfig.maxHeaderHeight;
        headerWidth = headerHeight * aspectRatio;
      }
      
      // Center the image horizontally
      const headerX = (options.pageWidth - headerWidth) / 2;
      
      // Set canvas size and draw image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Convert to base64 and add to PDF
      const imageData = canvas.toDataURL('image/png');
      pdf.addImage(imageData, 'PNG', headerX, options.yPos, headerWidth, headerHeight);
      
      // Update yPos after header
      const newYPos = options.yPos + headerHeight + 10;
      onComplete(newYPos);
    };
    
    img.onerror = () => {
      console.warn("Could not load header image, continuing without it");
      if (onError) onError();
      else onComplete(options.yPos);
    };
    
    // Load the uploaded image
    img.src = headerConfig.imagePath;
    
  } catch (error) {
    console.warn("Error loading header image:", error);
    if (onError) onError();
    else onComplete(options.yPos);
  }
};
