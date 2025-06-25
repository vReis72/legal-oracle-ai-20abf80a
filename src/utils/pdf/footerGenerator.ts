
import { jsPDF } from "jspdf";
import { PdfGenerationOptions } from "./types";

/**
 * Adds footer with page numbers and app info to all pages
 */
export const addPdfFooter = (pdf: jsPDF, options: PdfGenerationOptions): void => {
  const totalPages = pdf.internal.pages.length - 1;
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Page number (right aligned) - reduced font size
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text(`Página ${i} de ${totalPages}`, options.pageWidth - options.margin, options.pageHeight - 15, { align: "right" });
    
    // App footer info in a single line (left aligned) - reduced font size
    pdf.setFontSize(7);
    pdf.setTextColor(60);
    const footerText = `Legal Oracle AI - O seu Assistente Jurídico pessoal | By: K1nGs Data Mining & Artificial Intelligence | © ${new Date().getFullYear()} Legal Oracle AI`;
    pdf.text(footerText, options.margin, options.pageHeight - 15);
  }
};
