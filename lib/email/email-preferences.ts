/**
 * Email Preferences Management
 * Handles user email notification preferences
 */

export interface EmailPreferences {
  welcome: boolean
  passwordReset: boolean
  subscriptionChanges: boolean
  calculationResults: boolean
  systemMaintenance: boolean
  productUpdates: boolean
  marketingEmails: boolean
  weeklyDigest: boolean
  monthlyReport: boolean
}

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  welcome: true,
  passwordReset: true,
  subscriptionChanges: true,
  calculationResults: true,
  systemMaintenance: true,
  productUpdates: true,
  marketingEmails: false,
  weeklyDigest: false,
  monthlyReport: false
}

export interface EmailPreferenceCategory {
  id: keyof EmailPreferences
  label: string
  description: string
  category: 'essential' | 'account' | 'optional'
  canDisable: boolean
}

export const EMAIL_PREFERENCE_CATEGORIES: EmailPreferenceCategory[] = [
  {
    id: 'welcome',
    label: 'Welcome Emails',
    description: 'Receive welcome emails when you create an account',
    category: 'essential',
    canDisable: false
  },
  {
    id: 'passwordReset',
    label: 'Password Reset',
    description: 'Receive emails when you request a password reset',
    category: 'essential',
    canDisable: false
  },
  {
    id: 'subscriptionChanges',
    label: 'Subscription Changes',
    description: 'Notifications about subscription upgrades, downgrades, and cancellations',
    category: 'essential',
    canDisable: false
  },
  {
    id: 'calculationResults',
    label: 'Calculation Results',
    description: 'Receive your retirement calculation results via email',
    category: 'account',
    canDisable: true
  },
  {
    id: 'systemMaintenance',
    label: 'System Maintenance',
    description: 'Important notifications about system maintenance and outages',
    category: 'account',
    canDisable: true
  },
  {
    id: 'productUpdates',
    label: 'Product Updates',
    description: 'Learn about new features and improvements',
    category: 'optional',
    canDisable: true
  },
  {
    id: 'marketingEmails',
    label: 'Marketing Emails',
    description: 'Promotional emails and special offers',
    category: 'optional',
    canDisable: true
  },
  {
    id: 'weeklyDigest',
    label: 'Weekly Digest',
    description: 'Weekly summary of your retirement planning progress',
    category: 'optional',
    canDisable: true
  },
  {
    id: 'monthlyReport',
    label: 'Monthly Report',
    description: 'Monthly retirement planning insights and tips',
    category: 'optional',
    canDisable: true
  }
]

/**
 * Check if user has opted in to receive a specific type of email
 */
export function canSendEmail(
  preferences: Partial<EmailPreferences> | null,
  emailType: keyof EmailPreferences
): boolean {
  // If no preferences set, use defaults
  if (!preferences) {
    return DEFAULT_EMAIL_PREFERENCES[emailType]
  }

  // Check if preference is explicitly set
  if (preferences[emailType] !== undefined) {
    return preferences[emailType]!
  }

  // Fall back to default
  return DEFAULT_EMAIL_PREFERENCES[emailType]
}

/**
 * Validate email preferences object
 */
export function validateEmailPreferences(
  preferences: Partial<EmailPreferences>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check that essential emails cannot be disabled
  const essentialTypes = EMAIL_PREFERENCE_CATEGORIES
    .filter(cat => !cat.canDisable)
    .map(cat => cat.id)

  for (const essentialType of essentialTypes) {
    if (preferences[essentialType] === false) {
      errors.push(`${essentialType} emails cannot be disabled`)
    }
  }

  // Validate boolean values
  for (const [key, value] of Object.entries(preferences)) {
    if (typeof value !== 'boolean') {
      errors.push(`${key} must be a boolean value`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Merge user preferences with defaults
 */
export function mergeWithDefaults(
  userPreferences: Partial<EmailPreferences> | null
): EmailPreferences {
  return {
    ...DEFAULT_EMAIL_PREFERENCES,
    ...userPreferences
  }
}

/**
 * Get preferences by category
 */
export function getPreferencesByCategory(
  preferences: EmailPreferences
): Record<string, { preference: EmailPreferenceCategory; enabled: boolean }[]> {
  const categorized: Record<string, { preference: EmailPreferenceCategory; enabled: boolean }[]> = {
    essential: [],
    account: [],
    optional: []
  }

  for (const preference of EMAIL_PREFERENCE_CATEGORIES) {
    categorized[preference.category].push({
      preference,
      enabled: preferences[preference.id]
    })
  }

  return categorized
}

/**
 * Create unsubscribe token for email preferences
 */
export function createUnsubscribeToken(userId: string, emailType: keyof EmailPreferences): string {
  // In a real implementation, this would be a signed JWT or encrypted token
  // For now, we'll use a simple base64 encoding (not secure for production)
  const data = JSON.stringify({ userId, emailType, timestamp: Date.now() })
  return Buffer.from(data).toString('base64url')
}

/**
 * Parse unsubscribe token
 */
export function parseUnsubscribeToken(token: string): { userId: string; emailType: keyof EmailPreferences } | null {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64url').toString())
    
    // Check if token is not too old (30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    if (data.timestamp < thirtyDaysAgo) {
      return null
    }

    return {
      userId: data.userId,
      emailType: data.emailType
    }
  } catch {
    return null
  }
}
