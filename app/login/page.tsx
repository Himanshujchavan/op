"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles, Bot, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AuthLayout } from "@/components/auth/auth-layout"
import { SocialLogin } from "@/components/auth/social-login"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { signIn, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { FirebaseNotice } from "@/components/ui/firebase-notice"
import { OfflineNotice } from "@/components/ui/offline-notice"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [typedWelcome, setTypedWelcome] = useState("")
  const [showAssistantMessage, setShowAssistantMessage] = useState(false)
  const [assistantMessage, setAssistantMessage] = useState("")
  const [assistantAvatar, setAssistantAvatar] = useState(Math.floor(Math.random() * 4))
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        router.push("/dashboard")
      }
    })

    return () => unsubscribe()
  }, [router])

  // Check online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    // Set initial status
    setIsOffline(!navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  // Typewriter effect for welcome message
  useEffect(() => {
    const welcomeText = "Welcome back, Commander!"
    let index = 0
    let timer: NodeJS.Timeout

    const typeNextChar = () => {
      if (index <= welcomeText.length) {
        setTypedWelcome(welcomeText.substring(0, index))
        index++
        timer = setTimeout(typeNextChar, 100)
      }
    }

    typeNextChar()

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Create ripple effect on input click
  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const ripple = document.createElement("span")
    ripple.classList.add("ripple")
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    element.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  // Show random assistant message on avatar hover
  const showRandomAssistantMessage = () => {
    const messages = [
      "Logging you in with brilliance!",
      "Trust me, I remember your tasks better than you!",
      "Your AI desk is ready and waiting!",
      "Need help? Just ask!",
      "I've been expecting you!",
    ]

    setAssistantMessage(messages[Math.floor(Math.random() * messages.length)])
    setShowAssistantMessage(true)

    setTimeout(() => {
      setShowAssistantMessage(false)
    }, 3000)
  }

  // Add this useEffect to check if Firebase is configured
  useEffect(() => {
    // Check if auth is initialized
    if (!auth) {
      setIsFirebaseConfigured(false)
    }
  }, [])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Check if offline before attempting login
    if (isOffline) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      })
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

      const result = await signIn(email, password)

      if (result.success) {
        if (result.warning) {
          toast({
            title: "Login successful with limitations",
            description: result.warning,
          })
        } else {
          toast({
            title: "Login successful!",
            description: "Welcome back to your AI Assistant.",
          })
        }

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        // Handle specific error codes
        let errorMessage = "Please check your credentials and try again."

        if (result.error?.includes("user-not-found")) {
          errorMessage = "No account found with this email. Please sign up."
          setErrors({
            email: "No account found with this email",
          })
        } else if (result.error?.includes("wrong-password") || result.error?.includes("invalid-credential")) {
          errorMessage = "Invalid email or password. Please try again."
          setErrors({
            password: "Invalid email or password",
          })
        } else if (result.error?.includes("too-many-requests")) {
          errorMessage = "Too many failed login attempts. Please try again later."
        } else if (result.error?.includes("network-request-failed") || result.error?.includes("unavailable")) {
          errorMessage = "Network error. Please check your internet connection."
          setIsOffline(true) // Update offline state
        } else {
          setErrors({
            password: "Invalid email or password",
          })
        }

        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // Special handling for API key error
      if (error.message && error.message.includes("api-key-not-valid")) {
        toast({
          title: "Firebase configuration error",
          description: "Please configure your Firebase API key in the environment variables.",
          variant: "destructive",
        })
      } else if (error.message && (error.message.includes("network") || error.message.includes("offline"))) {
        setIsOffline(true) // Update offline state
        toast({
          title: "Network error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // For development/testing purposes only
  const handleTestLogin = () => {
    // You can set these to test credentials that you know work
    setEmail("test@example.com")
    setPassword("password123")

    toast({
      title: "Test credentials loaded",
      description: "You can now click Login to test the authentication.",
    })
  }

  // Navigate to signup page
  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/signup")
  }

  return (
    <AuthLayout>
      {!isFirebaseConfigured && <FirebaseNotice />}
      {isOffline && <OfflineNotice />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full"
      >
        <div className="flex flex-col space-y-2 text-center mb-8">
          <div className="flex justify-center mb-4">
            <motion.div
              className="relative w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              onHoverStart={showRandomAssistantMessage}
            >
              {assistantAvatar === 0 && <Bot className="h-8 w-8 text-white" />}
              {assistantAvatar === 1 && <Sparkles className="h-8 w-8 text-white" />}
              {assistantAvatar === 2 && <div className="text-white text-2xl font-bold">🦊</div>}
              {assistantAvatar === 3 && <div className="text-white text-2xl font-bold">🦉</div>}

              <AnimatePresence>
                {showAssistantMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -50, scale: 1 }}
                    exit={{ opacity: 0, y: -60, scale: 0.8 }}
                    className="absolute top-0 whitespace-nowrap bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg"
                  >
                    {assistantMessage}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-slate-800"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.h1
            className="text-2xl font-semibold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="typing-text">{typedWelcome}</span>
            <span className="animate-pulse">|</span>
          </motion.h1>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your AI desk is ready
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative" onClick={createRipple}>
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
                  animate={errors.email ? { x: [0, -5, 5, -5, 0] } : {}}
                  transition={{ type: "spring", stiffness: 500, damping: 10 }}
                >
                  <Input
                    id="email"
                    type="email"
                    className={cn(
                      "h-14 pl-10 pr-3 pt-5 pb-2 bg-background/50 rounded-xl",
                      errors.email && "border-red-500 focus-visible:ring-red-500",
                    )}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    ref={emailInputRef}
                  />
                </motion.div>
                {errors.email && (
                  <motion.p
                    className="text-xs text-red-500 mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative" onClick={createRipple}>
                <Label
                  htmlFor="password"
                  className={cn(
                    "absolute left-10 top-2 text-sm transition-all duration-200",
                    password ? "-translate-y-5 scale-75 text-primary" : "text-muted-foreground",
                  )}
                >
                  Password
                </Label>
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <motion.div
                  animate={errors.password ? { x: [0, -5, 5, -5, 0] } : {}}
                  transition={{ type: "spring", stiffness: 500, damping: 10 }}
                  className="relative"
                >
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={cn(
                      "h-14 pl-10 pr-10 pt-5 pb-2 bg-background/50 rounded-xl",
                      errors.password && "border-red-500 focus-visible:ring-red-500",
                    )}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    ref={passwordInputRef}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </motion.div>
                {errors.password && (
                  <motion.p
                    className="text-xs text-red-500 mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline relative group">
                    Forgot password?
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-12 btn-gradient rounded-xl relative overflow-hidden group"
                disabled={isLoading || isOffline}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : isOffline ? (
                  <>
                    <WifiOff className="mr-2 h-4 w-4" />
                    Offline
                  </>
                ) : (
                  <>
                    Log in
                    <motion.span
                      className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                    >
                      →
                    </motion.span>
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <motion.span
                  className="bg-background px-2 text-muted-foreground"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Or continue with
                </motion.span>
              </div>
            </div>

            <SocialLogin />

            <motion.div
              className="mt-6 text-center text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Don't have an account?{" "}
              <button onClick={handleSignupClick} className="text-primary hover:underline cursor-pointer font-medium">
                Sign up
              </button>
            </motion.div>
          </div>

          {/* Test login button - only visible in development */}
          {process.env.NODE_ENV === "development" && (
            <motion.div className="fixed bottom-6 left-6" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                onClick={handleTestLogin}
                disabled={isOffline}
              >
                Load Test Credentials
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AuthLayout>
  )
}
