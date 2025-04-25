"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type WorkflowTrigger = {
  type: string
  condition: string
  value: string
}

type WorkflowAction = {
  type: string
  target: string
  action: string
  parameters: Record<string, string>
}

type Workflow = {
  id: string
  name: string
  description: string
  triggers: WorkflowTrigger[]
  actions: WorkflowAction[]
  isActive: boolean
  lastRun?: Date
  createdAt: Date
}

export function WorkflowAutomation() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Email to Task Converter',
      description: 'Automatically creates tasks from emails with "Action Required" in the subject',
      triggers: [
        { type: 'email', condition: 'subject_contains', value: 'Action Required' }
      ],
      actions: [
        { 
          type: 'task', 
          target: 'tasks', 
          action: 'create', 
          parameters: { 
            title: '{{email.subject}}', 
            description: '{{email.body}}',
            priority: 'high'
          } 
        }
      ],
      isActive: true,
      lastRun: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 7 * 86400000)
    },
    {
      id: '2',
      name: 'Document Organizer',
      description: 'Automatically organizes downloaded files into appropriate folders',
      triggers: [
        { type: 'file', condition: 'created_in', value: 'Downloads' }
      ],
      actions: [
        { 
          type: 'file', 
          target: 'filesystem', 
          action: 'move', 
          parameters: { 
            destination: '{{file.type}}/{{file.created_month}}',
            rename: '{{file.date}}_{{file.name}}'
          } 
        }
      ],
      isActive: false,
      createdAt: new Date(Date.now() - 14 * 86400000)
    }
  ])
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    triggers: [],
    actions: [],
    isActive: false
  })
  
  const handleCreateWorkflow = () => {
    const workflow: Workflow = {
      id: Date.now().toString(),
      name: newWorkflow.name || 'Untitled Workflow',
      description: newWorkflow.description || '',
      triggers: newWorkflow.triggers || [],
      actions: newWorkflow.actions || [],
      isActive: newWorkflow.isActive || false,
      createdAt: new Date()
    }
    
    setWorkflows([...workflows, workflow])
    setIsCreating(false)
    setNewWorkflow({
      name: '',
      description: '',
      triggers: [],
      actions: [],
      isActive: false
    })
  }
  
  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(w => w.id !== id))
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(null)
    }
  }
  
  const handleToggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(w => {
      if (w.id === id) {
        return { ...w, isActive: !w.isActive }
      }
      return w
    }))
    
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow({ ...selectedWorkflow, isActive: !selectedWorkflow.isActive })
    }
  }
  
  const addTrigger = () => {
    setNewWorkflow({
      ...newWorkflow,
      triggers: [...(newWorkflow.triggers || []), { type: 'email', condition: 'subject_contains', value: '' }]
    })
  }
  
  const addAction = () => {
    setNewWorkflow({
      ...newWorkflow,
      actions: [...(newWorkflow.actions || []), { 
        type: 'task', 
        target: 'tasks', 
        action: 'create', 
        parameters: {} 
      }]
    })
  }
  
  const updateTrigger = (index: number, field: keyof WorkflowTrigger, value: string) => {
    if (!newWorkflow.triggers) return
    
    const updatedTriggers = [...newWorkflow.triggers]
    updatedTriggers[index] = {
      ...updatedTriggers[index],
      [field]: value
    }
    
    setNewWorkflow({
      ...newWorkflow,
      triggers: updatedTriggers
    })
  }
  
  const updateAction = (index: number, field: keyof WorkflowAction, value: string) => {
    if (!newWorkflow.actions) return
    
    const updatedActions = [...newWorkflow.actions]
    updatedActions[index] = {
      ...updatedActions[index],
      [field]: value
    }
    
    setNewWorkflow({
      ...newWorkflow,
      actions: updatedActions
    })
  }
  
  const updateActionParameter = (actionIndex: number, paramKey: string, value: string) => {
    if (!newWorkflow.actions) return
    
    const updatedActions = [...newWorkflow.actions]
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex],
      parameters: {
        ...updatedActions[actionIndex].parameters,
        [paramKey]: value
      }
    }
    
    setNewWorkflow({
      ...newWorkflow,
      actions: updatedActions
    })
  }
  
  const removeTrigger = (index: number) => {
    if (!newWorkflow.triggers) return
    
    const updatedTriggers = [...newWorkflow.triggers]
    updatedTriggers.splice(index, 1)
    
    setNewWorkflow({
      ...newWorkflow,
      triggers: updatedTriggers
    })
  }
  
  const removeAction = (index: number) => {
    if (!newWorkflow.actions) return
    
    const updatedActions = [...newWorkflow.actions]
    updatedActions.splice(index, 1)
    
    setNewWorkflow({
      ...newWorkflow,
      actions: updatedActions
    })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Workflow Automation</h2>
          <p className="text-muted-foreground">Create custom workflows to automate repetitive tasks</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>
      
      {isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
            <CardDescription>Define triggers and actions for your custom workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter workflow name" 
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what this workflow does" 
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Triggers (When this happens...)</Label>
                  <Button variant="outline" size="sm" onClick={addTrigger}>
                    <Plus className="h-4 w-4 mr-1" /> Add Trigger
                  </Button>
                </div>
                
                {newWorkflow.triggers && newWorkflow.triggers.length > 0 ? (
                  <div className="space-y-4">
                    {newWorkflow.triggers.map((trigger, index) => (
                      <Card key={index} className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2"
                          onClick={() => removeTrigger(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Trigger Type</Label>
                              <Select 
                                value={trigger.type}
                                onValueChange={(value) => updateTrigger(index, 'type', value)}
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
                                value={trigger.condition}
                                onValueChange={(value) => updateTrigger(index, 'condition', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  {trigger.type === 'email' && (
                                    <>
                                      <SelectItem value="subject_contains">Subject Contains</SelectItem>
                                      <SelectItem value="from_address">From Address</SelectItem>
                                      <SelectItem value="has_attachment">Has Attachment</SelectItem>
                                    </>
                                  )}
                                  {trigger.type === 'calendar' && (
                                    <>
                                      <SelectItem value="event_created">Event Created</SelectItem>
                                      <SelectItem value="event_updated">Event Updated</SelectItem>
                                      <SelectItem value="event_starting_soon">Event Starting Soon</SelectItem>
                                    </>
                                  )}
                                  {trigger.type === 'file' && (
                                    <>
                                      <SelectItem value="created_in">Created In</SelectItem>
                                      <SelectItem value="modified">Modified</SelectItem>
                                      <SelectItem value="type_is">Type Is</SelectItem>
                                    </>
                                  )}
                                  {trigger.type === 'task' && (
                                    <>
                                      <SelectItem value="created">Created</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="due_soon">Due Soon</SelectItem>
                                    </>
                                  )}
                                  {trigger.type === 'time' && (
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
                                value={trigger.value}
                                onChange={(e) => updateTrigger(index, 'value', e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No triggers defined</AlertTitle>
                    <AlertDescription>
                      Add at least one trigger to define when this workflow should run
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Actions (Do this...)</Label>
                  <Button variant="outline" size="sm" onClick={addAction}>
                    <Plus className="h-4 w-4 mr-1" /> Add Action
                  </Button>
                </div>
                
                {newWorkflow.actions && newWorkflow.actions.length > 0 ? (
                  <div className="space-y-4">
                    {newWorkflow.actions.map((action, index) => (
                      <Card key={index} className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2"
                          onClick={() => removeAction(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label>Action Type</Label>
                              <Select 
                                value={action.type}
                                onValueChange={(value) => updateAction(index, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="calendar">Calendar</SelectItem>
                                  <SelectItem value="file">File</SelectItem>
                                  <SelectItem value="task">Task</SelectItem>
                                  <SelectItem value="notification">Notification</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Target</Label>
                              <Select 
                                value={action.target}
                                onValueChange={(value) => updateAction(index, 'target', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select target" />
                                </SelectTrigger>
                                <SelectContent>
                                  {action.type === 'email' && (
                                    <>
                                      <SelectItem value="inbox">Inbox</SelectItem>
                                      <SelectItem value="outbox">Outbox</SelectItem>
                                      <SelectItem value="specific_address">Specific Address</SelectItem>
                                    </>
                                  )}
                                  {action.type === 'calendar' && (
                                    <>
                                      <SelectItem value="events">Events</SelectItem>
                                      <SelectItem value="reminders">Reminders</SelectItem>
                                    </>
                                  )}
                                  {action.type === 'file' && (
                                    <>
                                      <SelectItem value="filesystem">File System</SelectItem>
                                      <SelectItem value="cloud_storage">Cloud Storage</SelectItem>
                                    </>
                                  )}
                                  {action.type === 'task' && (
                                    <>
                                      <SelectItem value="tasks">Tasks</SelectItem>
                                      <SelectItem value="projects">Projects</SelectItem>
                                    </>
                                  )}
                                  {action.type === 'notification' && (
                                    <>
                                      <SelectItem value="app">App</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                      <SelectItem value="sms">SMS</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Action</Label>
                              <Select 
                                value={action.action}
                                onValueChange={(value) => updateAction(index, 'action', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                                <SelectContent>
                                  {action.type === 'email' && (
                                    <>
                                      <SelectItem value="send">Send</SelectItem>
                                      <SelectItem value="forward">Forward</SelectItem>
                                      <SelectItem value="reply">Reply</SelectItem>
                                      <SelectItem value="archive">Archive</SelectItem>
                                    </>
                                  )}
                                  {action.type === 'calendar' && (
                                    <>
                                      <SelectItem value="create">Create</SelectItem>
                                      <SelectItem value="update">Update</SelectItem>
                                      <SelectItem value="delete">Delete</SelectItem>
                                    </>
                                  )}
                                  {action.type === 'file' && (
                                    <>
                                      <SelectItem value="create">Create</SelectItem>
                                      <SelectItem value="move">Move</SelectItem>
                                      <SelectItem value="copy">Copy</SelectItem>
                                      <SelectItem value="delete">Delete</SelectItem>
                                    </>
                                  )}
                                  {action.type === 'task' && (
                                    <>
                                      <SelectItem value="create">Create</SelectItem>
                                      <SelectItem value="update">Update</SelectItem>
                                      <SelectItem value="complete">Complete</SelectItem>
                                      <SelectItem value="delete">Delete</SelectItem>
                                    </>
                                  )}
                                  {action.type === 'notification' && (
                                    <>
                                      <SelectItem value="send">Send</SelectItem>
                                      <SelectItem value="schedule">Schedule</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <Label>Parameters</Label>
                            {action.type === 'email' && action.action === 'send' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>To</Label>
                                  <Input 
                                    placeholder="recipient@example.com" 
                                    value={action.parameters.to || ''}
                                    onChange={(e) => updateActionParameter(index, 'to', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Subject</Label>
                                  <Input 
                                    placeholder="Email subject" 
                                    value={action.parameters.subject || ''}
                                    onChange={(e) => updateActionParameter(index, 'subject', e.target.value)}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Body</Label>
                                  <Textarea 
                                    placeholder="Email body" 
                                    value={action.parameters.body || ''}
                                    onChange={(e) => updateActionParameter(index, 'body', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {action.type === 'task' && action.action === 'create' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Title</Label>
                                  <Input 
                                    placeholder="Task title" 
                                    value={action.parameters.title || ''}
                                    onChange={(e) => updateActionParameter(index, 'title', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Priority</Label>
                                  <Select 
                                    value={action.parameters.priority || 'medium'}
                                    onValueChange={(value) => updateActionParameter(index, 'priority', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-2">
                                  <Label>Description</Label>
                                  <Textarea 
                                    placeholder="Task description" 
                                    value={action.parameters.description || ''}
                                    onChange={(e) => updateActionParameter(index, 'description', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {action.type === 'file' && action.action === 'move' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Destination</Label>
                                  <Input 
                                    placeholder="Path/to/destination" 
                                    value={action.parameters.destination || ''}
                                    onChange={(e) => updateActionParameter(index, 'destination', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Rename (optional)</Label>
                                  <Input 
                                    placeholder="New filename" 
                                    value={action.parameters.rename || ''}
                                    onChange={(e) => updateActionParameter(index, 'rename', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {action.type === 'calendar' && action.action === 'create' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Title</Label>
                                  <Input 
                                    placeholder="Event title" 
                                    value={action.parameters.title || ''}
                                    onChange={(e) => updateActionParameter(index, 'title', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Date/Time</Label>
                                  <Input 
                                    placeholder="YYYY-MM-DD HH:MM" 
                                    value={action.parameters.datetime || ''}
                                    onChange={(e) => updateActionParameter(index, 'datetime', e.target.value)}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Description</Label>
                                  <Textarea 
                                    placeholder="Event description" 
                                    value={action.parameters.description || ''}
                                    onChange={(e) => updateActionParameter(index, 'description', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {action.type === 'notification' && action.action === 'send' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <Label>Message</Label>
                                  <Textarea 
                                    placeholder="Notification message" 
                                    value={action.parameters.message || ''}
                                    onChange={(e) => updateActionParameter(index, 'message', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No actions defined</AlertTitle>
                    <AlertDescription>
                      Add at least one action to define what this workflow should do
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={newWorkflow.isActive}
                  onCheckedChange={(checked) => setNewWorkflow({...newWorkflow, isActive: checked})}
                />
                <Label htmlFor="active">Activate workflow immediately</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateWorkflow}
              disabled={!newWorkflow.name || !newWorkflow.triggers?.length || !newWorkflow.actions?.length}
            >
              Create Workflow
            </Button>
          </CardFooter>
        </Card>
      ) : selectedWorkflow ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedWorkflow.name}</CardTitle>
                <CardDescription>{selectedWorkflow.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="workflow-active" 
                  checked={selectedWorkflow.isActive}
                  onCheckedChange={() => handleToggleWorkflow(selectedWorkflow.id)}
                />
                <Label htmlFor="workflow-active">Active</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="triggers">Triggers</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="history">Run History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          {selectedWorkflow.isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Last Run</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          {selectedWorkflow.lastRun ? (
                            new Date(selectedWorkflow.lastRun).toLocaleString()
                          ) : (
                            'Never'
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          <p>This workflow has {selectedWorkflow.triggers.length} trigger(s) and {selectedWorkflow.actions.length} action(s).</p>
                          <p className="mt-2">Created on {new Date(selectedWorkflow.createdAt).toLocaleDateString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="triggers">
                <div className="space-y-4">
                  {selectedWorkflow.triggers.map((trigger, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {trigger.type === 'email' && (
                              <div className="mr-2 p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                              </div>
                            )}
                            {trigger.type === 'file' && (
                              <div className="mr-2 p-2 bg-green-100 rounded-full dark:bg-green-900">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text\
