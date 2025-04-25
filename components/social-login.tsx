"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { FaGithub, FaMicrosoft } from "react-icons/fa"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const SocialLogin = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store user info with proper error handling
      try {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: "user@gmail.com",
            name: "Google User",
            isLoggedIn: true,
            provider: "google",
          }),
        )
      } catch (error) {
        console.error("Error storing user data:", error)
        toast({
          title: "Login error",
          description: "Could not store user data. Please try again.",
          variant: "destructive",
        })
        setIsGoogleLoading(false)
        return
      }

      toast({
        title: "Google login successful!",
        description: "Welcome to your AI Assistant.",
      })

      // Use router.push instead of direct window.location change
      router.push("/welcome")
    } catch (error) {
      console.error("Google login error:", error)
      toast({
        title: "Login failed",
        description: "Could not log in with Google. Please try again.",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setIsGithubLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store user info with proper error handling
      try {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: "user@github.com",
            name: "Github User",
            isLoggedIn: true,
            provider: "github",
          }),
        )
      } catch (error) {
        console.error("Error storing user data:", error)
        toast({
          title: "Login error",
          description: "Could not store user data. Please try again.",
          variant: "destructive",
        })
        setIsGithubLoading(false)
        return
      }

      toast({
        title: "Github login successful!",
        description: "Welcome to your AI Assistant.",
      })

      router.push("/welcome")
    } catch (error) {
      console.error("Github login error:", error)
      toast({
        title: "Login failed",
        description: "Could not log in with Github. Please try again.",
        variant: "destructive",
      })
      setIsGithubLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setIsMicrosoftLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store user info with proper error handling
      try {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: "user@microsoft.com",
            name: "Microsoft User",
            isLoggedIn: true,
            provider: "microsoft",
          }),
        )
      } catch (error) {
        console.error("Error storing user data:", error)
        toast({
          title: "Login error",
          description: "Could not store user data. Please try again.",
          variant: "destructive",
        })
        setIsMicrosoftLoading(false)
        return
      }

      toast({
        title: "Microsoft login successful!",
        description: "Welcome to your AI Assistant.",
      })

      router.push("/welcome")
    } catch (error) {
      console.error("Microsoft login error:", error)
      toast({
        title: "Login failed",
        description: "Could not log in with Microsoft. Please try again.",
        variant: "destructive",
      })
      setIsMicrosoftLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
        {isGoogleLoading ? (
          "Loading ..."
        ) : (
          <>
            <FcGoogle className="mr-2 h-5 w-5" />
            Google
          </>
        )}
      </Button>
      <Button variant="outline" className="w-full" onClick={handleGithubLogin} disabled={isGithubLoading}>
        {isGithubLoading ? (
          "Loading ..."
        ) : (
          <>
            <FaGithub className="mr-2 h-5 w-5" />
            Github
          </>
        )}
      </Button>
      <Button variant="outline" className="w-full" onClick={handleMicrosoftLogin} disabled={isMicrosoftLoading}>
        {isMicrosoftLoading ? (
          "Loading ..."
        ) : (
          <>
            <FaMicrosoft className="mr-2 h-5 w-5" />
            Microsoft
          </>
        )}
      </Button>
    </div>
  )
}

export default SocialLogin
