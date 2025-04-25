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
import { Plus, Database, FileText, Mail, User, Building, ArrowRight, Edit, Trash, RefreshCw } from "lucide-react"
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

export function DataEntryAutomation() {
  const { addAction } = useAssistant()
  const [showNewRule, setShowNewRule] = useState(false)
  const [activeTab, setActiveTab] = useState("rules")

  const [rules, setRules] = useState([
    {
      id: 1,
      name: "Extract contact info from emails",
      enabled: true,
      source: "email",
      destination: "crm",
      dataType: "contact",
      details: {
        fields: ["name", "email", "phone", "company"],
        confirmBeforeCreating: true,
      },
    },
    {
      id: 2,
      name: "Create leads from website forms",
      enabled: true,
      source: "form",
      destination: "crm",
      dataType: "lead",
      details: {
        fields: ["name", "email", "interest", "source"],
        assignTo: "sales-team",
      },
    },
    {
      id: 3,
      name: "Update customer records from emails",
      enabled: false,
      source: "email",
      destination: "crm",
      dataType: "customer",
      details: {
        updateFields: ["address", "phone", "preferences"],
        matchBy: "email",
      },
    },
  ])

  const [newRule, setNewRule] = useState({
    name: "",
    source: "email",
    destination: "crm",
    dataType: "contact",
    fields: "name, email, phone",
    confirmBeforeCreating: true,
  })

  const [recentEntries, setRecentEntries] = useState([
    {
      id: 1,
      type: "contact",
      name: "John Smith",
      email: "john.smith@example.com",
      company: "Acme Inc.",
      source: "Email",
      timestamp: "Today, 10:23 AM",
      status: "success",
    },
    {
      id: 2,
      type: "lead",
      name: "Sarah Johnson",
      email: "sarah.j@techfirm.com",
      interest: "Product Demo",
      source: "Web Form",
      timestamp: "Today, 9:15 AM",
      status: "success",
    },
    {
      id: 3,
      type: "customer",
      name: "Acme Corporation",
      email: "info@acme.com",
      update: "New address and phone",
      source: "Email",
      timestamp: "Yesterday",
      status: "pending",
    },
  ])

  const handleAddRule = () => {
    if (!newRule.name) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your automation rule.",
        variant: "destructive",
      })
      return
    }

    const fields = newRule.fields.split(",").map((field) => field.trim())

    const rule = {
      id: Date.now(),
      name: newRule.name,
      enabled: true,
      source: newRule.source,
      destination: newRule.destination,
      dataType: newRule.dataType,
      details: {
        fields,
        confirmBeforeCreating: newRule.confirmBeforeCreating,
      },
    }

    setRules([...rules, rule])
    setShowNewRule(false)
    setNewRule({
      name: "",
      source: "email",
      destination: "crm",
      dataType: "contact",
      fields: "name, email, phone",
      confirmBeforeCreating: true,
    })

    addAction(`Created new data entry automation: ${newRule.name}`)

    toast({
      title: "Rule created",
      description: "Your data entry automation rule has been created successfully.",
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
      case "form":
        return <FileText className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case "contact":
        return <User className="h-4 w-4" />
      case "lead":
        return <User className="h-4 w-4" />
      case "customer":
        return <Building className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Processing
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="entries">Recent Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Entry Automation</CardTitle>
                  <CardDescription>Automate data entry from various sources</CardDescription>
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
                      <DialogTitle>Create Data Entry Rule</DialogTitle>
                      <DialogDescription>Set up a rule to automatically extract and enter data.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                          placeholder="E.g., Extract contact info from emails"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Data Source</Label>
                          <Select
                            value={newRule.source}
                            onValueChange={(value) => setNewRule({ ...newRule, source: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="form">Web Form</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Destination</Label>
                          <Select
                            value={newRule.destination}
                            onValueChange={(value) => setNewRule({ ...newRule, destination: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="crm">CRM System</SelectItem>
                              <SelectItem value="database">Database</SelectItem>
                              <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Data Type</Label>
                        <Select
                          value={newRule.dataType}
                          onValueChange={(value) => setNewRule({ ...newRule, dataType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select data type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contact">Contact</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="order">Order</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="fields">Fields to Extract (comma-separated)</Label>
                        <Input
                          id="fields"
                          value={newRule.fields}
                          onChange={(e) => setNewRule({ ...newRule, fields: e.target.value })}
                          placeholder="E.g., name, email, phone, company"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="confirm"
                          checked={newRule.confirmBeforeCreating}
                          onCheckedChange={(checked) => setNewRule({ ...newRule, confirmBeforeCreating: checked })}
                        />
                        <Label htmlFor="confirm">Confirm before creating entries</Label>
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
                    <Database className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No automation rules created yet</p>
                    <p className="text-sm">Create your first rule to start automating data entry</p>
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
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getSourceIcon(rule.source)}
                            <span>{rule.source}</span>
                          </Badge>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground mx-1" />
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getDataTypeIcon(rule.dataType)}
                            <span>{rule.dataType}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Fields: {rule.details.fields ? rule.details.fields.join(", ") : "None"}
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
                    description: "All data entry rules have been tested successfully.",
                  })
                }}
              >
                Test Rules
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Connected Data Sources</CardTitle>
              <CardDescription>Systems that can be used for automated data entry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Extract data from email content</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Connected</Badge>
                </div>

                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">CRM System</p>
                      <p className="text-sm text-muted-foreground">Customer relationship management</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Connected</Badge>
                </div>

                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Web Forms</p>
                      <p className="text-sm text-muted-foreground">Capture data from website forms</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Data Entries</CardTitle>
                  <CardDescription>Data recently processed by automation rules</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getDataTypeIcon(entry.type)}
                          <span>{entry.type}</span>
                        </Badge>
                        <h3 className="font-medium">{entry.name}</h3>
                      </div>
                      {getStatusBadge(entry.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{entry.email}</span>
                      </div>
                      {entry.company && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Building className="h-3.5 w-3.5" />
                          <span>{entry.company}</span>
                        </div>
                      )}
                      {entry.interest && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ArrowRight className="h-3.5 w-3.5" />
                          <span>{entry.interest}</span>
                        </div>
                      )}
                      {entry.update && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Edit className="h-3.5 w-3.5" />
                          <span>{entry.update}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        <span>Source: {entry.source}</span>
                      </div>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View All Data Entries</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
