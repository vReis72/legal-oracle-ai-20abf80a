
import { Document as DocumentType } from "@/types/document";

export interface PdfGenerationOptions {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  yPos: number;
}

export interface HeaderImageConfig {
  maxHeaderHeight: number;
  maxHeaderWidth: number;
  imagePath: string;
}

export { DocumentType };
