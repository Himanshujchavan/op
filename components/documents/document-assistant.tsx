"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Copy,
  Download,
  type File,
  FileText,
  Upload,
  Languages,
  Key,
  Clock,
  Mail,
  FileUp,
  Search,
  CheckCircle,
  AlertCircle,
  WifiOff,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAssistant } from "@/contexts/assistant-context"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeDocument } from "@/utils/groq-api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { auth, db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DocumentAssistantProps {
  isOffline?: boolean
}

export function DocumentAssistant({ isOffline = false }: DocumentAssistantProps) {
  const { addAction } = useAssistant()
  const [activeTab, setActiveTab] = useState("upload")
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedAction, setSelectedAction] = useState<"summarize" | "translate" | "extract-keywords">("summarize")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedResult, setProcessedResult] = useState<string | string[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [summary, setSummary] = useState("")
  const [copied, setCopied] = useState(false)
  const [documentHistory, setDocumentHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Simulated document history for demo purposes
  useEffect(() => {
    if (!isOffline) {
      setIsLoading(true)
      setTimeout(() => {
        setDocumentHistory([
          {
            id: "doc1",
            name: "Q2 Financial Report.pdf",
            type: "pdf",
            date: new Date(2023, 5, 15),
            size: "2.4 MB",
          },
          {
            id: "doc2",
            name: "Project Proposal.docx",
            type: "docx",
            date: new Date(2023, 6, 3),
            size: "1.8 MB",
          },
          {
            id: "doc3",
            name: "Meeting Notes.txt",
            type: "txt",
            date: new Date(2023, 6, 10),
            size: "45 KB",
          },
        ])
        setIsLoading(false)
      }, 1000)
    } else {
      // Clear history when offline
      setDocumentHistory([])
    }
  }, [isOffline])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      //validateAndSetFile(selectedFile)
      setFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setProcessedResult(null)

    // Read file content
    const reader = new FileReader()

    reader.onload = async (event) => {
      const content = event.target?.result as string
      setFileContent(content)

      // Simulate upload progress
      setIsUploading(true)
      setUploadProgress(0)

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)

            toast({
              title: "File uploaded",
              description: `${selectedFile.name} has been uploaded successfully.`,
            })

            return 100
          }
          return prev + 10
        })
      }, 200)
    }

    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the file. Please try again.",
        variant: "destructive",
      })
    }

    if (selectedFile.type === "text/plain") {
      reader.readAsText(selectedFile)
    } else {
      // For non-text files, we'd normally use a server-side solution
      // For this demo, we'll simulate text extraction
      setTimeout(() => {
        setFileContent(`Sample content extracted from ${selectedFile.name}. In a real application, we would use proper PDF/DOCX parsing libraries on the server side.

This is a demonstration of how the document processing would work with actual text content.

The AI model will analyze this text and perform the selected operation (summarize, translate, or extract keywords).

For the purposes of this demo, we're simulating document content extraction.`)

        setIsUploading(false)
        setUploadProgress(100)

        toast({
          title: "File uploaded",
          description: `${selectedFile.name} has been uploaded successfully.`,
        })
      }, 2000)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      //validateAndSetFile(e.dataTransfer.files[0])
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    if (isOffline) {
      toast({
        title: "You're offline",
        description: "Document upload requires an internet connection.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would upload the file to a storage service
      // and then process it with an AI service

      // Log document to Firestore if user is authenticated
      if (auth.currentUser && db) {
        try {
          await addDoc(collection(db, "users", auth.currentUser.uid, "documents"), {
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: serverTimestamp(),
          })
        } catch (error) {
          console.error("Error logging document:", error)
          // Continue even if logging fails
        }
      }

      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been uploaded and is ready for processing.`,
      })

      // Add to document history
      setDocumentHistory([
        {
          id: `doc${Date.now()}`,
          name: file.name,
          type: file.type.split("/")[1],
          date: new Date(),
          size: `${(file.size / 1024).toFixed(1)} KB`,
        },
        ...documentHistory,
      ])

      // Simulate processing
      setIsUploading(false)
      setIsProcessing(true)
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setIsProcessing(false)

      // Set a sample summary
      setSummary(
        `# Summary of ${file.name}\n\nThis document appears to be a ${
          file.type.split("/")[1]
        } file containing business information. Key points:\n\n- The document discusses quarterly financial results\n- Revenue increased by 15% compared to last quarter\n- New product line mentioned for Q3\n- Three action items identified for the marketing team\n\n## Recommendations\n\n1. Review the Q3 product launch timeline\n2. Allocate additional budget to marketing\n3. Schedule follow-up meeting with stakeholders`,
      )

      setActiveTab("summary")
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleProcessDocument = async () => {
    if (!fileContent) return

    setIsProcessing(true)
    setProcessedResult(null)

    try {
      addAction(`Processing document: ${file?.name} (${selectedAction})`)

      const result = await analyzeDocument(fileContent, selectedAction)
      setProcessedResult(result)

      toast({
        title: "Document processed",
        description: `Your document has been ${selectedAction}d successfully.`,
      })
    } catch (error) {
      console.error("Error processing document:", error)

      toast({
        title: "Processing error",
        description: "There was an error processing your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    if (isOffline) {
      toast({
        title: "You're offline",
        description: "Document search requires an internet connection.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate search delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Search completed",
        description: `Found 3 results for "${searchQuery}"`,
      })

      // Set a sample summary based on search
      setSummary(
        `# Search Results for "${searchQuery}"\n\n## Found in 3 documents:\n\n1. **Q2 Financial Report.pdf** - Page 4, 8, 15\n2. **Project Proposal.docx** - Page 2\n3. **Meeting Notes.txt** - Throughout document\n\n## Context:\n\n"${searchQuery}" appears most frequently in financial projections and action items. The term is associated with quarterly goals and marketing initiatives.`,
      )

      setActiveTab("summary")
    } catch (error) {
      console.error("Error searching documents:", error)
      toast({
        title: "Search failed",
        description: "There was an error searching your documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyResult = () => {
    if (processedResult) {
      const textToCopy = Array.isArray(processedResult) ? processedResult.join("\n") : processedResult
      navigator.clipboard.writeText(textToCopy)

      toast({
        title: "Copied to clipboard",
        description: "The processed result has been copied to your clipboard.",
      })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadResult = () => {
    if (processedResult) {
      const textToDownload = Array.isArray(processedResult) ? processedResult.join("\n") : processedResult
      const blob = new Blob([textToDownload], { type: "text/plain" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${file?.name.split(".")[0]}_${selectedAction}d.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your processed document is being downloaded.",
      })
    }
  }

  const downloadSummary = () => {
    const element = document.createElement("a")
    const file = new Blob([summary], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "document-summary.md"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleReset = () => {
    setFile(null)
    setFileContent(null)
    setProcessedResult(null)
    setUploadProgress(0)
    setIsUploading(false)
    setIsProcessing(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    toast({
      title: "Reset complete",
      description: "Document assistant has been reset.",
    })
  }

  const getActionIcon = () => {
    switch (selectedAction) {
      case "summarize":
        return <FileText className="h-5 w-5" />
      case "translate":
        return <Languages className="h-5 w-5" />
      case "extract-keywords":
        return <Key className="h-5 w-5" />
    }
  }

  const getActionDescription = () => {
    switch (selectedAction) {
      case "summarize":
        return "Generate a concise summary of your document, highlighting the key points and main ideas."
      case "translate":
        return "Translate your document to English from any supported language."
      case "extract-keywords":
        return "Extract the most important keywords and phrases from your document."
    }
  }

  return (
    <div className="space-y-6">
      {isOffline && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limited functionality</AlertTitle>
          <AlertDescription>
            You're currently offline. Document processing features are limited until your connection is restored.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" disabled={isProcessing}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="search" disabled={isProcessing || isOffline}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!summary}>
            <FileText className="mr-2 h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {isOffline ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">You're offline</h3>
                  <p className="text-muted-foreground mt-2">
                    Document upload requires an internet connection. Please check your connection and try again.
                  </p>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    file ? "border-primary" : "border-muted-foreground/25"
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md"
                  />

                  {!file ? (
                    <div className="flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      </motion.div>
                      <h3 className="text-lg font-medium">Drag and drop your document here</h3>
                      <p className="text-muted-foreground mt-2">
                        Supports PDF, Word, TXT, and Markdown files up to 10MB
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        Select File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FileText className="h-12 w-12 text-primary mb-4" />
                      </motion.div>
                      <h3 className="text-lg font-medium">{file.name}</h3>
                      <p className="text-muted-foreground mt-2">
                        {file.type || "Unknown type"} • {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={() => setFile(null)} disabled={isUploading}>
                          Change
                        </Button>
                        <Button onClick={handleUpload} disabled={isUploading}>
                          {isUploading ? "Uploading..." : "Upload & Process"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="mt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Processing...</span>
                  </div>
                </div>
              )}

              {!isOffline && documentHistory.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Recent Documents</h3>
                  <div className="space-y-2">
                    {documentHistory.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary cursor-pointer"
                      >
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} • {doc.size} • {doc.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search your documents</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      placeholder="Enter keywords or phrases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isProcessing || isOffline}
                    />
                    <Button onClick={handleSearch} disabled={!searchQuery.trim() || isProcessing || isOffline}>
                      Search
                    </Button>
                  </div>
                </div>

                {isProcessing && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2 }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Searching...</span>
                    </div>
                  </div>
                )}

                {!isOffline && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Search suggestions</h3>
                    <div className="flex flex-wrap gap-2">
                      {["quarterly report", "financial projection", "marketing plan", "team meeting"].map(
                        (suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchQuery(suggestion)}
                            disabled={isProcessing}
                          >
                            {suggestion}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Document Summary</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSummary}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                {summary.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={i} className="text-xl font-bold mt-2 mb-4">
                        {line.substring(2)}
                      </h1>
                    )
                  } else if (line.startsWith("## ")) {
                    return (
                      <h2 key={i} className="text-lg font-bold mt-4 mb-2">
                        {line.substring(3)}
                      </h2>
                    )
                  } else if (line.startsWith("- ")) {
                    return (
                      <p key={i} className="ml-4 mb-1">
                        • {line.substring(2)}
                      </p>
                    )
                  } else if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
                    return (
                      <p key={i} className="ml-4 mb-1">
                        {line}
                      </p>
                    )
                  } else if (line === "") {
                    return <br key={i} />
                  } else {
                    return (
                      <p key={i} className="mb-2">
                        {line}
                      </p>
                    )
                  }
                })}
              </div>

              <div className="mt-6">
                <Label htmlFor="notes">Add your notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add your thoughts or additional notes here..."
                  className="mt-2"
                  rows={4}
                />
                <Button className="mt-2" disabled={isOffline}>
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Smart Suggestions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Smart Suggestions</CardTitle>
          <CardDescription>Based on your activity and schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 border-border hover:bg-secondary"
              onClick={() => {
                toast({
                  title: "Schedule checked",
                  description: "You have 3 meetings scheduled for today.",
                })
                addAction("Checked today's schedule")
              }}
            >
              <div className="flex w-full items-center">
                <Clock className="h-5 w-5 text-primary" />
                <span className="ml-2 font-medium">Check today's schedule</span>
              </div>
              <p className="text-xs text-left text-muted-foreground">You have 3 meetings scheduled for today</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 border-border hover:bg-secondary"
              onClick={() => {
                toast({
                  title: "Unread emails",
                  description: "You have 3 unread emails in your inbox.",
                })
                addAction("Checked unread emails")
              }}
            >
              <div className="flex w-full items-center">
                <Mail className="h-5 w-5 text-primary" />
                <span className="ml-2 font-medium">3 unread emails</span>
              </div>
              <p className="text-xs text-left text-muted-foreground">Check your inbox for new messages</p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 border-border hover:bg-secondary"
              onClick={() => {
                toast({
                  title: "Report summarized",
                  description: "The quarterly report has been summarized.",
                })
                addAction("Summarized quarterly report")
              }}
            >
              <div className="flex w-full items-center">
                <FileText className="h-5 w-5 text-primary" />
                <span className="ml-2 font-medium">Summarize quarterly report</span>
              </div>
              <p className="text-xs text-left text-muted-foreground">Generate a concise summary of the Q2 report</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
