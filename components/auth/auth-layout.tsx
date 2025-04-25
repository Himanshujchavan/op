"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from "next/image"
import { AnimatedBackground } from "@/components/ui/animated-background"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user is already logged in with proper error handling
    try {
      const user = localStorage.getItem("user")
      if (user) {
        try {
          const userData = JSON.parse(user)
          if (userData && userData.isLoggedIn) {
            router.push("/dashboard")
            return
          }
        } catch (error) {
          // Invalid user data, continue with login
          console.error("Error parsing user data:", error)
          localStorage.removeItem("user")
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      // Continue with login flow
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  // Create particles
  useEffect(() => {
    if (!particlesRef.current) return

    const container = particlesRef.current
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    // Create 50 particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div")
      particle.classList.add("particle")

      // Random size between 2-6px
      const size = Math.random() * 4 + 2
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Random position
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      // Random animation duration between 15-30s
      const duration = Math.random() * 15 + 15
      particle.style.animationDuration = `${duration}s`

      // Random delay
      particle.style.animationDelay = `${Math.random() * 5}s`

      container.appendChild(particle)
    }

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }, [isLoaded])

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-primary font-medium"
          >
            Loading...
          </motion.p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative px-4 py-8">
      {/* Animated background */}
      <div className="animated-bg">
        <AnimatedBackground />
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div ref={particlesRef} className="particles"></div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="relative z-10 w-full max-w-md mx-auto p-4 sm:p-8 glassmorphic rounded-xl sm:rounded-[2rem] shadow-xl"
      >
        <div className="light-sweep"></div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-indigo-500/30 rounded-xl blur-xl animate-pulse"></div>
            <Image src="/logo.svg" alt="Logo" width={64} height={64} className="rounded-xl relative z-10" />
          </motion.div>
        </div>

        <div className="mt-6">{children}</div>
      </motion.div>
    </div>
  )
}
