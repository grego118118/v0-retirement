"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { useSession } from "next-auth/react"
import Image from "next/image"
import {
  Calculator,
  LayoutDashboard,
  BookOpen,
  CreditCard,
  DollarSign,
  Wand2
} from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header
      className="sticky top-0 z-50 w-full mrs-glass shadow-lg"
      role="banner"
      aria-label="Site header"
      style={{ borderBottom: '1px solid var(--mrs-navy-200)' }}
    >
      <div className="mrs-page-wrapper">
        <div className="mrs-content-container flex h-14 items-center max-w-full overflow-x-hidden">
        <div className="mr-2 md:mr-4 flex min-w-0 flex-shrink-0">
          <Link
            href="/"
            className="mr-2 md:mr-6 flex items-center space-x-2 flex-shrink-0 group"
            aria-label="Massachusetts Pension Calculator - Home"
          >
            <div className="p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110" style={{ background: 'var(--mrs-gradient-primary)' }}>
              <Image
                src="/images/massachusetts-seal.svg"
                alt="Massachusetts State Seal"
                width={24}
                height={24}
                className="h-6 w-6 text-white"
              />
            </div>
            <span className="mrs-heading-3 text-sm md:text-base truncate font-semibold text-gray-800 dark:text-white">MA Pension</span>
          </Link>
          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center space-x-3 xl:space-x-4 text-sm font-medium"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link
              href="/calculator"
              className={`nav-link flex items-center gap-1.5 ${
                isActive("/calculator") ? "nav-link-active" : ""
              }`}
            >
              <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Calculator
            </Link>

            {session && (
              <>
                <Link
                  href="/wizard"
                  className={`nav-link flex items-center gap-1.5 ${
                    isActive("/wizard") ? "nav-link-active" : ""
                  }`}
                >
                  <Wand2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Retirement Wizard
                </Link>
                <Link
                  href="/dashboard"
                  className={`nav-link flex items-center gap-1.5 ${
                    isActive("/dashboard") ? "nav-link-active" : ""
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Dashboard
                </Link>
              </>
            )}
            <Link
              href="/blog"
              className={`nav-link flex items-center gap-1.5 ${
                isActive("/blog") ? "nav-link-active" : ""
              }`}
            >
              <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Blog
            </Link>

            {/* Dynamic Pricing/Billing Link */}
            {session ? (
              <Link
                href="/billing"
                className={`nav-link flex items-center gap-1.5 ${
                  isActive("/billing") ? "nav-link-active" : ""
                }`}
              >
                <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Billing
              </Link>
            ) : (
              <Link
                href="/pricing"
                className={`nav-link flex items-center gap-1.5 ${
                  isActive("/pricing") ? "nav-link-active" : ""
                }`}
              >
                <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Pricing
              </Link>
            )}
          </nav>

          {/* Mobile Navigation - Essential Links Only */}
          <nav
            className="flex lg:hidden items-center space-x-2 text-xs font-medium"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <Link
              href="/calculator"
              className={`nav-link-mobile flex items-center gap-1 ${
                isActive("/calculator") ? "nav-link-active" : ""
              }`}
            >
              <Calculator className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              Calc
            </Link>

            {session && (
              <>
                <Link
                  href="/wizard"
                  className={`nav-link-mobile flex items-center gap-1 ${
                    isActive("/wizard") ? "nav-link-active" : ""
                  }`}
                >
                  <Wand2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  Wizard
                </Link>
                <Link
                  href="/dashboard"
                  className={`nav-link-mobile flex items-center gap-1 ${
                    isActive("/dashboard") ? "nav-link-active" : ""
                  }`}
                >
                  <LayoutDashboard className="h-3 w-3 text-green-600 dark:text-green-400" />
                  Dashboard
                </Link>
              </>
            )}

            <Link
              href="/blog"
              className={`nav-link-mobile flex items-center gap-1 ${
                isActive("/blog") ? "nav-link-active" : ""
              }`}
            >
              <BookOpen className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              Blog
            </Link>

            {/* Dynamic Pricing/Billing Link - Mobile */}
            {session ? (
              <Link
                href="/billing"
                className={`nav-link-mobile flex items-center gap-1 ${
                  isActive("/billing") ? "nav-link-active" : ""
                }`}
              >
                <CreditCard className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                Billing
              </Link>
            ) : (
              <Link
                href="/pricing"
                className={`nav-link-mobile flex items-center gap-1 ${
                  isActive("/pricing") ? "nav-link-active" : ""
                }`}
              >
                <DollarSign className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                Pricing
              </Link>
            )}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          <ModeToggle />
          <UserMenu />
        </div>
        </div>
      </div>
    </header>
  )
}
