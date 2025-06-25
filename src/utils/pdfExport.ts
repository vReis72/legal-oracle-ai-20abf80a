
import { jsPDF } from "jspdf";
import { DocumentType, PdfGenerationOptions } from "./pdf/types";
import { addPdfHeader } from "./pdf/headerGenerator";
import { addPdfFooter } from "./pdf/footerGenerator";
import { generatePdfContent } from "./pdf/contentGenerator";

/**
 * Utility to export document analysis as PDF
 */
export const exportDocumentAsPdf = (document: DocumentType): boolean => {
  if (!document || !document.processed) {
    console.error("Cannot export unprocessed document");
    return false;
  }

  try {
    // Initialize PDF with A4 size
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set up PDF options
    const options: PdfGenerationOptions = {
      pageWidth: pdf.internal.pageSize.getWidth(),
      pageHeight: pdf.internal.pageSize.getHeight(),
      margin: 20,
      contentWidth: pdf.internal.pageSize.getWidth() - 40,
      yPos: 20
    };

    // Function to generate the main document content
    const generateDocumentContent = (yPos: number) => {
      options.yPos = yPos;
      
      // Generate all content sections
      generatePdfContent(pdf, document, options);
      
      // Add footer with page numbers and app footer info
      addPdfFooter(pdf, options);

      // Save the PDF
      pdf.save(`${document.name.replace(/\s+/g, '_')}_análise.pdf`);
    };

    // Start the process by adding header image
    addPdfHeader(pdf, options, generateDocumentContent, () => generateDocumentContent(options.yPos));
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
