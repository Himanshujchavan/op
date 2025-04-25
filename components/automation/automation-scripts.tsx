"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Code,
  FileText,
  Play,
  Plus,
  RefreshCcw,
  Terminal,
  Video,
  CheckCircle2,
  Loader2,
  Pause,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useAssistant } from "@/contexts/assistant-context"
import { toast } from "@/components/ui/use-toast"

export function AutomationScripts() {
  const { addAction } = useAssistant()
  const [activeScript, setActiveScript] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const predefinedScripts = [
    {
      id: "zoom-notes",
      name: "Open Zoom + Notes",
      description: "Opens Zoom and a note-taking app side by side",
      icon: Video,
      color: "#4ECDC4",
    },
    {
      id: "daily-report",
      name: "Generate Daily Report",
      description: "Collects data and creates a daily summary report",
      icon: FileText,
      color: "#EF233C",
    },
    {
      id: "calendar-check",
      name: "Calendar Check",
      description: "Checks upcoming meetings and sends reminders",
      icon: Calendar,
      color: "#2B2D42",
    },
    {
      id: "code-backup",
      name: "Code Backup",
      description: "Creates a backup of your code repositories",
      icon: Code,
      color: "#8D99AE",
    },
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  const handleRunScript = (scriptId: string) => {
    setActiveScript(scriptId)
    setIsRunning(true)
    setProgress(0)
    setLogs([])
    addAction(`Started automation script: ${predefinedScripts.find((s) => s.id === scriptId)?.name}`)

    // Simulate script execution
    const script = predefinedScripts.find((s) => s.id === scriptId)

    if (script) {
      let logMessages: string[] = []

      if (script.id === "zoom-notes") {
        logMessages = [
          "Checking if Zoom is installed...",
          "Launching Zoom application...",
          "Checking if Notes app is installed...",
          "Launching Notes application...",
          "Arranging windows side by side...",
          "Setup complete!",
        ]
      } else if (script.id === "daily-report") {
        logMessages = [
          "Connecting to database...",
          "Fetching today's metrics...",
          "Processing sales data...",
          "Generating charts and visualizations...",
          "Compiling report document...",
          "Saving report to shared drive...",
          "Report generated successfully!",
        ]
      } else if (script.id === "calendar-check") {
        logMessages = [
          "Connecting to calendar API...",
          "Fetching today's events...",
          "Checking for upcoming meetings...",
          "Found 3 meetings scheduled for today",
          "Preparing notification messages...",
          "Sending reminders...",
          "Calendar check complete!",
        ]
      } else if (script.id === "code-backup") {
        logMessages = [
          "Scanning for code repositories...",
          "Found 5 repositories to backup",
          "Creating backup directory...",
          "Cloning repositories...",
          "Compressing backup files...",
          "Uploading to cloud storage...",
          "Backup complete!",
        ]
      }

      let currentLog = 0
      const totalLogs = logMessages.length

      const interval = setInterval(() => {
        if (currentLog < totalLogs) {
          setLogs((prev) => [...prev, logMessages[currentLog]])
          setProgress(Math.round(((currentLog + 1) / totalLogs) * 100))
          currentLog++
        } else {
          clearInterval(interval)
          setIsRunning(false)
          toast({
            title: "Script completed",
            description: `${script.name} has finished running successfully.`,
          })
          addAction(`Completed automation script: ${script.name}`)

          // Save the execution result to localStorage for history
          try {
            const scriptHistory = JSON.parse(localStorage.getItem("scriptHistory") || "[]")
            scriptHistory.push({
              id: Date.now(),
              scriptId: script.id,
              scriptName: script.name,
              timestamp: new Date().toISOString(),
              logs: logMessages,
              success: true,
            })
            localStorage.setItem("scriptHistory", JSON.stringify(scriptHistory))
          } catch (error) {
            console.error("Error saving script history:", error)
          }
        }
      }, 1000)

      setIntervalId(interval)
    }
  }

  const handleStopScript = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setIsRunning(false)
    setLogs((prev) => [...prev, "Script execution stopped by user."])

    if (activeScript) {
      const scriptName = predefinedScripts.find((s) => s.id === activeScript)?.name
      addAction(`Stopped automation script: ${scriptName}`)

      toast({
        title: "Script stopped",
        description: `${scriptName} execution has been stopped.`,
        variant: "destructive",
      })
    }
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
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Automation Scripts</h1>
        <Button
          variant="outline"
          className="bg-white border-[#8D99AE]/30"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Predefined Scripts */}
        <Card className="border-[#8D99AE]/30">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Predefined Scripts</CardTitle>
            <CardDescription>Run automation with a single click</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
              {predefinedScripts.map((script) => {
                const Icon = script.icon
                const isActive = activeScript === script.id

                return (
                  <motion.div
                    key={script.id}
                    variants={item}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      isActive
                        ? "bg-[#2B2D42]/5 border-[#2B2D42]/30"
                        : "bg-white border-[#8D99AE]/20 hover:border-[#8D99AE]/40",
                    )}
                    onClick={() => setActiveScript(script.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: script.color }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-medium text-[#1A1A1A] mb-1">{script.name}</h3>
                      <p className="text-xs text-[#8D99AE]">{script.description}</p>
                    </div>
                  </motion.div>
                )
              })}

              <motion.div
                variants={item}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-4 rounded-lg border border-dashed border-[#8D99AE]/30 cursor-pointer hover:border-[#8D99AE]/50 bg-[#F8F9FA]"
                onClick={() => {
                  toast({
                    title: "Create custom script",
                    description: "Opening script editor...",
                  })

                  // Simulate opening a script editor
                  setTimeout(() => {
                    toast({
                      title: "Coming soon",
                      description: "Custom script creation will be available in a future update.",
                    })
                  }, 1000)
                }}
              >
                <div className="flex flex-col items-center text-center h-full justify-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[#8D99AE]/20">
                    <Plus className="w-6 h-6 text-[#8D99AE]" />
                  </div>
                  <h3 className="font-medium text-[#1A1A1A] mb-1">Create New</h3>
                  <p className="text-xs text-[#8D99AE]">Build a custom automation</p>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-[#2B2D42] hover:bg-[#2B2D42]/80"
              disabled={!activeScript || isRunning}
              onClick={() => activeScript && handleRunScript(activeScript)}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Selected Script
            </Button>
          </CardFooter>
        </Card>

        {/* Script Execution */}
        <Card className="border-[#8D99AE]/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#1A1A1A]">Script Execution</CardTitle>
                <CardDescription>
                  {activeScript
                    ? `Running: ${predefinedScripts.find((s) => s.id === activeScript)?.name}`
                    : "Select a script to run"}
                </CardDescription>
              </div>
              {isRunning && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-[#EF233C]/30 text-[#EF233C] hover:bg-[#EF233C]/10 hover:text-[#EF233C]"
                  onClick={handleStopScript}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeScript && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-[#8D99AE]/20" />
                </div>
              )}

              <div className="border rounded-lg bg-[#2B2D42] text-white p-3 font-mono text-sm h-64 overflow-y-auto">
                <div className="flex items-center mb-2">
                  <Terminal className="w-4 h-4 mr-2" />
                  <span>Terminal Output</span>
                </div>
                <div className="space-y-1">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex"
                      >
                        <span className="text-[#4ECDC4] mr-2">$</span>
                        <span>{log}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-[#8D99AE]">
                      {activeScript
                        ? "Waiting to start execution..."
                        : "No script selected. Select a script and click Run."}
                    </div>
                  )}
                  {isRunning && (
                    <motion.div
                      animate={{ opacity: [0.5, 1] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                      className="inline-block w-2 h-4 bg-white ml-1"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-[#8D99AE] text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {logs.length > 0 ? "Last run: Just now" : "Never run"}
            </div>
            {progress === 100 && (
              <div className="flex items-center text-[#4ECDC4] text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Completed successfully
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Scheduled Scripts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-[#8D99AE]/30">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Scheduled Scripts</CardTitle>
            <CardDescription>Automations that run on a schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#8D99AE]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#2B2D42] flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">Daily Report Generation</p>
                      <p className="text-xs text-[#8D99AE] flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Runs every weekday at 5:00 PM
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-[#8D99AE]/30"
                    onClick={() => {
                      toast({
                        title: "Edit schedule",
                        description: "Schedule editing will be available in a future update.",
                      })
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#8D99AE]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#4ECDC4] flex items-center justify-center mr-3">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">Weekly Calendar Sync</p>
                      <p className="text-xs text-[#8D99AE] flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Runs every Monday at 9:00 AM
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-[#8D99AE]/30"
                    onClick={() => {
                      toast({
                        title: "Edit schedule",
                        description: "Schedule editing will be available in a future update.",
                      })
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#8D99AE]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#EF233C] flex items-center justify-center mr-3">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">Code Repository Backup</p>
                      <p className="text-xs text-[#8D99AE] flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Runs every Friday at 11:00 PM
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-[#8D99AE]/30"
                    onClick={() => {
                      toast({
                        title: "Edit schedule",
                        description: "Schedule editing will be available in a future update.",
                      })
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-[#4ECDC4] hover:bg-[#4ECDC4]/80 text-[#1A1A1A]"
              onClick={() => {
                toast({
                  title: "Schedule script",
                  description: "Opening scheduler...",
                })

                // Simulate opening a scheduler
                setTimeout(() => {
                  toast({
                    title: "Coming soon",
                    description: "Schedule creation will be available in a future update.",
                  })
                }, 1000)

                addAction("Attempted to schedule new script")
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule New Script
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
