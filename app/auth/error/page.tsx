"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An unknown authentication error occurred."
  let errorDescription = "Please try again or contact support if the problem persists."

  if (error === "Configuration") {
    errorMessage = "Server Configuration Error"
    errorDescription = "There is a problem with the server configuration. Please contact support."
  } else if (error === "AccessDenied") {
    errorMessage = "Access Denied"
    errorDescription = "You do not have permission to sign in."
  } else if (error === "Verification") {
    errorMessage = "Verification Failed"
    errorDescription = "The verification link is invalid or has expired."
  } else if (error === "OAuthSignin" || error === "OAuthCallback" || error === "OAuthCreateAccount") {
    errorMessage = "OAuth Authentication Error"
    errorDescription = "There was a problem with the OAuth authentication process."
  } else if (error === "EmailCreateAccount") {
    errorMessage = "Account Creation Failed"
    errorDescription = "There was a problem creating your account."
  } else if (error === "Callback") {
    errorMessage = "Authentication Callback Error"
    errorDescription = "There was a problem with the authentication callback."
  } else if (error === "OAuthAccountNotLinked") {
    errorMessage = "Account Not Linked"
    errorDescription = "This email is already associated with another account."
  } else if (error === "EmailSignin") {
    errorMessage = "Email Sign-in Failed"
    errorDescription = "There was a problem sending the email."
  } else if (error === "CredentialsSignin") {
    errorMessage = "Invalid Credentials"
    errorDescription = "The email or password you entered is incorrect."
  } else if (error === "SessionRequired") {
    errorMessage = "Authentication Required"
    errorDescription = "You must be signed in to access this page."
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{errorMessage}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{errorDescription}</p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/auth/signin">Try Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg max-w-lg">
        <h2 className="font-semibold mb-2">Troubleshooting Tips</h2>
        <ul className="text-sm text-muted-foreground text-left list-disc pl-5 space-y-1">
          <li>Clear your browser cookies and try again</li>
          <li>Make sure you're using the correct email address</li>
          <li>Check if you already have an account with a different sign-in method</li>
          <li>If using Google sign-in, ensure pop-ups are allowed</li>
          <li>If problems persist, please contact support</li>
        </ul>
      </div>
    </div>
  )
}
