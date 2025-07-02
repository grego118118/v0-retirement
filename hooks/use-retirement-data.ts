"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// Simple error reporting functions for development
const reportError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported:', error, context)
  }
}

const addBreadcrumb = (message: string, category?: string, level?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level?.toUpperCase() || 'INFO'}] ${category || 'general'}: ${message}`)
  }
}

// Utility function to safely serialize errors for logging
function serializeError(error: unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    }
  }

  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.parse(JSON.stringify(error))
    } catch {
      return { error: String(error) }
    }
  }

  return { error: String(error) }
}

// Utility function to create detailed error context
function createErrorContext(error: unknown, context: Record<string, any>): Record<string, any> {
  return {
    ...serializeError(error),
    ...context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
  }
}

interface RetirementProfile {
  dateOfBirth: string
  membershipDate: string
  retirementGroup: string
  benefitPercentage: number
  currentSalary: number
  averageHighest3Years?: number
  yearsOfService?: number
  retirementOption?: string
  retirementDate?: string
  estimatedSocialSecurityBenefit?: number
}

interface RetirementCalculation {
  id?: string
  calculationName?: string
  retirementDate: string
  retirementAge: number
  yearsOfService: number
  averageSalary: number
  retirementGroup: string
  benefitPercentage: number
  retirementOption: string
  monthlyBenefit: number
  annualBenefit: number
  benefitReduction?: number
  survivorBenefit?: number
  notes?: string
  isFavorite?: boolean
  createdAt?: string
  updatedAt?: string
  // Social Security fields
  socialSecurityData?: {
    fullRetirementAge?: number
    earlyRetirementBenefit?: number
    fullRetirementBenefit?: number
    delayedRetirementBenefit?: number
    selectedClaimingAge?: number
    selectedMonthlyBenefit?: number
    combinedMonthlyIncome?: number
    replacementRatio?: number
  }
}

export function useRetirementData() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<RetirementProfile | null>(null)
  const [calculations, setCalculations] = useState<RetirementCalculation[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch retirement profile with retry logic for database connectivity issues
  const fetchProfile = useCallback(async (retryCount = 0) => {
    if (!session?.user) {
      console.log("fetchProfile: No session or user, skipping profile fetch")
      return
    }

    console.log(`fetchProfile: Starting profile fetch for user: ${session.user.id} (attempt ${retryCount + 1})`)
    setLoading(true)

    // Clear any previous errors
    setError(null)

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log("fetchProfile: Request timeout, aborting...")
        controller.abort()
      }, 10000) // 10 second timeout

      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log("fetchProfile: Response status:", response.status)

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")

        // Enhanced error logging for HTTP errors with comprehensive details
        const errorDetails = {
          endpoint: '/api/profile',
          method: 'GET',
          status: response.status,
          statusText: response.statusText || 'Unknown Status',
          contentType: response.headers.get('content-type') || 'Unknown',
          responseData: errorText.substring(0, 500),
          requestParams: {
            operation: 'fetchProfile'
          },
          userId: session?.user?.id || 'Unknown',
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
          errorType: 'HTTP_RESPONSE_ERROR',
          headers: Object.fromEntries(response.headers.entries())
        }

        // Enhanced error logging with safety checks
        try {
          console.error("fetchProfile: HTTP error response details:", errorDetails)
          console.error("fetchProfile: Full response object:", {
            url: response.url,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            ok: response.ok,
            redirected: response.redirected,
            type: response.type
          })
        } catch (loggingError) {
          console.error("fetchProfile: Error during error logging:", loggingError)
          console.error("fetchProfile: Basic error info:", {
            status: response.status,
            statusText: response.statusText,
            url: '/api/profile'
          })
        }

        // Handle specific HTTP status codes with appropriate user feedback and error state
        if (response.status === 401) {
          const errorMessage = "Please sign in to access your profile"
          setError(errorMessage)
          toast.error(errorMessage)
          return
        } else if (response.status === 403) {
          const errorMessage = "Access denied. Please check your permissions."
          setError(errorMessage)
          toast.error(errorMessage)
          return
        } else if (response.status >= 500) {
          // Handle server errors with retry logic for database connectivity issues
          if (retryCount < 2) {
            const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000) // Exponential backoff, max 5s
            console.log(`fetchProfile: Server error (${response.status}), retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/3)`)

            // Don't show error toast on first retry, only log it
            if (retryCount === 0) {
              console.warn("fetchProfile: Database connectivity issue detected, attempting retry...")
            }

            setTimeout(() => {
              fetchProfile(retryCount + 1)
            }, retryDelay)
            return
          } else {
            // All retries exhausted
            const errorMessage = "Server is temporarily unavailable. Please try again later."
            console.error(`fetchProfile: Server error after ${retryCount + 1} attempts, giving up`)
            setError(errorMessage)
            toast.error(errorMessage, {
              description: "Database connectivity issue. Please check your connection and try again.",
              action: {
                label: "Retry",
                onClick: () => fetchProfile(0) // Reset retry count
              }
            })
            return
          }
        } else if (response.status === 404) {
          const errorMessage = "Profile not found. Please create your profile first."
          setError(errorMessage)
          toast.error(errorMessage)
          return
        } else {
          // Generic error for other status codes
          const errorMessage = `Failed to load profile (HTTP ${response.status})`
          setError(errorMessage)
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const errorMessage = "Server returned invalid response format"
        console.error("fetchProfile: Response is not JSON, content-type:", contentType)
        console.error("fetchProfile: Response details:", {
          status: response.status,
          statusText: response.statusText,
          contentType: contentType,
          url: response.url
        })
        setError(errorMessage)
        throw new Error(`Response is not JSON. Content-Type: ${contentType}`)
      }

      // Enhanced response parsing with error handling
      let data: any = {}
      try {
        data = await response.json()
        console.log("fetchProfile: Response data parsed successfully:", {
          hasData: !!data,
          dataType: typeof data,
          dataKeys: data ? Object.keys(data) : []
        })
      } catch (parseError) {
        const errorMessage = "Failed to parse server response"
        console.error("fetchProfile: Failed to parse JSON response:", parseError)
        console.error("fetchProfile: Response details:", {
          status: response.status,
          statusText: response.statusText,
          contentType: contentType,
          url: response.url
        })
        setError(errorMessage)
        throw new Error(`Failed to parse server response: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
      }

      // Enhanced data processing with validation and error handling
      if (data && typeof data === 'object') {
        try {
          // Convert the profile data to the expected format with validation
          const profileData = {
            dateOfBirth: data.dateOfBirth || "",
            membershipDate: data.membershipDate || "",
            retirementGroup: data.retirementGroup || "Group 1",
            benefitPercentage: data.benefitPercentage || 2.0,
            currentSalary: data.currentSalary || 0,
            averageHighest3Years: data.averageHighest3Years || 0,
            yearsOfService: data.yearsOfService || 0,
            retirementOption: data.retirementOption || "A",
            retirementDate: data.retirementDate || "",
            estimatedSocialSecurityBenefit: data.estimatedSocialSecurityBenefit || 0
          }

          console.log("fetchProfile: Successfully processed profile data:", {
            hasRequiredFields: !!(profileData.retirementGroup && profileData.retirementOption),
            dataKeys: Object.keys(profileData),
            sampleValues: {
              retirementGroup: profileData.retirementGroup,
              yearsOfService: profileData.yearsOfService,
              currentSalary: profileData.currentSalary
            }
          })

          setProfile(profileData)

          // Clear any previous errors on successful data processing
          setError(null)

          // Log successful recovery after retries
          if (retryCount > 0) {
            console.log(`fetchProfile: Successfully recovered after ${retryCount + 1} attempts`)
            addBreadcrumb(
              `Profile fetch recovered after ${retryCount + 1} attempts`,
              'data',
              'info'
            )
          }
        } catch (processingError) {
          const errorMessage = "Failed to process profile data"
          console.error("fetchProfile: Error processing profile data:", processingError)
          setError(errorMessage)
          setProfile(null)
          throw new Error(`Failed to process profile data: ${processingError instanceof Error ? processingError.message : String(processingError)}`)
        }
      } else if (data === null || data === undefined) {
        console.log("fetchProfile: No profile data returned, setting empty profile")
        setProfile(null)
        setError(null) // Clear errors for valid empty response
      } else {
        const errorMessage = "Invalid profile data format received"
        console.warn("fetchProfile: Invalid data format:", {
          dataType: typeof data,
          dataValue: data
        })
        setError(errorMessage)
        setProfile(null)
      }
    } catch (error) {
      // Handle network errors and timeouts with retry logic
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch')
      const isTimeoutError = error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))

      if ((isNetworkError || isTimeoutError) && retryCount < 2) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000) // Exponential backoff, max 5s
        console.log(`fetchProfile: Network/timeout error, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/3)`)
        console.log("fetchProfile: Error details:", {
          errorType: isNetworkError ? 'network' : 'timeout',
          errorMessage: error instanceof Error ? error.message : String(error),
          retryCount: retryCount + 1
        })

        setTimeout(() => {
          fetchProfile(retryCount + 1)
        }, retryDelay)
        return
      }

      // Enhanced error logging for profile fetch errors
      const errorContext = createErrorContext(error, {
        userId: session?.user?.id,
        url: '/api/profile',
        operation: 'fetchProfile',
        retryCount: retryCount,
        maxRetries: 2,
        errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown'
      })
      console.error("fetchProfile: Detailed error information:", errorContext)

      // Only report error to monitoring system after all retries are exhausted
      if (retryCount >= 2 || (!isNetworkError && !isTimeoutError)) {
        reportError(error instanceof Error ? error : new Error(String(error)), {
          category: 'data_fetch',
          operation: 'fetchProfile',
          userId: session?.user?.id,
          context: errorContext
        })

        // Add breadcrumb for debugging
        addBreadcrumb(
          `Profile fetch failed after ${retryCount + 1} attempts: ${error instanceof Error ? error.message : String(error)}`,
          'data',
          'error'
        )
      }

      // Provide more specific and user-friendly error messages
      if (isNetworkError) {
        const errorMessage = retryCount >= 2
          ? "Unable to connect to the server after multiple attempts. Please check your internet connection and try again."
          : "Network connection issue detected."

        if (retryCount >= 2) {
          toast.error(errorMessage, {
            description: "If the problem persists, please contact support.",
            action: {
              label: "Retry",
              onClick: () => fetchProfile(0) // Reset retry count
            }
          })
        }
        setError(errorMessage)
      } else if (isTimeoutError) {
        const errorMessage = retryCount >= 2
          ? "Request timed out after multiple attempts. The server may be experiencing high load."
          : "Request timed out."

        if (retryCount >= 2) {
          toast.error(errorMessage, {
            description: "Please try again in a few moments.",
            action: {
              label: "Retry",
              onClick: () => fetchProfile(0) // Reset retry count
            }
          })
        }
        setError(errorMessage)
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        if (retryCount >= 2) {
          toast.error("Server response error. Please try again.", {
            description: "The server returned an unexpected response format.",
            action: {
              label: "Retry",
              onClick: () => fetchProfile(0) // Reset retry count
            }
          })
        }
        setError("Server response error")
      } else {
        // Generic error handling for other types of errors
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

        if (retryCount >= 2) {
          toast.error("Unable to load your retirement profile", {
            description: "Please try again or contact support if the issue continues.",
            action: {
              label: "Retry",
              onClick: () => fetchProfile(0) // Reset retry count
            }
          })
        }

        setError(`Failed to load profile: ${errorMessage}`)
        console.error("fetchProfile: Generic error:", {
          errorMessage,
          errorType: typeof error,
          retryCount: retryCount + 1
        })
      }

      // Set profile to null on error to trigger fallback behavior
      setProfile(null)

      // Set error state for consuming components
      setError(error instanceof Error ? error.message : "Failed to load retirement profile")
    } finally {
      setLoading(false)
    }
  }, [session]) // Note: retryCount is a parameter, not a dependency

  // Fetch calculations with comprehensive error handling
  const fetchCalculations = useCallback(async (favorites?: boolean) => {
    if (!session?.user) {
      console.log("fetchCalculations: No session or user, skipping calculations fetch")
      return
    }

    console.log("fetchCalculations: Starting calculations fetch for user:", session.user.id)
    setLoading(true)

    // Clear any previous errors
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: "20",
        ...(favorites && { favorites: "true" }),
      })

      const url = `/api/retirement/calculations?${params}`
      console.log("fetchCalculations: Making request to:", url)

      const response = await fetch(url)
      console.log("fetchCalculations: Response status:", response.status)
      console.log("fetchCalculations: Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("fetchCalculations: Response is not JSON. Content-Type:", contentType)
        console.error("fetchCalculations: Response text:", responseText)
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("fetchCalculations: Parsed response data:", data)

      if (response.ok) {
        // Enhanced success logging with data validation
        console.log("fetchCalculations: Response successful, processing data...")
        console.log("fetchCalculations: Raw response data:", {
          hasCalculations: !!data.calculations,
          calculationsType: typeof data.calculations,
          calculationsLength: data.calculations?.length || 0,
          calculationsIsArray: Array.isArray(data.calculations),
          dataKeys: Object.keys(data || {}),
          sampleCalculation: data.calculations?.[0] ? {
            id: data.calculations[0].id,
            name: data.calculations[0].calculationName,
            hasRequiredFields: !!(data.calculations[0].id && data.calculations[0].calculationName)
          } : null
        })

        // Validate and set calculations with comprehensive fallback handling
        let calculations: any[] = []

        try {
          if (Array.isArray(data.calculations)) {
            calculations = data.calculations
          } else if (data.calculations === null || data.calculations === undefined) {
            console.warn("fetchCalculations: No calculations array in response, using empty array")
            calculations = []
          } else {
            console.warn("fetchCalculations: Unexpected calculations data type:", typeof data.calculations)
            calculations = []
          }

          setCalculations(calculations)
          console.log("fetchCalculations: Successfully set calculations:", calculations.length)
        } catch (stateError) {
          console.error("fetchCalculations: Error setting calculations state:", stateError)
          setCalculations([])
          throw new Error(`Failed to process calculations data: ${stateError instanceof Error ? stateError.message : String(stateError)}`)
        }

        // Additional validation to ensure data integrity
        if (calculations.length > 0) {
          const validCalculations = calculations.filter(calc => calc.id && calc.calculationName)
          if (validCalculations.length !== calculations.length) {
            console.warn("fetchCalculations: Some calculations missing required fields:", {
              total: calculations.length,
              valid: validCalculations.length,
              invalid: calculations.length - validCalculations.length
            })
          }
        }
      } else {
        // Enhanced error logging for API errors with comprehensive details
        const errorDetails = {
          endpoint: url,
          method: 'GET',
          status: response.status,
          statusText: response.statusText || 'Unknown Status',
          contentType: response.headers.get('content-type') || 'Unknown',
          responseData: data || {},
          requestParams: {
            limit: "20",
            favorites: favorites || false
          },
          userId: session?.user?.id || 'Unknown',
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
          errorType: 'API_RESPONSE_ERROR'
        }

        // Enhanced error logging with safety checks
        try {
          console.error("fetchCalculations: API error details:", errorDetails)
          console.error("fetchCalculations: Full response object:", {
            url: response.url,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            ok: response.ok,
            redirected: response.redirected,
            type: response.type
          })
        } catch (loggingError) {
          console.error("fetchCalculations: Error during error logging:", loggingError)
          console.error("fetchCalculations: Basic error info:", {
            status: response.status,
            statusText: response.statusText,
            url: url
          })
        }

        if (response.status === 401) {
          console.log("fetchCalculations: Unauthorized - user may need to sign in")
          toast.error("Please sign in to view your calculations")
        } else if (response.status === 403) {
          toast.error("Access denied. Please check your permissions.")
        } else if (response.status >= 500) {
          toast.error("Server error. Please try again later.")
        } else {
          toast.error(data.error || `Failed to fetch calculations (${response.status})`)
        }
        setCalculations([]) // Set empty array on error
      }
    } catch (error) {
      // Enhanced error logging for network/parsing errors
      const errorContext = createErrorContext(error, {
        userId: session?.user?.id,
        url: `/api/retirement/calculations?${new URLSearchParams({
          limit: "20",
          ...(favorites && { favorites: "true" }),
        })}`,
        operation: 'fetchCalculations',
        favorites: favorites
      })
      console.error("fetchCalculations: Detailed error information:", errorContext)

      // Report error to monitoring system
      reportError(error instanceof Error ? error : new Error(String(error)), {
        category: 'data_fetch',
        operation: 'fetchCalculations',
        userId: session?.user?.id,
        context: errorContext,
        favorites: favorites
      })

      // Add breadcrumb for debugging
      addBreadcrumb(
        `Calculations fetch failed: ${error instanceof Error ? error.message : String(error)}`,
        'data',
        'error'
      )

      // Provide specific and user-friendly error messages based on error type
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Unable to connect to the server", {
          description: "Please check your internet connection and try again.",
          action: {
            label: "Retry",
            onClick: () => fetchCalculations(favorites)
          }
        })
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        toast.error("Server response error", {
          description: "The server returned an unexpected response. Please try again.",
          action: {
            label: "Retry",
            onClick: () => fetchCalculations(favorites)
          }
        })
      } else if (error instanceof Error) {
        const isNetworkError = error.message.toLowerCase().includes('network') ||
                              error.message.toLowerCase().includes('fetch') ||
                              error.message.toLowerCase().includes('timeout')

        if (isNetworkError) {
          toast.error("Connection problem detected", {
            description: "Unable to load your saved calculations. Please check your connection.",
            action: {
              label: "Retry",
              onClick: () => fetchCalculations(favorites)
            }
          })
        } else {
          toast.error("Unable to load your calculations", {
            description: "Please try again or contact support if the issue continues.",
            action: {
              label: "Retry",
              onClick: () => fetchCalculations(favorites)
            }
          })
        }
      } else {
        toast.error("Unable to load your calculations", {
          description: "An unexpected error occurred. Please try again.",
          action: {
            label: "Retry",
            onClick: () => fetchCalculations(favorites)
          }
        })
      }
      setCalculations([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  // Auto-fetch profile when session is available
  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session?.user?.id]) // Only depend on user ID, not the entire fetchProfile function

  // Auto-fetch calculations when session is available
  useEffect(() => {
    if (session?.user) {
      fetchCalculations()
    }
  }, [session?.user?.id, fetchCalculations]) // Include fetchCalculations in dependencies

  // Save or update retirement profile
  const saveProfile = useCallback(async (profileData: RetirementProfile) => {
    if (!session?.user) {
      console.log("saveProfile: No session or user, cannot save profile")
      toast.error("You must be logged in to save your profile")
      return false
    }

    console.log("saveProfile: Starting profile save for user:", session.user.id)
    console.log("saveProfile: Profile data to save:", {
      ...profileData,
      // Don't log sensitive data in production
      dataKeys: Object.keys(profileData),
      hasDateOfBirth: !!profileData.dateOfBirth,
      hasMembershipDate: !!profileData.membershipDate,
      retirementGroup: profileData.retirementGroup
    })

    setLoading(true)
    try {
      const response = await fetch("/api/retirement/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(profileData),
      })

      console.log("saveProfile: Response status:", response.status)

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error("saveProfile: HTTP error response:", {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        })

        // Provide specific error messages based on status code
        if (response.status === 401) {
          toast.error("Please sign in to save your profile")
          return false
        } else if (response.status === 400) {
          const message = errorData.message || "Please check your input data and try again"
          toast.error(message)
          return false
        } else if (response.status === 409) {
          const message = errorData.message || "Profile already exists"
          toast.error(message)
          return false
        } else if (response.status === 500) {
          const message = errorData.message || "Server error. Please try again in a moment."
          toast.error(message)
          return false
        }

        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      if (data && data.profile) {
        // Convert the response data to the expected profile format
        const profileData = data.profile
        setProfile({
          dateOfBirth: profileData.dateOfBirth || "",
          membershipDate: profileData.membershipDate || "",
          retirementGroup: profileData.retirementGroup || "Group 1",
          benefitPercentage: profileData.benefitPercentage || 2.0,
          currentSalary: profileData.currentSalary || 0,
          averageHighest3Years: profileData.averageHighest3Years || 0,
          yearsOfService: profileData.yearsOfService || 0,
          retirementOption: profileData.retirementOption || "A",
          retirementDate: profileData.retirementDate || "",
          estimatedSocialSecurityBenefit: profileData.estimatedSocialSecurityBenefit || 0
        })
        toast.success(profile ? "Profile updated" : "Profile created")
        return true
      } else {
        toast.error("Failed to save profile")
        return false
      }
    } catch (error) {
      console.error("saveProfile: Error saving profile:", error)

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else if (error instanceof Error) {
        // Don't show technical error messages to users
        if (error.message.includes('HTTP 500')) {
          toast.error("Server error. Please try again in a moment.")
        } else if (error.message.includes('HTTP 400')) {
          toast.error("Please check your input data and try again.")
        } else if (error.message.includes('Response is not JSON')) {
          toast.error("Server error. Please try again.")
        } else {
          toast.error("Failed to save profile. Please try again.")
        }
      } else {
        toast.error("Failed to save profile")
      }

      return false
    } finally {
      setLoading(false)
    }
  }, [session, profile])

  // Save new calculation
  const saveCalculation = useCallback(async (calculationData: RetirementCalculation) => {
    if (!session?.user) {
      console.log("saveCalculation: No session or user")
      toast.error("You must be logged in to save calculations")
      return false
    }

    console.log("saveCalculation: Starting save for user:", session.user.id)
    console.log("saveCalculation: Calculation data:", calculationData)

    setLoading(true)
    try {
      const response = await fetch("/api/retirement/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculationData),
      })

      const data = await response.json()

      console.log("saveCalculation: Response status:", response.status)
      console.log("saveCalculation: Response data:", data)

      if (response.ok) {
        setCalculations(prev => [data.calculation, ...prev])
        toast.success("Calculation saved successfully!")
        console.log("saveCalculation: Save successful, calculation added to state")
        return true
      } else {
        console.error("saveCalculation: API error:", data)
        toast.error(data.error || "Failed to save calculation")
        return false
      }
    } catch (error) {
      console.error("saveCalculation: Network error:", error)
      toast.error("Failed to save calculation")
      return false
    } finally {
      setLoading(false)
    }
  }, [session])

  // Update calculation (supports all calculation fields)
  const updateCalculation = useCallback(async (
    id: string,
    updates: Partial<RetirementCalculation>
  ) => {
    if (!session?.user) {
      toast.error("You must be logged in to update calculations")
      return false
    }

    console.log("updateCalculation: Starting update for calculation:", id)
    console.log("updateCalculation: Updates:", updates)

    setLoading(true)
    try {
      const response = await fetch(`/api/retirement/calculations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(updates),
      })

      console.log("updateCalculation: Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("updateCalculation: HTTP error response:", {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        })

        // Provide specific error messages based on status code
        if (response.status === 401) {
          toast.error("Please sign in to update calculations")
        } else if (response.status === 404) {
          toast.error("Calculation not found")
        } else if (response.status === 400) {
          toast.error(errorData.error || "Invalid data provided")
        } else {
          toast.error(errorData.error || "Failed to update calculation")
        }
        return false
      }

      const data = await response.json()
      console.log("updateCalculation: Response data:", data)

      if (data.calculation) {
        setCalculations(prev =>
          prev.map(calc => (calc.id === id ? data.calculation : calc))
        )
        toast.success("Calculation updated successfully")
        console.log("updateCalculation: Update successful")
        return true
      } else {
        toast.error("Failed to update calculation")
        return false
      }
    } catch (error) {
      console.error("updateCalculation: Network error:", error)

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else {
        toast.error("Failed to update calculation")
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [session])

  // Delete calculation with enhanced error handling
  const deleteCalculation = useCallback(async (id: string) => {
    if (!session?.user) {
      console.log("deleteCalculation: No session or user")
      toast.error("You must be logged in to delete calculations")
      return false
    }

    console.log("deleteCalculation: Starting delete for calculation:", {
      calculationId: id,
      userId: session.user.id,
      userEmail: session.user.email
    })

    setLoading(true)
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log("deleteCalculation: Request timeout, aborting...")
        controller.abort()
      }, 15000) // 15 second timeout

      const response = await fetch(`/api/retirement/calculations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log("deleteCalculation: Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (response.ok) {
        // Try to parse the response to verify it's valid JSON
        let responseData = null
        try {
          responseData = await response.json()
          console.log("deleteCalculation: Success response data:", responseData)
        } catch (parseError) {
          console.warn("deleteCalculation: Could not parse success response as JSON:", parseError)
          // Still proceed with deletion if response is ok but not JSON
        }

        // Update the UI by removing the calculation
        setCalculations(prev => {
          const updated = prev.filter(calc => calc.id !== id)
          console.log("deleteCalculation: Updated calculations list:", {
            originalCount: prev.length,
            newCount: updated.length,
            removedId: id
          })
          return updated
        })

        toast.success("Calculation deleted successfully")
        console.log("deleteCalculation: Delete successful")
        return true
      } else {
        // Enhanced error response handling
        let errorData = { error: "Unknown error" }
        let responseText = ""

        try {
          // Try to get response as text first
          responseText = await response.text()
          console.log("deleteCalculation: Raw error response text:", responseText)

          // Try to parse as JSON
          if (responseText) {
            errorData = JSON.parse(responseText)
          }
        } catch (parseError) {
          console.warn("deleteCalculation: Could not parse error response:", {
            parseError: parseError,
            responseText: responseText
          })
          errorData = { error: responseText || "Server returned an invalid response" }
        }

        console.error("deleteCalculation: HTTP error response:", {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          responseText: responseText
        })

        // Provide specific error messages based on status code
        let userMessage = "Failed to delete calculation"
        if (response.status === 401) {
          userMessage = "Please sign in to delete calculations"
        } else if (response.status === 404) {
          userMessage = "Calculation not found or you don't have permission to delete it"
        } else if (response.status === 400) {
          userMessage = "Invalid calculation ID"
        } else if (response.status >= 500) {
          userMessage = "Server error. Please try again later."
        } else {
          userMessage = errorData.error || "Failed to delete calculation"
        }

        toast.error(userMessage)
        return false
      }
    } catch (error) {
      console.error("deleteCalculation: Network/fetch error:", {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        name: error instanceof Error ? error.name : undefined
      })

      // Provide more specific error messages
      let userMessage = "Failed to delete calculation"
      if (error instanceof TypeError && error.message.includes('fetch')) {
        userMessage = "Network error. Please check your connection and try again."
      } else if (error instanceof Error && error.name === 'AbortError') {
        userMessage = "Request timed out. Please try again."
      } else if (error instanceof Error) {
        userMessage = `Error: ${error.message}`
      }

      toast.error(userMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [session])

  return {
    profile,
    calculations,
    loading,
    error,
    fetchProfile,
    saveProfile,
    fetchCalculations,
    saveCalculation,
    updateCalculation,
    deleteCalculation,
  }
} 