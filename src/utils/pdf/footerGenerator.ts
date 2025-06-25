
import { jsPDF } from "jspdf";
import { PdfGenerationOptions } from "./types";

/**
 * Adds footer with page numbers and app info to all pages
 */
export const addPdfFooter = (pdf: jsPDF, options: PdfGenerationOptions): void => {
  const totalPages = pdf.internal.pages.length - 1;
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Page number
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Página ${i} de ${totalPages}`, options.pageWidth - options.margin, options.pageHeight - 20);
    
    // App footer info (same as in Footer component)
    pdf.setFontSize(9);
    pdf.setTextColor(60);
    pdf.text("Legal Oracle AI - O seu Assistente Jurídico pessoal", options.margin, options.pageHeight - 15);
    pdf.text("By: K1nGs Data Mining & Artificial Intelligence", options.margin, options.pageHeight - 10);
    pdf.text(`© ${new Date().getFullYear()} Legal Oracle AI`, options.margin, options.pageHeight - 5);
  }
};
