"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useReducer, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

// Define types for messages and actions
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type Action = {
  id: number
  action: string
  time: string
}

type AssistantContextType = {
  isListening: boolean
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>
  assistantName: string
  setAssistantName: React.Dispatch<React.SetStateAction<string>>
  recentActions: Action[]
  addAction: (action: string) => void
  deleteAction: (id: number) => void
  clearActions: () => void
  isFloatingAssistantOpen: boolean
  setFloatingAssistantOpen: React.Dispatch<React.SetStateAction<boolean>>
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void
  processCommand: (command: string) => Promise<void>
  isProcessing: boolean
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

// Define SpeechRecognition and SpeechRecognitionEvent types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Reducer for managing actions
function actionsReducer(state: Action[], action: { type: string; payload?: any }): Action[] {
  switch (action.type) {
    case "ADD_ACTION":
      return [action.payload, ...state.slice(0, 4)]
    case "DELETE_ACTION":
      return state.filter((a) => a.id !== action.payload)
    case "CLEAR_ACTIONS":
      return []
    default:
      return state
  }
}

// Reducer for managing messages
function messagesReducer(state: Message[], action: { type: string; payload?: any }): Message[] {
  switch (action.type) {
    case "ADD_MESSAGE":
      return [...state, action.payload]
    case "DELETE_MESSAGE":
      return state.filter((m) => m.id !== action.payload)
    case "CLEAR_MESSAGES":
      return [
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your AI assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]
    default:
      return state
  }
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false)
  const [assistantName, setAssistantName] = useState("AI Assistant")
  const [isFloatingAssistantOpen, setFloatingAssistantOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [recentActions, dispatchActions] = useReducer(actionsReducer, [
    { id: 1, action: "Summarized quarterly report", time: "10 minutes ago" },
    { id: 2, action: "Checked calendar for today", time: "25 minutes ago" },
    { id: 3, action: "Replied to 3 emails", time: "1 hour ago" },
    { id: 4, action: "Created meeting notes", time: "2 hours ago" },
    { id: 5, action: "Scheduled team meeting", time: "Yesterday" },
  ])

  const [messages, dispatchMessages] = useReducer(messagesReducer, [
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])

  const addAction = useCallback((action: string) => {
    const newAction = {
      id: Date.now(),
      action,
      time: "Just now",
    }
    dispatchActions({ type: "ADD_ACTION", payload: newAction })
  }, [])

  const deleteAction = useCallback((id: number) => {
    dispatchActions({ type: "DELETE_ACTION", payload: id })
  }, [])

  const clearActions = useCallback(() => {
    dispatchActions({ type: "CLEAR_ACTIONS" })
  }, [])

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    dispatchMessages({ type: "ADD_MESSAGE", payload: newMessage })
  }, [])

  const deleteMessage = useCallback((id: string) => {
    dispatchMessages({ type: "DELETE_MESSAGE", payload: id })
  }, [])

  const clearMessages = useCallback(() => {
    dispatchMessages({ type: "CLEAR_MESSAGES" })
  }, [])

  const processCommand = useCallback(async (command: string) => {
    if (!command.trim()) return

    setIsProcessing(true)
    addMessage({ role: "user", content: command })
    addAction(`Sent command: ${command}`)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    let response = ""

    try {
      if (command.toLowerCase().includes("schedule") || command.toLowerCase().includes("meeting")) {
        response = "I've scheduled that for you. Would you like me to send calendar invites to the participants?"
        const events = JSON.parse(localStorage.getItem("events") || "[]")
        events.push({
          id: Date.now(),
          title: command.includes("meeting") ? "Meeting" : "Scheduled Event",
          date: new Date(Date.now() + 86400000).toISOString(),
          description: command,
        })
        localStorage.setItem("events", JSON.stringify(events))
      } else {
        response = "I've processed your request. Is there anything else you'd like me to help with?"
      }
    } catch (error) {
      console.error("Error processing command:", error)
      response = "I'm sorry, something went wrong while processing your request."
    }

    addMessage({ role: "assistant", content: response })
    setIsProcessing(false)
  }, [addAction, addMessage])

  useEffect(() => {
    if (!isListening) return

    let recognition: any | null = null

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          processCommand(transcript)
          setIsListening(false)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.start()
      }
    } catch (error) {
      console.error("Speech recognition error:", error)
      setIsListening(false)
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [isListening, processCommand])

  return (
    <AssistantContext.Provider
      value={{
        isListening,
        setIsListening,
        assistantName,
        setAssistantName,
        recentActions,
        addAction,
        deleteAction,
        clearActions,
        isFloatingAssistantOpen,
        setFloatingAssistantOpen,
        messages,
        addMessage,
        deleteMessage,
        clearMessages,
        processCommand,
        isProcessing,
      }}
    >
      {children}
    </AssistantContext.Provider>
  )
}

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error("useAssistant must be used within an AssistantProvider")
  }
  return context
}
