"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AuthLayout } from "@/components/auth/auth-layout"
import { toast } from "@/components/ui/use-toast"
import { resetPassword } from "@/lib/firebase"
import { FirebaseNotice } from "@/components/ui/firebase-notice"
import { auth } from "@/lib/firebase"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid")
      return
    }

    setIsLoading(true)

    try {
      // Check if Firebase auth is initialized
      if (!auth) {
        toast({
          title: "Firebase not configured",
          description: "Please add your Firebase credentials to use authentication features.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const result = await resetPassword(email)

      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: "Reset email sent",
          description: "Check your inbox for password reset instructions.",
        })
      } else {
        // Handle specific error codes
        let errorMessage = "Failed to send reset email."

        if (result.error?.includes("user-not-found")) {
          errorMessage = "No account found with this email address."
        } else if (result.error?.includes("invalid-email")) {
          errorMessage = "Invalid email address. Please check and try again."
        } else if (result.error?.includes("too-many-requests")) {
          errorMessage = "Too many requests. Please try again later."
        }

        setError(errorMessage)
        toast({
          title: "Reset failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Password reset error:", error)
      setError(error.message || "An error occurred")
      toast({
        title: "Reset failed",
        description: "An error occurred while sending the reset email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      {!isFirebaseConfigured && <FirebaseNotice />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full"
      >
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2">Check your inbox</h3>
            <p className="text-muted-foreground mb-6">We've sent a password reset link to {email}</p>
            <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
              Return to login
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Label
                    htmlFor="email"
                    className={cn(
                      "absolute left-10 top-2 text-sm transition-all duration-200",
                      email ? "-translate-y-5 scale-75 text-primary" : "text-muted-foreground",
                    )}
                  >
                    Email
                  </Label>
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <motion.div
                    animate={error ? { x: [0, -5, 5, -5, 0] } : {}}
                    transition={{ type: "spring", stiffness: 500, damping: 10 }}
                  >
                    <Input
                      id="email"
                      type="email"
                      className={cn(
                        "h-14 pl-10 pr-3 pt-5 pb-2 bg-background/50 rounded-xl",
                        error && "border-red-500 focus-visible:ring-red-500",
                      )}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                    />
                  </motion.div>
                  {error && (
                    <motion.p
                      className="text-xs text-red-500 mt-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full h-12 btn-gradient rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </motion.div>

              <div className="flex justify-center">
                <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </AuthLayout>
  )
}
