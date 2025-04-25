"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  BrainCircuit,
  Mail,
  FileText,
  Terminal,
  History,
  Settings,
  Menu,
  X,
  Mic,
  Loader2,
  LogOut,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { FloatingAssistant } from "@/components/floating-assistant"
import { AssistantProvider, useAssistant } from "@/contexts/assistant-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { PageTransition } from "@/components/ui/page-transition"
import { useTheme } from "next-themes"
import Image from "next/image"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update the useEffect hook that checks authentication:
  useEffect(() => {
    // Check if user is logged in with proper error handling
    const checkAuth = async () => {
      try {
        // First check if auth is initialized
        if (!auth) {
          console.error("Firebase auth not initialized")
          router.push("/login")
          return
        }

        // Use onAuthStateChanged to check auth state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in
            setUser({
              name: user.displayName || "User",
              email: user.email || "user@example.com",
            })
            setIsLoading(false)
          } else {
            // User is not signed in
            console.log("No user signed in")
            router.push("/login")
          }
        })

        return () => unsubscribe()
      } catch (error) {
        console.error("Error checking auth state:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    setIsSidebarOpen(!isMobile)
  }, [isMobile])

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut()

      // Clear user data
      localStorage.removeItem("user")

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    // Apply theme immediately
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save to localStorage
    localStorage.setItem("theme", newTheme)

    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: `Your preference has been saved.`,
    })
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/tasks", label: "Task Assistant", icon: BrainCircuit },
    { href: "/email", label: "Email & CRM", icon: Mail },
    { href: "/documents", label: "Document Assistant", icon: FileText },
    { href: "/automation", label: "Automation Scripts", icon: Terminal },
    { href: "/history", label: "History & Logs", icon: History },
    { href: "/settings", label: "Profile & Settings", icon: Settings },
    { href: "/nlp-engine", label: "NLP Engine", icon: Sparkles },
  ]

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-pulse">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-primary font-medium">Loading your assistant...</p>
        </div>
      </div>
    )
  }

  const currentTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "light"

  return (
    <AssistantProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: isMobile ? -280 : 0 }}
              animate={{ x: 0 }}
              exit={{ x: isMobile ? -280 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "w-64 bg-primary text-primary-foreground flex flex-col z-40",
                isMobile ? "fixed h-full shadow-xl" : "h-screen",
              )}
            >
              <div className="p-4 border-b border-primary-foreground/10 flex items-center gap-3">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} className="rounded-lg" />
                <h1 className="text-xl font-bold">AI Assistant</h1>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
                        isActive
                          ? "bg-accent text-primary-foreground"
                          : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                      )}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute left-0 w-1 h-8 bg-primary-foreground rounded-r-full"
                        />
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* User profile section */}
              <div className="p-4 border-t border-primary-foreground/10">
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start p-2 hover:bg-primary-foreground/10">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                          <AvatarFallback className="bg-accent text-primary">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-medium truncate max-w-[120px]">{user.name}</span>
                          <span className="text-xs text-primary-foreground/70 truncate max-w-[120px]">
                            {user.email}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={toggleTheme}>
                        {currentTheme === "dark" ? (
                          <>
                            <Sun className="mr-2 h-4 w-4 text-amber-500" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="mr-2 h-4 w-4 text-blue-400" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <SidebarVoiceButton />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content with page transition */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex justify-end p-4">
            <ThemeToggle />
          </div>
          <PageTransition>
            <div className="container p-4 mx-auto max-w-7xl">{children}</div>
          </PageTransition>
        </main>

        {/* Floating assistant */}
        <FloatingAssistant />
      </div>
    </AssistantProvider>
  )
}

// Voice command button component for the sidebar
function SidebarVoiceButton() {
  const { isListening, setIsListening, isProcessing } = useAssistant()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="p-4 border-t border-primary-foreground/10">
      <Button
        variant="outline"
        className={cn(
          "w-full bg-accent hover:bg-accent/80 text-primary-foreground border-none rounded-xl",
          isListening && "animate-pulse",
        )}
        onClick={() => setIsListening(!isListening)}
        disabled={isProcessing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isListening ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Mic className={cn("w-4 h-4 mr-2", isHovered && "animate-bounce")} />
        )}
        {isListening ? "Listening..." : "Voice Command"}
      </Button>
    </div>
  )
}
