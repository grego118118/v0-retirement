"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePDFGeneration } from "@/hooks/use-pdf-generation"
import { CheckCircle, XCircle, AlertTriangle, FileText, Settings, RefreshCw } from "lucide-react"

// Sample pension data for testing
const samplePensionData = {
  personalInfo: {
    name: "Test User",
    email: "test@example.com",
    retirementGroup: "1" as const,
    currentAge: 45,
    retirementAge: 60,
    yearsOfService: 15,
    currentSalary: 75000,
    finalSalary: 85000,
    highestConsecutiveYears: [80000, 82000, 85000]
  },
  pensionResults: {
    monthlyPension: 2500,
    annualPension: 30000,
    pensionMultiplier: 2.0,
    serviceCredit: 15,
    averageSalary: 82333,
    benefitFormula: "15 years × 2.0% × $82,333",
    optionABenefit: 30000,
    optionBBenefit: 28500,
    optionCBenefit: 25000,
    colaAdjustment: 390
  },
  calculationDetails: {
    retirementDate: new Date('2040-01-01'),
    eligibilityDate: new Date('2040-01-01'),
    isEligible: true,
    yearsUntilRetirement: 15,
    projectedSalaryAtRetirement: 85000,
    benefitCap: 68000,
    isCapApplied: false
  }
}

export function PDFTestComponent() {
  const { data: session, status } = useSession()
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isTestingAPI, setIsTestingAPI] = useState(false)
  
  const {
    generatePensionPDF,
    hasAccess,
    isPremium,
    isGenerating,
    isLoading,
    upgradeRequired,
    refreshSubscriptionStatus,
    developmentOverride
  } = usePDFGeneration()

  const testSubscriptionAPI = async () => {
    setIsTestingAPI(true)
    try {
      const response = await fetch('/api/subscription/status')
      const data = await response.json()
      setTestResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setTestResult(`Error: ${error}`)
    } finally {
      setIsTestingAPI(false)
    }
  }

  const testPDFGeneration = async () => {
    try {
      const success = await generatePensionPDF(samplePensionData, {
        includeCharts: true,
        includeCOLAProjections: true
      })
      
      if (success) {
        console.log('✅ PDF generation test successful!')
      } else {
        console.log('❌ PDF generation test failed')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
    }
  }

  if (status === 'loading') {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-6">
          <p className="text-gray-600">Loading session...</p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">Please sign in to test PDF generation</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Generation Test
          </CardTitle>
          <CardDescription>
            Test PDF generation functionality and debug subscription status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Email:</strong> {session?.user?.email}
            </div>
            <div>
              <strong>Session Status:</strong> 
              <Badge variant={status === 'authenticated' ? 'default' : 'destructive'}>
                {status}
              </Badge>
            </div>
          </div>

          {/* PDF Generation Status */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <strong>Has Access:</strong>
              {hasAccess ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>{hasAccess ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <strong>Is Premium:</strong>
              {isPremium ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>{isPremium ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <strong>Upgrade Required:</strong>
              {upgradeRequired ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span>{upgradeRequired ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <strong>Is Loading:</strong>
              <span>{isLoading ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Development Override */}
          {developmentOverride && (
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Development Override Active: PDF testing enabled (ENABLE_PDF_TESTING=true)
              </AlertDescription>
            </Alert>
          )}

          {/* Environment Variables */}
          <div className="text-sm">
            <strong>Environment:</strong> {process.env.NODE_ENV}
            <br />
            <strong>PDF Testing Enabled:</strong> {process.env.ENABLE_PDF_TESTING || 'false'}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={testSubscriptionAPI}
              disabled={isTestingAPI}
              variant="outline"
            >
              {isTestingAPI ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Test Subscription API
            </Button>
            
            <Button 
              onClick={refreshSubscriptionStatus}
              variant="outline"
            >
              Refresh Status
            </Button>
            
            <Button 
              onClick={testPDFGeneration}
              disabled={isGenerating || (!hasAccess && !developmentOverride)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Test PDF Generation
            </Button>
          </div>

          {/* API Response */}
          {testResult && (
            <div className="mt-4">
              <strong>Subscription API Response:</strong>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                {testResult}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
