"use client"

import { ScreenCapture } from "@/components/nlp-engine/screen-capture"

export default function OCRPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-2">Document & Screen OCR</h1>
      <p className="text-muted-foreground mb-6">
        Capture your screen or upload documents for OCR processing and data extraction
      </p>

      <ScreenCapture />
    </div>
  )
}
