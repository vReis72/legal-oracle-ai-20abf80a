
import { jsPDF } from "jspdf";
import { DocumentType, PdfGenerationOptions } from "./types";

/**
 * Generates the main document content for PDF
 */
export const generatePdfContent = (
  pdf: jsPDF, 
  document: DocumentType, 
  options: PdfGenerationOptions
): number => {
  let yPos = options.yPos;

  // Add document title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(document.name, options.pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Add metadata
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Tipo: ${document.type}`, options.margin, yPos);
  yPos += 7;
  
  const uploadDate = document.uploadDate instanceof Date 
    ? document.uploadDate.toLocaleDateString() 
    : new Date(document.uploadDate).toLocaleDateString();
  
  pdf.text(`Data de upload: ${uploadDate}`, options.margin, yPos);
  yPos += 15;

  // Add summary section if available
  if (document.summary) {
    yPos = addSummarySection(pdf, document.summary, options, yPos);
  }

  // Add highlights if available
  if (document.highlights && document.highlights.length > 0) {
    yPos = addHighlightsSection(pdf, document.highlights, options, yPos);
  }

  // Add key points if available
  if (document.keyPoints && document.keyPoints.length > 0) {
    yPos = addKeyPointsSection(pdf, document.keyPoints, options, yPos);
  }

  // Add conclusion section if available
  if (document.conclusion) {
    yPos = addConclusionSection(pdf, document.conclusion, options, yPos);
  }

  return yPos;
};

const addSummarySection = (
  pdf: jsPDF, 
  summary: string, 
  options: PdfGenerationOptions, 
  yPos: number
): number => {
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Resumo do Documento", options.margin, yPos);
  yPos += 7;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  
  const splitSummary = pdf.splitTextToSize(summary, options.contentWidth);
  pdf.text(splitSummary, options.margin, yPos);
  yPos += splitSummary.length * 7 + 10;

  return yPos;
};

const addHighlightsSection = (
  pdf: jsPDF, 
  highlights: DocumentType['highlights'], 
  options: PdfGenerationOptions, 
  yPos: number
): number => {
  // Check if we need a new page
  if (yPos > options.pageHeight - 60) {
    pdf.addPage();
    yPos = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Destaques", options.margin, yPos);
  yPos += 7;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  
  highlights?.forEach((highlight, index) => {
    // Check if we need a new page
    if (yPos > options.pageHeight - 50) {
      pdf.addPage();
      yPos = 20;
    }
    
    const highlightPrefix = `${index + 1}. `;
    const highlightText = `${highlight.text} (Página ${highlight.page}, Importância: ${highlight.importance})`;
    
    const splitHighlight = pdf.splitTextToSize(highlightText, options.contentWidth - pdf.getTextWidth(highlightPrefix));
    
    pdf.text(highlightPrefix, options.margin, yPos);
    pdf.text(splitHighlight, options.margin + pdf.getTextWidth(highlightPrefix), yPos);
    
    yPos += splitHighlight.length * 7 + 5;
  });
  
  yPos += 5;
  return yPos;
};

const addKeyPointsSection = (
  pdf: jsPDF, 
  keyPoints: DocumentType['keyPoints'], 
  options: PdfGenerationOptions, 
  yPos: number
): number => {
  // Check if we need a new page
  if (yPos > options.pageHeight - 60) {
    pdf.addPage();
    yPos = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Pontos-Chave", options.margin, yPos);
  yPos += 7;

  pdf.setFontSize(11);
  keyPoints?.forEach((point, index) => {
    // Check if we need a new page
    if (yPos > options.pageHeight - 50) {
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`${index + 1}. ${point.title}`, options.margin, yPos);
    yPos += 7;
    
    pdf.setFont("helvetica", "normal");
    const splitDescription = pdf.splitTextToSize(point.description, options.contentWidth);
    pdf.text(splitDescription, options.margin, yPos);
    yPos += splitDescription.length * 7 + 5;
  });

  return yPos;
};

const addConclusionSection = (
  pdf: jsPDF, 
  conclusion: string, 
  options: PdfGenerationOptions, 
  yPos: number
): number => {
  // Check if we need a new page
  if (yPos > options.pageHeight - 60) {
    pdf.addPage();
    yPos = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Conclusão", options.margin, yPos);
  yPos += 7;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  
  const splitConclusion = pdf.splitTextToSize(conclusion, options.contentWidth);
  pdf.text(splitConclusion, options.margin, yPos);
  yPos += splitConclusion.length * 7 + 10;

  return yPos;
};
