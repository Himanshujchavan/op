"use client"

import { useEffect } from "react"
import { enableFirestorePersistence } from "@/lib/firebase"

export function FirebaseClientInit() {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Small delay to ensure Firebase is fully initialized
      const timer = setTimeout(() => {
        try {
          enableFirestorePersistence()
        } catch (error) {
          console.error("Error in FirebaseClientInit:", error)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  // This component doesn't render anything
  return null
}
