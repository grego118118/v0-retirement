/**
 * Email Preferences Component
 * Allows users to manage their email notification preferences
 */

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, 
  Shield, 
  Settings, 
  Gift, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useEmailPreferences } from '@/hooks/use-email'
import { EmailPreferences, EMAIL_PREFERENCE_CATEGORIES } from '@/lib/email/email-preferences'

export function EmailPreferencesComponent() {
  const {
    isLoading,
    error,
    preferences,
    categories,
    updatePreference
  } = useEmailPreferences()

  const [localPreferences, setLocalPreferences] = useState<EmailPreferences | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences)
      setHasChanges(false)
    }
  }, [preferences])

  const handlePreferenceChange = async (
    preferenceId: keyof EmailPreferences, 
    enabled: boolean
  ) => {
    if (!localPreferences) return

    // Update local state immediately for responsive UI
    const newPreferences = {
      ...localPreferences,
      [preferenceId]: enabled
    }
    setLocalPreferences(newPreferences)
    setHasChanges(true)

    // Update on server
    const success = await updatePreference(preferenceId, enabled)
    
    if (success) {
      setHasChanges(false)
    } else {
      // Revert local change if server update failed
      setLocalPreferences(localPreferences)
      setHasChanges(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'essential':
        return <Shield className="h-4 w-4" />
      case 'account':
        return <Settings className="h-4 w-4" />
      case 'optional':
        return <Gift className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-600'
      case 'account':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-600'
      case 'optional':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-600'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-600'
    }
  }

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'essential':
        return 'Critical emails that cannot be disabled for security and account management'
      case 'account':
        return 'Important notifications about your account and service updates'
      case 'optional':
        return 'Optional emails you can choose to receive based on your preferences'
      default:
        return ''
    }
  }

  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.category]) {
      acc[category.category] = []
    }
    acc[category.category].push(category)
    return acc
  }, {} as Record<string, typeof categories>)

  if (isLoading && !localPreferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preferences
          </CardTitle>
          <CardDescription>
            Manage your email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading preferences...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Manage your email notification preferences. You can control which types of emails you receive from us.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load email preferences: {error}
            </AlertDescription>
          </Alert>
        )}

        {hasChanges && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your preferences are being updated...
            </AlertDescription>
          </Alert>
        )}

        {localPreferences && Object.entries(groupedCategories).map(([categoryName, categoryItems]) => (
          <div key={categoryName} className="space-y-4">
            <div className="flex items-center gap-3">
              {getCategoryIcon(categoryName)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold capitalize">{categoryName} Emails</h3>
                  <Badge variant="secondary" className={getCategoryColor(categoryName)}>
                    {(categoryItems as any[]).length} {(categoryItems as any[]).length === 1 ? 'type' : 'types'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getCategoryDescription(categoryName)}
                </p>
              </div>
            </div>

            <div className="space-y-3 ml-7">
              {(categoryItems as any[]).map((category: any) => (
                <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{category.label}</h4>
                      {!category.canDisable && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={(localPreferences as any)[category.id]}
                      onCheckedChange={(enabled) => handlePreferenceChange(category.id, enabled)}
                      disabled={!category.canDisable || isLoading}
                    />
                    {(localPreferences as any)[category.id] && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {categoryName !== 'optional' && <Separator />}
          </div>
        ))}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Important Notes</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Essential emails cannot be disabled for security and legal compliance</li>
            <li>• Changes take effect immediately</li>
            <li>• You can update these preferences at any time</li>
            <li>• Unsubscribe links are included in all optional emails</li>
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Last updated: {preferences ? new Date().toLocaleDateString() : 'Never'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
