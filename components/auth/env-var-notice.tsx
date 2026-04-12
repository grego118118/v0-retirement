"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EnvVarNotice() {
  // Check if Supabase environment variables are configured
  const isSupabaseConfigured = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isSupabaseConfigured) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Missing Environment Variables</AlertTitle>
      <AlertDescription>
        <p>
          Supabase environment variables are missing. Authentication features will not work until these are configured.
        </p>
        <p className="mt-2">Please add the following environment variables to your project:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}
