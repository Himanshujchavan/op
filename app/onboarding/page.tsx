"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Calendar, Check, Mail, Mic, Settings, Sparkles, User, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [assistantName, setAssistantName] = useState("AI Assistant")
  const [selectedVoice, setSelectedVoice] = useState("female")
  const [selectedApps, setSelectedApps] = useState<string[]>(["email", "calendar"])
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 4

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      setIsLoading(true)
      // Simulate setup completion
      setTimeout(() => {
        setIsLoading(false)
        toast({
          title: "Setup complete!",
          description: "Your AI Assistant is ready to use.",
        })
        router.push("/dashboard")
      }, 2000)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const toggleApp = (app: string) => {
    if (selectedApps.includes(app)) {
      setSelectedApps(selectedApps.filter((a) => a !== app))
    } else {
      setSelectedApps([...selectedApps, app])
    }
  }

  const handleConnect = (service: string) => {
    toast({
      title: "Connecting...",
      description: `Connecting to ${service}. This feature will be available in a future update.`,
    })
  }

  const apps = [
    { id: "email", name: "Email", icon: Mail },
    { id: "calendar", name: "Calendar", icon: Calendar },
    { id: "zoom", name: "Zoom", icon: Mic },
    { id: "slack", name: "Slack", icon: Zap },
    { id: "notion", name: "Notion", icon: Settings },
    { id: "figma", name: "Figma", icon: Sparkles },
  ]

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA] p-4">
      <Card className="w-full max-w-2xl border-[#8D99AE]/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#1A1A1A]">Welcome to AI Desktop Assistant</CardTitle>
          <CardDescription>Let's set up your personal assistant in a few steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      i + 1 === step
                        ? "bg-[#2B2D42] text-white"
                        : i + 1 < step
                          ? "bg-[#4ECDC4] text-white"
                          : "bg-[#8D99AE]/20 text-[#8D99AE]",
                    )}
                  >
                    {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={cn("h-1 w-full mx-1", i + 1 < step ? "bg-[#4ECDC4]" : "bg-[#8D99AE]/20")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                      className="w-24 h-24 rounded-full bg-[#4ECDC4] flex items-center justify-center"
                    >
                      <Sparkles className="w-12 h-12 text-white" />
                    </motion.div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-[#1A1A1A]">Meet Your AI Assistant</h3>
                    <p className="text-[#8D99AE]">
                      Your personal AI assistant is here to help you with tasks, emails, documents, and more. Let's get
                      started by personalizing your experience.
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="assistant-name">Name Your Assistant</Label>
                      <Input
                        id="assistant-name"
                        value={assistantName}
                        onChange={(e) => setAssistantName(e.target.value)}
                        className="border-[#8D99AE]/30"
                      />
                      <p className="text-xs text-[#8D99AE]">
                        This is what you'll call your assistant when using voice commands.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Assistant Voice</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer",
                            selectedVoice === "female" ? "border-[#2B2D42] bg-[#2B2D42]/5" : "border-[#8D99AE]/30",
                          )}
                          onClick={() => setSelectedVoice("female")}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-[#1A1A1A]">Female</span>
                            {selectedVoice === "female" && <Check className="w-4 h-4 text-[#4ECDC4]" />}
                          </div>
                          <div className="h-8 bg-[#8D99AE]/10 rounded-md" />
                        </div>
                        <div
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer",
                            selectedVoice === "male" ? "border-[#2B2D42] bg-[#2B2D42]/5" : "border-[#8D99AE]/30",
                          )}
                          onClick={() => setSelectedVoice("male")}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-[#1A1A1A]">Male</span>
                            {selectedVoice === "male" && <Check className="w-4 h-4 text-[#4ECDC4]" />}
                          </div>
                          <div className="h-8 bg-[#8D99AE]/10 rounded-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg">Connect Your Services</Label>
                      <p className="text-sm text-[#8D99AE] mb-4">
                        Connect your email, calendar, and other services to get the most out of your assistant.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#8D99AE]/10 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#EF233C] flex items-center justify-center mr-3">
                              <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-[#1A1A1A]">Email</p>
                              <p className="text-xs text-[#8D99AE]">Connect Gmail or Outlook</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="border-[#8D99AE]/30"
                            onClick={() => handleConnect("Email")}
                          >
                            Connect
                          </Button>
                        </div>

                        <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#8D99AE]/10 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#4ECDC4] flex items-center justify-center mr-3">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-[#1A1A1A]">Calendar</p>
                              <p className="text-xs text-[#8D99AE]">Connect Google Calendar</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="border-[#8D99AE]/30"
                            onClick={() => handleConnect("Calendar")}
                          >
                            Connect
                          </Button>
                        </div>

                        <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#8D99AE]/10 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#2B2D42] flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-[#1A1A1A]">CRM</p>
                              <p className="text-xs text-[#8D99AE]">Connect Salesforce, HubSpot, etc.</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="border-[#8D99AE]/30"
                            onClick={() => handleConnect("CRM")}
                          >
                            Connect
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg">Select Your Favorite Apps</Label>
                      <p className="text-sm text-[#8D99AE] mb-4">
                        Choose the applications you use most frequently for quick access.
                      </p>

                      <div className="grid grid-cols-3 gap-3">
                        {apps.map((app) => {
                          const Icon = app.icon
                          const isSelected = selectedApps.includes(app.id)

                          return (
                            <div
                              key={app.id}
                              className={cn(
                                "p-3 rounded-lg border cursor-pointer flex flex-col items-center text-center",
                                isSelected ? "border-[#4ECDC4] bg-[#4ECDC4]/5" : "border-[#8D99AE]/30",
                              )}
                              onClick={() => toggleApp(app.id)}
                            >
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                                  isSelected ? "bg-[#4ECDC4]" : "bg-[#8D99AE]/20",
                                )}
                              >
                                <Icon className={cn("w-5 h-5", isSelected ? "text-white" : "text-[#8D99AE]")} />
                              </div>
                              <span className="text-sm font-medium text-[#1A1A1A]">{app.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#4ECDC4] mt-1" />}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={step === 1 || isLoading}
            className="border-[#8D99AE]/30"
          >
            Back
          </Button>
          <Button onClick={handleNextStep} className="bg-[#2B2D42] hover:bg-[#2B2D42]/80" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : step === totalSteps ? (
              <>
                Finish Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
