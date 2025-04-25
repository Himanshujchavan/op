"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Github, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth"
import { doc, setDoc, getDoc, getFirestore, serverTimestamp } from "firebase/firestore"

export function SocialLogin() {
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const db = getFirestore()

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      // Add scopes if needed
      provider.addScope("https://www.googleapis.com/auth/userinfo.email")
      provider.addScope("https://www.googleapis.com/auth/userinfo.profile")

      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", user.uid))

      // If not, create one
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "Google User",
          email: user.email,
          role: "User",
          createdAt: serverTimestamp(),
          provider: "google",
          preferences: {
            notifications: true,
            soundEffects: true,
            animations: true,
            theme: "light",
          },
        })
      }

      toast({
        title: "Google login successful!",
        description: "Welcome to your AI Assistant.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Google login error:", error)

      // More specific error messages
      if (error.code === "auth/popup-closed-by-user") {
        toast({
          title: "Login cancelled",
          description: "You closed the login popup. Please try again.",
          variant: "destructive",
        })
      } else if (error.code === "auth/popup-blocked") {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Could not log in with Google. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setIsMicrosoftLoading(true)
    try {
      const provider = new OAuthProvider("microsoft.com")
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", user.uid))

      // If not, create one
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "Microsoft User",
          email: user.email,
          role: "User",
          createdAt: serverTimestamp(),
          provider: "microsoft",
          preferences: {
            notifications: true,
            soundEffects: true,
            animations: true,
            theme: "light",
          },
        })
      }

      toast({
        title: "Microsoft login successful!",
        description: "Welcome to your AI Assistant.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Microsoft login error:", error)
      toast({
        title: "Login failed",
        description: "Could not log in with Microsoft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMicrosoftLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setIsGithubLoading(true)
    try {
      const provider = new GithubAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", user.uid))

      // If not, create one
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "Github User",
          email: user.email,
          role: "User",
          createdAt: serverTimestamp(),
          provider: "github",
          preferences: {
            notifications: true,
            soundEffects: true,
            animations: true,
            theme: "light",
          },
        })
      }

      toast({
        title: "Github login successful!",
        description: "Welcome to your AI Assistant.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Github login error:", error)
      toast({
        title: "Login failed",
        description: "Could not log in with Github. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGithubLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          className="w-full bg-background hover:bg-muted social-btn"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image src="/google-logo.svg" width={18} height={18} alt="Google" className="mr-0" />
          )}
          <span className="sr-only">Google</span>
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          className="w-full bg-background hover:bg-muted social-btn"
          onClick={handleMicrosoftLogin}
          disabled={isMicrosoftLoading}
        >
          {isMicrosoftLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image src="/microsoft-logo.svg" width={18} height={18} alt="Microsoft" className="mr-0" />
          )}
          <span className="sr-only">Microsoft</span>
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          className="w-full bg-background hover:bg-muted social-btn"
          onClick={handleGithubLogin}
          disabled={isGithubLoading}
        >
          {isGithubLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
          <span className="sr-only">Github</span>
        </Button>
      </motion.div>
    </div>
  )
}
