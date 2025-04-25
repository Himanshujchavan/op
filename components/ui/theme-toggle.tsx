"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Apply theme from localStorage on initial load if available
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)

      // Apply theme to document element immediately
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [setTheme])

  const toggleTheme = () => {
    // Determine the new theme
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"

    // Apply theme to document element immediately for instant visual feedback
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Update the theme in localStorage and context
    localStorage.setItem("theme", newTheme)
    setTheme(newTheme)

    // Show toast notification
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: "Your preference has been saved.",
    })
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 relative">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const currentTheme = resolvedTheme || theme

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9 relative"
      onClick={toggleTheme}
      aria-label={`Switch to ${currentTheme === "dark" ? "light" : "dark"} theme`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: currentTheme === "dark" ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full flex items-center justify-center"
      >
        <Sun
          className={`h-4 w-4 transition-all ${currentTheme === "dark" ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
        />
        <Moon
          className={`absolute h-4 w-4 transition-all ${currentTheme === "dark" ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
        />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
