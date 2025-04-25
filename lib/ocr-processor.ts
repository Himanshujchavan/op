// This is a browser-based OCR processor using Tesseract.js
// For a desktop application, you would use a more powerful OCR library

import { createWorker } from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

// Singleton worker instance to optimize performance
let ocrWorker: any;

async function getOCRWorker() {
  if (!ocrWorker) {
    ocrWorker = await createWorker({
      logger: (info) => console.log("OCR Worker Log:", info), // Add logging for debugging
    });
    await ocrWorker.loadLanguage("eng");
    await ocrWorker.initialize("eng");
  }
  return ocrWorker;
}

export async function processImage(imageData: string | Blob): Promise<OCRResult> {
  try {
    const worker = await getOCRWorker();

    // Process the image
    const { data } = await worker.recognize(imageData);

    // Format the result
    const formattedResult: OCRResult = {
      text: data.text,
      confidence: data.confidence,
      words: data.words.map((word) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox,
      })),
    };

    return formattedResult;
  } catch (error) {
    console.error("OCR processing error:", error);
    throw new Error("Failed to process image with OCR");
  }
}

export async function extractInvoiceData(text: string): Promise<{
  invoiceNumber?: string;
  date?: string;
  total?: string;
  vendor?: string;
}> {
  try {
    // Send the OCR text to Groq for structured extraction
    const response = await fetch("/api/extract-invoice-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Invoice extraction error:", error);

    // Fallback to simple regex extraction with improved patterns
    const invoiceNumber = text.match(/(?:invoice|inv)\s*#?\s*([A-Za-z0-9-]+)/i)?.[1];
    const date = text.match(/(?:date|issued on)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i)?.[1];
    const total = text.match(/(?:total|amount)\s*:?\s*[$€£]?\s*(\d+[.,]?\d{0,2})/i)?.[1];
    const vendor = text.match(/(?:from|vendor)\s*:?\s*([A-Za-z0-9\s]+(?:Inc|LLC|Ltd|GmbH|Co))/i)?.[1];

    return {
      invoiceNumber,
      date,
      total,
      vendor,
    };
  }
}

// Cleanup function to terminate the worker when the app is shutting down
export async function terminateOCRWorker() {
  if (ocrWorker) {
    await ocrWorker.terminate();
    ocrWorker = null;
  }
}
