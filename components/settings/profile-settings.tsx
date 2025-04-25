"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Cloud,
  CreditCard,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Mail,
  Moon,
  Save,
  Sun,
  Trash,
  User,
  Download,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import {
  auth,
  updateUserProfile,
  updateUserPreferences,
  logOut,
  deleteAccount,
  connectService,
  disconnectService,
} from "@/lib/firebase"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Update the ProfileSettings component to add state for user data
export function ProfileSettings() {
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
  })
  const [preferences, setPreferences] = useState({
    notifications: true,
    soundEffects: true,
    animations: true,
    theme: "light", // Default theme
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [connections, setConnections] = useState<Record<string, any>>({})
  const [isConnecting, setIsConnecting] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("profile")

  // Add these states for tracking connection status
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  const [isConnectingMicrosoft, setIsConnectingMicrosoft] = useState(false)
  const [isConnectingSlack, setIsConnectingSlack] = useState(false)
  const [connectedServices, setConnectedServices] = useState({
    google: false,
    microsoft: false,
    slack: false,
    email: false,
    calendar: false,
    crm: false,
  })

  // Update preferences.theme whenever the theme changes
  useEffect(() => {
    if (theme) {
      setPreferences((prev) => ({
        ...prev,
        theme: theme,
      }))
    }
  }, [theme])

  // Add this function to handle connecting a service
  const handleConnectService = async (service: string) => {
    if (!auth?.currentUser?.uid) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect services",
        variant: "destructive",
      })
      return
    }

    // Set loading state
    if (service === "google") setIsConnectingGoogle(true)
    if (service === "microsoft") setIsConnectingMicrosoft(true)
    if (service === "slack") setIsConnectingSlack(true)
    if (service === "email" || service === "calendar" || service === "crm") {
      setIsConnecting((prev) => ({ ...prev, [service]: true }))
    }

    try {
      const result = await connectService(auth.currentUser.uid, service, {
        name: service,
        email: auth.currentUser.email,
        timestamp: new Date().toISOString(),
      })

      if (result.success) {
        toast({
          title: "Service connected",
          description: `${service.charAt(0).toUpperCase() + service.slice(1)} has been connected successfully`,
        })

        // Update connected services
        setConnectedServices((prev) => ({
          ...prev,
          [service]: true,
        }))
      } else {
        toast({
          title: "Connection failed",
          description: result.error || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error connecting ${service}:`, error)
      toast({
        title: "Error",
        description: `Failed to connect ${service}`,
        variant: "destructive",
      })
    } finally {
      // Reset loading state
      if (service === "google") setIsConnectingGoogle(false)
      if (service === "microsoft") setIsConnectingMicrosoft(false)
      if (service === "slack") setIsConnectingSlack(false)
      if (service === "email" || service === "calendar" || service === "crm") {
        setIsConnecting((prev) => ({ ...prev, [service]: false }))
      }
    }
  }

  // Add this function to handle disconnecting a service
  const handleDisconnectService = async (service: string) => {
    if (!auth?.currentUser?.uid) {
      toast({
        title: "Authentication required",
        description: "Please log in to disconnect services",
        variant: "destructive",
      })
      return
    }

    // Set loading state
    if (service === "google") setIsConnectingGoogle(true)
    if (service === "microsoft") setIsConnectingMicrosoft(true)
    if (service === "slack") setIsConnectingSlack(true)
    if (service === "email" || service === "calendar" || service === "crm") {
      setIsConnecting((prev) => ({ ...prev, [service]: true }))
    }

    try {
      const result = await disconnectService(auth.currentUser.uid, service)

      if (result.success) {
        toast({
          title: "Service disconnected",
          description: `${service.charAt(0).toUpperCase() + service.slice(1)} has been disconnected successfully`,
        })

        // Update connected services
        setConnectedServices((prev) => ({
          ...prev,
          [service]: false,
        }))
      } else {
        toast({
          title: "Disconnection failed",
          description: result.error || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error)
      toast({
        title: "Error",
        description: `Failed to disconnect ${service}`,
        variant: "destructive",
      })
    } finally {
      // Reset loading state
      if (service === "google") setIsConnectingGoogle(false)
      if (service === "microsoft") setIsConnectingMicrosoft(false)
      if (service === "slack") setIsConnectingSlack(false)
      if (service === "email" || service === "calendar" || service === "crm") {
        setIsConnecting((prev) => ({ ...prev, [service]: false }))
      }
    }
  }

  // Add useEffect to load user data from Firebase
  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      setUserData({
        name: user.displayName || "",
        email: user.email || "",
        role: "User",
      })

      // Load user preferences from localStorage as a fallback
      try {
        const storedPreferences = localStorage.getItem("preferences")
        if (storedPreferences) {
          const parsedPrefs = JSON.parse(storedPreferences)
          setPreferences(parsedPrefs)

          // If theme is stored in preferences, apply it
          if (parsedPrefs.theme) {
            setTheme(parsedPrefs.theme)
          }
        } else {
          // If no stored preferences, initialize with current theme
          const currentTheme = localStorage.getItem("theme") || "light"
          setPreferences((prev) => ({
            ...prev,
            theme: currentTheme,
          }))
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
      }
    } else {
      router.push("/login")
    }
  }, [router, setTheme])

  // Add function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // Add function to save user data
  const saveUserData = async () => {
    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (user) {
        await updateUserProfile(user.uid, {
          name: userData.name,
          role: userData.role,
        })

        toast({
          title: "Profile updated",
          description: "Your profile information has been saved successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving user data:", error)
      toast({
        title: "Error",
        description: "Failed to save profile information.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add function to save preferences
  const savePreferences = async () => {
    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (user) {
        // Make sure we have a valid theme value
        const currentTheme = theme || resolvedTheme || "light"

        // Update preferences with the current theme
        const updatedPreferences = {
          ...preferences,
          theme: currentTheme,
        }

        // Save to Firestore
        await updateUserPreferences(user.uid, updatedPreferences)

        // Save to localStorage as fallback
        localStorage.setItem("preferences", JSON.stringify(updatedPreferences))
        localStorage.setItem("theme", currentTheme)

        // Apply theme immediately
        if (currentTheme === "dark") {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }

        toast({
          title: "Preferences saved",
          description: "Your preferences have been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add function to handle preference toggles
  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Add function to handle sign out
  const handleSignOut = async () => {
    try {
      await logOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      })
    }
  }

  // Add function to handle account deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteAccount(deletePassword)

      if (result.success) {
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted.",
        })
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete account.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeletePassword("")
    }
  }

  const integrations = [
    {
      id: "email",
      name: "Email",
      icon: Mail,
      connected: connectedServices.email,
      provider: "Gmail",
    },
    {
      id: "calendar",
      name: "Calendar",
      icon: Calendar,
      connected: connectedServices.calendar,
      provider: "Google Calendar",
    },
    {
      id: "crm",
      name: "CRM",
      icon: User,
      connected: connectedServices.crm,
      provider: "Salesforce",
    },
    {
      id: "google",
      name: "Google",
      icon: Mail,
      connected: connectedServices.google,
    },
    {
      id: "microsoft",
      name: "Microsoft",
      icon: Calendar,
      connected: connectedServices.microsoft,
    },
    {
      id: "slack",
      name: "Slack",
      icon: User,
      connected: connectedServices.slack,
    },
  ]

  const privacySettings = [
    {
      id: "store-history",
      label: "Store command history",
      description: "Save your commands and actions for future reference",
      enabled: true,
    },
    {
      id: "usage-data",
      label: "Share usage data",
      description: "Help improve the assistant by sharing anonymous usage data",
      enabled: true,
    },
    {
      id: "voice-data",
      label: "Store voice recordings",
      description: "Save voice commands for training and improvement",
      enabled: false,
    },
  ]

  const commandAliases = [
    { id: 1, alias: "clean up", command: "Close all applications and organize desktop" },
    { id: 2, alias: "meeting mode", command: "Open Zoom, Notes, and mute notifications" },
    { id: 3, alias: "focus time", command: "Block distracting websites and enable Do Not Disturb" },
  ]

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Get the current theme for display
  const currentTheme = theme || resolvedTheme || "light"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-white">Profile & Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-[#2B2D42] data-[state=active]:text-white"
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-[#2B2D42] data-[state=active]:text-white"
            onClick={() => setActiveTab("integrations")}
          >
            <Globe className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="data-[state=active]:bg-[#2B2D42] data-[state=active]:text-white"
            onClick={() => setActiveTab("privacy")}
          >
            <Lock className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger
            value="commands"
            className="data-[state=active]:bg-[#2B2D42] data-[state=active]:text-white"
            onClick={() => setActiveTab("commands")}
          >
            <Cloud className="w-4 h-4 mr-2" />
            Commands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-[#8D99AE]/30">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] dark:text-white">Personal Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col items-center space-y-3">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>{userData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      className="border-[#8D99AE]/30"
                      onClick={() => {
                        toast({
                          title: "Avatar update",
                          description: "This feature will be available soon.",
                        })
                      }}
                    >
                      Change Avatar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        className="border-[#8D99AE]/30"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className="border-[#8D99AE]/30"
                        type="email"
                        disabled
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={userData.role}
                        onChange={handleInputChange}
                        className="border-[#8D99AE]/30"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#2B2D42] hover:bg-[#2B2D42]/80"
                  onClick={saveUserData}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-[#8D99AE]/30">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] dark:text-white">Preferences</CardTitle>
                <CardDescription>Customize your assistant experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer",
                          currentTheme === "light" ? "border-[#2B2D42] bg-[#2B2D42]/5" : "border-[#8D99AE]/30",
                        )}
                        onClick={() => setTheme("light")}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#F8F9FA] border border-[#8D99AE]/30 flex items-center justify-center">
                          <Sun className="w-5 h-5 text-[#2B2D42]" />
                        </div>
                        <span className="text-sm font-medium">Light</span>
                        {currentTheme === "light" && <Check className="w-4 h-4 text-[#4ECDC4]" />}
                      </div>
                      <div
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer",
                          currentTheme === "dark" ? "border-[#2B2D42] bg-[#2B2D42]/5" : "border-[#8D99AE]/30",
                        )}
                        onClick={() => setTheme("dark")}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#2B2D42] flex items-center justify-center">
                          <Moon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">Dark</span>
                        {currentTheme === "dark" && <Check className="w-4 h-4 text-[#4ECDC4]" />}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notifications</Label>
                        <p className="text-sm text-[#8D99AE]">Receive alerts and reminders</p>
                      </div>
                      <Switch
                        checked={preferences.notifications}
                        onCheckedChange={(checked) => handlePreferenceChange("notifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Sound Effects</Label>
                        <p className="text-sm text-[#8D99AE]">Play sounds for actions</p>
                      </div>
                      <Switch
                        checked={preferences.soundEffects}
                        onCheckedChange={(checked) => handlePreferenceChange("soundEffects", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Animations</Label>
                        <p className="text-sm text-[#8D99AE]">Show interface animations</p>
                      </div>
                      <Switch
                        checked={preferences.animations}
                        onCheckedChange={(checked) => handlePreferenceChange("animations", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#2B2D42] hover:bg-[#2B2D42]/80"
                  onClick={savePreferences}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-[#8D99AE]/30 mt-6">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] dark:text-white">Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-slate-800 border border-[#8D99AE]/10 flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-[#2B2D42] dark:text-white mr-3" />
                      <div>
                        <p className="font-medium text-[#1A1A1A] dark:text-white">Subscription</p>
                        <p className="text-xs text-[#8D99AE]">Pro Plan - ₹ 75/month</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#8D99AE]/30"
                      onClick={() => {
                        toast({
                          title: "Subscription Management",
                          description: "Opening subscription management page...",
                        })
                      }}
                    >
                      Manage
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-slate-800 border border-[#8D99AE]/10 flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="w-5 h-5 text-[#2B2D42] dark:text-white mr-3" />
                      <div>
                        <p className="font-medium text-[#1A1A1A] dark:text-white">Notifications</p>
                        <p className="text-xs text-[#8D99AE]">Email, push, and in-app notifications</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#8D99AE]/30"
                      onClick={() => {
                        toast({
                          title: "Notification Settings",
                          description: "Opening notification configuration...",
                        })
                      }}
                    >
                      Configure
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8F9FA] dark:bg-slate-800 border border-[#8D99AE]/10 flex items-center justify-between">
                    <div className="flex items-center">
                      <HelpCircle className="w-5 h-5 text-[#2B2D42] dark:text-white mr-3" />
                      <div>
                        <p className="font-medium text-[#1A1A1A] dark:text-white">Help & Support</p>
                        <p className="text-xs text-[#8D99AE]">Get help or contact support</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#8D99AE]/30"
                      onClick={() => {
                        toast({
                          title: "Help & Support",
                          description: "Opening support center...",
                        })
                      }}
                    >
                      Get Help
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-[#EF233C]/30 text-[#EF233C] hover:bg-[#EF233C]/10 hover:text-[#EF233C]"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-[#EF233C]/30 text-[#EF233C] hover:bg-[#EF233C]/10 hover:text-[#EF233C]"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="delete-password">Enter your password to confirm</Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Your password"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || !deletePassword}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Account
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="border-[#8D99AE]/30">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] dark:text-white">Connected Services</CardTitle>
              <CardDescription>Manage your connected apps and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="p-4 rounded-lg bg-[#F8F9FA] dark:bg-slate-800 border border-[#8D99AE]/10 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#2B2D42] flex items-center justify-center mr-3">
                        {React.createElement(integration.icon, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A] dark:text-white">{integration.name}</p>
                        <p className="text-xs text-[#8D99AE]">
                          {integration.connected
                            ? `Connected to ${integration.provider || integration.name}`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    {integration.id === "google" ? (
                      <Button
                        variant={connectedServices.google ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          connectedServices.google ? handleDisconnectService("google") : handleConnectService("google")
                        }
                        disabled={isConnectingGoogle}
                      >
                        {isConnectingGoogle ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : connectedServices.google ? (
                          <>Disconnect</>
                        ) : (
                          <>Connect</>
                        )}
                      </Button>
                    ) : integration.id === "microsoft" ? (
                      <Button
                        variant={connectedServices.microsoft ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          connectedServices.microsoft
                            ? handleDisconnectService("microsoft")
                            : handleConnectService("microsoft")
                        }
                        disabled={isConnectingMicrosoft}
                      >
                        {isConnectingMicrosoft ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : connectedServices.microsoft ? (
                          <>Disconnect</>
                        ) : (
                          <>Connect</>
                        )}
                      </Button>
                    ) : integration.id === "slack" ? (
                      <Button
                        variant={connectedServices.slack ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          connectedServices.slack ? handleDisconnectService("slack") : handleConnectService("slack")
                        }
                        disabled={isConnectingSlack}
                      >
                        {isConnectingSlack ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : connectedServices.slack ? (
                          <>Disconnect</>
                        ) : (
                          <>Connect</>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant={integration.connected ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          integration.connected
                            ? handleDisconnectService(integration.id)
                            : handleConnectService(integration.id)
                        }
                        disabled={isConnecting[integration.id]}
                      >
                        {isConnecting[integration.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : integration.connected ? (
                          <>Disconnect</>
                        ) : (
                          <>Connect</>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-[#4ECDC4] hover:bg-[#4ECDC4]/80 text-[#1A1A1A]"
                onClick={() => {
                  toast({
                    title: "Add Integration",
                    description: "Opening integration marketplace...",
                  })
                }}
              >
                <Globe className="w-4 h-4 mr-2" />
                Add New Integration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="border-[#8D99AE]/30">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] dark:text-white">Privacy Settings</CardTitle>
              <CardDescription>Control your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {privacySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{setting.label}</Label>
                      <p className="text-sm text-[#8D99AE]">{setting.description}</p>
                    </div>
                    <Switch defaultChecked={setting.enabled} />
                  </div>
                ))}

                <div className="pt-4 border-t border-[#8D99AE]/10">
                  <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-white mb-4">Data Management</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full border-[#8D99AE]/30 justify-start"
                      onClick={() => {
                        toast({
                          title: "Download Data",
                          description: "Your data export is being prepared. You'll receive an email when it's ready.",
                        })
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download My Data
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-[#EF233C]/30 text-[#EF233C] hover:bg-[#EF233C]/10 hover:text-[#EF233C] justify-start"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete All My Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-[#2B2D42] hover:bg-[#2B2D42]/80"
                onClick={() => {
                  toast({
                    title: "Privacy Settings Saved",
                    description: "Your privacy preferences have been updated successfully.",
                  })
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="commands">
          <Card className="border-[#8D99AE]/30">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] dark:text-white">Custom Commands</CardTitle>
              <CardDescription>Create personal command aliases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commandAliases.map((alias) => (
                  <div
                    key={alias.id}
                    className="p-4 rounded-lg bg-[#F8F9FA] dark:bg-slate-800 border border-[#8D99AE]/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-[#1A1A1A] dark:text-white">"{alias.alias}"</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[#8D99AE] hover:text-[#EF233C]"
                        onClick={() => {
                          toast({
                            title: "Command Deleted",
                            description: `Command "${alias.alias}" has been removed.`,
                          })
                        }}
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-[#8D99AE]">{alias.command}</p>
                  </div>
                ))}

                <div className="p-4 rounded-lg border border-dashed border-[#8D99AE]/30">
                  <div className="space-y-3">
                    <div className="grid gap-2">
                      <Label htmlFor="alias">Command Alias</Label>
                      <Input id="alias" placeholder="e.g., 'work mode'" className="border-[#8D99AE]/30" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="command">Actual Command</Label>
                      <Input
                        id="command"
                        placeholder="e.g., 'Open email, calendar, and Slack'"
                        className="border-[#8D99AE]/30"
                      />
                    </div>
                    <Button
                      className="w-full bg-[#4ECDC4] hover:bg-[#4ECDC4]/80 text-[#1A1A1A]"
                      onClick={() => {
                        toast({
                          title: "Command Added",
                          description: "Your custom command has been created successfully.",
                        })
                      }}
                    >
                      Add Command
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
