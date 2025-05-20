"use client"

import { useSimpleAuth } from "@/components/auth/simple-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthStatus() {
  const { user, isLoading, isAuthenticated, loginWithGoogle, logout } = useSimpleAuth()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Status</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
          <CardDescription>Current authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-4">
              <div>
                <strong>Status:</strong> Authenticated
              </div>
              <div>
                <strong>User:</strong> {user?.name || "Unknown"}
              </div>
              <div>
                <strong>Email:</strong> {user?.email || "Not provided"}
              </div>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">{JSON.stringify(user, null, 2)}</pre>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="mb-4">You are not signed in.</p>
              <Button onClick={() => loginWithGoogle()}>Sign in with Google</Button>
            </div>
          )}
        </CardContent>
        {isAuthenticated && (
          <CardFooter>
            <Button variant="outline" onClick={() => logout()} className="w-full">
              Sign Out
            </Button>
          </CardFooter>
        )}
      </Card>

      <div className="mt-8 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
            <CardDescription>Details about your current environment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Protocol:</strong> {typeof window !== "undefined" ? window.location.protocol : "N/A"}
              </div>
              <div>
                <strong>Hostname:</strong> {typeof window !== "undefined" ? window.location.hostname : "N/A"}
              </div>
              <div>
                <strong>Secure Context:</strong>{" "}
                {typeof window !== "undefined" && window.isSecureContext ? "Yes" : "No"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
