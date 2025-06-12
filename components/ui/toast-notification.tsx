"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface ToastNotificationProps {
  message: string
  duration?: number
  onClose?: () => void
}

export function ToastNotification({ message, duration = 5000, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Use requestAnimationFrame for CSP compliance
    let frameCount = 0
    const targetFrames = Math.floor(duration / 16.67) // Convert ms to frames (60fps)
    let animationId: number

    const animate = () => {
      frameCount++
      if (frameCount >= targetFrames) {
        setIsVisible(false)
        if (onClose) onClose()
      } else {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-background border rounded-lg shadow-lg p-4 max-w-md flex items-center gap-3">
            <div className="flex-1">{message}</div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-6 w-6">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
