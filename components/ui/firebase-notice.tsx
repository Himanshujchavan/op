"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function FirebaseNotice() {
  return (
    <Alert variant="destructive" className="mb-6 border-2 border-red-500">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">Firebase Configuration Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2 text-base">
          To use authentication features, you need to configure Firebase in your environment variables:
        </p>
        <pre className="bg-slate-950 text-white p-3 rounded-md text-xs overflow-x-auto mb-3 border border-red-400">
          {`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`}
        </pre>
        <div className="flex justify-between items-center">
          <p className="text-sm">These variables must be added to your Vercel project settings.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://firebase.google.com/docs/web/setup", "_blank")}
          >
            Firebase Setup Guide
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
