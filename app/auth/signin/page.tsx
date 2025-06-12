import type { Metadata } from "next"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { Shield, Calculator } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign In | MA Pension Estimator",
  description: "Sign in to access your Massachusetts pension calculations and retirement planning tools.",
}

function SignInContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
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

        {/* Sign In Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
          <CardHeader className="text-center space-y-4 lg:space-y-6 pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
            <div className="mx-auto flex h-12 w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 shadow-md">
              <Shield className="h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-800 dark:text-slate-200">Welcome Back</CardTitle>
              <CardDescription className="text-base lg:text-lg xl:text-xl leading-relaxed">
                Sign in to access your Massachusetts pension calculations and retirement planning tools
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 lg:space-y-8 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
            {/* Google Sign In Button */}
            <GoogleSignInButton
              callbackUrl="/dashboard"
              className="w-full h-10 lg:h-12 text-sm lg:text-base shadow-sm hover:shadow-md transition-all duration-200"
            />

            {/* Benefits */}
            <div className="space-y-3 lg:space-y-4 text-sm lg:text-base text-muted-foreground">
              <p className="text-center font-medium text-slate-700 dark:text-slate-300">By signing in, you get access to:</p>
              <ul className="space-y-2 lg:space-y-3">
                <li className="flex items-center gap-3 lg:gap-4">
                  <div className="h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm" />
                  <span>Save and track your pension calculations</span>
                </li>
                <li className="flex items-center gap-3 lg:gap-4">
                  <div className="h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm" />
                  <span>Personalized retirement planning dashboard</span>
                </li>
                <li className="flex items-center gap-3 lg:gap-4">
                  <div className="h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm" />
                  <span>Premium Social Security optimization tools</span>
                </li>
                <li className="flex items-center gap-3 lg:gap-4">
                  <div className="h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm" />
                  <span>Combined pension and Social Security wizard</span>
                </li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <div className="text-xs lg:text-sm text-muted-foreground text-center space-y-2 lg:space-y-3">
              <p className="leading-relaxed">
                We use Google OAuth for secure authentication. We only access your basic profile information (name and email).
              </p>
              <p className="leading-relaxed">
                By signing in, you agree to our{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Calculator */}
        <div className="text-center">
          <Link
            href="/calculator"
            className="text-sm lg:text-base text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            Continue without signing in →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sign in...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
