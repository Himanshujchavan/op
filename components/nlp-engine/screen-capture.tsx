"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Copy, Download, Loader2, Scan } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { processImage, extractInvoiceData } from "@/lib/ocr-processor"
import type { OCRResult } from "@/lib/ocr-processor"

export function ScreenCapture() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const captureScreen = async () => {
    // Note: This is a mock function since browser APIs don't allow capturing the screen without user permission
    // In a real desktop app, you would use Electron or similar to capture the screen
    toast({
      title: "Screen Capture",
      description: "Screen capture is only available in the desktop application.",
      variant: "default",
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Display the image
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error reading file:", error)
      toast({
        title: "Error",
        description: "Failed to read the image file.",
        variant: "destructive",
      })
    }
  }

  const processOCR = async () => {
    if (!capturedImage) return

    setIsProcessing(true)
    try {
      // Process the image with OCR
      const result = await processImage(capturedImage)
      setOcrResult(result)

      // If it looks like an invoice, try to extract structured data
      if (result.text.toLowerCase().includes("invoice") || result.text.toLowerCase().includes("receipt")) {
        const data = await extractInvoiceData(result.text)
        setExtractedData(data)
      } else {
        setExtractedData(null)
      }
    } catch (error) {
      console.error("OCR processing error:", error)
      toast({
        title: "OCR Error",
        description: "Failed to process the image with OCR.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyText = () => {
    if (!ocrResult) return

    navigator.clipboard.writeText(ocrResult.text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    })
  }

  const downloadImage = () => {
    if (!capturedImage) return

    const a = document.createElement("a")
    a.href = capturedImage
    a.download = `capture-${new Date().toISOString().slice(0, 10)}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Screen Capture & OCR</CardTitle>
        <CardDescription>Capture your screen or upload an image for OCR processing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={captureScreen}>
            <Camera className="h-4 w-4 mr-2" />
            Capture Screen
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Scan className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>

        {capturedImage && (
          <div className="mt-4">
            <div className="border rounded-md overflow-hidden">
              <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="max-w-full h-auto" />
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={processOCR} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Process with OCR
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={downloadImage}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}

        {ocrResult && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">OCR Result:</h3>
            <div className="bg-muted p-3 rounded-md relative">
              <pre className="whitespace-pre-wrap text-sm">{ocrResult.text}</pre>
              <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={copyText}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Confidence: {Math.round(ocrResult.confidence)}%</p>
          </div>
        )}

        {extractedData && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Extracted Data:</h3>
            <div className="bg-muted p-3 rounded-md">
              <dl className="space-y-1">
                {extractedData.invoiceNumber && (
                  <div className="grid grid-cols-3">
                    <dt className="font-medium">Invoice Number:</dt>
                    <dd className="col-span-2">{extractedData.invoiceNumber}</dd>
                  </div>
                )}
                {extractedData.date && (
                  <div className="grid grid-cols-3">
                    <dt className="font-medium">Date:</dt>
                    <dd className="col-span-2">{extractedData.date}</dd>
                  </div>
                )}
                {extractedData.total && (
                  <div className="grid grid-cols-3">
                    <dt className="font-medium">Total:</dt>
                    <dd className="col-span-2">{extractedData.total}</dd>
                  </div>
                )}
                {extractedData.vendor && (
                  <div className="grid grid-cols-3">
                    <dt className="font-medium">Vendor:</dt>
                    <dd className="col-span-2">{extractedData.vendor}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
