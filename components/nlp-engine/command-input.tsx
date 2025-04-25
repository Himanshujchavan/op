"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CommandInputProps {
  onCommandProcessed: (result: any) => void
  disabled?: boolean
}

export function CommandInput({ onCommandProcessed, disabled = false }: CommandInputProps) {
  const [command, setCommand] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processCommand = async () => {
    if (!command.trim() || isProcessing || disabled) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/process-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        onCommandProcessed({
          intent: data.intent,
          response: data.response,
          commandId: data.commandId,
        })
        setCommand("")
      } else {
        toast({
          title: "Error processing command",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing command:", error)
      toast({
        title: "Error processing command",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      // Focus the input after processing
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      processCommand()
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        ref={inputRef}
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Cannot process commands while offline" : "Type your command here..."}
        className="flex-1"
        disabled={isProcessing || disabled}
      />
      <Button onClick={processCommand} disabled={!command.trim() || isProcessing || disabled}>
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  )
}
