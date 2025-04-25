"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Loader2, RefreshCcw, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { processCommand } from "@/lib/groq-api" // Import Groq API for command processing
import { executeDesktopAction } from "@/lib/terminator" // Import Terminator interaction logic

interface VoiceCommandProps {
  onCommand: (text: string) => void
  isProcessing: boolean
}

export function VoiceCommand({ onCommand, isProcessing }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [isSupported, setIsSupported] = useState(true)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const recognitionRef = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [volume, setVolume] = useState(0)
  const maxRetries = 3

  // Check for microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })

      if (permissionStatus.state === "denied") {
        setPermissionDenied(true)
        setErrorMessage("Microphone access denied. Please enable microphone access in your browser settings.")
        return false
      }

      setPermissionDenied(false)
      setErrorMessage(null)
      return true
    } catch (error) {
      console.log("Permission API not supported, will try direct access")
      // If permissions API is not supported, we'll try direct access
      return true
    }
  }

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    try {
      // Clean up any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
          recognitionRef.current = null
        } catch (error) {
          console.error("Error cleaning up previous recognition instance:", error)
        }
      }

      // @ts-ignore - SpeechRecognition is not in the TypeScript types
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        setErrorMessage("Speech recognition is not supported in your browser")
        return false
      }

      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex
        const result = event.results[current]
        const transcriptValue = result[0].transcript
        const confidenceValue = result[0].confidence

        setTranscript(transcriptValue)
        setConfidence(confidenceValue)

        if (result.isFinal) {
          setIsListening(false)
          onCommand(transcriptValue)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)

        // Handle specific error types
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setPermissionDenied(true)
          setErrorMessage("Microphone access denied. Please enable microphone access in your browser settings.")
          setIsListening(false)
        } else if (event.error === "aborted") {
          // If aborted and we haven't exceeded max retries, try again
          if (retryCount < maxRetries) {
            console.log(`Recognition aborted, retrying (${retryCount + 1}/${maxRetries})...`)
            setRetryCount((prev) => prev + 1)

            // Small delay before retrying
            setTimeout(() => {
              if (isListening) {
                try {
                  recognitionRef.current.start()
                } catch (error) {
                  console.error("Error restarting speech recognition:", error)
                  setIsListening(false)
                  setErrorMessage("Failed to restart speech recognition. Please try again.")
                }
              }
            }, 300)
          } else {
            setIsListening(false)
            setErrorMessage("Speech recognition was aborted. Please try again.")
            toast({
              title: "Voice recognition stopped",
              description: "Speech recognition was interrupted. Please try again.",
              variant: "destructive",
            })
          }
        } else if (event.error === "network") {
          setIsListening(false)
          setErrorMessage("Network error. Please check your connection and try again.")
        } else if (event.error === "no-speech") {
          setErrorMessage("No speech detected. Please try again and speak clearly.")
          // Don't stop listening for no-speech errors, just notify
          toast({
            title: "No speech detected",
            description: "Please speak clearly into your microphone.",
            variant: "default",
          })
        } else {
          setIsListening(false)
          setErrorMessage(`Error: ${event.error}. Please try again.`)
          toast({
            title: "Voice recognition error",
            description: `Error: ${event.error}`,
            variant: "destructive",
          })
        }
      }

      recognitionRef.current.onend = () => {
        // Only set isListening to false if we're not in the middle of a retry
        if (retryCount >= maxRetries || !isListening) {
          setIsListening(false)
        }
      }

      return true
    } catch (error) {
      console.error("Speech recognition initialization error:", error)
      setIsSupported(false)
      setErrorMessage("Failed to initialize speech recognition")
      return false
    }
  }

  // Effect for initializing speech recognition
  useEffect(() => {
    const initialize = async () => {
      const hasPermission = await checkMicrophonePermission()
      if (hasPermission) {
        initializeSpeechRecognition()
      }
    }

    initialize()

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (error) {
          console.error("Error aborting speech recognition:", error)
        }
      }

      cleanupAudio()
    }
  }, [])

  // Cleanup audio resources
  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop media stream if it exists
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    // Close audio context if it exists and is not already closed
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close()
      } catch (error) {
        console.error("Error closing AudioContext:", error)
      }
    }

    audioContextRef.current = null
    analyserRef.current = null
    dataArrayRef.current = null
    setVolume(0)
  }

  // Set up audio visualization
  useEffect(() => {
    if (!isListening) {
      cleanupAudio()
      return
    }

    const setupAudio = async () => {
      try {
        // Clean up any existing audio resources first
        cleanupAudio()

        // Check permission first
        const hasPermission = await checkMicrophonePermission()
        if (!hasPermission) {
          return
        }

        // Create new audio resources
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream

        // Create new AudioContext
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyserRef.current = audioContextRef.current.createAnalyser()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        source.connect(analyserRef.current)
        analyserRef.current.fftSize = 32
        const bufferLength = analyserRef.current.frequencyBinCount
        dataArrayRef.current = new Uint8Array(bufferLength)

        const visualize = () => {
          if (!analyserRef.current || !dataArrayRef.current) return

          // Check if the component is still mounted and listening
          if (!isListening) {
            cleanupAudio()
            return
          }

          analyserRef.current.getByteFrequencyData(dataArrayRef.current)
          const average = dataArrayRef.current.reduce((acc, val) => acc + val, 0) / bufferLength
          setVolume(average / 255) // Normalize to 0-1

          animationFrameRef.current = requestAnimationFrame(visualize)
        }

        visualize()
      } catch (error) {
        console.error("Audio visualization error:", error)

        // Check if this is a permission error
        if (
          error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "PermissionDeniedError")
        ) {
          setPermissionDenied(true)
          setErrorMessage("Microphone access denied. Please enable microphone access in your browser settings.")
        }

        // If we can't get audio, still allow speech recognition to work
        // but don't show visualization
      }
    }

    setupAudio()
  }, [isListening])

  const toggleListening = async () => {
    if (isProcessing) return

    // Reset retry count when manually toggling
    setRetryCount(0)
    setErrorMessage(null)

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (error) {
          console.error("Error stopping speech recognition:", error)
        }
      }
      setIsListening(false)
      cleanupAudio()
    } else {
      // Check permission before starting
      const hasPermission = await checkMicrophonePermission()
      if (!hasPermission) {
        return
      }

      // Re-initialize recognition to ensure a fresh instance
      const initialized = initializeSpeechRecognition()
      if (!initialized) {
        return
      }

      setTranscript("")
      setConfidence(0)

      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        toast({
          title: "Voice recognition error",
          description: "Could not start voice recognition. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Function to request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermissionDenied(false)
      setErrorMessage(null)

      // Re-initialize after getting permission
      const initialized = initializeSpeechRecognition()
      if (initialized) {
        toast({
          title: "Microphone access granted",
          description: "You can now use voice commands.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error requesting microphone permission:", error)
      setPermissionDenied(true)
      setErrorMessage("Could not access microphone. Please check your browser settings.")
      toast({
        title: "Microphone access denied",
        description: "Please enable microphone access in your browser settings.",
        variant: "destructive",
      })
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-indigo-100 dark:border-indigo-900/50">
        <CardContent className="p-4 text-center">
          <MicOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Voice recognition is not supported in your browser.</p>
          <p className="text-xs mt-2 text-muted-foreground">Try using Chrome, Edge, or Safari for voice commands.</p>
        </CardContent>
      </Card>
    )
  }

  if (permissionDenied) {
    return (
      <Card className="border-amber-100 dark:border-amber-900/50">
        <CardContent className="p-4 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
          <p className="font-medium text-amber-700 dark:text-amber-400">Microphone access required</p>
          <p className="text-sm mt-2 mb-4 text-muted-foreground">
            Please allow microphone access to use voice commands.
          </p>
          <Button
            variant="outline"
            onClick={requestMicrophonePermission}
            className="bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800"
          >
            Request Microphone Access
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className={`h-20 w-20 rounded-full shadow-lg ${
            isListening ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-indigo-600 to-indigo-500"
          }`}
          onClick={toggleListening}
          disabled={isProcessing}
        >
          {isListening ? (
            <Mic className="h-8 w-8 animate-pulse text-white" />
          ) : isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </Button>

        {/* Animated rings */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400 dark:border-red-500"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-300 dark:border-red-600"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
            />
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full"
          >
            {/* Voice visualization */}
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-indigo-500 dark:bg-indigo-400 rounded-full w-1"
                  animate={{
                    height:
                      volume > 0
                        ? `${Math.max(4, Math.min(40, 10 + Math.sin(i * 0.5 + Date.now() * 0.005) * 15 * volume))}px`
                        : "4px",
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>

            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg">
              <p className="text-center text-sm font-medium">{transcript || "Listening..."}</p>
              {confidence > 0 && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full"
                    style={{ width: `${Math.round(confidence * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-2">
        {isListening ? "Speak now..." : isProcessing ? "Processing..." : "Click the microphone to speak a command"}
      </p>

      {retryCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <RefreshCcw className="h-3 w-3" />
          Retrying... ({retryCount}/{maxRetries})
        </div>
      )}
    </div>
  )
}
