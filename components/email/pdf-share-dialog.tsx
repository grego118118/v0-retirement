/**
 * PDF Share Dialog Component
 * Allows users to share PDF reports via email
 */

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Share2, 
  Mail, 
  Plus, 
  X, 
  Loader2, 
  Crown,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { usePDFShare } from '@/hooks/use-email'
import { useSubscriptionStatus } from '@/hooks/use-subscription'

export interface PDFShareDialogProps {
  pdfData: any
  pdfType: 'pension' | 'tax' | 'wizard' | 'combined'
  reportTitle?: string
  trigger?: React.ReactNode
  className?: string
}

export function PDFShareDialog({
  pdfData,
  pdfType,
  reportTitle,
  trigger,
  className
}: PDFShareDialogProps) {
  const { upgradeRequired } = useSubscriptionStatus()
  const {
    isSharing,
    error,
    shareStatus,
    sharePDF,
    canSharePDF,
    needsUpgrade
  } = usePDFShare()

  const [isOpen, setIsOpen] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([''])
  const [message, setMessage] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const isPremiumRequired = upgradeRequired('pdf_reports') || needsUpgrade()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const addRecipient = () => {
    const email = emailInput.trim()
    
    if (!email) {
      setValidationErrors(['Please enter an email address'])
      return
    }

    if (!validateEmail(email)) {
      setValidationErrors(['Please enter a valid email address'])
      return
    }

    if (recipients.includes(email)) {
      setValidationErrors(['This email address is already added'])
      return
    }

    if (recipients.filter(r => r).length >= 5) {
      setValidationErrors(['Maximum 5 recipients allowed'])
      return
    }

    setRecipients([...recipients.filter(r => r), email])
    setEmailInput('')
    setValidationErrors([])
  }

  const removeRecipient = (index: number) => {
    const newRecipients = recipients.filter((_, i) => i !== index)
    if (newRecipients.length === 0) {
      setRecipients([''])
    } else {
      setRecipients(newRecipients)
    }
  }

  const handleShare = async () => {
    const validRecipients = recipients.filter(email => email && validateEmail(email))
    
    if (validRecipients.length === 0) {
      setValidationErrors(['Please add at least one valid email address'])
      return
    }

    setValidationErrors([])

    const result = await sharePDF({
      recipients: validRecipients,
      message: message.trim(),
      pdfData,
      pdfType,
      reportTitle: reportTitle || `${pdfType.charAt(0).toUpperCase() + pdfType.slice(1)} Report`
    })

    if (result.success) {
      setIsOpen(false)
      setRecipients([''])
      setMessage('')
      setEmailInput('')
    }
  }

  const getReportTypeLabel = () => {
    switch (pdfType) {
      case 'pension':
        return 'Pension Calculation Report'
      case 'tax':
        return 'Tax Implications Report'
      case 'wizard':
        return 'Retirement Planning Report'
      case 'combined':
        return 'Comprehensive Retirement Report'
      default:
        return 'Retirement Report'
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={className}>
      <Share2 className="h-4 w-4 mr-2" />
      Share via Email
      {isPremiumRequired && <Crown className="h-3 w-3 ml-2" />}
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share {getReportTypeLabel()}
          </DialogTitle>
          <DialogDescription>
            Send your retirement calculation report to family, friends, or financial advisors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Premium requirement notice */}
          {isPremiumRequired && (
            <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-600">
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Premium Feature:</span> PDF sharing requires a Premium subscription.{" "}
                <Button variant="link" className="p-0 h-auto text-amber-800 underline" onClick={() => window.open('/subscribe', '_blank')}>
                  Upgrade now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Usage limits */}
          {shareStatus && !isPremiumRequired && (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  {shareStatus.limits.remaining} of {shareStatus.limits.hourly} shares remaining this hour
                </span>
              </div>
            </div>
          )}

          {/* Email recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Email Recipients (max 5)</Label>
            
            {/* Current recipients */}
            {recipients.filter(r => r).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {recipients.filter(r => r).map((email, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      onClick={() => removeRecipient(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add new recipient */}
            <div className="flex gap-2">
              <Input
                id="recipients"
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                disabled={isPremiumRequired || isSharing}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRecipient}
                disabled={isPremiumRequired || isSharing || recipients.filter(r => r).length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Personal message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to include with the report..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isPremiumRequired || isSharing}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/500 characters
            </div>
          </div>

          {/* Report info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Report Details</h4>
            <p className="text-sm text-muted-foreground">
              <strong>Type:</strong> {getReportTypeLabel()}<br />
              <strong>Title:</strong> {reportTitle || `${pdfType.charAt(0).toUpperCase() + pdfType.slice(1)} Report`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSharing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={
              isPremiumRequired || 
              isSharing || 
              recipients.filter(r => r && validateEmail(r)).length === 0 ||
              !canSharePDF()
            }
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
