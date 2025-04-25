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
import {
  Plus,
  FolderOpen,
  File,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Tag,
  Trash,
  RefreshCw,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export function FileAutomation() {
  const { addAction } = useAssistant()
  const [showNewRule, setShowNewRule] = useState(false)
  const [activeTab, setActiveTab] = useState("organize")

  const [rules, setRules] = useState([
    {
      id: 1,
      name: "Organize downloads by file type",
      enabled: true,
      type: "organize",
      details: {
        sourceFolder: "Downloads",
        criteria: "file-type",
        destinations: {
          pdf: "Documents/PDFs",
          "jpg,png,gif": "Images",
          "doc,docx": "Documents/Word",
          "xls,xlsx": "Documents/Excel",
        },
      },
    },
    {
      id: 2,
      name: "Rename invoice files",
      enabled: true,
      type: "rename",
      details: {
        sourceFolder: "Downloads",
        filePattern: "invoice*.pdf",
        renamePattern: "Invoice-{date}-{counter}",
        preserveExtension: true,
      },
    },
    {
      id: 3,
      name: "Summarize meeting notes",
      enabled: false,
      type: "summarize",
      details: {
        sourceFolder: "Documents/Meeting Notes",
        fileTypes: ["doc", "docx", "txt", "pdf"],
        summaryLength: "medium",
        extractActionItems: true,
      },
    },
  ])

  const [newRule, setNewRule] = useState({
    name: "",
    type: "organize",
    sourceFolder: "Downloads",
    criteria: "file-type",
    fileTypes: "pdf,doc,jpg",
    destinationFolder: "Organized Files",
    renamePattern: "",
    summaryLength: "medium",
  })

  const [recentFiles, setRecentFiles] = useState([
    {
      id: 1,
      name: "Invoice-2023-04-15.pdf",
      originalName: "invoice_123456.pdf",
      type: "pdf",
      size: "1.2 MB",
      action: "renamed",
      timestamp: "Today, 10:23 AM",
    },
    {
      id: 2,
      name: "Project Proposal.docx",
      originalName: "Project Proposal.docx",
      type: "docx",
      size: "3.5 MB",
      action: "moved",
      destination: "Documents/Work",
      timestamp: "Today, 9:15 AM",
    },
    {
      id: 3,
      name: "Meeting Summary - Q2 Planning.txt",
      originalName: "Meeting Notes Q2.txt",
      type: "txt",
      size: "45 KB",
      action: "summarized",
      timestamp: "Yesterday",
    },
  ])

  const handleAddRule = () => {
    if (!newRule.name || !newRule.sourceFolder) {
      toast({
        title: "Missing information",
        description: "Please provide a name and source folder for your rule.",
        variant: "destructive",
      })
      return
    }

    let details = {}

    if (newRule.type === "organize") {
      const fileTypes = newRule.fileTypes.split(",").map((type) => type.trim())
      const destinations: Record<string, string> = {}

      fileTypes.forEach((type) => {
        destinations[type] = `${newRule.destinationFolder}/${type.toUpperCase()}`
      })

      details = {
        sourceFolder: newRule.sourceFolder,
        criteria: newRule.criteria,
        destinations,
      }
    } else if (newRule.type === "rename") {
      details = {
        sourceFolder: newRule.sourceFolder,
        filePattern: "*.*",
        renamePattern: newRule.renamePattern || "{name}-{date}",
        preserveExtension: true,
      }
    } else if (newRule.type === "summarize") {
      details = {
        sourceFolder: newRule.sourceFolder,
        fileTypes: newRule.fileTypes.split(",").map((type) => type.trim()),
        summaryLength: newRule.summaryLength,
        extractActionItems: true,
      }
    }

    const rule = {
      id: Date.now(),
      name: newRule.name,
      enabled: true,
      type: newRule.type,
      details,
    }

    setRules([...rules, rule])
    setShowNewRule(false)
    setNewRule({
      name: "",
      type: "organize",
      sourceFolder: "Downloads",
      criteria: "file-type",
      fileTypes: "pdf,doc,jpg",
      destinationFolder: "Organized Files",
      renamePattern: "",
      summaryLength: "medium",
    })

    addAction(`Created new file automation rule: ${newRule.name}`)

    toast({
      title: "Rule created",
      description: "Your file automation rule has been created successfully.",
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "organize":
        return <FolderOpen className="h-4 w-4" />
      case "rename":
        return <Tag className="h-4 w-4" />
      case "summarize":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "organize":
        return "Organize Files"
      case "rename":
        return "Rename Files"
      case "summarize":
        return "Summarize Content"
      default:
        return type
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FilePdf className="h-4 w-4 text-red-500" />
      case "docx":
      case "doc":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      case "jpg":
      case "png":
      case "gif":
        return <ImageIcon className="h-4 w-4 text-purple-500" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "moved":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Moved
          </Badge>
        )
      case "renamed":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Renamed
          </Badge>
        )
      case "summarized":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            Summarized
          </Badge>
        )
      default:
        return <Badge variant="outline">Processed</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="organize" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organize">File Organization</TabsTrigger>
          <TabsTrigger value="rename">File Renaming</TabsTrigger>
          <TabsTrigger value="summarize">Content Summarization</TabsTrigger>
        </TabsList>

        <TabsContent value="organize">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>File Organization Rules</CardTitle>
                  <CardDescription>Automatically organize files into folders</CardDescription>
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
                      <DialogTitle>Create File Organization Rule</DialogTitle>
                      <DialogDescription>Set up a rule to automatically organize files into folders.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                          placeholder="E.g., Organize downloads by file type"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="source-folder">Source Folder</Label>
                        <Input
                          id="source-folder"
                          value={newRule.sourceFolder}
                          onChange={(e) => setNewRule({ ...newRule, sourceFolder: e.target.value })}
                          placeholder="E.g., Downloads"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Organization Criteria</Label>
                        <Select
                          value={newRule.criteria}
                          onValueChange={(value) => setNewRule({ ...newRule, criteria: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select criteria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="file-type">File Type</SelectItem>
                            <SelectItem value="date">Creation Date</SelectItem>
                            <SelectItem value="name">File Name</SelectItem>
                            <SelectItem value="size">File Size</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="file-types">File Types (comma-separated)</Label>
                        <Input
                          id="file-types"
                          value={newRule.fileTypes}
                          onChange={(e) => setNewRule({ ...newRule, fileTypes: e.target.value })}
                          placeholder="E.g., pdf, doc, jpg"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="destination-folder">Destination Folder</Label>
                        <Input
                          id="destination-folder"
                          value={newRule.destinationFolder}
                          onChange={(e) => setNewRule({ ...newRule, destinationFolder: e.target.value })}
                          placeholder="E.g., Organized Files"
                        />
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
                {rules.filter((rule) => rule.type === "organize").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No file organization rules created yet</p>
                    <p className="text-sm">Create your first rule to start organizing files</p>
                  </div>
                ) : (
                  rules
                    .filter((rule) => rule.type === "organize")
                    .map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-4 border rounded-lg ${rule.enabled ? "bg-card" : "bg-muted/30"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                            <h3 className="font-medium">{rule.name}</h3>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getTypeIcon(rule.type)}
                            <span>{getTypeLabel(rule.type)}</span>
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">Source: {rule.details.sourceFolder}</div>

                        <div className="text-sm text-muted-foreground">
                          Criteria: {rule.details.criteria === "file-type" ? "File Type" : rule.details.criteria}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {rules.filter((r) => r.type === "organize" && r.enabled).length} active rules
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Rules tested",
                    description: "All file organization rules have been tested successfully.",
                  })
                }}
              >
                Test Rules
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Storage Analysis</CardTitle>
              <CardDescription>Overview of your file storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>65.2 GB of 100 GB</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FilePdf className="h-5 w-5 text-red-500" />
                      <p className="font-medium">Documents</p>
                    </div>
                    <p className="text-sm text-muted-foreground">25.4 GB (39%)</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-5 w-5 text-purple-500" />
                      <p className="font-medium">Images</p>
                    </div>
                    <p className="text-sm text-muted-foreground">18.7 GB (29%)</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-500" />
                      <p className="font-medium">Spreadsheets</p>
                    </div>
                    <p className="text-sm text-muted-foreground">12.3 GB (19%)</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <File className="h-5 w-5 text-blue-500" />
                      <p className="font-medium">Other</p>
                    </div>
                    <p className="text-sm text-muted-foreground">8.8 GB (13%)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rename">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>File Renaming Rules</CardTitle>
                  <CardDescription>Automatically rename files based on patterns</CardDescription>
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
                      <DialogTitle>Create File Renaming Rule</DialogTitle>
                      <DialogDescription>
                        Set up a rule to automatically rename files based on patterns.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                          placeholder="E.g., Rename invoice files"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="source-folder">Source Folder</Label>
                        <Input
                          id="source-folder"
                          value={newRule.sourceFolder}
                          onChange={(e) => setNewRule({ ...newRule, sourceFolder: e.target.value })}
                          placeholder="E.g., Downloads"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="file-types">File Types (comma-separated)</Label>
                        <Input
                          id="file-types"
                          value={newRule.fileTypes}
                          onChange={(e) => setNewRule({ ...newRule, fileTypes: e.target.value })}
                          placeholder="E.g., pdf, doc, jpg"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="rename-pattern">Rename Pattern</Label>
                        <Input
                          id="rename-pattern"
                          value={newRule.renamePattern}
                          onChange={(e) => setNewRule({ ...newRule, renamePattern: e.target.value })}
                          placeholder="E.g., {date}-{name}"
                        />
                        <p className="text-xs text-muted-foreground">
                          Available variables: {"{name}"}, {"{date}"}, {"{type}"}, {"{counter}"}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewRule(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setNewRule({ ...newRule, type: "rename" })
                          handleAddRule()
                        }}
                      >
                        Create Rule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.filter((rule) => rule.type === "rename").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No file renaming rules created yet</p>
                    <p className="text-sm">Create your first rule to start renaming files</p>
                  </div>
                ) : (
                  rules
                    .filter((rule) => rule.type === "rename")
                    .map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-4 border rounded-lg ${rule.enabled ? "bg-card" : "bg-muted/30"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                            <h3 className="font-medium">{rule.name}</h3>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getTypeIcon(rule.type)}
                            <span>{getTypeLabel(rule.type)}</span>
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">Source: {rule.details.sourceFolder}</div>

                        <div className="text-sm text-muted-foreground">Pattern: {rule.details.renamePattern}</div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {rules.filter((r) => r.type === "rename" && r.enabled).length} active rules
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Rules tested",
                    description: "All file renaming rules have been tested successfully.",
                  })
                }}
              >
                Test Rules
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recently Renamed Files</CardTitle>
                  <CardDescription>Files processed by renaming rules</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFiles
                  .filter((file) => file.action === "renamed")
                  .map((file) => (
                    <div key={file.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <h3 className="font-medium">{file.name}</h3>
                        </div>
                        {getActionBadge(file.action)}
                      </div>
                      <div className="text-sm text-muted-foreground">Original: {file.originalName}</div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{file.size}</span>
                        <span>{file.timestamp}</span>
                      </div>
                    </div>
                  ))}

                {recentFiles.filter((file) => file.action === "renamed").length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No renamed files yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summarize">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Content Summarization Rules</CardTitle>
                  <CardDescription>Automatically summarize file contents</CardDescription>
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
                      <DialogTitle>Create Content Summarization Rule</DialogTitle>
                      <DialogDescription>Set up a rule to automatically summarize file contents.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                          placeholder="E.g., Summarize meeting notes"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="source-folder">Source Folder</Label>
                        <Input
                          id="source-folder"
                          value={newRule.sourceFolder}
                          onChange={(e) => setNewRule({ ...newRule, sourceFolder: e.target.value })}
                          placeholder="E.g., Documents/Meeting Notes"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="file-types">File Types (comma-separated)</Label>
                        <Input
                          id="file-types"
                          value={newRule.fileTypes}
                          onChange={(e) => setNewRule({ ...newRule, fileTypes: e.target.value })}
                          placeholder="E.g., doc, docx, txt, pdf"
                        />
                      </div>

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
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewRule(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setNewRule({ ...newRule, type: "summarize" })
                          handleAddRule()
                        }}
                      >
                        Create Rule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.filter((rule) => rule.type === "summarize").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No content summarization rules created yet</p>
                    <p className="text-sm">Create your first rule to start summarizing file contents</p>
                  </div>
                ) : (
                  rules
                    .filter((rule) => rule.type === "summarize")
                    .map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-4 border rounded-lg ${rule.enabled ? "bg-card" : "bg-muted/30"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                            <h3 className="font-medium">{rule.name}</h3>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getTypeIcon(rule.type)}
                            <span>{getTypeLabel(rule.type)}</span>
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">Source: {rule.details.sourceFolder}</div>

                        <div className="text-sm text-muted-foreground">
                          Summary Length: {rule.details.summaryLength}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {rules.filter((r) => r.type === "summarize" && r.enabled).length} active rules
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Rules tested",
                    description: "All content summarization rules have been tested successfully.",
                  })
                }}
              >
                Test Rules
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Summaries</CardTitle>
                  <CardDescription>Files summarized by automation rules</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFiles
                  .filter((file) => file.action === "summarized")
                  .map((file) => (
                    <div key={file.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <h3 className="font-medium">{file.name}</h3>
                        </div>
                        {getActionBadge(file.action)}
                      </div>
                      <div className="text-sm text-muted-foreground">Original: {file.originalName}</div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{file.size}</span>
                        <span>{file.timestamp}</span>
                      </div>
                    </div>
                  ))}

                {recentFiles.filter((file) => file.action === "summarized").length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No summarized files yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
