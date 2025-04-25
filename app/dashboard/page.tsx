"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { OfflineNotice } from "@/components/ui/offline-notice"
import { toast } from "@/components/ui/use-toast"
import { auth } from "@/lib/firebase"
import { Auth } from "firebase/auth"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardPage() {
  const [isOffline, setIsOffline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
      if (navigator.onLine && isOffline) {
        toast({
          title: "You're back online",
          description: "Connection restored. All features are now available.",
        })
      }
    }

    // Set initial status
    setIsOffline(!navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    // Handle authentication state
    const unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
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
  }, [router, isOffline])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {isOffline && <OfflineNotice />}
      <DashboardContent />
    </MainLayout>
  )
}
