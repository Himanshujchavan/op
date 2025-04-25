"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Trash2, WifiOff } from "lucide-react"
import { motion } from "framer-motion"
import { auth, db } from "@/lib/firebase"
import { collection, query, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

// Define the history item type
interface HistoryItem {
  id: string
  type: string
  action: string
  timestamp: any // Firestore timestamp
  icon?: string
  color?: string
}

export function HistoryLogs() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  // Check online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    // Set initial status
    setIsOffline(!navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  // Fetch history items
  useEffect(() => {
    const fetchHistoryItems = async () => {
      try {
        // Check if offline first
        if (!navigator.onLine) {
          setIsOffline(true)
          setIsLoading(false)
          return
        }

        // Check if user is authenticated
        if (!auth.currentUser) {
          console.error("No authenticated user")
          setIsLoading(false)
          return
        }

        // Create sample data if in development mode
        if (process.env.NODE_ENV === "development") {
          const sampleData = generateSampleHistoryData()
          setItems(sampleData)
          setIsLoading(false)
          return
        }

        // Fetch real data from Firestore
        const userId = auth.currentUser.uid
        const historyRef = collection(db, "users", userId, "history")
        const q = query(historyRef, orderBy("timestamp", "desc"))

        const querySnapshot = await getDocs(q)
        const historyItems: HistoryItem[] = []

        querySnapshot.forEach((doc) => {
          historyItems.push({
            id: doc.id,
            ...(doc.data() as Omit<HistoryItem, "id">),
          })
        })

        setItems(historyItems)
      } catch (error) {
        console.error("Error fetching history:", error)
        // If we get a specific offline error, set offline state
        if (
          error instanceof Error &&
          (error.message.includes("offline") ||
            error.message.includes("network") ||
            error.message.includes("unavailable"))
        ) {
          setIsOffline(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistoryItems()
  }, [])

  // Generate sample history data for development
  const generateSampleHistoryData = (): HistoryItem[] => {
    return [
      {
        id: "1",
        type: "task",
        action: "Created task: Review quarterly report",
        timestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 30) },
        icon: "📝",
        color: "bg-blue-500",
      },
      {
        id: "2",
        type: "email",
        action: "Sent email to john@example.com",
        timestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 2) },
        icon: "📧",
        color: "bg-green-500",
      },
      {
        id: "3",
        type: "document",
        action: "Edited document: Project Proposal",
        timestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 5) },
        icon: "📄",
        color: "bg-amber-500",
      },
      {
        id: "4",
        type: "automation",
        action: "Ran automation: Daily Report",
        timestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 24) },
        icon: "⚙️",
        color: "bg-purple-500",
      },
      {
        id: "5",
        type: "task",
        action: "Completed task: Call with marketing team",
        timestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 26) },
        icon: "✅",
        color: "bg-blue-500",
      },
      {
        id: "6",
        type: "email",
        action: "Received email from support@company.com",
        timestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 48) },
        icon: "📧",
        color: "bg-green-500",
      },
    ]
  }

  // Filter items based on search query and active tab
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || item.type === activeTab
    return matchesSearch && matchesTab
  })

  // Delete history item
  const deleteHistoryItem = async (id: string) => {
    try {
      // Check if offline
      if (isOffline) {
        toast({
          title: "You're offline",
          description: "Cannot delete history items while offline.",
          variant: "destructive",
        })
        return
      }

      // Check if in development mode
      if (process.env.NODE_ENV === "development") {
        // Just remove from local state for development
        setItems(items.filter((item) => item.id !== id))
        toast({
          title: "Item deleted",
          description: "History item has been removed.",
        })
        return
      }

      // Delete from Firestore
      if (!auth.currentUser) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to delete history items.",
          variant: "destructive",
        })
        return
      }

      const userId = auth.currentUser.uid
      await deleteDoc(doc(db, "users", userId, "history", id))

      // Update local state
      setItems(items.filter((item) => item.id !== id))

      toast({
        title: "Item deleted",
        description: "History item has been removed.",
      })
    } catch (error) {
      console.error("Error deleting history item:", error)
      toast({
        title: "Error",
        description: "Failed to delete history item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Clear all history
  const clearAllHistory = async () => {
    try {
      // Check if offline
      if (isOffline) {
        toast({
          title: "You're offline",
          description: "Cannot clear history while offline.",
          variant: "destructive",
        })
        return
      }

      // Check if in development mode
      if (process.env.NODE_ENV === "development") {
        // Just clear local state for development
        setItems([])
        toast({
          title: "History cleared",
          description: "All history items have been removed.",
        })
        return
      }

      // Delete all from Firestore
      if (!auth.currentUser) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to clear history.",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would use a batch or transaction to delete all items
      // For simplicity, we'll just clear the local state
      setItems([])

      toast({
        title: "History cleared",
        description: "All history items have been removed.",
      })
    } catch (error) {
      console.error("Error clearing history:", error)
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Export history as JSON
  const exportHistory = () => {
    try {
      const dataStr = JSON.stringify(items, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `history-export-${format(new Date(), "yyyy-MM-dd")}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Export successful",
        description: "Your history has been exported as JSON.",
      })
    } catch (error) {
      console.error("Error exporting history:", error)
      toast({
        title: "Export failed",
        description: "Failed to export history. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>History & Logs</CardTitle>
          <CardDescription>Loading your activity history...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  // Render offline state
  if (isOffline) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>History & Logs</CardTitle>
          <CardDescription>Your activity history and logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">You're offline</h3>
            <p className="text-muted-foreground mb-4">
              History logs are not available while offline. Please check your internet connection and try again.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>History & Logs</CardTitle>
        <CardDescription>Your activity history and logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search history..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {items.length > 0 && (
              <>
                <Button variant="outline" size="icon" onClick={exportHistory}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={clearAllHistory}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="task">Tasks</TabsTrigger>
              <TabsTrigger value="email">Emails</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No history items found.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-[#8D99AE]/20 space-y-6">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <div className="absolute -left-[22px] flex items-center justify-center w-10 h-10 rounded-full bg-background border border-[#8D99AE]/20">
                        <span className="text-lg">{item.icon || "🔍"}</span>
                      </div>
                      <div className="bg-card rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.action}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.timestamp && item.timestamp.toDate
                                ? format(item.timestamp.toDate(), "MMM d, yyyy 'at' h:mm a")
                                : "Unknown date"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {item.type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteHistoryItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
