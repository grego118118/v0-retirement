import { Suspense } from "react"
import WidgetCalculator from "@/components/widget/widget-calculator"

interface PageProps {
  searchParams: Promise<{
    theme?: string
    accentColor?: string
    group?: string
    lockGroup?: string
    partner?: string
    ctaUrl?: string
    ctaText?: string
    branding?: string
    size?: string
  }>
}

function WidgetSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-[400px]" />
    </div>
  )
}

export default async function EmbedCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams

  const config = {
    theme: (params.theme as "light" | "dark" | "auto") || "auto",
    accentColor: params.accentColor,
    defaultGroup: params.group ? `GROUP_${params.group}` : undefined,
    lockGroup: params.lockGroup === "true",
    partnerId: params.partner,
    ctaUrl: params.ctaUrl,
    ctaText: params.ctaText,
    showBranding: params.branding !== "false",
    size: (params.size as "compact" | "standard" | "full") || "standard",
  }

  return (
    <div className="p-4 w-full max-w-md mx-auto">
      <Suspense fallback={<WidgetSkeleton />}>
        <WidgetCalculator config={config} />
      </Suspense>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: "Massachusetts Pension Calculator - Embed",
    description: "Estimate your Massachusetts public employee pension",
    robots: "noindex, nofollow",
  }
}

