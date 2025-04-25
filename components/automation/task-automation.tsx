"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Plus, CheckSquare, Mail, MessageSquare, Clock, ArrowRight, Users, Calendar, Trash, Edit } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TaskAutomation() {
  const { addAction } = useAssistant()
  const [showNewRule, setShowNewRule] = useState(false)
  const [activeTab, setActiveTab] = useState("rules")

  const [rules, setRules] = useState([
    {
      id: 1,
      name: "Create tasks from emails",
      enabled: true,
      source: "email",
      trigger: "subject contains 'Action Required'",
      details: {
        assignTo: "me",
        priority: "high",
        extractDeadline: true,
      },
    },
    {
      id: 2,
      name: "Auto-assign tasks to team members",
      enabled: true,
      source: "task",
      trigger: "new task created with tag 'project-x'",
      details: {
        assignmentStrategy: "round-robin",
        team: ["john@example.com", "sarah@example.com", "mike@example.com"],
        notifyAssignee: true,
      },
    },
    {
      id: 3,
      name: "Generate meeting notes tasks",
      enabled: false,
      source: "calendar",
      trigger: "meeting ends",
      details: {
        taskTemplate: "Create meeting notes for {{meeting.title}}",
        dueDate: "same day",
        priority: "medium",
      },
    },
  ])

  const [newRule, setNewRule] = useState({
    name: "",
    source: "email",
    triggerType: "subject_contains",
    triggerValue: "",
    assignTo: "me",
    priority: "medium",
    extractDeadline: true,
  })

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review Q2 Marketing Report",
      source: "Email",
      priority: "high",
      dueDate: "Tomorrow",
      status: "pending",
      assignedTo: "You",
    },
    {
      id: 2,
      title: "Prepare presentation for client meeting",
      source: "Calendar",
      priority: "medium",
      dueDate: "Friday",
      status: "in-progress",
      assignedTo: "Sarah",
    },
    {
      id: 3,
      title: "Follow up with vendors about pricing",
      source: "Email",
      priority: "low",
      dueDate: "Next week",
      status: "pending",
      assignedTo: "Mike",
    },
  ])

  const handleAddRule = () => {
    if (!newRule.name || !newRule.triggerValue) {
      toast({
        title: "Missing information",
        description: "Please provide a name and trigger condition for your rule.",
        variant: "destructive",
      })
      return
    }

    const trigger = `${newRule.triggerType === "subject_contains" ? "subject contains" : newRule.triggerType} '${
      newRule.triggerValue
    }'`

    const rule = {
      id: Date.now(),
      name: newRule.name,
      enabled: true,
      source: newRule.source,
      trigger,
      details: {
        assignTo: newRule.assignTo,
        priority: newRule.priority,
        extractDeadline: newRule.extractDeadline,
      },
    }

    setRules([...rules, rule])
    setShowNewRule(false)
    setNewRule({
      name: "",
      source: "email",
      triggerType: "subject_contains",
      triggerValue: "",
      assignTo: "me",
      priority: "medium",
      extractDeadline: true,
    })

    addAction(`Created new task automation rule: ${newRule.name}`)

    toast({
      title: "Rule created",
      description: "Your task automation rule has been created successfully.",
    })
  }

  const handleToggleRule = (id: number) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)))

    const rule = rules.find((r) => r.id === id)
    if (rule) {
      toast({
        title: rule.enabled ? "Rule disabled" : "Rule enabled",
        description: `"${rule.name}" has been ${rule.enabled ? "disabled" : "enabled"}.`,
      })
    }
  }

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter((rule) => rule.id !== id))

    toast({
      title: "Rule deleted",
      description: "The automation rule has been deleted.",
    })
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "calendar":
        return <Calendar className="h-4 w-4" />
      case "task":
        return <CheckSquare className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <CheckSquare className="h-4 w-4" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "low":
        return <Badge className="bg-green-500">Low</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            In Progress
          </Badge>
        )
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="tasks">Automated Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Task Automation Rules</CardTitle>
                  <CardDescription>Automate task creation and assignment</CardDescription>
                </div>
                <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create Task Automation Rule</DialogTitle>
                      <DialogDescription>Set up a rule to automatically create and assign tasks.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                          placeholder="E.g., Create tasks from emails"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Task Source</Label>
                        <Select
                          value={newRule.source}
                          onValueChange={(value) => setNewRule({ ...newRule, source: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="calendar">Calendar</SelectItem>
                            <SelectItem value="message">Message</SelectItem>
                            <SelectItem value="task">Existing Task</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Trigger Type</Label>
                        <Select
                          value={newRule.triggerType}
                          onValueChange={(value) => setNewRule({ ...newRule, triggerType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            {newRule.source === "email" && (
                              <>
                                <SelectItem value="subject_contains">Subject Contains</SelectItem>
                                <SelectItem value="from_address">From Address</SelectItem>
                                <SelectItem value="has_attachment">Has Attachment</SelectItem>
                              </>
                            )}
                            {newRule.source === "calendar" && (
                              <>
                                <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                                <SelectItem value="meeting_starts">Meeting Starts</SelectItem>
                                <SelectItem value="meeting_ends">Meeting Ends</SelectItem>
                              </>
                            )}
                            {newRule.source === "message" && (
                              <>
                                <SelectItem value="message_contains">Message Contains</SelectItem>
                                <SelectItem value="from_user">From User</SelectItem>
                              </>
                            )}
                            {newRule.source === "task" && (
                              <>
                                <SelectItem value="task_created">Task Created</SelectItem>
                                <SelectItem value="task_completed">Task Completed</SelectItem>
                                <SelectItem value="task_overdue">Task Overdue</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="trigger-value">Trigger Value</Label>
                        <Input
                          id="trigger-value"
                          value={newRule.triggerValue}
                          onChange={(e) => setNewRule({ ...newRule, triggerValue: e.target.value })}
                          placeholder={
                            newRule.triggerType === "subject_contains"
                              ? "E.g., Action Required"
                              : newRule.triggerType === "from_address"
                                ? "E.g., boss@example.com"
                                : "Enter value"
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Assign To</Label>
                        <Select
                          value={newRule.assignTo}
                          onValueChange={(value) => setNewRule({ ...newRule, assignTo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="me">Me</SelectItem>
                            <SelectItem value="sender">Sender</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="auto">Auto-assign</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Priority</Label>
                        <Select
                          value={newRule.priority}
                          onValueChange={(value) => setNewRule({ ...newRule, priority: value })}
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

                      <div className="flex items-center gap-2">
                        <Switch
                          id="extract-deadline"
                          checked={newRule.extractDeadline}
                          onCheckedChange={(checked) => setNewRule({ ...newRule, extractDeadline: checked })}
                        />
                        <Label htmlFor="extract-deadline">Extract deadline from content</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewRule(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddRule}>Create Rule</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No automation rules created yet</p>
                    <p className="text-sm">Create your first rule to start automating tasks</p>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className={`p-4 border rounded-lg ${rule.enabled ? "bg-card" : "bg-muted/30"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                          <h3 className="font-medium">{rule.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getSourceIcon(rule.source)}
                          <span>{rule.source}</span>
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">
                        <span>When {rule.trigger}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>Assign to: {rule.details.assignTo}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ArrowRight className="h-3.5 w-3.5" />
                          <span>Priority: {rule.details.priority}</span>
                        </div>
                        {rule.details.extractDeadline && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Extract deadline</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">{rules.filter((r) => r.enabled).length} active rules</div>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Rules tested",
                    description: "All task automation rules have been tested successfully.",
                  })
                }}
              >
                Test Rules
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automated Tasks</CardTitle>
                  <CardDescription>Tasks created by automation rules</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Tasks refreshed",
                      description: "The task list has been refreshed.",
                    })
                  }}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No automated tasks yet</p>
                    <p className="text-sm">Tasks created by automation rules will appear here</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        {getPriorityBadge(task.priority)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {getSourceIcon(task.source.toLowerCase())}
                          <span>Source: {task.source}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>Assigned to: {task.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1">{getStatusBadge(task.status)}</div>
                      </div>

                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <CheckSquare className="h-3.5 w-3.5 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View All Tasks</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
