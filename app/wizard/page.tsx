"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Lock, Zap, Target, BarChart3, FileText, Calculator, Users, ArrowRight, CheckCircle, Clock } from "lucide-react"
import { CombinedCalculationWizard } from "@/components/wizard/combined-calculation-wizard"
import { CombinedCalculationData } from "@/lib/wizard/wizard-types"
import Link from "next/link"

export default function WizardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)
  const [resumeToken, setResumeToken] = useState<string>()

  const handleStartWizard = () => {
    setShowWizard(true)
  }

  const handleResumeWizard = () => {
    // Load saved wizard state
    if (typeof window !== 'undefined' && session?.user?.email) {
      const savedToken = localStorage.getItem(`wizard-state-${session.user.email}`)
      if (savedToken) {
        setResumeToken(savedToken)
        setShowWizard(true)
      }
    }
  }

  const handleWizardComplete = (data: CombinedCalculationData) => {
    // Redirect to dashboard or results page
    router.push('/dashboard?tab=calculations')
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show wizard if user is authenticated and wizard is started
  if (session?.user && showWizard) {
    return (
      <CombinedCalculationWizard
        onComplete={handleWizardComplete}
        resumeToken={resumeToken}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 lg:gap-4 mb-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Combined Calculation
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Wizard
                </span>
              </h1>
              {session?.user && (
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-3 lg:px-4 py-1 lg:py-2 text-sm lg:text-base">
                  <CheckCircle className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Available
                </Badge>
              )}
            </div>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Our step-by-step wizard guides you through combining your <strong>Massachusetts pension</strong>
              and Social Security benefits for comprehensive retirement income planning.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Authentication Check */}
        {!session?.user && (
          <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-lg">
              Please <Link href="/auth/signin" className="font-semibold text-blue-600 hover:text-blue-700 underline">sign in with Google</Link> to access the Combined Calculation Wizard.
              All logged-in users have full access to premium features.
            </AlertDescription>
          </Alert>
        )}

        {/* Authenticated User Actions */}
        {session?.user && (
          <div className="mb-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleStartWizard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                Start New Calculation
              </Button>

              {typeof window !== 'undefined' && localStorage.getItem(`wizard-state-${session.user.email}`) && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleResumeWizard}
                  className="px-8 py-3 text-lg"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Resume Previous Session
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Welcome back! You have full access to all premium features.
            </p>
          </div>
        )}

        {/* Wizard Steps Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 dark:text-blue-300 font-bold">1</span>
            </div>
            <CardTitle className="text-lg">Personal Info</CardTitle>
            <CardDescription>
              Age, service years, salary history, and retirement goals
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-600 dark:text-green-300 font-bold">2</span>
            </div>
            <CardTitle className="text-lg">Pension Details</CardTitle>
            <CardDescription>
              Group classification, final salary, and benefit calculations
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-purple-600 dark:text-purple-300 font-bold">3</span>
            </div>
            <CardTitle className="text-lg">Social Security</CardTitle>
            <CardDescription>
              Earnings record, claiming strategy, and spousal benefits
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-orange-600 dark:text-orange-300 font-bold">4</span>
            </div>
            <CardTitle className="text-lg">Optimization</CardTitle>
            <CardDescription>
              Combined analysis with tax implications and recommendations
            </CardDescription>
          </CardHeader>
        </Card>
        </div>

        {/* Premium Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Smart Optimization
            </CardTitle>
            <CardDescription>
              AI-powered recommendations for optimal claiming strategies
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Scenario Planning
            </CardTitle>
            <CardDescription>
              Compare multiple retirement scenarios and timing options
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Visual Analytics
            </CardTitle>
            <CardDescription>
              Interactive charts showing income projections over time
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Detailed Reports
            </CardTitle>
            <CardDescription>
              Comprehensive PDF reports with all calculations and recommendations
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              Tax Planning
            </CardTitle>
            <CardDescription>
              Federal and Massachusetts state tax implications analysis
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Spousal Analysis
            </CardTitle>
            <CardDescription>
              Coordinate benefits for married couples to maximize household income
            </CardDescription>
          </CardHeader>
        </Card>
        </div>

        {/* Feature Access Information */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            {session?.user ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                Combined Calculation Wizard Available
              </>
            ) : (
              <>
                <Lock className="h-6 w-6" />
                Sign In to Access Wizard
              </>
            )}
          </CardTitle>
          <CardDescription className="text-lg">
            {session?.user ? (
              "You have full access to all premium features including the step-by-step wizard"
            ) : (
              "Sign in with Google to get immediate access to all premium features"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {session?.user ? (
            <div className="space-y-4">
              <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                ✓ Full Premium Access Included
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>✓ Unlimited calculations</div>
                <div>✓ PDF reports</div>
                <div>✓ Social Security optimization</div>
                <div>✓ Tax analysis</div>
                <div>✓ Scenario comparisons</div>
                <div>✓ Spousal benefits</div>
              </div>
              <Button
                size="lg"
                onClick={handleStartWizard}
                className="bg-green-600 hover:bg-green-700 mt-4"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Start Wizard Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-lg font-semibold">
                Free Access with Google Sign-In
              </div>
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/signin">
                  <Crown className="mr-2 h-4 w-4" />
                  Sign In with Google
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                No subscription required • All features included
              </p>
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
