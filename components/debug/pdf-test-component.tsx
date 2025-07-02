"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePDFGeneration } from "@/hooks/use-pdf-generation"
import { CheckCircle, XCircle, AlertTriangle, FileText, Settings, RefreshCw } from "lucide-react"
import { PensionCalculationData } from "@/lib/pdf/pdf-generator"

// Sample pension data for testing - Updated to match PensionCalculationData interface
const samplePensionData: PensionCalculationData = {
  name: "Test User",
  employeeId: "EMP123456",
  currentAge: 45,
  plannedRetirementAge: 60,
  retirementGroup: "1",
  serviceEntry: "before_2012",
  averageSalary: 82333,
  yearsOfService: 15,
  projectedYearsAtRetirement: 15,
  basePension: 30000,
  benefitFactor: 0.02,
  totalBenefitPercentage: 0.30,
  cappedAt80Percent: false,
  options: {
    A: {
      annual: 30000,
      monthly: 2500,
      description: "Option A: Full Allowance (100%)"
    },
    B: {
      annual: 28500,
      monthly: 2375,
      description: "Option B: Annuity Protection",
      reduction: 0.05
    },
    C: {
      annual: 25000,
      monthly: 2083,
      description: "Option C: Joint & Survivor (66.67%)",
      reduction: 0.167,
      survivorAnnual: 16667,
      survivorMonthly: 1389,
      beneficiaryAge: 55
    }
  },
  colaProjections: [
    {
      year: 1,
      startingPension: 30000,
      colaIncrease: 390,
      endingPension: 30390,
      monthlyPension: 2532.50
    }
  ],
  isVeteran: false,
  eligibilityMessage: "Eligible for retirement at age 60",
  calculationDate: new Date()
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
