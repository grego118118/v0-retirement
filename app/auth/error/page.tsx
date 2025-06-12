import type { Metadata } from "next"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calculator, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Authentication Error | MA Pension Estimator",
  description: "There was an error with authentication. Please try again.",
}

interface ErrorPageProps {
  searchParams: Promise<{ error?: string }>
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "Configuration":
      return "There is a problem with the server configuration. Please contact support."
    case "AccessDenied":
      return "You do not have permission to sign in. Please contact support if you believe this is an error."
    case "Verification":
      return "The sign in link is no longer valid. It may have been used already or it may have expired."
    case "OAuthSignin":
      return "Error in constructing an authorization URL. Please try again."
    case "OAuthCallback":
      return "Error in handling the response from the OAuth provider. Please try again."
    case "OAuthCreateAccount":
      return "Could not create OAuth account in the database. Please try again."
    case "EmailCreateAccount":
      return "Could not create email account in the database. Please try again."
    case "Callback":
      return "Error in the OAuth callback handler route. Please try again."
    case "OAuthAccountNotLinked":
      return "The email on the account is already linked, but not with this OAuth account. Please sign in with the original account."
    case "EmailSignin":
      return "Sending the e-mail with the verification token failed. Please try again."
    case "CredentialsSignin":
      return "The credentials you provided are incorrect. Please check and try again."
    case "SessionRequired":
      return "You must be signed in to view this page."
    default:
      return "An unexpected error occurred during authentication. Please try again."
  }
}

async function ErrorContent({ searchParams }: ErrorPageProps) {
  const params = await searchParams
  const error = params.error
  const errorMessage = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20 dark:from-slate-950 dark:via-red-950/30 dark:to-orange-950/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-3 lg:space-x-4 text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            <div className="p-2 lg:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
              <Calculator className="h-6 w-6 lg:h-7 lg:w-7" />
            </div>
            <span>MA Pension Estimator</span>
          </Link>
        </div>

        {/* Error Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/50 dark:from-slate-900 dark:to-red-950/20">
          <CardHeader className="text-center space-y-4 lg:space-y-6 pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
            <div className="mx-auto flex h-12 w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 shadow-md">
              <AlertCircle className="h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-2xl lg:text-3xl xl:text-4xl font-bold text-red-600 dark:text-red-400">
                Authentication Error
              </CardTitle>
              <CardDescription className="text-base lg:text-lg xl:text-xl leading-relaxed">
                {errorMessage}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Details */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Error Code:</strong> {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/auth/signin">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Signing In Again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-sm text-muted-foreground text-center space-y-2">
              <p>
                If this problem persists, please try the following:
              </p>
              <ul className="text-left space-y-1">
                <li>• Clear your browser cookies and cache</li>
                <li>• Disable browser extensions temporarily</li>
                <li>• Try using an incognito/private browsing window</li>
                <li>• Check if your Google account is accessible</li>
              </ul>
              <p className="pt-2">
                Still having issues?{" "}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact our support team
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Continue Without Signing In */}
        <div className="text-center">
          <Link 
            href="/calculator" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue without signing in →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading error page...</p>
        </div>
      </div>
    }>
      <ErrorContent searchParams={searchParams} />
    </Suspense>
  )
}
