"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Archive,
  ArrowRight,
  Clock,
  Mail,
  MailOpen,
  RefreshCcw,
  Search,
  Star,
  Trash,
  User,
  Users,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { summarizeEmail, suggestTasksFromEmail } from "@/utils/groq-api"
import { useAssistant } from "@/contexts/assistant-context"

export function EmailCRM() {
  const { addAction } = useAssistant()
  const [activeTab, setActiveTab] = useState("email")
  const [selectedEmail, setSelectedEmail] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [newContact, setNewContact] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  })
  const [emailSummary, setEmailSummary] = useState("")
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([])
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [selectedContact, setSelectedContact] = useState(1)

  const [emails, setEmails] = useState([
    {
      id: 1,
      sender: "Devid Deshmukh",
      subject: "Quarterly Report Review",
      preview:
        "I've attached the quarterly report for your review. Please let me know if you have any questions or concerns.",
      time: "10:30 AM",
      unread: true,
      important: true,
      content: `Hi there,

I've attached the quarterly report for your review. Please let me know if you have any questions or concerns.

The highlights include:
- 15% increase in revenue
- New client acquisition up by 22%
- Operating costs reduced by 8%

Let's discuss this during our meeting tomorrow.

Best regards,
Devid`,
      attachment: "Quarterly_Report_Q1_2023.pdf",
    },
    {
      id: 2,
      sender: "Marketing Team",
      subject: "Campaign Results",
      preview: "The latest marketing campaign has exceeded our expectations. Here are the results and next steps.",
      time: "Yesterday",
      unread: true,
      important: false,
      content: `Hello,

I'm pleased to report that our latest marketing campaign has exceeded our expectations. The engagement metrics are impressive:

- 45% increase in website traffic
- 30% higher conversion rate
- 2x social media engagement

We should capitalize on this momentum by planning our next campaign. I've outlined some ideas in the attached document.

Let's schedule a meeting to discuss next steps.

Regards,
Marketing Team`,
      attachment: "Campaign_Results_2023.pdf",
    },
    {
      id: 3,
      sender: "Pratik Rai",
      subject: "Meeting Agenda",
      preview: "Here's the agenda for our upcoming team meeting. Please review and suggest any additional topics.",
      time: "Yesterday",
      unread: false,
      important: true,
      content: `Hi team,

Here's the agenda for our upcoming meeting on Friday:

1. Project status updates (15 min)
2. Q2 planning discussion (30 min)
3. New client onboarding process (20 min)
4. Open floor for questions (15 min)

Please review and let me know if you'd like to add any topics.

Best,
Pratik`,
      attachment: null,
    },
    {
      id: 4,
      sender: "Tech Support",
      subject: "Your Ticket #45678",
      preview: "We've resolved the issue you reported. Please confirm that everything is working correctly.",
      time: "2 days ago",
      unread: false,
      important: false,
      content: `Hello,

We've resolved the issue you reported in ticket #45678 regarding the dashboard loading errors.

The problem was related to a caching issue that has now been fixed. Please confirm that everything is working correctly on your end.

If you encounter any further issues, don't hesitate to reach out.

Regards,
Tech Support Team`,
      attachment: null,
    },
    {
      id: 5,
      sender: "HR Department",
      subject: "Policy Updates",
      preview: "Please review the attached document for important updates to our company policies.",
      time: "3 days ago",
      unread: false,
      important: false,
      content: `Dear Team Member,

Please review the attached document for important updates to our company policies, effective next month.

Key changes include:
- Updated remote work guidelines
- New expense reporting process
- Revised PTO request procedure

All employees are required to acknowledge receipt by the end of this week.

Thank you,
HR Department`,
      attachment: "Policy_Updates_2023.pdf",
    },
  ])

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "Arpit Choudhari",
      company: "Acme Inc.",
      email: "a.p@acme.com",
      phone: "+1 (555) 123-4567",
      lastContact: "2 days ago",
      nextFollowUp: "Tomorrow",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: 2,
      name: "Darshan Bagade",
      company: "Tech Solutions",
      email: "darshan@techsolutions.com",
      phone: "+1 (555) 987-6543",
      lastContact: "1 week ago",
      nextFollowUp: "Next Monday",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: 3,
      name: "Yogesh Nagarare",
      company: "Global Enterprises",
      email: "m.brown@global.com",
      phone: "+1 (555) 456-7890",
      lastContact: "3 days ago",
      nextFollowUp: "Friday",
      avatar: "/placeholder-user.jpg",
    },
  ])

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

  const handleRefresh = async () => {
    setIsRefreshing(true)

    // Simulate fetching new emails
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Refreshed",
        description: "Your inbox has been updated.",
      })
    }, 1500)
  }

  const handleEmailClick = async (emailId: number) => {
    // Mark email as read
    setEmails(emails.map((email) => (email.id === emailId ? { ...email, unread: false } : email)))

    setSelectedEmail(emailId)

    // Get the selected email
    const email = emails.find((e) => e.id === emailId)

    if (email && email.unread) {
      addAction(`Read email: ${email.subject}`)

      // Use Groq to summarize the email
      setIsSummarizing(true)
      try {
        const summary = await summarizeEmail(email.content)
        setEmailSummary(summary)

        const tasks = await suggestTasksFromEmail(email.content)
        setSuggestedTasks(tasks)
      } catch (error) {
        console.error("Error processing email with Groq:", error)
      } finally {
        setIsSummarizing(false)
      }
    }
  }

  const handleDeleteEmail = (emailId: number) => {
    setEmails(emails.filter((email) => email.id !== emailId))

    if (selectedEmail === emailId) {
      setSelectedEmail(emails[0]?.id || 0)
    }

    toast({
      title: "Email deleted",
      description: "The email has been moved to trash.",
    })

    addAction("Deleted an email")
  }

  const handleMarkAsRead = (emailId: number) => {
    setEmails(emails.map((email) => (email.id === emailId ? { ...email, unread: false } : email)))

    toast({
      title: "Marked as read",
      description: "Email has been marked as read.",
    })
  }

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and email.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(...contacts.map((c) => c.id)) + 1

    setContacts([
      ...contacts,
      {
        id: newId,
        name: newContact.name,
        company: newContact.company || "Not specified",
        email: newContact.email,
        phone: newContact.phone || "Not specified",
        lastContact: "Just now",
        nextFollowUp: "Not scheduled",
        avatar: "/placeholder-user.jpg",
      },
    ])

    setNewContact({
      name: "",
      company: "",
      email: "",
      phone: "",
    })

    setIsAddingContact(false)

    toast({
      title: "Contact added",
      description: `${newContact.name} has been added to your contacts.`,
    })

    addAction(`Added new contact: ${newContact.name}`)
  }

  const handleDeleteContact = (contactId: number) => {
    setContacts(contacts.filter((contact) => contact.id !== contactId))

    if (selectedContact === contactId) {
      setSelectedContact(contacts[0]?.id || 0)
    }

    toast({
      title: "Contact deleted",
      description: "The contact has been removed.",
    })

    addAction("Deleted a contact")
  }

  const handleAddTaskFromSuggestion = (task: string) => {
    // In a real app, this would add the task to your task list
    toast({
      title: "Task added",
      description: `"${task}" has been added to your tasks.`,
    })

    addAction(`Added task from email: ${task}`)
  }

  const getSelectedEmail = () => {
    return emails.find((email) => email.id === selectedEmail)
  }

  const getSelectedContact = () => {
    return contacts.find((contact) => contact.id === selectedContact)
  }

  const unreadCount = emails.filter((email) => email.unread).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email & CRM</h1>
        <Button
          variant="outline"
          className="bg-white dark:bg-transparent border-border"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="email" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger
            value="email"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger
            value="crm"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="w-4 h-4 mr-2" />
            CRM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Email Sidebar */}
            <Card className="border-border md:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Inbox</CardTitle>
                  {unreadCount > 0 && <Badge className="bg-destructive">{unreadCount} Unread</Badge>}
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search emails..." className="pl-8 border-border" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-border">
                  {emails.map((email) => (
                    <motion.div
                      key={email.id}
                      variants={item}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-secondary",
                        email.unread && "bg-secondary/50",
                        selectedEmail === email.id && "bg-secondary",
                      )}
                      onClick={() => handleEmailClick(email.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div
                            className={cn("w-2 h-2 rounded-full mr-2", email.unread ? "bg-primary" : "bg-transparent")}
                          />
                          <span
                            className={cn("font-medium", email.unread ? "text-foreground" : "text-muted-foreground")}
                          >
                            {email.sender}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {email.important && <Star className="w-3 h-3 text-amber-500 mr-1" />}
                          <span className="text-xs text-muted-foreground">{email.time}</span>
                        </div>
                      </div>
                      <p
                        className={cn(
                          "font-medium text-sm",
                          email.unread ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>

            {/* Email Content */}
            <Card className="border-border md:col-span-2">
              {getSelectedEmail() ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{getSelectedEmail()?.subject}</CardTitle>
                        <CardDescription>
                          From {getSelectedEmail()?.sender} - {getSelectedEmail()?.time}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 border-border">
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-border"
                          onClick={() => handleDeleteEmail(selectedEmail)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-border"
                          onClick={() => handleMarkAsRead(selectedEmail)}
                        >
                          <MailOpen className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder-user.jpg" alt={getSelectedEmail()?.sender} />
                          <AvatarFallback>
                            {getSelectedEmail()
                              ?.sender.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getSelectedEmail()?.sender}</p>
                          <p className="text-xs text-muted-foreground">
                            {getSelectedEmail()?.sender.toLowerCase().replace(" ", ".") + "@example.com"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-secondary border border-border">
                        <pre className="whitespace-pre-wrap font-sans text-foreground">
                          {getSelectedEmail()?.content}
                        </pre>
                      </div>

                      {getSelectedEmail()?.attachment && (
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{getSelectedEmail()?.attachment}</p>
                            <Button variant="outline" size="sm" className="h-7 border-border">
                              Download
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* AI-powered email insights */}
                      {emailSummary && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <p className="font-medium text-sm mb-2">AI Summary:</p>
                          <p className="text-sm">{emailSummary}</p>

                          {suggestedTasks.length > 0 && (
                            <div className="mt-3">
                              <p className="font-medium text-sm mb-2">Suggested Tasks:</p>
                              <div className="flex flex-wrap gap-2">
                                {suggestedTasks.map((task, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="border-primary/30 bg-primary/5"
                                    onClick={() => handleAddTaskFromSuggestion(task)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {task}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isSummarizing && (
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center space-x-2">
                            <RefreshCcw className="h-4 w-4 animate-spin text-primary" />
                            <p className="text-sm">AI is analyzing this email...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-4">
                    <div className="w-full space-y-2">
                      <p className="text-sm font-medium">Quick Replies:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="border-border">
                          Thanks, I'll review it
                        </Button>
                        <Button variant="outline" size="sm" className="border-border">
                          Can we discuss this tomorrow?
                        </Button>
                        <Button variant="outline" size="sm" className="border-border">
                          Please provide more details
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </>
              ) : (
                <CardContent className="flex flex-col items-center justify-center h-[400px]">
                  <Mail className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Select an email to view</p>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crm">
          <div className="grid gap-6 md:grid-cols-3">
            {/* CRM Sidebar */}
            <Card className="border-border md:col-span-1">
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search contacts..." className="pl-8 border-border" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-border">
                  {contacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      variants={item}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-secondary",
                        selectedContact === contact.id && "bg-secondary",
                      )}
                      onClick={() => setSelectedContact(contact.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.company}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
              <CardFooter>
                <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <User className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                      <DialogDescription>Enter the details of your new contact below.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter name"
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          placeholder="Acme Inc."
                          value={newContact.company}
                          onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name.test@example.com"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          placeholder="+1 (555) 123-4567"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingContact(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddContact}>Add Contact</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>

            {/* Contact Details */}
            <Card className="border-border md:col-span-2">
              {getSelectedContact() ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={getSelectedContact()?.avatar || "/placeholder.svg"}
                            alt={getSelectedContact()?.name}
                          />
                          <AvatarFallback>
                            {getSelectedContact()
                              ?.name.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{getSelectedContact()?.name}</CardTitle>
                          <CardDescription>{getSelectedContact()?.company}</CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="border-border"
                          onClick={() => handleDeleteContact(selectedContact)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">Contact</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-3 rounded-lg bg-secondary border border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                          <p>{getSelectedContact()?.email}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary border border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
                          <p>{getSelectedContact()?.phone}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary border border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Last Contact</p>
                          <p className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getSelectedContact()?.lastContact}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary border border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Next Follow-up</p>
                          <p className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getSelectedContact()?.nextFollowUp}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">Recent Interactions</h3>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-secondary border border-border">
                            <div className="flex justify-between mb-1">
                              <p className="font-medium">Email: Quarterly Report Review</p>
                              <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
                            </div>
                            <p className="text-sm text-muted-foreground">Sent quarterly report for review</p>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary border border-border">
                            <div className="flex justify-between mb-1">
                              <p className="font-medium">Call: Project Discussion</p>
                              <p className="text-xs text-muted-foreground">Yesterday, 2:15 PM</p>
                            </div>
                            <p className="text-sm text-muted-foreground">Discussed timeline for new project</p>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary border border-border">
                            <div className="flex justify-between mb-1">
                              <p className="font-medium">Meeting: Contract Review</p>
                              <p className="text-xs text-muted-foreground">3 days ago</p>
                            </div>
                            <p className="text-sm text-muted-foreground">Reviewed and signed new contract</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-4">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Schedule Follow-up
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <CardContent className="flex flex-col items-center justify-center h-[400px]">
                  <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Select a contact to view details</p>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
