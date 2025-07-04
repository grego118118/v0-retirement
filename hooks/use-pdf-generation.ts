"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  PensionCalculationData,
  PDFGenerationOptions
} from '@/lib/pdf/puppeteer-pdf-generator'
import { canAccessFeature, isUserPremium } from '@/lib/stripe/config'

// Utility functions for PDF generation
function generatePDFFilename(
  reportType: 'pension' | 'combined',
  userName?: string
): string {
  const dateStr = new Date().toISOString().split('T')[0]
  const userStr = userName ? userName.replace(/[^a-zA-Z0-9]/g, '_') : 'User'

  return reportType === 'pension'
    ? `MA_Pension_Report_${userStr}_${dateStr}.pdf`
    : `MA_Retirement_Analysis_${userStr}_${dateStr}.pdf`
}

function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)
}

// Combined calculation data interface (for compatibility)
interface CombinedCalculationData {
  pensionData: PensionCalculationData
  socialSecurityData?: any
  additionalIncome?: any
}

interface UsePDFGenerationOptions {
  onSuccess?: (filename: string) => void
  onError?: (error: string) => void
  useServerGeneration?: boolean // Whether to use server-side generation
}

export function usePDFGeneration(options: UsePDFGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<{
    isPremium: boolean
    userType: string
    isLoading: boolean
    lastFetched: number | null
    error: string | null
  }>({
    isPremium: false,
    userType: 'oauth_free',
    isLoading: true,
    lastFetched: null,
    error: null
  })

  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const {
    onSuccess,
    onError,
    useServerGeneration = true
  } = options

  // Manual refresh function
  const refreshSubscriptionStatus = useCallback(async () => {
    if (status === 'loading' || status === 'unauthenticated' || !session?.user?.email) {
      return
    }

    setSubscriptionData(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()

        // Debug logging for API response
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Subscription Status API Response:', data)
        }

        // Determine userType based on subscription data
        let userType = 'oauth_free'
        if (data.isPremium) {
          if (data.subscriptionPlan === 'monthly') {
            userType = 'stripe_monthly'
          } else if (data.subscriptionPlan === 'annual') {
            userType = 'stripe_annual'
          } else {
            userType = 'oauth_premium' // Grandfathered users
          }
        }

        const newSubscriptionData = {
          isPremium: data.isPremium,
          userType,
          isLoading: false,
          lastFetched: Date.now(),
          error: null
        }

        // Debug logging for processed data
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Processed Subscription Data:', newSubscriptionData)
          console.log('🔄 Setting subscription data - userType changing from', subscriptionData.userType, 'to', newSubscriptionData.userType)
        }

        setSubscriptionData(newSubscriptionData)
      } else {
        // API error, default to free
        const errorMsg = `API Error: ${response.status} ${response.statusText}`
        console.error('❌ Subscription API Error:', errorMsg)
        setSubscriptionData({
          isPremium: false,
          userType: 'oauth_free',
          isLoading: false,
          lastFetched: Date.now(),
          error: errorMsg
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Error fetching subscription status:', error)
      setSubscriptionData({
        isPremium: false,
        userType: 'oauth_free',
        isLoading: false,
        lastFetched: Date.now(),
        error: errorMsg
      })
    }
  }, [session, status])

  // Fetch subscription status when session is available
  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (status === 'loading') {
        return // Wait for session to load
      }

      if (status === 'unauthenticated') {
        setSubscriptionData({
          isPremium: false,
          userType: 'oauth_free',
          isLoading: false,
          lastFetched: Date.now(),
          error: null
        })
        return
      }

      if (!session?.user?.email) {
        setSubscriptionData({
          isPremium: false,
          userType: 'oauth_free',
          isLoading: false,
          lastFetched: Date.now(),
          error: 'No user email in session'
        })
        return
      }

      // Use the refresh function for initial load
      refreshSubscriptionStatus()
    }

    fetchSubscriptionStatus()
  }, [session, status, refreshSubscriptionStatus])

  // Check if user has premium access using the fetched subscription data
  const isPremium = subscriptionData.isPremium

  // Use useMemo to ensure featureCheck is recalculated when subscription data changes
  const featureCheck = useMemo(() => {
    const result = canAccessFeature(subscriptionData.userType, 'pdf_reports', 0)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 FeatureCheck Recalculated:', {
        userType: subscriptionData.userType,
        result,
        timestamp: new Date().toISOString()
      })
    }
    return result
  }, [subscriptionData.userType])

  // If session or subscription data is still loading, assume no access until confirmed
  const hasAccess = (status === 'loading' || subscriptionData.isLoading) ? false : featureCheck.hasAccess

  // Debug logging for troubleshooting
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 PDF Generation Hook Debug:', {
        sessionStatus: status,
        userEmail: session?.user?.email,
        subscriptionData,
        featureCheck,
        hasAccess,
        isPremium,
        calculationBreakdown: {
          userType: subscriptionData.userType,
          isLoading: subscriptionData.isLoading,
          sessionLoading: status === 'loading',
          featureHasAccess: featureCheck.hasAccess,
          finalHasAccess: hasAccess
        }
      })
    }
  }, [status, session?.user?.email, subscriptionData, featureCheck, hasAccess, isPremium])

  // Development mode override for testing
  const isDevelopmentOverride = process.env.NODE_ENV === 'development' &&
    process.env.ENABLE_PDF_TESTING === 'true'

  const generatePDF = async (
    data: PensionCalculationData | CombinedCalculationData,
    reportType: 'pension' | 'combined',
    pdfOptions: Partial<PDFGenerationOptions> = {}
  ) => {
    // Check if session or subscription data is still loading
    if (status === 'loading' || subscriptionData.isLoading) {
      const errorMessage = "Please wait while we verify your account access"
      toast({
        title: "Loading",
        description: errorMessage,
      })
      onError?.(errorMessage)
      return false
    }

    // Check access (with development override)
    if (!hasAccess && !isDevelopmentOverride) {
      // Debug logging for access denial
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ PDF Generation Access Denied:', {
          hasAccess,
          sessionStatus: status,
          subscriptionIsLoading: subscriptionData.isLoading,
          subscriptionData,
          featureCheck,
          userType: subscriptionData.userType,
          isPremium: subscriptionData.isPremium,
          developmentOverride: isDevelopmentOverride,
          enablePdfTesting: process.env.ENABLE_PDF_TESTING
        })
      }

      // Handle unauthenticated users by redirecting to pricing
      if (status === 'unauthenticated') {
        console.log('🔄 PDF Generation: Redirecting unauthenticated user to pricing page')
        router.push('/pricing?feature=pdf-reports')
        return false
      }

      // Handle authenticated users without premium access
      const errorMessage = "Premium subscription required for PDF generation"
      toast({
        title: "Premium Feature Required",
        description: errorMessage,
        variant: "destructive",
      })
      onError?.(errorMessage)
      return false
    }

    // Development mode notification
    if (isDevelopmentOverride && !hasAccess) {
      console.log('🧪 Development Override: PDF generation enabled for testing')
      toast({
        title: "Development Mode",
        description: "PDF generation enabled for testing (ENABLE_PDF_TESTING=true)",
        variant: "default",
      })
    }

    setIsGenerating(true)

    try {
      let blob: Blob
      const userName = session?.user?.name || undefined
      const filename = generatePDFFilename(reportType, userName)

      if (useServerGeneration) {
        // Use server-side generation
        const response = await fetch('/api/pdf/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportType,
            data,
            options: {
              includeCharts: true,
              includeCOLAProjections: true,
              includeScenarioComparison: reportType === 'combined',
              watermark: isPremium ? undefined : 'PREMIUM PREVIEW',
              ...pdfOptions
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json()

          // Handle authentication redirect from server
          if (response.status === 401 && errorData.redirectTo) {
            console.log('🔄 PDF Generation: Server requested redirect to:', errorData.redirectTo)
            router.push(errorData.redirectTo)
            return false
          }

          throw new Error(errorData.error || 'Server-side PDF generation failed')
        }

        blob = await response.blob()
      } else {
        // Client-side generation not supported with Puppeteer
        // Always use server-side generation
        throw new Error('PDF generation requires server-side processing. Please try again.')
      }

      // Download the PDF
      downloadPDF(blob, filename)

      // Success feedback
      const successMessage = `Your ${reportType === 'pension' ? 'pension calculation' : 'retirement analysis'} report has been downloaded.`
      toast({
        title: "PDF Generated Successfully",
        description: successMessage,
      })

      onSuccess?.(filename)

      // Track usage for analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pdf_download', {
          event_category: 'premium_feature',
          event_label: reportType,
          value: 1
        })
      }

      return true

    } catch (error) {
      console.error('PDF generation error:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'There was an error generating your PDF report. Please try again.'
      
      toast({
        title: "PDF Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })

      onError?.(errorMessage)
      return false

    } finally {
      setIsGenerating(false)
    }
  }

  const generatePensionPDF = async (
    data: PensionCalculationData,
    options: Partial<PDFGenerationOptions> = {}
  ) => {
    return generatePDF(data, 'pension', options)
  }

  const generateCombinedPDF = async (
    data: CombinedCalculationData,
    options: Partial<PDFGenerationOptions> = {}
  ) => {
    return generatePDF(data, 'combined', options)
  }

  return {
    generatePDF,
    generatePensionPDF,
    generateCombinedPDF,
    isGenerating,
    hasAccess: hasAccess || isDevelopmentOverride,
    isPremium,
    upgradeRequired: !hasAccess && !isDevelopmentOverride,
    isLoading: status === 'loading' || subscriptionData.isLoading,
    refreshSubscriptionStatus,
    subscriptionError: subscriptionData.error,
    lastFetched: subscriptionData.lastFetched,
    developmentOverride: isDevelopmentOverride
  }
}

// Utility hook for quick PDF generation with default settings
export function useQuickPDFGeneration() {
  return usePDFGeneration({
    useServerGeneration: true,
    onSuccess: (filename) => {
      console.log(`PDF downloaded: ${filename}`)
    },
    onError: (error) => {
      console.error(`PDF generation failed: ${error}`)
    }
  })
}
