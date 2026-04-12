"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GoogleSignInButtonProps {
  callbackUrl?: string
  className?: string
}

export function GoogleSignInButton({ callbackUrl = "/", className }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      console.log("Starting Google sign in with callback URL:", callbackUrl)

      const result = await signIn("google", {
        callbackUrl,
        redirect: true
      })

      console.log("Sign in result:", result)

      // If we get here and result is undefined, it means the redirect happened
      if (result?.error) {
        console.error("Sign in error:", result.error)
        setIsLoading(false)
        toast({
          title: "Sign in failed",
          description: `Authentication error: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error signing in:", error)
      setIsLoading(false)
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
      variant="outline"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"
            />
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  )
}
