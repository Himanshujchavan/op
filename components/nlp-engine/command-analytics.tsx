"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { Command } from "@/lib/command-processor"

interface CommandAnalyticsProps {
  commands: Command[]
}

export function CommandAnalytics({ commands }: CommandAnalyticsProps) {
  // Prepare data for type distribution chart
  const typeDistribution = useMemo(() => {
    const typeCounts: Record<string, number> = {}
    commands.forEach((command) => {
      const type = command.intent.type
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
    }))
  }, [commands])

  // Prepare data for status distribution chart
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    }

    commands.forEach((command) => {
      statusCounts[command.status] = (statusCounts[command.status] || 0) + 1
    })

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }))
  }, [commands])

  // Prepare data for daily command usage
  const dailyUsage = useMemo(() => {
    const dailyCounts: Record<string, number> = {}

    commands.forEach((command) => {
      if (command.timestamp?.toDate) {
        const date = command.timestamp.toDate().toISOString().split("T")[0]
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      }
    })

    // Sort by date
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [commands])

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Command Analytics</CardTitle>
        <CardDescription>Insights from your command history</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="types">
          <TabsList className="mb-4">
            <TabsTrigger value="types">Command Types</TabsTrigger>
            <TabsTrigger value="status">Status Distribution</TabsTrigger>
            <TabsTrigger value="usage">Usage Over Time</TabsTrigger>
          </TabsList>

          <TabsContent value="types">
            <ChartContainer
              config={{
                type: {
                  label: "Command Type",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="status">
            <ChartContainer
              config={{
                status: {
                  label: "Command Status",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "completed"
                            ? "#4ade80"
                            : entry.name === "failed"
                              ? "#f87171"
                              : entry.name === "running"
                                ? "#60a5fa"
                                : "#fcd34d"
                        }
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="usage">
            <ChartContainer
              config={{
                count: {
                  label: "Commands",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUsage}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="count" fill="var(--color-count)" name="Commands" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
