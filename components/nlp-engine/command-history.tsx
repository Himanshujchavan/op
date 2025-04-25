"use client"

import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import type { Command } from "@/lib/command-processor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, Loader2, Search, Filter, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CommandAnalytics } from "./command-analytics"

interface CommandHistoryProps {
  limit?: number
  showAnalytics?: boolean
}

export function CommandHistory({ limit: historyLimit = 10, showAnalytics = true }: CommandHistoryProps) {
  const [commands, setCommands] = useState<(Command & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchCommands() {
      if (!auth.currentUser) {
        setError("You must be logged in to view command history")
        setLoading(false)
        return
      }

      try {
        const userId = auth.currentUser.uid
        const commandsRef = collection(db, "commands")
        const q = query(commandsRef, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(historyLimit))

        const querySnapshot = await getDocs(q)
        const fetchedCommands = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as (Command & { id: string })[]

        setCommands(fetchedCommands)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching command history:", err)
        setError("Failed to load command history")
        setLoading(false)
      }
    }

    fetchCommands()
  }, [historyLimit])

  // Filter commands based on search term and filters
  const filteredCommands = commands.filter((command) => {
    const matchesSearch = searchTerm ? command.intent.rawInput.toLowerCase().includes(searchTerm.toLowerCase()) : true
    const matchesStatus = statusFilter !== "all" ? command.status === statusFilter : true
    const matchesType = typeFilter !== "all" ? command.intent.type === typeFilter : true

    return matchesSearch && matchesStatus && matchesType
  })

  // Extract unique command types for filter
  const commandTypes = Array.from(new Set(commands.map((command) => command.intent.type)))

  const getStatusBadge = (status: Command["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "running":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (commands.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No commands found in your history.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {showAnalytics && <CommandAnalytics commands={commands} />}

      <Card>
        <CardHeader>
          <CardTitle>Command History</CardTitle>
          <CardDescription>Your recent commands and their execution status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search commands..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {commandTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCommands.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No commands match your filters.</p>
            ) : (
              filteredCommands.map((command) => (
                <Card key={command.id} className="overflow-hidden">
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge>{command.intent.type}</Badge>
                        <span className="font-medium">{command.intent.rawInput}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(command.status)}
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {command.timestamp?.toDate ? command.timestamp.toDate().toLocaleString() : "Unknown time"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm">{command.response}</p>
                    {command.result && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <pre className="whitespace-pre-wrap">
                          {typeof command.result === "string"
                            ? command.result
                            : JSON.stringify(command.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
