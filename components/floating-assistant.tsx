"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, X, Send, MessageSquare, Loader2, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAssistant } from "@/contexts/assistant-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

export function FloatingAssistant() {
  const {
    isListening,
    setIsListening,
    isFloatingAssistantOpen,
    setFloatingAssistantOpen,
    addAction,
    messages,
    addMessage,
    processCommand,
    isProcessing,
  } = useAssistant()

  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions = ["Check today's schedule", "Unread emails", "Summarize document", "Open Zoom"]

  const handleSuggestionClick = (suggestion: string) => {
    toast({
      title: "Processing command",
      description: `"${suggestion}"`,
    })

    processCommand(suggestion)
  }

  const handleSendCommand = () => {
    if (inputValue.trim()) {
      toast({
        title: "Processing command",
        description: `"${inputValue}"`,
      })

      processCommand(inputValue)
      setInputValue("")
    }
  }

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isFloatingAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[90vw] max-w-[320px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-4 bg-[#2B2D42] text-white flex justify-between items-center">
              <h3 className="font-medium">Quick Assistant</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-[#8D99AE]/20"
                onClick={() => setFloatingAssistantOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Chat messages */}
                <div className="space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-2",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt="AI" />
                          <AvatarFallback className="bg-[#4ECDC4] text-[#1A1A1A]">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "rounded-lg p-3 max-w-[80%]",
                          message.role === "user"
                            ? "bg-[#2B2D42] text-white"
                            : "bg-[#F8F9FA] dark:bg-gray-700 border border-[#8D99AE]/10 text-[#1A1A1A] dark:text-white",
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" alt="User" />
                          <AvatarFallback className="bg-[#EF233C] text-white">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isProcessing && (
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt="AI" />
                        <AvatarFallback className="bg-[#4ECDC4] text-[#1A1A1A]">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 bg-[#F8F9FA] dark:bg-gray-700 border border-[#8D99AE]/10">
                        <Loader2 className="h-4 w-4 animate-spin text-[#8D99AE]" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="bg-[#F8F9FA] dark:bg-gray-700 text-[#1A1A1A] dark:text-white border-[#8D99AE]/30 hover:bg-[#8D99AE]/10 text-xs"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <Input
                    placeholder="Type a command..."
                    className="pr-10"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendCommand()
                    }}
                    disabled={isProcessing}
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6 bg-[#4ECDC4] hover:bg-[#4ECDC4]/80"
                    onClick={handleSendCommand}
                    disabled={isProcessing || !inputValue.trim()}
                  >
                    <Send className="h-3 w-3 text-[#1A1A1A]" />
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full h-10 w-10 p-0 flex items-center justify-center",
                      isListening
                        ? "bg-[#EF233C] text-white border-[#EF233C] animate-pulse"
                        : "bg-[#F8F9FA] dark:bg-gray-700 text-[#1A1A1A] dark:text-white border-[#8D99AE]/30",
                    )}
                    onClick={() => setIsListening(!isListening)}
                    disabled={isProcessing}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setFloatingAssistantOpen(!isFloatingAssistantOpen)}
        className="bg-[#4ECDC4] text-[#1A1A1A] h-14 w-14 rounded-full flex items-center justify-center shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  )
}
