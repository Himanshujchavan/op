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
import { Plus, Calendar, Clock, Users, Video, MapPin, Bell, CalendarDays, ArrowRight, Check, X } from "lucide-react"
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

export function CalendarAutomation() {
  const { addAction } = useAssistant()
  const [showNewRule, setShowNewRule] = useState(false)
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: "Auto-schedule team meetings",
      enabled: true,
      type: "scheduling",
      details: {
        attendees: ["team@example.com"],
        duration: 30,
        preferredDays: ["Tuesday", "Thursday"],
        preferredTimes: ["10:00", "14:00"],
      },
    },
    {
      id: 2,
      name: "Create events from emails",
      enabled: true,
      type: "email-to-calendar",
      details: {
        keywords: ["meeting", "schedule", "calendar"],
        confirmBeforeCreating: true,
      },
    },
    {
      id: 3,
      name: "Meeting reminders",
      enabled: false,
      type: "reminders",
      details: {
        reminderTime: 15, // minutes before
        includeAgenda: true,
        notificationType: "email",
      },
    },
  ])

  const [newAutomation, setNewAutomation] = useState({
    name: "",
    type: "scheduling",
    attendees: "",
    duration: "30",
    keywords: "",
    reminderTime: "15",
  })

  const handleAddAutomation = () => {
    if (!newAutomation.name) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your automation.",
        variant: "destructive",
      })
      return
    }

    let details = {}

    if (newAutomation.type === "scheduling") {
      details = {
        attendees: newAutomation.attendees.split(",").map((a) => a.trim()),
        duration: Number.parseInt(newAutomation.duration),
        preferredDays: ["Monday", "Wednesday", "Friday"],
        preferredTimes: ["09:00", "13:00", "15:00"],
      }
    } else if (newAutomation.type === "email-to-calendar") {
      details = {
        keywords: newAutomation.keywords.split(",").map((k) => k.trim()),
        confirmBeforeCreating: true,
      }
    } else if (newAutomation.type === "reminders") {
      details = {
        reminderTime: Number.parseInt(newAutomation.reminderTime),
        includeAgenda: true,
        notificationType: "email",
      }
    }

    const automation = {
      id: Date.now(),
      name: newAutomation.name,
      enabled: true,
      type: newAutomation.type,
      details,
    }

    setAutomations([...automations, automation])
    setShowNewRule(false)
    setNewAutomation({
      name: "",
      type: "scheduling",
      attendees: "",
      duration: "30",
      keywords: "",
      reminderTime: "15",
    })

    addAction(`Created new calendar automation: ${newAutomation.name}`)

    toast({
      title: "Automation created",
      description: "Your calendar automation has been created successfully.",
    })
  }

  const handleToggleAutomation = (id: number) => {
    setAutomations(
      automations.map((automation) =>
        automation.id === id ? { ...automation, enabled: !automation.enabled } : automation,
      ),
    )

    const automation = automations.find((a) => a.id === id)
    if (automation) {
      toast({
        title: automation.enabled ? "Automation disabled" : "Automation enabled",
        description: `"${automation.name}" has been ${automation.enabled ? "disabled" : "enabled"}.`,
      })
    }
  }

  const handleDeleteAutomation = (id: number) => {
    setAutomations(automations.filter((automation) => automation.id !== id))

    toast({
      title: "Automation deleted",
      description: "The calendar automation has been deleted.",
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "scheduling":
        return <Users className="h-4 w-4" />
      case "email-to-calendar":
        return <CalendarDays className="h-4 w-4" />
      case "reminders":
        return <Bell className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "scheduling":
        return "Auto-scheduling"
      case "email-to-calendar":
        return "Email to Calendar"
      case "reminders":
        return "Smart Reminders"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendar Automations</CardTitle>
              <CardDescription>Automate scheduling and calendar management</CardDescription>
            </div>
            <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Automation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create Calendar Automation</DialogTitle>
                  <DialogDescription>Set up an automation to streamline your calendar management.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="automation-name">Automation Name</Label>
                    <Input
                      id="automation-name"
                      value={newAutomation.name}
                      onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                      placeholder="E.g., Schedule weekly team meetings"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Automation Type</Label>
                    <Select
                      value={newAutomation.type}
                      onValueChange={(value) => setNewAutomation({ ...newAutomation, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduling">Auto-scheduling</SelectItem>
                        <SelectItem value="email-to-calendar">Email to Calendar</SelectItem>
                        <SelectItem value="reminders">Smart Reminders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newAutomation.type === "scheduling" && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="attendees">Attendees (comma-separated)</Label>
                        <Input
                          id="attendees"
                          value={newAutomation.attendees}
                          onChange={(e) => setNewAutomation({ ...newAutomation, attendees: e.target.value })}
                          placeholder="E.g., john@example.com, sarah@example.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Meeting Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newAutomation.duration}
                          onChange={(e) => setNewAutomation({ ...newAutomation, duration: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {newAutomation.type === "email-to-calendar" && (
                    <div className="grid gap-2">
                      <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        value={newAutomation.keywords}
                        onChange={(e) => setNewAutomation({ ...newAutomation, keywords: e.target.value })}
                        placeholder="E.g., meeting, schedule, calendar"
                      />
                    </div>
                  )}

                  {newAutomation.type === "reminders" && (
                    <div className="grid gap-2">
                      <Label htmlFor="reminder-time">Reminder Time (minutes before)</Label>
                      <Input
                        id="reminder-time"
                        type="number"
                        value={newAutomation.reminderTime}
                        onChange={(e) => setNewAutomation({ ...newAutomation, reminderTime: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewRule(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAutomation}>Create Automation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No calendar automations created yet</p>
                <p className="text-sm">Create your first automation to streamline scheduling</p>
              </div>
            ) : (
              automations.map((automation) => (
                <div
                  key={automation.id}
                  className={`p-4 border rounded-lg ${automation.enabled ? "bg-card" : "bg-muted/30"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={() => handleToggleAutomation(automation.id)}
                      />
                      <h3 className="font-medium">{automation.name}</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAutomation(automation.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getTypeIcon(automation.type)}
                      <span>{getTypeLabel(automation.type)}</span>
                    </Badge>
                  </div>

                  {automation.type === "scheduling" && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{automation.details.attendees.length} attendees</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{automation.details.duration} minutes</span>
                      </div>
                    </div>
                  )}

                  {automation.type === "email-to-calendar" && (
                    <div className="text-sm text-muted-foreground">
                      Keywords: {automation.details.keywords.join(", ")}
                    </div>
                  )}

                  {automation.type === "reminders" && (
                    <div className="text-sm text-muted-foreground">
                      {automation.details.reminderTime} minutes before event
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {automations.filter((a) => a.enabled).length} active automations
          </div>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Automations tested",
                description: "All calendar automations have been tested successfully.",
              })
            }}
          >
            Test Automations
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Automated Events</CardTitle>
          <CardDescription>Events created or managed by your automations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">Weekly Team Standup</h3>
                <Badge>Recurring</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Tomorrow, 10:00 AM</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Video className="h-3.5 w-3.5" />
                  <span>Zoom Meeting</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>5 attendees</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-500">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">Project Review Meeting</h3>
                <Badge variant="outline">From Email</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Friday, 2:00 PM</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Conference Room A</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>3 attendees</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Bell className="h-3.5 w-3.5" />
                  <span>15 min reminder</span>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">Client Presentation</h3>
                <Badge variant="outline">Auto-scheduled</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Next Monday, 11:00 AM</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Video className="h-3.5 w-3.5" />
                  <span>Google Meet</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>4 attendees</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>60 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">View All Automated Events</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
