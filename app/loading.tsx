"use client"

import { motion } from "framer-motion"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Image from "next/image"

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/logo.svg" alt="Logo" width={80} height={80} className="rounded-xl" />
        </motion.div>

        <LoadingSpinner size="lg" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-primary font-medium text-xl">Loading your AI Assistant...</p>
          <div className="typing-container">
            <p className="text-sm text-muted-foreground">Preparing your personalized dashboard</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
