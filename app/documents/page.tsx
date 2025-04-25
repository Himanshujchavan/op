"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { DocumentAssistant } from "@/components/documents/document-assistant"
import { OfflineNotice } from "@/components/ui/offline-notice"
import { PageTransition } from "@/components/ui/page-transition"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DocumentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    })

    // Check online/offline status
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    // Set initial status
    setIsOffline(!navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      unsubscribe()
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [router])

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
      <PageTransition>
        <div className="container mx-auto p-4">
          {isOffline && <OfflineNotice />}
          <h1 className="text-3xl font-bold mb-6">Document Assistant</h1>
          <p className="text-muted-foreground mb-8">
            Upload documents and let AI help you analyze, summarize, and extract information.
          </p>
          <DocumentAssistant isOffline={isOffline} />
        </div>
      </PageTransition>
    </MainLayout>
  )
}
