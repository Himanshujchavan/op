"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  GripVertical,
  RefreshCcw,
  Send,
  Sparkles,
  Loader2,
  Brain,
  Plus,
  Trash,
  PlusCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useAssistant } from "@/contexts/assistant-context"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { auth, addTask, getUserTasks, updateTask, deleteTask } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TaskAssistant() {
  const { addAction } = useAssistant()
  const [taskInput, setTaskInput] = useState("")
  const [currentTask, setCurrentTask] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const [taskResult, setTaskResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [userTasks, setUserTasks] = useState<any[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  })

  // Add this state for the new task
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [isAddingTask, setIsAddingTask] = useState(false)

  // Load user tasks
  useEffect(() => {
    const loadTasks = async () => {
      const user = auth.currentUser
      if (user) {
        setIsLoadingTasks(true)
        try {
          const result = await getUserTasks(user.uid)
          if (result.success) {
            setUserTasks(result.tasks)
          }
        } catch (error) {
          console.error("Error loading tasks:", error)
        } finally {
          setIsLoadingTasks(false)
        }
      }
    }

    loadTasks()
  }, [])

  const handleSubmitTask = async () => {
    if (taskInput.trim()) {
      setCurrentTask(taskInput)
      setTaskInput("")
      setProgress(0)
      setTaskResult(null)
      setAiResponse(null)
      addAction(`Started task: ${taskInput}`)
      setIsProcessing(true)

      toast({
        title: "Task started",
        description: `Processing: "${taskInput}"`,
      })

      try {
        // Start progress animation
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval)
              return 90
            }
            return prev + 10
          })
        }, 500)

        // Simulate AI processing
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Generate a simple mock response
        const mockResponse = {
          steps: [
            { title: "Analyze task requirements", description: "Breaking down what needs to be done" },
            { title: "Gather necessary information", description: "Collecting all relevant data" },
            { title: "Create implementation plan", description: "Developing a step-by-step approach" },
            { title: "Execute the task", description: "Carrying out the planned steps" },
            { title: "Review and verify", description: "Checking the results for accuracy" },
          ],
          estimatedTime: "30 minutes",
          resources: ["Documentation", "Task templates", "Previous examples"],
          summary: "This task has been analyzed and broken down into manageable steps.",
        }

        // Complete progress
        clearInterval(interval)
        setProgress(100)

        // Generate a simple result message
        const result = `I've analyzed your task and created a detailed plan. Please review the steps below.`
        setTaskResult(result)
        setAiResponse(mockResponse)

        toast({
          title: "Task analyzed",
          description: "Your task has been processed with AI assistance.",
        })

        // Save task to Firebase
        const user = auth.currentUser
        if (user) {
          const taskData = {
            title: taskInput,
            description: result,
            steps: mockResponse.steps,
            estimatedTime: mockResponse.estimatedTime,
            resources: mockResponse.resources,
            createdAt: new Date().toISOString(),
          }

          const addResult = await addTask(user.uid, taskData)
          if (addResult.success) {
            // Refresh tasks list
            const tasksResult = await getUserTasks(user.uid)
            if (tasksResult.success) {
              setUserTasks(tasksResult.tasks)
            }
          }
        }
      } catch (error) {
        console.error("Error processing task:", error)
        setTaskResult("I encountered an issue while processing your task. Please try again.")
        toast({
          title: "Processing error",
          description: "There was an error analyzing your task.",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleReset = () => {
    setIsResetting(true)

    setTimeout(() => {
      setCurrentTask(null)
      setProgress(0)
      setTaskResult(null)
      setAiResponse(null)
      setIsResetting(false)

      toast({
        title: "Task reset",
        description: "Task assistant has been reset.",
      })
    }, 1000)
  }

  const handleAddToTasks = async (step: string) => {
    const user = auth.currentUser
    if (user) {
      try {
        const taskData = {
          title: step,
          description: "Task created from step",
          createdAt: new Date().toISOString(),
        }

        const result = await addTask(user.uid, taskData)
        if (result.success) {
          toast({
            title: "Added to tasks",
            description: `"${step}" has been added to your task list.`,
          })

          addAction(`Added task: ${step}`)

          // Refresh tasks list
          const tasksResult = await getUserTasks(user.uid)
          if (tasksResult.success) {
            setUserTasks(tasksResult.tasks)
          }
        }
      } catch (error) {
        console.error("Error adding task:", error)
        toast({
          title: "Error",
          description: "Failed to add task.",
          variant: "destructive",
        })
      }
    }
  }

  const handleAddNewTask = async () => {
    if (!newTask.title) {
      toast({
        title: "Title required",
        description: "Please provide a task title.",
        variant: "destructive",
      })
      return
    }

    const user = auth.currentUser
    if (user) {
      try {
        const taskData = {
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          createdAt: new Date().toISOString(),
        }

        const result = await addTask(user.uid, taskData)
        if (result.success) {
          toast({
            title: "Task added",
            description: `"${newTask.title}" has been added to your tasks.`,
          })

          // Reset form
          setNewTask({
            title: "",
            description: "",
            dueDate: "",
          })

          setShowAddTaskDialog(false)

          // Refresh tasks list
          const tasksResult = await getUserTasks(user.uid)
          if (tasksResult.success) {
            setUserTasks(tasksResult.tasks)
          }
        }
      } catch (error) {
        console.error("Error adding task:", error)
        toast({
          title: "Error",
          description: "Failed to add task.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const user = auth.currentUser
    if (user) {
      try {
        const result = await deleteTask(user.uid, taskId)
        if (result.success) {
          toast({
            title: "Task deleted",
            description: "The task has been removed.",
          })

          // Update local state
          setUserTasks(userTasks.filter((task) => task.id !== taskId))
        }
      } catch (error) {
        console.error("Error deleting task:", error)
        toast({
          title: "Error",
          description: "Failed to delete task.",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleTaskComplete = async (taskId: string, completed: boolean) => {
    const user = auth.currentUser
    if (user) {
      try {
        const result = await updateTask(user.uid, taskId, { completed: !completed })
        if (result.success) {
          // Update local state
          setUserTasks(userTasks.map((task) => (task.id === taskId ? { ...task, completed: !completed } : task)))
        }
      } catch (error) {
        console.error("Error updating task:", error)
        toast({
          title: "Error",
          description: "Failed to update task.",
          variant: "destructive",
        })
      }
    }
  }

  // Add this function to handle adding a new task
  const handleAddTask = async () => {
    if (!newTaskTitle) return

    setIsAddingTask(true)

    try {
      if (!auth?.currentUser?.uid) {
        toast({
          title: "Authentication required",
          description: "Please log in to add tasks",
          variant: "destructive",
        })
        setIsAddingTask(false)
        return
      }

      const result = await addTask(auth.currentUser.uid, {
        title: newTaskTitle,
        description: newTaskDescription,
        dueDate: newTaskDueDate,
        priority: "medium",
        status: "pending",
      })

      if (result.success) {
        toast({
          title: "Task added",
          description: "Your task has been added successfully",
        })

        // Reset form
        setNewTaskTitle("")
        setNewTaskDescription("")
        setNewTaskDueDate("")

        // Refresh tasks (you would need to implement this)
        // fetchTasks()
      } else {
        toast({
          title: "Failed to add task",
          description: result.error || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      })
    } finally {
      setIsAddingTask(false)
    }
  }

  const taskSteps = [
    { id: 1, title: "Analyzing request", description: "Breaking down your task", completed: progress >= 20 },
    { id: 2, title: "Gathering information", description: "Searching relevant data", completed: progress >= 40 },
    { id: 3, title: "Processing", description: "Applying AI reasoning", completed: progress >= 60 },
    { id: 4, title: "Generating response", description: "Creating detailed answer", completed: progress >= 80 },
    { id: 5, title: "Finalizing", description: "Polishing and formatting", completed: progress >= 100 },
  ]

  const exampleTasks = [
    "Create a weekly report from my sales data",
    "Schedule a team meeting for next Tuesday",
    "Summarize the last 5 customer support tickets",
    "Draft an email to the marketing team",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Task Assistant</h1>
        <Button
          variant="outline"
          className="bg-white dark:bg-transparent border-border"
          onClick={handleReset}
          disabled={isResetting || !currentTask}
        >
          {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
          Reset
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Task Input */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>What would you like me to do?</CardTitle>
            <CardDescription>Describe your task in detail</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Enter your task here..."
                  className="pr-10 border-border min-h-[100px] resize-none"
                  disabled={!!currentTask && progress < 100}
                />
                <Button
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 bg-primary hover:bg-primary/90"
                  onClick={handleSubmitTask}
                  disabled={!taskInput.trim() || (!!currentTask && progress < 100) || isProcessing}
                >
                  <Send className="h-4 w-4 text-primary-foreground" />
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleTasks.map((task, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="bg-secondary text-foreground border-border hover:bg-secondary/80"
                      onClick={() => setTaskInput(task)}
                      disabled={!!currentTask && progress < 100}
                    >
                      {task}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Task */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Current Task</CardTitle>
              <CardDescription>{currentTask ? "Processing your request" : "No active task"}</CardDescription>
            </div>
            <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>Create a new task to track</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description (optional)</Label>
                    <Textarea
                      id="task-description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due Date (optional)</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="cursor-pointer"
                      onClick={(e) => {
                        // Ensure the date picker opens when clicking anywhere on the input
                        const input = e.target as HTMLInputElement
                        input.showPicker()
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNewTask}>Add Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {currentTask ? (
              <div className="space-y-4">
                <div className="p-3 bg-secondary rounded-lg border border-border">
                  <p className="font-medium">{currentTask}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary" />
                </div>

                {taskResult && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="font-medium">Result:</p>
                    <p className="text-sm mt-1">{taskResult}</p>

                    {aiResponse?.estimatedTime && (
                      <div className="mt-2 flex items-center">
                        <Badge variant="outline" className="bg-primary/5 border-primary/20">
                          Estimated time: {aiResponse.estimatedTime}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2 p-4">
                    <Brain className="h-5 w-5 text-primary animate-pulse" />
                    <p className="text-sm font-medium">AI is analyzing your task...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground">
                  <Sparkles className="w-10 h-10 mb-2" />
                  <p>Enter a task to get started</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Your Tasks</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <PlusCircle className="h-4 w-4" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              placeholder="Task title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={newTaskDescription}
                              onChange={(e) => setNewTaskDescription(e.target.value)}
                              placeholder="Task description"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                              id="dueDate"
                              type="date"
                              value={newTaskDueDate}
                              onChange={(e) => setNewTaskDueDate(e.target.value)}
                              className="cursor-pointer"
                              onClick={(e) => {
                                // Ensure the date picker opens when clicking anywhere on the input
                                const input = e.target as HTMLInputElement
                                input.showPicker()
                              }}
                            />
                          </div>
                          <Button className="w-full" onClick={handleAddTask} disabled={isAddingTask || !newTaskTitle}>
                            {isAddingTask ? "Adding..." : "Add Task"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {isLoadingTasks ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : userTasks.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {userTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border"
                        >
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full mr-2"
                              onClick={() => handleToggleTaskComplete(task.id, task.completed)}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </Button>
                            <span className={cn("text-sm", task.completed && "line-through text-muted-foreground")}>
                              {task.title}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No tasks yet. Add a task to get started.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Breakdown */}
      {currentTask && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Task Breakdown</CardTitle>
              <CardDescription>Step-by-step workflow</CardDescription>
            </CardHeader>
            <CardContent>
              {!aiResponse?.steps ? (
                <div className="space-y-4">
                  {taskSteps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center p-3 rounded-lg border",
                        step.completed ? "bg-primary/10 border-primary/30" : "bg-secondary border-border",
                      )}
                    >
                      <div className="flex items-center justify-center w-8 h-8">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 ml-2">
                        <p className="font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8">
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {aiResponse.steps.map((step: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start p-3 rounded-lg border border-border bg-secondary"
                    >
                      <div className="flex items-center justify-center w-8 h-8 mt-1">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{step.title}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleAddToTasks(step.title)}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add to tasks
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}

                  {aiResponse.resources && aiResponse.resources.length > 0 && (
                    <div className="p-3 rounded-lg border border-border bg-secondary/50">
                      <p className="font-medium mb-2">Recommended Resources:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {aiResponse.resources.map((resource: string, index: number) => (
                          <li key={index} className="text-sm">
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                disabled={progress < 100}
                onClick={() => {
                  if (taskResult) {
                    addAction(`Viewed results for task: ${currentTask}`)

                    toast({
                      title: "Task completed",
                      description: "The task has been completed successfully.",
                    })
                  }
                }}
              >
                View Results
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
