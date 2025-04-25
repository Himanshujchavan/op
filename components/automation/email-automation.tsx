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
import { Plus, Mail, Trash, Edit, Save, X, Tag, MessageSquare, Clock, Filter, ArrowRight } from "lucide-react"
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

function EmailAutomation() {
  const { addAction } = useAssistant()
  const [rules, setRules] = useState([
    {
      id: 1,
      name: "Auto-respond to client inquiries",
      trigger: "subject contains 'inquiry'",
      action: "send-reply",
      enabled: true,
      details: {
        template: "Thank you for your inquiry. Our team will get back to you within 24 hours.",
        priority: "high",
      },
    },
    {
      id: 2,
      name: "Move newsletters to Newsletter folder",
      trigger: "from contains 'newsletter' OR subject contains 'newsletter'",
      action: "move-folder",
      enabled: true,
      details: {
        folder: "Newsletters",
        applyLabels: ["Newsletter", "Automated"],
      },
    },
    {
      id: 3,
      name: "Summarize long emails",
      trigger: "body length > 1000 words",
      action: "summarize",
      enabled: false,
      details: {
        summaryLength: "brief",
        extractActionItems: true,
      },
    },
  ])

  const [showNewRule, setShowNewRule] = useState(false)
  const [newRule, setNewRule] = useState({
    name: "",
    triggerType: "subject",
    triggerValue: "",
    actionType: "send-reply",
    template: "",
    folder: "",
    summaryLength: "brief",
  })

  const [editingRule, setEditingRule] = useState<number | null>(null)

  const handleAddRule = () => {
    if (!newRule.name || !newRule.triggerValue) {
      toast({
        title: "Missing information",
        description: "Please provide a name and trigger condition for your rule.",
        variant: "destructive",
      })
      return
    }

    const trigger = `${newRule.triggerType} contains '${newRule.triggerValue}'`

    let details = {}
    if (newRule.actionType === "send-reply") {
      details = { template: newRule.template || "Thank you for your email." }
    } else if (newRule.actionType === "move-folder") {
      details = { folder: newRule.folder || "Archive" }
    } else if (newRule.actionType === "summarize") {
      details = { summaryLength: newRule.summaryLength }
    }

    const rule = {
      id: Date.now(),
      name: newRule.name,
      trigger,
      action: newRule.actionType,
      enabled: true,
      details,
    }

    setRules([...rules, rule])
    setShowNewRule(false)
    setNewRule({
      name: "",
      triggerType: "subject",
      triggerValue: "",
      actionType: "send-reply",
      template: "",
      folder: "",
      summaryLength: "brief",
    })

    addAction(`Created new email automation rule: ${newRule.name}`)

    toast({
      title: "Rule created",
      description: "Your email automation rule has been created successfully.",
    })
  }

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter((rule) => rule.id !== id))

    toast({
      title: "Rule deleted",
      description: "The automation rule has been deleted.",
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

  const handleEditRule = (id: number) => {
    setEditingRule(id)

    const rule = rules.find((r) => r.id === id)
    if (rule) {
      const triggerParts = rule.trigger.split(" contains '")
      const triggerType = triggerParts[0]
      const triggerValue = triggerParts[1].replace("'", "")

      setNewRule({
        name: rule.name,
        triggerType,
        triggerValue,
        actionType: rule.action,
        template: rule.details.template || "",
        folder: rule.details.folder || "",
        summaryLength: rule.details.summaryLength || "brief",
      })
    }
  }

  const handleSaveEdit = () => {
    if (!newRule.name || !newRule.triggerValue) {
      toast({
        title: "Missing information",
        description: "Please provide a name and trigger condition for your rule.",
        variant: "destructive",
      })
      return
    }

    const trigger = `${newRule.triggerType} contains '${newRule.triggerValue}'`

    let details = {}
    if (newRule.actionType === "send-reply") {
      details = { template: newRule.template || "Thank you for your email." }
    } else if (newRule.actionType === "move-folder") {
      details = { folder: newRule.folder || "Archive" }
    } else if (newRule.actionType === "summarize") {
      details = { summaryLength: newRule.summaryLength }
    }

    setRules(
      rules.map((rule) =>
        rule.id === editingRule
          ? {
              ...rule,
              name: newRule.name,
              trigger,
              action: newRule.actionType,
              details,
            }
          : rule,
      ),
    )

    setEditingRule(null)
    setNewRule({
      name: "",
      triggerType: "subject",
      triggerValue: "",
      actionType: "send-reply",
      template: "",
      folder: "",
      summaryLength: "brief",
    })

    toast({
      title: "Rule updated",
      description: "Your email automation rule has been updated successfully.",
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "send-reply":
        return <MessageSquare className="h-4 w-4" />
      case "move-folder":
        return <Tag className="h-4 w-4" />
      case "summarize":
        return <Filter className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "send-reply":
        return "Auto-reply"
      case "move-folder":
        return "Move to folder"
      case "summarize":
        return "Summarize"
      default:
        return action
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Automation Rules</CardTitle>
              <CardDescription>Create rules to automate email management</CardDescription>
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
                  <DialogTitle>Create Email Automation Rule</DialogTitle>
                  <DialogDescription>
                    Set up a rule to automatically handle emails based on specific conditions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      placeholder="E.g., Auto-reply to client inquiries"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>When</Label>
                    <div className="flex gap-2">
                      <Select
                        value={newRule.triggerType}
                        onValueChange={(value) => setNewRule({ ...newRule, triggerType: value })}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subject">Subject</SelectItem>
                          <SelectItem value="from">From</SelectItem>
                          <SelectItem value="to">To</SelectItem>
                          <SelectItem value="body">Body</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="flex items-center px-2">contains</span>
                      <Input
                        value={newRule.triggerValue}
                        onChange={(e) => setNewRule({ ...newRule, triggerValue: e.target.value })}
                        placeholder="E.g., inquiry"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Then</Label>
                    <Select
                      value={newRule.actionType}
                      onValueChange={(value) => setNewRule({ ...newRule, actionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send-reply">Send auto-reply</SelectItem>
                        <SelectItem value="move-folder">Move to folder</SelectItem>
                        <SelectItem value="summarize">Summarize email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newRule.actionType === "send-reply" && (
                    <div className="grid gap-2">
                      <Label htmlFor="reply-template">Reply Template</Label>
                      <Textarea
                        id="reply-template"
                        value={newRule.template}
                        onChange={(e) => setNewRule({ ...newRule, template: e.target.value })}
                        placeholder="Thank you for your email. Our team will get back to you within 24 hours."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use {`{{`}email.body{`}}`} to use the email body
                      </p>
                    </div>
                  )}

                  {newRule.actionType === "move-folder" && (
                    <div className="grid gap-2">
                      <Label htmlFor="folder-name">Folder Name</Label>
                      <Input
                        id="folder-name"
                        value={newRule.folder}
                        onChange={(e) => setNewRule({ ...newRule, folder: e.target.value })}
                        placeholder="E.g., Newsletters"
                      />
                    </div>
                  )}

                  {newRule.actionType === "summarize" && (
                    <div className="grid gap-2">
                      <Label>Summary Length</Label>
                      <Select
                        value={newRule.summaryLength}
                        onValueChange={(value) => setNewRule({ ...newRule, summaryLength: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">Brief</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                <Mail className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No automation rules created yet</p>
                <p className="text-sm">Create your first rule to start automating email tasks</p>
              </div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className={`p-4 border rounded-lg ${rule.enabled ? "bg-card" : "bg-muted/30"}`}>
                  {editingRule === rule.id ? (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`edit-name-${rule.id}`}>Rule Name</Label>
                        <Input
                          id={`edit-name-${rule.id}`}
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>When</Label>
                        <div className="flex gap-2">
                          <Select
                            value={newRule.triggerType}
                            onValueChange={(value) => setNewRule({ ...newRule, triggerType: value })}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="subject">Subject</SelectItem>
                              <SelectItem value="from">From</SelectItem>
                              <SelectItem value="to">To</SelectItem>
                              <SelectItem value="body">Body</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="flex items-center px-2">contains</span>
                          <Input
                            value={newRule.triggerValue}
                            onChange={(e) => setNewRule({ ...newRule, triggerValue: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Then</Label>
                        <Select
                          value={newRule.actionType}
                          onValueChange={(value) => setNewRule({ ...newRule, actionType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="send-reply">Send auto-reply</SelectItem>
                            <SelectItem value="move-folder">Move to folder</SelectItem>
                            <SelectItem value="summarize">Summarize email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newRule.actionType === "send-reply" && (
                        <div className="grid gap-2">
                          <Label htmlFor={`edit-template-${rule.id}`}>Reply Template</Label>
                          <Textarea
                            id={`edit-template-${rule.id}`}
                            value={newRule.template}
                            onChange={(e) => setNewRule({ ...newRule, template: e.target.value })}
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Use {`{{email.body}}`} to use the email body
                          </p>
                        </div>
                      )}

                      {newRule.actionType === "move-folder" && (
                        <div className="grid gap-2">
                          <Label htmlFor={`edit-folder-${rule.id}`}>Folder Name</Label>
                          <Input
                            id={`edit-folder-${rule.id}`}
                            value={newRule.folder}
                            onChange={(e) => setNewRule({ ...newRule, folder: e.target.value })}
                          />
                        </div>
                      )}

                      {newRule.actionType === "summarize" && (
                        <div className="grid gap-2">
                          <Label>Summary Length</Label>
                          <Select
                            value={newRule.summaryLength}
                            onValueChange={(value) => setNewRule({ ...newRule, summaryLength: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="brief">Brief</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingRule(null)}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                          <h3 className="font-medium">{rule.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>When {rule.trigger}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getActionIcon(rule.action)}
                          <span>{getActionLabel(rule.action)}</span>
                        </Badge>

                        {rule.action === "send-reply" && rule.details.template && (
                          <span className="text-sm text-muted-foreground truncate">
                            "{rule.details.template.substring(0, 30)}
                            {rule.details.template.length > 30 ? "..." : ""}"
                          </span>
                        )}

                        {rule.action === "move-folder" && rule.details.folder && (
                          <span className="text-sm text-muted-foreground">to "{rule.details.folder}"</span>
                        )}

                        {rule.action === "summarize" && (
                          <span className="text-sm text-muted-foreground">({rule.details.summaryLength})</span>
                        )}
                      </div>
                    </>
                  )}
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
                description: "All automation rules have been tested successfully.",
              })
            }}
          >
            Test Rules
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Classification</CardTitle>
          <CardDescription>Automatically classify and organize your emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-medium mb-2">AI-Powered Email Classification</h3>
              <p className="text-sm text-muted-foreground mb-4">
                GroqAssist can automatically classify your emails into categories based on content analysis.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-3 border rounded-lg text-center">
                  <p className="font-medium">Work</p>
                  <p className="text-sm text-muted-foreground">124 emails</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="font-medium">Personal</p>
                  <p className="text-sm text-muted-foreground">56 emails</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="font-medium">Newsletters</p>
                  <p className="text-sm text-muted-foreground">87 emails</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="font-medium">Promotions</p>
                  <p className="text-sm text-muted-foreground">203 emails</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-medium mb-2">Email Summarization</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Extract key points and action items from long email threads.
              </p>
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium mb-1">Sample Summary</p>
                <p className="text-sm text-muted-foreground">
                  Meeting scheduled for Friday at 2 PM to discuss Q3 marketing strategy. John will prepare the
                  presentation. Sarah will share last quarter's results. Action items: Finalize budget proposal by
                  Wednesday, review competitor analysis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Configure Email Classification Settings</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export { EmailAutomation }
