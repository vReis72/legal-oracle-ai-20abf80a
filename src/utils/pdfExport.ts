
import { jsPDF } from "jspdf";
import { Document } from "@/types/document";

/**
 * Utility to export document analysis as PDF
 */
export const exportDocumentAsPdf = (document: Document) => {
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

    // Set initial position for content
    let yPos = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Add document title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(document.name, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Add metadata
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Tipo: ${document.type}`, margin, yPos);
    yPos += 7;
    
    const uploadDate = document.uploadDate instanceof Date 
      ? document.uploadDate.toLocaleDateString() 
      : new Date(document.uploadDate).toLocaleDateString();
    
    pdf.text(`Data de upload: ${uploadDate}`, margin, yPos);
    yPos += 15;

    // Add summary section if available
    if (document.summary) {
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumo do Documento", margin, yPos);
      yPos += 7;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      // Split text to fit within margins
      const splitSummary = pdf.splitTextToSize(document.summary, contentWidth);
      pdf.text(splitSummary, margin, yPos);
      yPos += splitSummary.length * 7 + 10;
    }

    // Add highlights if available
    if (document.highlights && document.highlights.length > 0) {
      // Check if we need a new page
      if (yPos > pdf.internal.pageSize.getHeight() - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Destaques", margin, yPos);
      yPos += 7;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      document.highlights.forEach((highlight, index) => {
        // Check if we need a new page
        if (yPos > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPos = 20;
        }
        
        // Format the highlight
        const highlightPrefix = `${index + 1}. `;
        const highlightText = `${highlight.text} (Página ${highlight.page}, Importância: ${highlight.importance})`;
        
        // Split text to fit within margins with indentation for the prefix
        const splitHighlight = pdf.splitTextToSize(highlightText, contentWidth - pdf.getTextWidth(highlightPrefix));
        
        pdf.text(highlightPrefix, margin, yPos);
        pdf.text(splitHighlight, margin + pdf.getTextWidth(highlightPrefix), yPos);
        
        yPos += splitHighlight.length * 7 + 5;
      });
      
      yPos += 5;
    }

    // Add key points if available
    if (document.keyPoints && document.keyPoints.length > 0) {
      // Check if we need a new page
      if (yPos > pdf.internal.pageSize.getHeight() - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Pontos-Chave", margin, yPos);
      yPos += 7;

      pdf.setFontSize(11);
      document.keyPoints.forEach((point, index) => {
        // Check if we need a new page
        if (yPos > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${point.title}`, margin, yPos);
        yPos += 7;
        
        pdf.setFont("helvetica", "normal");
        const splitDescription = pdf.splitTextToSize(point.description, contentWidth);
        pdf.text(splitDescription, margin, yPos);
        yPos += splitDescription.length * 7 + 5;
      });
    }
    
    // Add footer with page number
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10);
    }

    // Save the PDF
    pdf.save(`${document.name.replace(/\s+/g, '_')}_análise.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
