"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { useSession } from "next-auth/react"

export function AuthDisabledNotice() {
  const { data: session } = useSession()

  if (session) {
    return null
  }

  return (
    <Alert className="mb-6">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Sign in to Save Calculations</AlertTitle>
      <AlertDescription>
        Sign in to save your calculations and access them later. You can still use the calculator without signing in, but your results won't be saved.
      </AlertDescription>
    </Alert>
  )
}
