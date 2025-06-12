"use client"

import { SessionProvider } from "next-auth/react"
import { type ReactNode, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function NextAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if NEXTAUTH_URL and NEXTAUTH_SECRET are set
    if (typeof window !== "undefined") {
      const missingEnvVars = []

      // We can't check server-side env vars directly from client,
      // but we can detect common issues

      if (
        window.location.protocol === "http:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1" &&
        !window.location.hostname.match(/^10\./) &&
        !window.location.hostname.match(/^192\.168\./) &&
        !window.location.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
      ) {
        toast({
          title: "Authentication Warning",
          description: "Using HTTP on non-localhost may cause authentication issues. For OAuth to work with IP addresses, ensure your OAuth provider allows the current IP address.",
          variant: "destructive",
        })
      }

      setIsReady(true)
    }
  }, [toast])

  if (!isReady) {
    return <div className="flex items-center justify-center min-h-screen">Loading authentication...</div>
  }

  return <SessionProvider>{children}</SessionProvider>
}
