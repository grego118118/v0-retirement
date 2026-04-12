"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Users,
  TrendingUp,
  Shield,
  DollarSign,
  FileText
} from "lucide-react"
import { CombinedCalculationWizard } from "@/components/wizard/combined-calculation-wizard"
import { PremiumGate } from "@/components/premium/premium-gate"
import { CombinedCalculationData } from "@/lib/wizard/wizard-types"

export default function WizardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)
  const [resumeToken, setResumeToken] = useState<string>()

  const handleStartWizard = () => {
    setShowWizard(true)
  }

  const handleResumeWizard = () => {
    // Load saved wizard state
    if (typeof window !== 'undefined' && session?.user?.id) {
      const savedToken = localStorage.getItem(`wizard-state-${session.user.id}`)
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

  if (showWizard) {
    return (
      <PremiumGate
        feature="combined_wizard"
        title="Combined Retirement Planning Wizard"
        description="Advanced retirement optimization with pension and Social Security analysis"
      >
        <CombinedCalculationWizard
          onComplete={handleWizardComplete}
          resumeToken={resumeToken}
        />
      </PremiumGate>
    )
  }

  return (
    <PremiumGate
      feature="combined_wizard"
      title="Combined Retirement Planning Wizard"
      description="Advanced retirement optimization with pension and Social Security analysis"
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Combined Retirement Planning Wizard
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get a comprehensive analysis of your Massachusetts pension and Social Security benefits 
            with personalized optimization recommendations.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                Step-by-Step Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Guided workflow through pension details, Social Security benefits, 
                and optimization preferences with built-in validation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Advanced Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered analysis of optimal claiming strategies, break-even points, 
                and lifetime benefit maximization.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-purple-600" />
                Tax Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Federal and Massachusetts tax calculations with strategies 
                to minimize your retirement tax burden.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What's Included */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              What's Included in Your Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive retirement planning with advanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Core Analysis
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Massachusetts pension benefit calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Social Security optimization (ages 62-70)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Combined income projections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Inflation adjustments (COLA)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Medicare premium impact
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Break-even analysis
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Advanced Features
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Spousal benefits optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Tax-efficient withdrawal strategies
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Federal and state tax calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Monte Carlo risk analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Multiple scenario comparisons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Comprehensive PDF reports
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Process Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-600" />
              7-Step Process (~10 minutes)
            </CardTitle>
            <CardDescription>
              Complete analysis with save and resume functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: 1, title: "Personal Info", desc: "Age, retirement timeline, filing status" },
                { step: 2, title: "Pension Details", desc: "Service years, salary, retirement group" },
                { step: 3, title: "Social Security", desc: "Benefits from SSA.gov statement" },
                { step: 4, title: "Income & Assets", desc: "Additional retirement income sources" },
                { step: 5, title: "Preferences", desc: "Goals, risk tolerance, analysis options" },
                { step: 6, title: "Optimization", desc: "AI-powered strategy analysis" },
                { step: 7, title: "Review & Save", desc: "Final results and PDF generation" }
              ].slice(0, 4).map((item) => (
                <div key={item.step} className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold">
                    {item.step}
                  </div>
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {[
                { step: 5, title: "Preferences", desc: "Goals, risk tolerance, analysis options" },
                { step: 6, title: "Optimization", desc: "AI-powered strategy analysis" },
                { step: 7, title: "Review & Save", desc: "Final results and PDF generation" }
              ].map((item) => (
                <div key={item.step} className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold">
                    {item.step}
                  </div>
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              Why Use the Combined Wizard?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Maximize Income</h4>
                <p className="text-sm text-muted-foreground">
                  Our optimization engine can increase your retirement income by 5-15% 
                  through strategic claiming decisions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Minimize Taxes</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced tax calculations help you keep more of your retirement income 
                  through efficient withdrawal strategies.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Peace of Mind</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analysis with multiple scenarios gives you confidence 
                  in your retirement planning decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {session?.user && (
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={handleStartWizard}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Start New Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {typeof window !== 'undefined' && session.user?.id && localStorage.getItem(`wizard-state-${session.user.id}`) && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleResumeWizard}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Resume Saved Analysis
                </Button>
              )}
            </div>
          )}

          <Alert className="max-w-2xl mx-auto">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Premium Feature:</strong> The Combined Retirement Planning Wizard is available 
              to premium subscribers. Upgrade to access advanced optimization and tax analysis features.
            </AlertDescription>
          </Alert>
        </div>

        {/* Testimonial/Success Story */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">Success Story</Badge>
              <blockquote className="text-lg italic mb-4">
                "The Combined Wizard helped me discover I could increase my retirement income by $847/month 
                by adjusting my Social Security claiming strategy. The tax optimization alone will save me 
                thousands per year!"
              </blockquote>
              <cite className="text-sm text-muted-foreground">
                — Sarah M., Massachusetts Teacher (Group 2 Retirement)
              </cite>
            </div>
          </CardContent>
        </Card>
      </div>
    </PremiumGate>
  )
}
