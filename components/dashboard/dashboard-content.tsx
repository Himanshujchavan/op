"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, RefreshCcw, Calendar, Mail, FileText, Zap, Clock, ArrowRight, Undo, Loader2, WifiOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAssistant } from "@/contexts/assistant-context"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DashboardContent() {
  const { isListening, setIsListening, recentActions, addAction, processCommand, isProcessing } = useAssistant()
  const [commandInput, setCommandInput] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const router = useRouter()

  // Check online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    // Set initial status
    setIsOffline(!navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  const handleSendCommand = () => {
    if (commandInput.trim()) {
      processCommand(commandInput)
      setCommandInput("")
    }
  }

  const quickActions = [
    { icon: Calendar, label: "Calendar", color: "#4ECDC4", path: "/email" },
    { icon: Mail, label: "Email", color: "#EF233C", path: "/email" },
    { icon: FileText, label: "Documents", color: "#8D99AE", path: "/documents" },
    { icon: Zap, label: "Automation", color: "#2B2D42", path: "/automation" },
  ]

  const handleQuickAction = (action: string, path: string) => {
    addAction(`Used quick action: ${action}`)

    toast({
      title: `Opening ${action}`,
      description: `Navigating to ${action} section.`,
    })

    router.push(path)
  }

  const handleUndoAction = (id: number) => {
    // Find the action to undo
    const actionToUndo = recentActions.find((action) => action.id === id)

    if (actionToUndo) {
      toast({
        title: "Action undone",
        description: `"${actionToUndo.action}" has been undone.`,
      })

      // In a real app, you would implement actual undo functionality
      // For now, we'll just add a new action indicating the undo
      addAction(`Undid action: ${actionToUndo.action}`)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Dashboard</h1>
        <Button
          variant="outline"
          className="bg-white border-[#8D99AE]/30"
          onClick={handleRefresh}
          disabled={isRefreshing || isOffline}
        >
          {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {isOffline && (
        <Alert variant="destructive" className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You're offline</AlertTitle>
          <AlertDescription>
            Some features may be limited until your connection is restored. Data will sync when you're back online.
          </AlertDescription>
        </Alert>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Voice Input Card */}
        <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                  transition={
                    isListening
                      ? {
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1.5,
                        }
                      : {}
                  }
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center cursor-pointer",
                    isListening ? "bg-[#EF233C] text-white" : "bg-[#2B2D42] text-white",
                    isOffline && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => !isOffline && setIsListening(!isListening)}
                >
                  <Mic className="w-8 h-8" />
                </motion.div>
                <p className="text-lg font-medium text-foreground">
                  {isOffline ? "Voice unavailable offline" : isListening ? "Listening..." : "Hey Assistant"}
                </p>
                <div className="w-full max-w-md relative">
                  <Input
                    placeholder={isOffline ? "Voice commands unavailable offline" : "Type your command here..."}
                    className="border-border pr-10"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendCommand()
                    }}
                    disabled={isProcessing || isOffline}
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 bg-primary hover:bg-primary/80"
                    onClick={handleSendCommand}
                    disabled={isProcessing || !commandInput.trim() || isOffline}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" />
                    ) : (
                      <ArrowRight className="h-3 w-3 text-primary-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Actions */}
        <motion.div variants={item} className="md:col-span-2 lg:col-span-2">
          <Card className="border-border h-full">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Actions</CardTitle>
              <CardDescription>Your latest activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActions.length > 0 ? (
                  recentActions.map((action) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: action.id * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          {action.id}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{action.action}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {action.time}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleUndoAction(action.id)}
                        disabled={isOffline}
                      >
                        <Undo className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No recent actions</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full text-primary"
                onClick={() => router.push("/history")}
                disabled={isOffline}
              >
                View All History
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card className="border-border h-full">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription>Frequently used tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: isOffline ? 1 : 1.05 }}
                      whileTap={{ scale: isOffline ? 1 : 0.95 }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-lg bg-background border border-border transition-shadow",
                        !isOffline && "cursor-pointer hover:shadow-md",
                        isOffline && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() => !isOffline && handleQuickAction(action.label, action.path)}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: action.color }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Smart Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-[#8D99AE]/30">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Smart Suggestions</CardTitle>
            <CardDescription>Based on your activity and schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-[#4ECDC4] hover:bg-[#4ECDC4]/80 text-[#1A1A1A]"
                onClick={() => {
                  processCommand("Check today's schedule")
                  toast({
                    title: "Checking schedule",
                    description: "Retrieving your calendar for today.",
                  })
                }}
                disabled={isProcessing || isOffline}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Check today's schedule
              </Button>
              <Button
                className="bg-[#EF233C] hover:bg-[#EF233C]/80 text-white"
                onClick={() => {
                  processCommand("Check unread emails")
                  toast({
                    title: "Checking emails",
                    description: "You have 3 unread emails.",
                  })
                  router.push("/email")
                }}
                disabled={isProcessing || isOffline}
              >
                <Mail className="w-4 h-4 mr-2" />3 unread emails
              </Button>
              <Button
                className="bg-[#2B2D42] hover:bg-[#2B2D42]/80 text-white"
                onClick={() => {
                  processCommand("Summarize quarterly report")
                  toast({
                    title: "Summarizing report",
                    description: "Processing quarterly report for summary.",
                  })
                  router.push("/documents")
                }}
                disabled={isProcessing || isOffline}
              >
                <FileText className="w-4 h-4 mr-2" />
                Summarize quarterly report
              </Button>
              <Button
                className="bg-[#8D99AE] hover:bg-[#8D99AE]/80 text-white"
                onClick={() => {
                  processCommand("Run daily automation")
                  toast({
                    title: "Running automation",
                    description: "Daily automation script is now running.",
                  })
                  router.push("/automation")
                }}
                disabled={isProcessing || isOffline}
              >
                <Zap className="w-4 h-4 mr-2" />
                Run daily automation
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
