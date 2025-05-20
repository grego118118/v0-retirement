"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export default function AuthDebug() {
  const { data: session, status } = useSession()
  const [envCheck, setEnvCheck] = useState<Record<string, boolean>>({})
  const [apiCheck, setApiCheck] = useState<{ status: string; message: string }>({
    status: "pending",
    message: "Not checked yet",
  })

  useEffect(() => {
    // Check for environment variables indirectly
    const checks = {
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol === "https:",
      host: window.location.hostname,
    }
    setEnvCheck(checks as any)
  }, [])

  const checkApiEndpoint = async () => {
    setApiCheck({ status: "checking", message: "Checking API endpoint..." })
    try {
      const res = await fetch("/api/auth/check", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const data = await res.json()
        setApiCheck({ status: "success", message: "API endpoint is working correctly" })
      } else {
        setApiCheck({ status: "error", message: `API error: ${res.status} ${res.statusText}` })
      }
    } catch (error) {
      setApiCheck({ status: "error", message: `Failed to reach API: ${(error as Error).message}` })
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">NextAuth.js Debug</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Status:</strong> {status}
              </div>
              {session ? (
                <div>
                  <strong>User:</strong> {session.user?.name || session.user?.email || "Unknown"}
                </div>
              ) : (
                <div className="text-yellow-500">No active session</div>
              )}
              <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">{JSON.stringify(session, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Check</CardTitle>
            <CardDescription>Checking for common configuration issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Secure Context:</strong>{" "}
                {envCheck.isSecureContext ? (
                  <span className="text-green-500">Yes</span>
                ) : (
                  <span className="text-yellow-500">No (may cause cookie issues)</span>
                )}
              </div>
              <div>
                <strong>Protocol:</strong>{" "}
                {envCheck.protocol ? (
                  <span className="text-green-500">HTTPS</span>
                ) : (
                  <span className="text-yellow-500">HTTP (only use for localhost development)</span>
                )}
              </div>
              <div>
                <strong>Host:</strong> {envCheck.host}
              </div>
              <div>
                <strong>API Check:</strong>{" "}
                {apiCheck.status === "success" ? (
                  <span className="text-green-500">{apiCheck.message}</span>
                ) : apiCheck.status === "error" ? (
                  <span className="text-red-500">{apiCheck.message}</span>
                ) : (
                  <span className="text-yellow-500">{apiCheck.message}</span>
                )}
              </div>
              <Button onClick={checkApiEndpoint} disabled={apiCheck.status === "checking"}>
                {apiCheck.status === "checking" ? "Checking..." : "Check API Endpoint"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
            <CardDescription>Try these steps if you're having authentication issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Ensure <code className="bg-muted px-1 rounded">NEXTAUTH_SECRET</code> is set in your environment
                variables
              </li>
              <li>
                Verify <code className="bg-muted px-1 rounded">NEXTAUTH_URL</code> matches your deployment URL
              </li>
              <li>
                Check that Google OAuth credentials are correctly configured in both Google Cloud Console and your
                environment variables
              </li>
              <li>Clear browser cookies and try again</li>
              <li>Ensure your database connection is working (if using a database adapter)</li>
              <li>Check server logs for more detailed error messages</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
