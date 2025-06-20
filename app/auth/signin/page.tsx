import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Github, Chrome } from "lucide-react"
import Link from "next/link"
import { SignInButton } from "@/components/auth/signin-button"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950 dark:to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Access your Massachusetts Pension Calculator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInButton provider="google" className="w-full">
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </SignInButton>
          
          <SignInButton provider="github" className="w-full" variant="outline">
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </SignInButton>

          <Separator className="my-4" />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
