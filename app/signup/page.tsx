"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AuthLayout } from "@/components/auth/auth-layout"
import { SocialLogin } from "@/components/auth/social-login"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { signUp, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { FirebaseNotice } from "@/components/ui/firebase-notice"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true)

  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        router.push("/dashboard")
      }
    })

    // Check if Firebase is configured
    if (!auth) {
      setIsFirebaseConfigured(false)
    }

    return () => unsubscribe()
  }, [router])

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

  const validateForm = () => {
    const newErrors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
      terms?: string
    } = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

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

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
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

      const result = await signUp(email, password, name)

      if (result.success) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account before logging in.",
        })

        // Redirect to login page after successful signup
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        // Handle specific error codes
        let errorMessage = "An error occurred during signup."

        if (result.error?.includes("email-already-in-use")) {
          errorMessage = "This email is already in use. Please log in instead."
          setErrors({
            email: "Email already in use",
          })
        } else if (result.error?.includes("weak-password")) {
          errorMessage = "Password is too weak. Please use a stronger password."
          setErrors({
            password: "Password is too weak",
          })
        } else if (result.error?.includes("invalid-email")) {
          errorMessage = "Invalid email address. Please check and try again."
          setErrors({
            email: "Invalid email format",
          })
        }

        toast({
          title: "Signup failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Signup error:", error)

      // Special handling for API key error
      if (error.message && error.message.includes("api-key-not-valid")) {
        toast({
          title: "Firebase configuration error",
          description: "Please configure your Firebase API key in the environment variables.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signup failed",
          description: "An error occurred during signup.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Navigate to login page
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/login")
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
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your information to get started</p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative" onClick={createRipple}>
                <Label
                  htmlFor="name"
                  className={cn(
                    "absolute left-10 top-2 text-sm transition-all duration-200",
                    name ? "-translate-y-5 scale-75 text-primary" : "text-muted-foreground",
                  )}
                >
                  Full Name
                </Label>
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <motion.div
                  animate={errors.name ? { x: [0, -5, 5, -5, 0] } : {}}
                  transition={{ type: "spring", stiffness: 500, damping: 10 }}
                >
                  <Input
                    id="name"
                    type="text"
                    className={cn(
                      "h-14 pl-10 pr-3 pt-5 pb-2 bg-background/50 rounded-xl",
                      errors.name && "border-red-500 focus-visible:ring-red-500",
                    )}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=""
                    ref={nameInputRef}
                  />
                </motion.div>
                {errors.name && (
                  <motion.p
                    className="text-xs text-red-500 mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>
            </div>

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
            </div>

            <div className="space-y-2">
              <div className="relative" onClick={createRipple}>
                <Label
                  htmlFor="confirmPassword"
                  className={cn(
                    "absolute left-10 top-2 text-sm transition-all duration-200",
                    confirmPassword ? "-translate-y-5 scale-75 text-primary" : "text-muted-foreground",
                  )}
                >
                  Confirm Password
                </Label>
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <motion.div
                  animate={errors.confirmPassword ? { x: [0, -5, 5, -5, 0] } : {}}
                  transition={{ type: "spring", stiffness: 500, damping: 10 }}
                  className="relative"
                >
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={cn(
                      "h-14 pl-10 pr-10 pt-5 pb-2 bg-background/50 rounded-xl",
                      errors.confirmPassword && "border-red-500 focus-visible:ring-red-500",
                    )}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=""
                    ref={confirmPasswordInputRef}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </motion.div>
                {errors.confirmPassword && (
                  <motion.p
                    className="text-xs text-red-500 mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className={errors.terms ? "border-red-500" : ""}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <motion.p
                className="text-xs text-red-500 mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.terms}
              </motion.p>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-12 btn-gradient rounded-xl relative overflow-hidden group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
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
              Already have an account?{" "}
              <button onClick={handleLoginClick} className="text-primary hover:underline cursor-pointer font-medium">
                Log in
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AuthLayout>
  )
}
