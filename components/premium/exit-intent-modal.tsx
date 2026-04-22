"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Crown } from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"

const SESSION_KEY = "masspension_exit_intent_shown"
const PROMO_CODE = "STAY20"

/**
 * Shows once per browser session when a free user's cursor leaves the top
 * of the viewport (typical close-tab intent). Offers a 20% promo code
 * (STAY20) redeemable at checkout via allow_promotion_codes. Premium
 * users and users who've already dismissed the modal this session are
 * excluded.
 */
export function ExitIntentModal() {
  const { isPremium } = useSubscriptionStatus()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (isPremium) return
    if (sessionStorage.getItem(SESSION_KEY) === "1") return

    // Arm only after a short dwell so we don't fire on accidental top-nav hovers
    let armed = false
    const dwellTimer = window.setTimeout(() => {
      armed = true
    }, 5000)

    const handleMouseLeave = (event: MouseEvent) => {
      if (!armed) return
      if (event.clientY > 10) return
      if (sessionStorage.getItem(SESSION_KEY) === "1") return
      sessionStorage.setItem(SESSION_KEY, "1")
      setOpen(true)
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.clearTimeout(dwellTimer)
    }
  }, [isPremium])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE)
    } catch (error) {
      console.warn("Failed to copy promo code:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <Badge className="w-fit mb-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Sparkles className="mr-1 h-3 w-3" />
            Before you go
          </Badge>
          <DialogTitle className="text-2xl">
            20% off your first month of Premium
          </DialogTitle>
          <DialogDescription>
            Start the 14-day free trial today and use promo code{" "}
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center font-mono font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 rounded px-2 py-0.5 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
              aria-label="Copy promo code STAY20"
            >
              {PROMO_CODE}
            </button>{" "}
            at checkout for 20% off your first month if you continue past the trial.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground space-y-2">
          <p>
            Premium unlocks unlimited saves, the multi-group career
            calculator, Social Security + WEP/GPO optimization, and
            professional PDF reports.
          </p>
          <p className="text-xs">
            No card charged during your 14-day trial · Cancel anytime.
          </p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            No thanks
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/pricing" onClick={() => setOpen(false)}>
              <Crown className="mr-2 h-4 w-4" />
              Start Free Trial
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
