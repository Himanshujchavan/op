"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bot, ArrowRight, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function WelcomePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    // Get user data with proper error handling
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          if (parsedUser && parsedUser.isLoggedIn) {
            setUser({
              name: parsedUser.name || "User",
            })
          } else {
            router.push("/login")
          }
        } catch (error) {
          console.error("Error parsing user data:", error)
          localStorage.removeItem("user")
          router.push("/login")
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      router.push("/login")
    }

    // Auto-redirect after animation
    const timer = setTimeout(() => {
      router.push("/dashboard")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden relative px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-auth-light dark:bg-auth-dark bg-cover bg-center opacity-50" />

      {/* Animated leaves */}
      <div className="leaf leaf-1">
        <Image src="/leaf.svg" alt="Leaf" width={32} height={32} className="text-primary" />
      </div>
      <div className="leaf leaf-2">
        <Image src="/leaf.svg" alt="Leaf" width={32} height={32} className="text-primary" />
      </div>
      <div className="leaf leaf-3">
        <Image src="/leaf.svg" alt="Leaf" width={32} height={32} className="text-primary" />
      </div>
      <div className="leaf leaf-4">
        <Image src="/leaf.svg" alt="Leaf" width={32} height={32} className="text-primary" />
      </div>
      <div className="leaf leaf-5">
        <Image src="/leaf.svg" alt="Leaf" width={32} height={32} className="text-primary" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-center z-10 max-w-md"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          className="mx-auto mb-8 bg-primary rounded-full p-6 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center"
        >
          <Bot className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl sm:text-4xl font-bold mb-4"
        >
          Welcome, {user?.name || "User"}! 🌱
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-lg sm:text-xl text-muted-foreground mb-8"
        >
          Your AI Assistant is ready to help you
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="relative">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 rounded-xl relative overflow-hidden group"
            onClick={() => router.push("/dashboard")}
          >
            <div className="absolute inset-0 w-3 bg-white/10 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-20"></div>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <motion.div
            className="absolute -right-8 -top-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Leaf className="h-6 w-6 text-accent opacity-50" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
