"use client"

import { ReactNode, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock } from "lucide-react"
import Link from "next/link"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { logPremium } from "@/lib/utils/debug"

interface PremiumGateProps {
  feature: string
  title: string
  description: string
  children: ReactNode
  fallback?: ReactNode
  showPreview?: boolean
}

export function PremiumGate({
  feature,
  title,
  description,
  children,
  fallback,
  showPreview = false
}: PremiumGateProps) {
  const { upgradeRequired, isPremium, subscriptionStatus } = useSubscriptionStatus()
  const lastDecisionRef = useRef<boolean | null>(null)

  const isUpgradeRequired = upgradeRequired(feature)

  // Only log when decision changes
  if (lastDecisionRef.current !== isUpgradeRequired) {
    logPremium(`Access decision for ${feature}`, {
      hasAccess: isPremium,
      subscriptionStatus,
      action: isUpgradeRequired ? 'showing_upgrade_prompt' : 'showing_premium_content'
    })
    lastDecisionRef.current = isUpgradeRequired
  }

  if (!isUpgradeRequired) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" />
      <div className="relative">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <Badge variant="secondary" className="mx-auto mb-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Lock className="mr-1 h-3 w-3" />
            Premium Feature
          </Badge>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {showPreview && (
            <div className="opacity-50 pointer-events-none">
              {children}
            </div>
          )}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upgrade to Premium to unlock this feature and many more advanced retirement planning tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/subscribe">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">View All Features</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

// Simplified version for inline use
interface PremiumBadgeProps {
  feature: string
  children: ReactNode
}

export function PremiumBadge({ feature, children }: PremiumBadgeProps) {
  const { upgradeRequired, isPremium, subscriptionStatus } = useSubscriptionStatus()
  const lastDecisionRef = useRef<boolean | null>(null)

  const isUpgradeRequired = upgradeRequired(feature)

  // Only log when decision changes
  if (lastDecisionRef.current !== isUpgradeRequired) {
    logPremium(`Badge decision for ${feature}`, {
      hasAccess: isPremium,
      subscriptionStatus,
      action: isUpgradeRequired ? 'showing_premium_badge' : 'showing_premium_content'
    })
    lastDecisionRef.current = isUpgradeRequired
  }

  if (!isUpgradeRequired) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 opacity-50 rounded-md" />
      <div className="relative opacity-50 pointer-events-none">
        {children}
      </div>
      <Badge className="absolute -top-2 -right-2 bg-amber-500 hover:bg-amber-600">
        <Crown className="mr-1 h-3 w-3" />
        Premium
      </Badge>
    </div>
  )
} 