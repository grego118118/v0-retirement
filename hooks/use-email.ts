/**
 * Email Hooks
 * React hooks for email functionality and preferences management
 */

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { EmailPreferences } from '@/lib/email/email-preferences'

export interface EmailSendOptions {
  template?: string
  templateData?: Record<string, any>
  to?: string | string[]
  subject?: string
  html?: string
  text?: string
  type?: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  provider?: string
  error?: string
}

export interface EmailStatus {
  configured: boolean
  provider: string
  limits: {
    hourly: number
    current: number
    remaining: number
  }
  supportedTemplates: string[]
}



/**
 * Hook for sending emails
 */
export function useEmail() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Check email service status
   */
  const checkStatus = useCallback(async (): Promise<EmailStatus | null> => {
    if (!session?.user) return null

    try {
      const response = await fetch('/api/email/send', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to check email status')
      }

      const statusData = await response.json()
      setStatus(statusData)
      setError(null)
      return statusData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    }
  }, [session])

  /**
   * Send email
   */
  const sendEmail = useCallback(async (options: EmailSendOptions): Promise<EmailSendResult> => {
    if (!session?.user) {
      throw new Error('Authentication required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      toast.success('Email sent successfully!')
      
      // Refresh status to update usage counts
      await checkStatus()

      return {
        success: true,
        messageId: result.messageId,
        provider: result.provider
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast.error(`Failed to send email: ${errorMessage}`)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [session, checkStatus])

  /**
   * Send template email
   */
  const sendTemplateEmail = useCallback(async (
    template: string,
    to: string | string[],
    templateData: Record<string, any>,
    type?: string
  ): Promise<EmailSendResult> => {
    return sendEmail({
      template,
      templateData,
      to,
      type
    })
  }, [sendEmail])

  /**
   * Check if user can send emails
   */
  const canSendEmail = useCallback((): boolean => {
    return Boolean(session?.user && status?.configured && status.limits.remaining > 0)
  }, [session, status])

  /**
   * Get remaining email count
   */
  const getRemainingCount = useCallback((): number => {
    return status?.limits.remaining || 0
  }, [status])

  // Load status on mount
  useEffect(() => {
    if (session?.user) {
      checkStatus()
    }
  }, [session, checkStatus])

  return {
    // State
    isLoading,
    error,
    status,

    // Actions
    sendEmail,
    sendTemplateEmail,
    checkStatus,

    // Utilities
    canSendEmail,
    getRemainingCount
  }
}



/**
 * Hook for email preferences management
 */
export function useEmailPreferences() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  /**
   * Load email preferences
   */
  const loadPreferences = useCallback(async () => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email/preferences', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to load email preferences')
      }

      const data = await response.json()
      setPreferences(data.preferences)
      setCategories(data.categories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Update all preferences
   */
  const updatePreferences = useCallback(async (newPreferences: EmailPreferences): Promise<boolean> => {
    if (!session?.user) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences: newPreferences })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update preferences')
      }

      setPreferences(result.preferences)
      toast.success('Email preferences updated successfully!')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast.error(`Failed to update preferences: ${errorMessage}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Update single preference
   */
  const updatePreference = useCallback(async (
    preference: keyof EmailPreferences, 
    enabled: boolean
  ): Promise<boolean> => {
    if (!session?.user) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preference, enabled })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update preference')
      }

      setPreferences(result.preferences)
      toast.success(result.message)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast.error(`Failed to update preference: ${errorMessage}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Load preferences on mount
  useEffect(() => {
    if (session?.user) {
      loadPreferences()
    }
  }, [session, loadPreferences])

  return {
    // State
    isLoading,
    error,
    preferences,
    categories,

    // Actions
    loadPreferences,
    updatePreferences,
    updatePreference
  }
}
