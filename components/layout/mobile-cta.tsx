"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Calculator, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

const HIDDEN_PATHS = ["/calculator", "/pricing", "/subscribe", "/embed", "/dashboard", "/wizard"]

export function MobileCTA() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isHidden = HIDDEN_PATHS.some((p) => pathname?.startsWith(p))
  if (isHidden) return null

  const isPremium = (session?.user as any)?.subscriptionStatus === "active"
  if (isPremium) return null

  const isAuthenticated = !!session?.user

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-3 safe-area-pb dark:bg-slate-900/95 dark:border-slate-700">
      {isAuthenticated ? (
        <Button asChild className="w-full bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 hover:from-mrs-gold-600 hover:to-mrs-gold-700 text-white font-bold rounded-xl h-12">
          <Link href="/pricing">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </Link>
        </Button>
      ) : (
        <Button asChild className="w-full bg-mrs-navy-900 hover:bg-mrs-navy-800 text-white font-bold rounded-xl h-12">
          <Link href="/calculator">
            <Calculator className="mr-2 h-4 w-4" />
            Try Calculator Free
          </Link>
        </Button>
      )}
    </div>
  )
}
