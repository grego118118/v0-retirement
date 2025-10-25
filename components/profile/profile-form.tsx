"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Calculator, Settings, AlertTriangle, CheckCircle, Save } from "lucide-react"
import { useSession, signIn } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }).max(100, {
    message: "Full name must be less than 100 characters.",
  }),
  retirementDate: z.string().optional().refine((date) => {
    if (!date) return true // Allow empty retirement date
    const selectedDate = new Date(date)
    const today = new Date()
    const minDate = new Date()
    minDate.setFullYear(today.getFullYear() - 1) // Allow past year for flexibility
    const maxDate = new Date()
    maxDate.setFullYear(today.getFullYear() + 50) // Max 50 years in future
    return selectedDate >= minDate && selectedDate <= maxDate
  }, "Retirement date must be within a reasonable range"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  initialData?: {
    fullName: string
    retirementDate: string
  }
  onUpdate: () => void
}

// Helper functions for date format conversion
const convertISOToDateInput = (isoDate: string | null | undefined): string => {
  if (!isoDate) return ""
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return ""
    // Convert to YYYY-MM-DD format for HTML date input
    return date.toISOString().split('T')[0]
  } catch (error) {
    console.warn('Error converting ISO date to input format:', error)
    return ""
  }
}

const convertDateInputToISO = (dateInput: string | null | undefined): string => {
  if (!dateInput) return ""
  try {
    // HTML date input gives us YYYY-MM-DD format
    // Convert to ISO string for API
    const date = new Date(dateInput + 'T00:00:00.000Z')
    if (isNaN(date.getTime())) return ""
    return date.toISOString()
  } catch (error) {
    console.warn('Error converting date input to ISO format:', error)
    return ""
  }
}

export function ProfileForm({ initialData, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const { toast } = useToast()
  const { data: session, status, update } = useSession()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      retirementDate: convertISOToDateInput(initialData?.retirementDate) || "",
    },
  })

  // Update form when initialData changes (e.g., after API fetch)
  useEffect(() => {
    if (initialData) {
      form.reset({
        fullName: initialData.fullName || "",
        retirementDate: convertISOToDateInput(initialData.retirementDate) || "",
      })
    }
  }, [initialData, form])

  // Auto-save functionality with debouncing
  const autoSave = useCallback(async (data: ProfileFormValues) => {
    if (!session?.user?.id || status !== "authenticated") return

    try {
      setIsAutoSaving(true)

      const payload = {
        full_name: data.fullName?.trim() || "",
        retirement_date: convertDateInputToISO(data.retirementDate) || "",
      }

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await response.json()
      setLastSaved(new Date())
      onUpdate()
    } catch (error) {
      console.error("Auto-save error:", error)
      // Don't show toast for auto-save errors to avoid spam
    } finally {
      setIsAutoSaving(false)
    }
  }, [session?.user?.id, status, onUpdate])

  // Watch for form changes and auto-save with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const subscription = form.watch((value) => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Debounce auto-save by 2 seconds
      timeoutId = setTimeout(() => {
        if (value.fullName || value.retirementDate) {
          autoSave(value as ProfileFormValues)
        }
      }, 2000)
    })

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [form.watch, autoSave])

  // Monitor session status and handle authentication issues
  useEffect(() => {
    console.log("Session status changed:", { status, session: !!session, userId: session?.user?.id })

    if (status === "unauthenticated") {
      setSessionError("You are not signed in. Please sign in to update your profile.")
    } else if (status === "authenticated" && !session?.user?.id) {
      setSessionError("Session is invalid. Please sign in again.")
    } else {
      setSessionError(null)
    }
  }, [status, session])

  // Function to refresh session
  const refreshSession = async () => {
    try {
      console.log("Refreshing session...")
      await update()
      setSessionError(null)
      toast({
        title: "Session refreshed",
        description: "Please try updating your profile again.",
      })
    } catch (error) {
      console.error("Failed to refresh session:", error)
      setSessionError("Failed to refresh session. Please sign in again.")
    }
  }

  async function handleSubmit(data: ProfileFormValues, retryCount = 0) {
    console.log("Profile form submission started", {
      data,
      sessionUser: session?.user,
      sessionStatus: status,
      retryCount
    })

    // Check session status first
    if (status === "loading") {
      console.log("Session still loading, waiting...")
      toast({
        title: "Please wait",
        description: "Loading your session...",
      })
      return
    }

    if (status === "unauthenticated") {
      console.error("User not authenticated")
      toast({
        title: "Authentication Required",
        description: "Please sign in to update your profile.",
        variant: "destructive",
      })
      return
    }

    if (!session?.user?.id) {
      console.error("No session or user ID found", { session, status })

      // Try to refresh session once
      if (retryCount === 0) {
        console.log("Attempting to refresh session...")
        await refreshSession()
        // Retry submission after session refresh
        setTimeout(() => handleSubmit(data, 1), 1000)
        return
      }

      toast({
        title: "Authentication Error",
        description: "Session is invalid. Please sign in again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setSessionError(null)

    try {
      // Validate and prepare the payload
      const payload = {
        full_name: data.fullName?.trim() || "",
        retirement_date: convertDateInputToISO(data.retirementDate) || "",
      }

      console.log("Sending profile update request", {
        payload,
        userId: session.user.id,
        sessionValid: !!session?.user?.id
      })

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Profile update response", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      // Get response data for better error handling
      const responseData = await response.json()
      console.log("Profile update response data", responseData)

      if (!response.ok) {
        // Handle 401 specifically with session refresh
        if (response.status === 401) {
          console.log("Received 401, attempting session refresh...")

          if (retryCount === 0) {
            await refreshSession()
            // Retry submission after session refresh
            setTimeout(() => handleSubmit(data, 1), 1000)
            return
          } else {
            setSessionError("Authentication failed. Please sign in again.")
            toast({
              title: "Authentication Failed",
              description: "Your session has expired. Please sign in again.",
              variant: "destructive",
            })
            return
          }
        }

        // Handle other error statuses
        let errorMessage = "Failed to update profile. Please try again."

        if (response.status === 400) {
          errorMessage = "Invalid profile data. Please check your inputs and try again."
        } else if (response.status === 500) {
          errorMessage = "Server error occurred. Please try again later."
        } else if (responseData.message) {
          errorMessage = responseData.message
        }

        throw new Error(errorMessage)
      }

      console.log("Profile updated successfully")
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      onUpdate()
    } catch (error) {
      console.error("Error updating profile:", error)

      // More specific error handling
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again."

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Simple wrapper for form submission
  const onSubmit = (data: ProfileFormValues) => {
    handleSubmit(data, 0)
  }

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Profile Information</CardTitle>
            <CardDescription>Loading your session...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Error Alert */}
      {sessionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{sessionError}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSession}
                disabled={isLoading}
              >
                Refresh Session
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signIn()}
              >
                Sign In
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Profile Information</CardTitle>
          <CardDescription>Update your personal information and retirement date.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>This is your full name as it will appear on your profile.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="retirementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Retirement Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min="1950-01-01"
                        max="2030-12-31"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your expected retirement date. This will be used to calculate your countdown.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Auto-save status indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isAutoSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Saved {lastSaved.toLocaleTimeString()}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      <span>Changes auto-save</span>
                    </>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !!sessionError || status !== "authenticated"}
                  variant="outline"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : sessionError ? (
                    "Sign In Required"
                  ) : (
                    "Save Now"
                  )}
                </Button>
              </div>

              {/* Session Status Indicator */}
              <div className="text-xs text-muted-foreground text-center">
                {status === "authenticated" && session?.user?.email && (
                  <span>Signed in as {session.user.email}</span>
                )}
                {status === "unauthenticated" && (
                  <span>Not signed in</span>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Your profile information is only used to personalize your experience and is not shared with third parties.
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access retirement planning tools and calculators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <a href="/calculator">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate My Pension
            </a>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <a href="/wizard">
              <Settings className="mr-2 h-4 w-4" />
              Retirement Planning Wizard
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
