"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AuthTroubleshooter() {
  const [checking, setChecking] = useState(false)
  const [providers, setProviders] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const checkProviders = async () => {
    setChecking(true)
    setError(null)
    try {
      const supabase = getSupabaseBrowserClient()

      // This is a workaround to check which providers are enabled
      // We try to get the URL for each provider and see if it succeeds
      const providers: string[] = []

      try {
        const { data: googleData, error: googleError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { skipBrowserRedirect: true },
        })
        if (!googleError && googleData?.url) {
          providers.push("google")
        }
      } catch (e) {
        console.log("Google provider check failed")
      }

      setProviders(providers)
    } catch (e: any) {
      setError(e.message || "Failed to check providers")
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="mt-8 border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">Authentication Troubleshooter</h3>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Check Available Authentication Methods</AccordionTrigger>
          <AccordionContent>
            <p className="mb-4 text-sm text-muted-foreground">
              This will check which authentication providers are currently enabled in your Supabase project.
            </p>

            <Button onClick={checkProviders} disabled={checking} size="sm" variant="outline">
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Available Providers"
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {providers.length > 0 && (
              <div className="mt-4">
                <p className="font-medium">Available providers:</p>
                <ul className="list-disc pl-5 mt-2">
                  {providers.map((provider) => (
                    <li key={provider}>{provider}</li>
                  ))}
                </ul>
              </div>
            )}

            {providers.length === 0 && !checking && !error && (
              <p className="mt-4 text-amber-600">
                No external providers are enabled. Only email authentication is available.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
