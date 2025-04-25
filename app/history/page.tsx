"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { HistoryLogs } from "@/components/history/history-logs"
import { OfflineNotice } from "@/components/ui/offline-notice"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

export default function HistoryPage() {
  const [isOffline, setIsOffline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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

    // Check authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is not signed in, redirect to login
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    })

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
      unsubscribe()
    }
  }, [router])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {isOffline && <OfflineNotice />}
      <HistoryLogs />
    </MainLayout>
  )
}
