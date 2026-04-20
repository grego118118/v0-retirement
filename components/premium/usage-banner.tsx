"use client"

import Link from "next/link"
import { AlertCircle, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

type UsageFeature = "saves" | "social_security" | "multi_group"

interface UsageBannerProps {
  feature: UsageFeature
  currentUsage: number
  limit: number
  className?: string
}

const FEATURE_COPY: Record<UsageFeature, { name: string; cta: string }> = {
  saves: {
    name: "saved calculation",
    cta: "Unlock unlimited saves",
  },
  social_security: {
    name: "Social Security calculation",
    cta: "Unlock unlimited SS scenarios",
  },
  multi_group: {
    name: "multi-group calculation",
    cta: "Unlock unlimited multi-group scenarios",
  },
}

export function UsageBanner({
  feature,
  currentUsage,
  limit,
  className,
}: UsageBannerProps) {
  if (limit <= 0 || currentUsage < limit - 1) {
    return null
  }

  const atLimit = currentUsage >= limit
  const copy = FEATURE_COPY[feature]

  return (
    <Alert
      className={`border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/40 ${className ?? ""}`}
    >
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-900 dark:text-amber-200">
        <span className="text-sm">
          {atLimit ? (
            <>
              <strong>
                {currentUsage} of {limit} free {copy.name}s used.
              </strong>{" "}
              Start a free trial to continue.
            </>
          ) : (
            <>
              <strong>Last free {copy.name} remaining.</strong> Start a free
              trial to keep going without limits.
            </>
          )}
        </span>
        <Button
          asChild
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
        >
          <Link href="/pricing">
            <Crown className="mr-2 h-3 w-3" />
            {copy.cta}
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
