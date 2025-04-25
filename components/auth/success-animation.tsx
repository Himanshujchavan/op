"use client"

import { useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface SuccessAnimationProps {
  onComplete?: () => void
}

export function SuccessAnimation({ onComplete }: SuccessAnimationProps) {
  const controls = useAnimation()

  useEffect(() => {
    const animate = async () => {
      // Initial state
      await controls.start({
        scale: 0,
        opacity: 0,
      })

      // Animate in
      await controls.start({
        scale: [0, 1.2, 1],
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      })

      // Hold
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Animate out
      await controls.start({
        scale: [1, 1.2, 0],
        opacity: [1, 1, 0],
        transition: {
          duration: 0.5,
          ease: "easeIn",
        },
      })

      if (onComplete) {
        onComplete()
      }
    }

    animate()
  }, [controls, onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div animate={controls} className="bg-white rounded-full p-8">
        <CheckCircle2 className="w-24 h-24 text-green-500" />
      </motion.div>
    </div>
  )
}
