"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Plus,
  Workflow,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
  Clock,
  Trash,
  Play,
  Code,
  Settings,
  AlertCircle,
} from "lucide-react"
import { useAssistant } from "@/contexts/assistant-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Using default export instead of named export
export default function CustomAutomation() {
  const { addAction } = useAssistant()
  const [showNewWorkflow, setShowNewWorkflow] = useState(false)
  const [activeTab, setActiveTab] = useState("workflows")

  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: "Email to Task Workflow",
      description: "Automatically create tasks from emails and notify team members",
      enabled: true,
      triggers: [
        {
          type: "email",
          condition: "subject_contains",
          value: "Action Required",
        },
      ],
      actions: [
        {
          type: "task",
          action: "create",
          parameters: {
            title: "{{email.subject}}",
            description: "{{email.body}}",
            priority: "high",
          },
        },
        {
          type: "notification",
          action: "send",
          parameters: {
            to: "team",
            message: "New task created: {{task.title}}",
          },
        },
      ],
      lastRun: "Today, 10:23 AM",
      runCount: 5,
    },
    {
      id: 2,
      name: "Meeting Follow-up Workflow",
      description: "Send follow-up emails after meetings and create summary documents",
      enabled: false,
      triggers: [
        {
          type: "calendar",
          condition: "event_ends",
          value: "Meeting",
        },
      ],
      actions: [
        {
          type: "email",
          action: "send",
          parameters: {
            to: "{{meeting.attendees}}",
            subject: "Follow-up: {{meeting.title}}",
            body: "Thank you for attending the meeting. Here's a summary...",
          },
        },
        {
          type: "document",
          action: "create",
          parameters: {
            title: "Meeting Summary - {{meeting.title}}",
            template: "meeting-summary",
          },
        },
      ],
      lastRun: "Yesterday",
      runCount: 3,
    },
  ])

  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    triggerType: "email",
    triggerCondition: "subject_contains",
    triggerValue: "",
    actions: [
      {
        type: "task",
        action: "create",
        parameters: {
          title: "",
          description: "",
          priority: "medium",
        },
      },
    ],
  })

  const [logs, setLogs] = useState([
    {
      id: 1,
      workflow: "Email to Task Workflow",
      timestamp: "Today, 10:23 AM",
      status: "success",
      details: "Created task 'Review Q2 Marketing Report' from email",
    },
    {
      id: 2,
      workflow: "Email to Task Workflow",
      timestamp: "Today, 9:15 AM",
      status: "success",
      details: "Created task 'Follow up with client' from email",
    },
    {
      id: 3,
      workflow: "Meeting Follow-up Workflow",
      timestamp: "Yesterday",
      status: "error",
      details: "Failed to send follow-up email: Invalid recipient",
    },
  ])

  const handleAddWorkflow = () => {
    if (!newWorkflow.name || !newWorkflow.triggerValue) {
      toast({
        title: "Missing information",
        description: "Please provide a name and trigger condition for your workflow.",
        variant: "destructive",
      })
      return
    }

    const workflow = {
      id: Date.now(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      enabled: true,
      triggers: [
        {
          type: newWorkflow.triggerType,
          condition: newWorkflow.triggerCondition,
          value: newWorkflow.triggerValue,
        },
      ],
      actions: newWorkflow.actions,
      lastRun: "Never",
      runCount: 0,
    }

    setWorkflows([...workflows, workflow])
    setShowNewWorkflow(false)
    setNewWorkflow({
      name: "",
      description: "",
      triggerType: "email",
      triggerCondition: "subject_contains",
      triggerValue: "",
      actions: [
        {
          type: "task",
          action: "create",
          parameters: {
            title: "",
            description: "",
            priority: "medium",
          },
        },
      ],
    })

    addAction(`Created new custom workflow: ${newWorkflow.name}`)

    toast({
      title: "Workflow created",
      description: "Your custom workflow has been created successfully.",
    })
  }

  const handleToggleWorkflow = (id: number) => {
    setWorkflows(
      workflows.map((workflow) => (workflow.id === id ? { ...workflow, enabled: !workflow.enabled } : workflow)),
    )

    const workflow = workflows.find((w) => w.id === id)
    if (workflow) {
      toast({
        title: workflow.enabled ? "Workflow disabled" : "Workflow enabled",
        description: `"${workflow.name}" has been ${workflow.enabled ? "disabled" : "enabled"}.`,
      })
    }
  }

  const handleDeleteWorkflow = (id: number) => {
    setWorkflows(workflows.filter((workflow) => workflow.id !== id))

    toast({
      title: "Workflow deleted",
      description: "The custom workflow has been deleted.",
    })
  }

  const handleRunWorkflow = (id: number) => {
    const workflow = workflows.find((w) => w.id === id)
    if (workflow) {
      toast({
        title: "Workflow running",
        description: `"${workflow.name}" is now running.`,
      })

      // Simulate a successful run
      setTimeout(() => {
        setLogs([
          {
            id: Date.now(),
            workflow: workflow.name,
            timestamp: "Just now",
            status: "success",
            details: `Manually executed workflow "${workflow.name}"`,
          },
          ...logs,
        ])

        setWorkflows(
          workflows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  lastRun: "Just now",
                  runCount: w.runCount + 1,
                }
              : w,
          ),
        )

        toast({
          title: "Workflow completed",
          description: `"${workflow.name}" has completed successfully.`,
        })
      }, 2000)
    }
  }

  const handleAddAction = () => {
    setNewWorkflow({
      ...newWorkflow,
      actions: [
        ...newWorkflow.actions,
        {
          type: "notification",
          action: "send",
          parameters: {
            to: "",
            message: "",
          },
        },
      ],
    })
  }

  const updateAction = (index: number, field: string, value: string) => {
    const updatedActions = [...newWorkflow.actions]
    if (field === "type") {
      let parameters = {}

      if (value === "task") {
        parameters = {
          title: "",
          description: "",
          priority: "medium",
        }
      } else if (value === "email") {
        parameters = {
          to: "",
          subject: "",
          body: "",
        }
      } else if (value === "notification") {
        parameters = {
          to: "",
          message: "",
        }
      } else if (value === "document") {
        parameters = {
          title: "",
          template: "",
        }
      }

      updatedActions[index] = {
        type: value,
        action: updatedActions[index].action,
        parameters,
      }
    } else if (field === "action") {
      updatedActions[index] = {
        ...updatedActions[index],
        action: value,
      }
    } else {
      // It's a parameter update
      updatedActions[index] = {
        ...updatedActions[index],
        parameters: {
          ...updatedActions[index].parameters,
          [field]: value,
        },
      }
    }

    setNewWorkflow({
      ...newWorkflow,
      actions: updatedActions,
    })
  }

  const removeAction = (index: number) => {
    const updatedActions = [...newWorkflow.actions]
    updatedActions.splice(index, 1)
    setNewWorkflow({
      ...newWorkflow,
      actions: updatedActions,
    })
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "calendar":
        return <Calendar className="h-4 w-4" />
      case "file":
        return <FileText className="h-4 w-4" />
      case "task":
        return <CheckSquare className="h-4 w-4" />
      case "time":
        return <Clock className="h-4 w-4" />
      default:
        return <Workflow className="h-4 w-4" />
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "notification":
        return <AlertCircle className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "running":
        return <Badge className="bg-blue-500">Running</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Define dummy variables for email, meeting, and task
  const email = { subject: "", body: "" }
  const meeting = { attendees: "", title: "" }
  const task = { title: "" }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="workflows" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflows">Custom Workflows</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Workflows</CardTitle>
                  <CardDescription>Create and manage custom automation workflows</CardDescription>
                </div>
                <Dialog open={showNewWorkflow} onOpenChange={setShowNewWorkflow}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Workflow
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Custom Workflow</DialogTitle>
                      <DialogDescription>
                        Set up a custom workflow with triggers and actions to automate your tasks.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="workflow-name">Workflow Name</Label>
                        <Input
                          id="workflow-name"
                          value={newWorkflow.name}
                          onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                          placeholder="E.g., Email to Task Workflow"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="workflow-description">Description</Label>
                        <Textarea
                          id="workflow-description"
                          value={newWorkflow.description}
                          onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                          placeholder="Describe what this workflow does"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Trigger (When this happens...)</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Trigger Type</Label>
                            <Select
                              value={newWorkflow.triggerType}
                              onValueChange={(value) => setNewWorkflow({ ...newWorkflow, triggerType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="calendar">Calendar</SelectItem>
                                <SelectItem value="file">File</SelectItem>
                                <SelectItem value="task">Task</SelectItem>
                                <SelectItem value="time">Time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Condition</Label>
                            <Select
                              value={newWorkflow.triggerCondition}
                              onValueChange={(value) => setNewWorkflow({ ...newWorkflow, triggerCondition: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                              <SelectContent>
                                {newWorkflow.triggerType === "email" && (
                                  <>
                                    <SelectItem value="subject_contains">Subject Contains</SelectItem>
                                    <SelectItem value="from_address">From Address</SelectItem>
                                    <SelectItem value="has_attachment">Has Attachment</SelectItem>
                                  </>
                                )}
                                {newWorkflow.triggerType === "calendar" && (
                                  <>
                                    <SelectItem value="event_created">Event Created</SelectItem>
                                    <SelectItem value="event_starts">Event Starts</SelectItem>
                                    <SelectItem value="event_ends">Event Ends</SelectItem>
                                  </>
                                )}
                                {newWorkflow.triggerType === "file" && (
                                  <>
                                    <SelectItem value="created">Created</SelectItem>
                                    <SelectItem value="modified">Modified</SelectItem>
                                    <SelectItem value="type_is">Type Is</SelectItem>
                                  </>
                                )}
                                {newWorkflow.triggerType === "task" && (
                                  <>
                                    <SelectItem value="created">Created</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="due_soon">Due Soon</SelectItem>
                                  </>
                                )}
                                {newWorkflow.triggerType === "time" && (
                                  <>
                                    <SelectItem value="daily_at">Daily At</SelectItem>
                                    <SelectItem value="weekly_on">Weekly On</SelectItem>
                                    <SelectItem value="monthly_on">Monthly On</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Value</Label>
                            <Input
                              placeholder="Enter value"
                              value={newWorkflow.triggerValue}
                              onChange={(e) => setNewWorkflow({ ...newWorkflow, triggerValue: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Actions (Do this...)</Label>
                          <Button variant="outline" size="sm" onClick={handleAddAction}>
                            <Plus className="h-4 w-4 mr-1" /> Add Action
                          </Button>
                        </div>

                        {newWorkflow.actions.map((action, index) => (
                          <Card key={index} className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeAction(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <CardContent className="pt-6">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label>Action Type</Label>
                                  <Select
                                    value={action.type}
                                    onValueChange={(value) => updateAction(index, "type", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="task">Create Task</SelectItem>
                                      <SelectItem value="email">Send Email</SelectItem>
                                      <SelectItem value="notification">Send Notification</SelectItem>
                                      <SelectItem value="document">Create Document</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label>Action</Label>
                                  <Select
                                    value={action.action}
                                    onValueChange={(value) => updateAction(index, "action", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {action.type === "task" && (
                                        <>
                                          <SelectItem value="create">Create</SelectItem>
                                          <SelectItem value="update">Update</SelectItem>
                                          <SelectItem value="complete">Complete</SelectItem>
                                        </>
                                      )}
                                      {action.type === "email" && (
                                        <>
                                          <SelectItem value="send">Send</SelectItem>
                                          <SelectItem value="forward">Forward</SelectItem>
                                          <SelectItem value="reply">Reply</SelectItem>
                                        </>
                                      )}
                                      {action.type === "notification" && (
                                        <>
                                          <SelectItem value="send">Send</SelectItem>
                                          <SelectItem value="schedule">Schedule</SelectItem>
                                        </>
                                      )}
                                      {action.type === "document" && (
                                        <>
                                          <SelectItem value="create">Create</SelectItem>
                                          <SelectItem value="update">Update</SelectItem>
                                          <SelectItem value="share">Share</SelectItem>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {action.type === "task" && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="col-span-2">
                                    <Label>Title</Label>
                                    <Input
                                      placeholder="Task title"
                                      value={action.parameters.title}
                                      onChange={(e) => updateAction(index, "title", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Use {`{{`}email.subject{`}}`} to use the email subject
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Description</Label>
                                    <Textarea
                                      placeholder="Task description"
                                      value={action.parameters.description}
                                      onChange={(e) => updateAction(index, "description", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Use {`{{`}email.body{`}}`} to use the email body
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Priority</Label>
                                    <Select
                                      value={action.parameters.priority}
                                      onValueChange={(value) => updateAction(index, "priority", value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}

                              {action.type === "email" && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="col-span-2">
                                    <Label>To</Label>
                                    <Input
                                      placeholder="recipient@example.com"
                                      value={action.parameters.to}
                                      onChange={(e) => updateAction(index, "to", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Use {`{{`}meeting.attendees{`}}`} for meeting attendees
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Subject</Label>
                                    <Input
                                      placeholder="Email subject"
                                      value={action.parameters.subject}
                                      onChange={(e) => updateAction(index, "subject", e.target.value)}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Body</Label>
                                    <Textarea
                                      placeholder="Email body"
                                      value={action.parameters.body}
                                      onChange={(e) => updateAction(index, "body", e.target.value)}
                                    />
                                  </div>
                                </div>
                              )}

                              {action.type === "notification" && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>To</Label>
                                    <Select
                                      value={action.parameters.to}
                                      onValueChange={(value) => updateAction(index, "to", value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select recipient" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="me">Me</SelectItem>
                                        <SelectItem value="team">Team</SelectItem>
                                        <SelectItem value="specific">Specific Person</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Message</Label>
                                    <Textarea
                                      placeholder="Notification message"
                                      value={action.parameters.message}
                                      onChange={(e) => updateAction(index, "message", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Use {`{{`}task.title{`}}`} to include the task title
                                    </p>
                                  </div>
                                </div>
                              )}

                              {action.type === "document" && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="col-span-2">
                                    <Label>Title</Label>
                                    <Input
                                      placeholder="Document title"
                                      value={action.parameters.title}
                                      onChange={(e) => updateAction(index, "title", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Use {`{{`}meeting.title{`}}`} to include the meeting title
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Template</Label>
                                    <Select
                                      value={action.parameters.template}
                                      onValueChange={(value) => updateAction(index, "template", value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="meeting-summary">Meeting Summary</SelectItem>
                                        <SelectItem value="project-report">Project Report</SelectItem>
                                        <SelectItem value="blank">Blank Document</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}

                        {newWorkflow.actions.length === 0 && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No actions defined</AlertTitle>
                            <AlertDescription>
                              Add at least one action to define what this workflow should do
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewWorkflow(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddWorkflow}
                        disabled={!newWorkflow.name || !newWorkflow.triggerValue || newWorkflow.actions.length === 0}
                      >
                        Create Workflow
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Workflow className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No custom workflows created yet</p>
                    <p className="text-sm">Create your first workflow to start automating tasks</p>
                  </div>
                ) : (
                  workflows.map((workflow) => (
                    <Card key={workflow.id} className={workflow.enabled ? "border-green-200" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{workflow.name}</CardTitle>
                            <CardDescription>{workflow.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={workflow.enabled}
                              onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {workflow.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Trigger</Label>
                            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getTriggerIcon(workflow.triggers[0].type)}
                                <span>{workflow.triggers[0].type}</span>
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {workflow.triggers[0].condition.replace("_", " ")} '{workflow.triggers[0].value}'
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">Actions ({workflow.actions.length})</Label>
                            <div className="space-y-2">
                              {workflow.actions.map((action, index) => (
                                <div key={index} className="p-2 border rounded-md bg-muted/30">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      {getActionIcon(action.type)}
                                      <span>{action.type}</span>
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {action.action} {action.type}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>Last run: {workflow.lastRun}</div>
                            <div>Run count: {workflow.runCount}</div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteWorkflow(workflow.id)}>
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Code className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" onClick={() => handleRunWorkflow(workflow.id)}>
                            <Play className="h-4 w-4 mr-1" />
                            Run Now
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Execution Logs</CardTitle>
                  <CardDescription>History of workflow executions</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Logs refreshed",
                      description: "The execution logs have been refreshed.",
                    })
                  }}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No execution logs yet</p>
                    <p className="text-sm">Workflow execution history will appear here</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{log.workflow}</h3>
                        {getStatusBadge(log.status)}
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">{log.details}</div>

                      <div className="text-xs text-muted-foreground">{log.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View All Logs</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
