"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const error = searchParams.get("error")

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account to access your pension calculator data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-4">
              {error === "OAuthSignin" && "Error starting the OAuth sign-in flow."}
              {error === "OAuthCallback" && "Error completing the OAuth sign-in flow."}
              {error === "OAuthCreateAccount" && "Error creating the OAuth user in the database."}
              {error === "EmailCreateAccount" && "Error creating the email user in the database."}
              {error === "Callback" && "Error during the OAuth callback."}
              {error === "OAuthAccountNotLinked" &&
                "This email is already associated with another account. Please sign in using a different method."}
              {error === "EmailSignin" && "Error sending the email for sign-in."}
              {error === "CredentialsSignin" && "Invalid credentials."}
              {error === "SessionRequired" && "You must be signed in to access this page."}
              {!error.match(/^(OAuth|Email|Credentials|Session)/) && "An unknown error occurred."}
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center"
            disabled={isLoading}
          >
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
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
