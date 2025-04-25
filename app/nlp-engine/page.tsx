"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CommandInput } from "@/components/nlp-engine/command-input"
import { VoiceCommand } from "@/components/nlp-engine/voice-command"
import type { CommandIntent } from "@/lib/groq-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, History, BarChart3, Wifi, WifiOff, Zap, Brain, Lightbulb, Mic } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"

export default function NLPEnginePage() {
  const [commandHistory, setCommandHistory] = useState<
    {
      intent: CommandIntent
      response: string
      commandId: string
      timestamp: Date
    }[]
  >([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [activeTab, setActiveTab] = useState("history")

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleCommandProcessed = (result: {
    intent: CommandIntent
    response: string
    commandId: string
  }) => {
    setCommandHistory((prev) => [
      {
        ...result,
        timestamp: new Date(),
      },
      ...prev,
    ])
  }

  const handleVoiceCommand = async (text: string) => {
    if (!isOnline) {
      setCommandHistory((prev) => [
        {
          intent: {
            type: "error",
            rawInput: text,
            action: "none",
            parameters: {},
          },
          response: "Cannot process command while offline. Please check your internet connection.",
          commandId: `offline-${Date.now()}`,
          timestamp: new Date(),
        },
        ...prev,
      ])
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "/api/process-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: text }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        handleCommandProcessed({
          intent: data.intent,
          response: data.response,
          commandId: data.commandId,
        })
      }
    } catch (error) {
      console.error("Error processing voice command:", error)
      setCommandHistory((prev) => [
        {
          intent: {
            type: "error",
            rawInput: text,
            action: "none",
            parameters: {},
          },
          response: `Error processing command: ${error instanceof Error ? error.message : "Unknown error"}`,
          commandId: `error-${Date.now()}`,
          timestamp: new Date(),
        },
        ...prev,
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center mb-2">
            <Brain className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-3xl font-bold glow-text">Natural Language Processing Engine</h1>
          </div>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Powered by Groq AI, this engine understands your commands and translates them into actions. Simply type or
            speak what you want to do, and let the AI handle the rest.
          </p>
        </motion.div>

        {!isOnline && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/30"
            role="alert"
          >
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              The NLP Engine requires an internet connection to process commands. Some features may be limited.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="enhanced-card overflow-hidden border-indigo-100 dark:border-indigo-900/50">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-primary" />
                      Command Center
                    </CardTitle>
                    <CardDescription>Type your command, and the AI will interpret what you want to do</CardDescription>
                  </div>
                  {isOnline ? (
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm">
                      <Wifi className="h-4 w-4 mr-1" />
                      Online
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500 text-sm">
                      <WifiOff className="h-4 w-4 mr-1" />
                      Offline
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="command-input p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <CommandInput onCommandProcessed={handleCommandProcessed} disabled={!isOnline} />
                </div>

                {/* Quick command suggestions */}
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Try these commands:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Summarize my emails", "Open notepad", "Search for jobs", "Create a spreadsheet"].map((cmd) => (
                      <Badge
                        key={cmd}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => (!isOnline ? null : handleVoiceCommand(cmd))}
                        aria-disabled={!isOnline}
                      >
                        {cmd}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="enhanced-card border-indigo-100 dark:border-indigo-900/50">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/50">
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-primary" />
                  Voice Commands
                </CardTitle>
                <CardDescription>Speak your command instead of typing</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {activeTab === "history" && <VoiceCommand onCommand={handleVoiceCommand} isProcessing={isProcessing} />}
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="history" onValueChange={setActiveTab} className="mt-8">
          <TabsList className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <TabsTrigger value="history" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              <History className="h-4 w-4 mr-2" />
              Command History
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="examples"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Examples
            </TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="mt-4">
            {commandHistory.length === 0 ? (
              <Card className="enhanced-card border-indigo-100 dark:border-indigo-900/50">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
                      <History className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">No commands yet. Try typing or speaking a command above.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {commandHistory.map((item, index) => (
                  <Card
                    key={index}
                    className="command-card overflow-hidden border-indigo-100 dark:border-indigo-900/50"
                  >
                    <CardHeader className="py-3 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-1 text-xs rounded ${
                              item.intent.type === "error"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                            }`}
                          >
                            {item.intent.type}
                          </div>
                          <span className="font-medium">{item.intent.rawInput}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{item.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <p className="text-sm">{item.response}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <Card className="enhanced-card border-indigo-100 dark:border-indigo-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Command Analytics</h3>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Analytics visualization will appear here as you use more commands.</p>
                  <p className="text-sm mt-2">Track your command usage patterns and success rates over time.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="examples" className="mt-4">
            <Card className="enhanced-card border-indigo-100 dark:border-indigo-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Example Commands</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-primary" />
                      Basic Commands
                    </h4>
                    <ul className="space-y-2 list-disc pl-5 text-sm">
                      <li>"Summarize my unread emails"</li>
                      <li>"Open notepad and type meeting notes"</li>
                      <li>"Search LinkedIn for software engineers in San Francisco"</li>
                      <li>"Create a new spreadsheet for Q3 budget planning"</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-primary" />
                      Advanced Commands
                    </h4>
                    <ul className="space-y-2 list-disc pl-5 text-sm">
                      <li>"Take a screenshot of my current window and save it to my desktop"</li>
                      <li>"Read this invoice and extract the total amount"</li>
                      <li>"Schedule a meeting with John for tomorrow at 3pm"</li>
                      <li>"Find all emails from Sarah about the project deadline"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
