"use client"

import { ReactNode, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock } from "lucide-react"
import Link from "next/link"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { logPremium } from "@/lib/utils/debug"
import { FREE_TIER_LIMITS } from "@/lib/stripe/config"

type PaywallVariant =
  | "saves_limit"
  | "ss_limit"
  | "wizard"
  | "pdf"
  | "multi_group"
  | "generic"

interface VariantCopy {
  badge: string
  title: string
  description: string
  highlight?: string
  primaryCta: string
}

const VARIANT_COPY: Record<PaywallVariant, VariantCopy> = {
  saves_limit: {
    badge: "You've hit your save limit",
    title: `${FREE_TIER_LIMITS.maxSavedCalculations} of ${FREE_TIER_LIMITS.maxSavedCalculations} free saves used`,
    description:
      "Your prior calculations are still here — start a 14-day free trial to save unlimited scenarios and compare them side-by-side.",
    highlight: "Most users save 5–8 scenarios before making a final retirement decision.",
    primaryCta: "Start 14-Day Free Trial",
  },
  ss_limit: {
    badge: "Unlock multi-scenario Social Security",
    title: "Compare more than one Social Security scenario",
    description:
      "You've used your free Social Security calculation. Premium unlocks unlimited scenarios so you can model early vs. full vs. delayed claiming — typical difference is $400–$1,200 /month.",
    highlight: "WEP/GPO impact on MA state employees can reduce SS by up to 50%. Model it before you file.",
    primaryCta: "Start 14-Day Free Trial",
  },
  wizard: {
    badge: "Full guided analysis",
    title: "The Combined Retirement Wizard is Premium",
    description:
      "The wizard walks you through pension, Social Security, taxes, and COLA in one guided flow — and flags optimizations most users miss on their first calculation.",
    highlight: "Covers Option A/B/C tradeoffs, WEP/GPO, and tax-withdrawal sequencing in ~8 minutes.",
    primaryCta: "Start 14-Day Free Trial",
  },
  pdf: {
    badge: "Professional PDF report",
    title: "Download your retirement report",
    description:
      "Premium generates a shareable PDF with your pension math, Social Security integration, COLA projections, and tax estimates — ready to hand to your spouse, CPA, or financial advisor.",
    highlight: "Most advisors charge $400+ to produce an equivalent retirement report.",
    primaryCta: "Start 14-Day Free Trial",
  },
  multi_group: {
    badge: "Multi-group career calculation",
    title: "You've run your free multi-group calculation",
    description:
      "Premium unlocks unlimited multi-group scenarios — MassPension is the only MA tool that correctly prorates benefits across career transitions between Groups 1–4.",
    highlight:
      "Example: 5 years Group 4 corrections + 30 years Group 2 mental health = combined 72.5% of average salary, not what either MSRB single-group calc would show.",
    primaryCta: "Start 14-Day Free Trial",
  },
  generic: {
    badge: "Premium Feature",
    title: "Unlock this feature",
    description:
      "Upgrade to Premium to unlock this feature and the complete MassPension toolkit.",
    primaryCta: "Start 14-Day Free Trial",
  },
}

interface PremiumGateProps {
  feature: string
  title?: string
  description?: string
  variant?: PaywallVariant
  children: ReactNode
  fallback?: ReactNode
  showPreview?: boolean
}

export function PremiumGate({
  feature,
  title,
  description,
  variant = "generic",
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

  const copy = VARIANT_COPY[variant] ?? VARIANT_COPY.generic
  const resolvedTitle = title ?? copy.title
  const resolvedDescription = description ?? copy.description

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
            {copy.badge}
          </Badge>
          <CardTitle className="text-xl">{resolvedTitle}</CardTitle>
          <CardDescription>{resolvedDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {showPreview && (
            <div className="opacity-50 pointer-events-none blur-[2px] select-none">
              {children}
            </div>
          )}
          <div className="space-y-3">
            {copy.highlight && (
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-md px-3 py-2">
                {copy.highlight}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              14-day free trial · No card charged today · Cancel anytime from your portal.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/pricing">
                  <Crown className="mr-2 h-4 w-4" />
                  {copy.primaryCta}
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