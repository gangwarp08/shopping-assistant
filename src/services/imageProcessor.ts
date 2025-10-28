import fetch from 'node-fetch';
import { PDFDocument } from 'pdf-lib';

export async function processImageInput(imageInput: string): Promise<string> {
  // Case 1: Direct base64 image (data:image/...)
  if (imageInput.startsWith('data:image/')) {
    return imageInput;
  }

  // Case 2: Image URL
  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    // Check if it's a PDF URL
    if (imageInput.toLowerCase().endsWith('.pdf')) {
      return await extractImageFromPdfUrl(imageInput);
    }
    return imageInput;
  }

  // Case 3: Base64 PDF (data:application/pdf...)
  if (imageInput.startsWith('data:application/pdf')) {
    return await extractImageFromPdfBase64(imageInput);
  }

  throw new Error('Unsupported image format');
}

async function extractImageFromPdfUrl(pdfUrl: string): Promise<string> {
  const response = await fetch(pdfUrl);
  const pdfBuffer = await response.buffer();
  const base64Pdf = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
  return await extractImageFromPdfBase64(base64Pdf);
}

async function extractImageFromPdfBase64(base64Pdf: string): Promise<string> {
  const base64Data = base64Pdf.replace(/^data:application\/pdf;base64,/, '');
  const pdfBuffer = Buffer.from(base64Data, 'base64');
  
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  
  // Extract first image from PDF
  // This is a simplified version - you may need more robust extraction
  const { width, height } = firstPage.getSize();
  
  // For now, return a placeholder
  // In production, you'd use a library like pdf2pic or similar
  throw new Error('PDF image extraction not fully implemented. Please provide direct image instead.');
}