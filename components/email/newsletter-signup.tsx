"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface NewsletterSignupProps {
  variant?: "default" | "compact" | "inline"
  className?: string
}

export function NewsletterSignup({ variant = "default", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        setEmail("")
        toast.success("Successfully subscribed to our newsletter!")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to subscribe. Please try again.")
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      toast.error("Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Thank you for subscribing! You'll receive retirement planning tips and updates.
        </AlertDescription>
      </Alert>
    )
  }

  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Stay Updated</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Get retirement planning tips and Massachusetts pension updates.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="sm" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email for updates"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "..." : "Subscribe"}
        </Button>
      </form>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Stay Informed</CardTitle>
        <CardDescription>
          Get the latest Massachusetts retirement planning tips, COLA updates, and calculator enhancements delivered to your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
          </Button>
        </form>
        
        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500 text-center">
            What you'll receive:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Monthly retirement planning tips
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Massachusetts COLA and benefit updates
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              New calculator features and improvements
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Exclusive retirement planning resources
            </li>
          </ul>
          <p className="text-xs text-gray-500 text-center mt-2">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
