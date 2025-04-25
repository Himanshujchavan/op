"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import type { Command } from "@/lib/command-processor"

export function useCommandStatus(commandId: string | null) {
  const [status, setStatus] = useState<Command["status"]>("pending")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!commandId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Set up real-time listener for command status
      const unsubscribe = onSnapshot(
        doc(db, "commands", commandId),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as Omit<Command, "id">
            setStatus(data.status)
            setResult(data.result || null)
          } else {
            setError("Command not found")
          }
          setLoading(false)
        },
        (err) => {
          console.error("Error listening to command status:", err)
          setError("Failed to listen to command updates")
          setLoading(false)
        },
      )

      // Clean up listener on unmount
      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up command listener:", err)
      setError("Failed to set up command listener")
      setLoading(false)
      return () => {}
    }
  }, [commandId])

  return { status, result, loading, error, isSuccess: status === "success", isError: !!error }
}
