"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePDFGeneration } from '@/hooks/use-pdf-generation'
import { canAccessFeature } from '@/lib/stripe/config'
import { RefreshCw, Bug, FileText, AlertTriangle, CheckCircle, XCircle, Settings } from 'lucide-react'

export function DetailedPDFDebug() {
  const { data: session, status } = useSession()
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isTestingAPI, setIsTestingAPI] = useState(false)
  
  const {
    hasAccess,
    isPremium,
    isLoading: pdfHookLoading,
    refreshSubscriptionStatus,
    subscriptionError,
    lastFetched,
    generatePDF,
    developmentOverride
  } = usePDFGeneration()

  // Test the API directly
  const testSubscriptionAPI = async () => {
    setIsTestingAPI(true)
    setApiError(null)
    
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setApiResponse(data)
      } else {
        setApiError(`API Error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      setApiError(`Network Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    } finally {
      setIsTestingAPI(false)
    }
  }

  // Test PDF generation with detailed logging
  const testPDFGeneration = async () => {
    console.log('🧪 Testing PDF Generation...')
    console.log('Current hook state:', {
      hasAccess,
      isPremium,
      isLoading: pdfHookLoading,
      subscriptionError,
      lastFetched
    })

    // Test sample data
    const sampleData = {
      name: "Test User",
      currentAge: 45,
      plannedRetirementAge: 62,
      retirementGroup: "GROUP_2",
      averageSalary: 75000,
      yearsOfService: 20,
      basePension: 55125,
      options: {
        A: { annual: 55125, monthly: 4594, description: "Option A" }
      },
      calculationDate: new Date()
    }

    try {
      const result = await generatePDF(sampleData, 'pension', {})
      console.log('✅ PDF Generation Result:', result)
    } catch (error) {
      console.error('❌ PDF Generation Error:', error)
    }
  }

  // Auto-test API on mount
  useEffect(() => {
    if (status === 'authenticated') {
      testSubscriptionAPI()
    }
  }, [status])

  // Manual feature check test
  const testFeatureCheck = () => {
    if (!apiResponse) return null

    // Determine userType like the hook does
    let userType = 'oauth_free'
    if (apiResponse.isPremium) {
      if (apiResponse.subscriptionPlan === 'monthly') {
        userType = 'stripe_monthly'
      } else if (apiResponse.subscriptionPlan === 'annual') {
        userType = 'stripe_annual'
      } else {
        userType = 'oauth_premium'
      }
    }

    const featureCheck = canAccessFeature(userType, 'pdf_reports', 0)
    
    return {
      userType,
      featureCheck,
      expectedAccess: apiResponse.isPremium
    }
  }

  const featureTest = testFeatureCheck()

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
          <p className="text-red-600">Not authenticated</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-purple-600" />
          Detailed PDF Debug Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Development Override Alert */}
        {developmentOverride && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Development Override Active: PDF testing enabled (ENABLE_PDF_TESTING=true)
            </AlertDescription>
          </Alert>
        )}

        {/* Environment Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Environment Configuration</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
            </div>
            <div>
              <strong>ENABLE_PDF_TESTING:</strong> {process.env.ENABLE_PDF_TESTING || 'false'}
            </div>
            <div>
              <strong>Development Override:</strong> {developmentOverride ? 'Active' : 'Inactive'}
            </div>
            <div>
              <strong>User Email:</strong> {session?.user?.email}
            </div>
          </div>
        </div>

        {/* API Response Test */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">1. Subscription API Response</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={testSubscriptionAPI}
              disabled={isTestingAPI}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isTestingAPI ? 'animate-spin' : ''}`} />
              Test API
            </Button>
          </div>
          
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {apiError}
            </div>
          )}
          
          {apiResponse && (
            <div className="p-3 bg-gray-50 border rounded text-sm">
              <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Feature Check Test */}
        {featureTest && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">2. Feature Access Calculation</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">API isPremium:</span>
                  <Badge variant={apiResponse.isPremium ? 'default' : 'secondary'}>
                    {apiResponse.isPremium ? 'TRUE' : 'FALSE'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Determined userType:</span>
                  <span className="font-mono">{featureTest.userType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Feature hasAccess:</span>
                  <Badge variant={featureTest.featureCheck.hasAccess ? 'default' : 'destructive'}>
                    {featureTest.featureCheck.hasAccess ? 'TRUE' : 'FALSE'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Access:</span>
                  <Badge variant={featureTest.expectedAccess ? 'default' : 'secondary'}>
                    {featureTest.expectedAccess ? 'TRUE' : 'FALSE'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Logic Match:</span>
                  {featureTest.featureCheck.hasAccess === featureTest.expectedAccess ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hook State */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">3. PDF Hook State</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Hook isPremium:</span>
                <Badge variant={isPremium ? 'default' : 'secondary'}>
                  {isPremium ? 'TRUE' : 'FALSE'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hook hasAccess:</span>
                <Badge variant={hasAccess ? 'default' : 'destructive'}>
                  {hasAccess ? 'TRUE' : 'FALSE'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Hook Loading:</span>
                <Badge variant={pdfHookLoading ? 'secondary' : 'outline'}>
                  {pdfHookLoading ? 'LOADING' : 'READY'}
                </Badge>
              </div>
              {subscriptionError && (
                <div className="text-red-600 text-xs">
                  Error: {subscriptionError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Issue Detection */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">4. Issue Detection</h4>
          <div className="space-y-2">
            {apiResponse?.isPremium && !hasAccess && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">ISSUE: API shows premium but hook shows no access!</span>
              </div>
            )}
            
            {featureTest && featureTest.featureCheck.hasAccess !== featureTest.expectedAccess && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">ISSUE: Feature check doesn't match expected access!</span>
              </div>
            )}
            
            {!apiResponse?.isPremium && session?.user?.email === 'grego118@gmail.com' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">ISSUE: grego118@gmail.com should be premium via fallback!</span>
              </div>
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="font-medium text-gray-900">5. Test Actions</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSubscriptionStatus}
              disabled={pdfHookLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${pdfHookLoading ? 'animate-spin' : ''}`} />
              Refresh Hook
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testPDFGeneration}
            >
              <FileText className="w-4 h-4 mr-2" />
              Test PDF Generation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
