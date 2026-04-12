"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePDFGeneration } from '@/hooks/use-pdf-generation'
import { RefreshCw, User, Shield, FileText, AlertTriangle } from 'lucide-react'

interface SubscriptionData {
  isPremium: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  usageLimits: {
    maxPdfReports: number
  }
}

export function SubscriptionDebug() {
  const { data: session, status } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use the PDF generation hook to get its state
  const {
    hasAccess,
    isPremium,
    isLoading: pdfHookLoading,
    refreshSubscriptionStatus,
    subscriptionError,
    lastFetched
  } = usePDFGeneration()

  const fetchSubscriptionStatus = async () => {
    if (status !== 'authenticated' || !session?.user?.email) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      } else {
        setError(`API Error: ${response.status}`)
      }
    } catch (err) {
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [session, status])

  if (status === 'loading') {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <User className="w-5 h-5" />
            Subscription Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Loading session...</p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <User className="w-5 h-5" />
            Subscription Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Not authenticated</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Subscription Debug
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptionStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Session Information</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-mono">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="font-mono text-xs">{session?.user?.id || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Session Status:</span>
              <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
                {status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Subscription Data */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Subscription Status</h4>
          
          {isLoading && (
            <p className="text-gray-600">Loading subscription data...</p>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {subscriptionData && (
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Premium Status:</span>
                <Badge variant={subscriptionData.isPremium ? 'default' : 'secondary'}>
                  {subscriptionData.isPremium ? 'PREMIUM' : 'FREE'}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription Status:</span>
                <span className="font-mono">{subscriptionData.subscriptionStatus}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-mono">{subscriptionData.subscriptionPlan}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PDF Reports:</span>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-mono">
                    {subscriptionData.usageLimits?.maxPdfReports === -1 
                      ? 'UNLIMITED' 
                      : subscriptionData.usageLimits?.maxPdfReports || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PDF Hook State */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="font-medium text-gray-900">PDF Generation Hook State</h4>
          <div className="text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hook isPremium:</span>
              <Badge variant={isPremium ? 'default' : 'secondary'}>
                {isPremium ? 'TRUE' : 'FALSE'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hook hasAccess:</span>
              <Badge variant={hasAccess ? 'default' : 'destructive'}>
                {hasAccess ? 'TRUE' : 'FALSE'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hook Loading:</span>
              <Badge variant={pdfHookLoading ? 'secondary' : 'outline'}>
                {pdfHookLoading ? 'LOADING' : 'READY'}
              </Badge>
            </div>

            {subscriptionError && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <div className="text-red-600 text-xs">
                  <strong>Hook Error:</strong> {subscriptionError}
                </div>
              </div>
            )}

            {lastFetched && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Last Fetched:</span>
                <span>{new Date(lastFetched).toLocaleTimeString()}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={refreshSubscriptionStatus}
              disabled={pdfHookLoading}
              className="w-full mt-2"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${pdfHookLoading ? 'animate-spin' : ''}`} />
              Refresh Hook State
            </Button>
          </div>
        </div>

        {/* Expected Behavior */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="font-medium text-gray-900">Expected Behavior</h4>
          <div className="text-sm text-gray-600">
            {hasAccess ? (
              <div className="flex items-center gap-2 text-green-700">
                <span>✅</span>
                <span>Should see functional PDF export buttons</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <span>❌</span>
                <span>Should see upgrade prompts for PDF generation</span>
              </div>
            )}

            {isPremium && !hasAccess && (
              <div className="flex items-center gap-2 text-red-700 mt-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">ISSUE: Premium user without access!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
