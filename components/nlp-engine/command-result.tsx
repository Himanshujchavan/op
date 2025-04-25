"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { CommandIntent } from "@/lib/groq-api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Copy, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useCommandStatus } from "@/hooks/use-command-status"

interface CommandResultProps {
  intent: CommandIntent
  response: string
  commandId?: string
}

export function CommandResult({ intent, response, commandId }: CommandResultProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)
  const { status, result, loading, error } = useCommandStatus(commandId || null)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(intent, null, 2))
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "Command details copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "open_app":
        return "🖥️"
      case "summarize":
        return "📝"
      case "search":
        return "🔍"
      case "type":
        return "⌨️"
      case "fetch_data":
        return "📊"
      default:
        return "🤖"
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "running":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getIconForType(intent.type)}</span>
              <CardTitle>{intent.action.replace(/_/g, " ")}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{intent.type}</Badge>
              {commandId && getStatusBadge()}
            </div>
          </div>
          <CardDescription>{intent.target ? `Target: ${intent.target}` : "No specific target"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{response}</p>

          {/* Show result if available */}
          {status === "completed" && result && (
            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100">
              <h4 className="text-sm font-medium text-green-800 mb-1">Result:</h4>
              <p className="text-sm text-green-700">{typeof result === "string" ? result : JSON.stringify(result)}</p>
            </div>
          )}

          {/* Show error if failed */}
          {status === "failed" && result && (
            <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100">
              <h4 className="text-sm font-medium text-red-800 mb-1">Error:</h4>
              <p className="text-sm text-red-700">{typeof result === "string" ? result : JSON.stringify(result)}</p>
            </div>
          )}

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="bg-muted p-3 rounded-md overflow-x-auto">
                <pre className="text-xs">{JSON.stringify(intent, null, 2)}</pre>
              </div>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Show Details
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" /> Copy JSON
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
