"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import {
  Calculator,
  LayoutDashboard,
  BookOpen,
  CreditCard,
  DollarSign,
  Wand2,
  Menu,
  X,
  Crown
} from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    return pathname === path
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [pathname])

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

          {/* Mobile Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </Button>
        </div>
        <div className="ml-auto flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          <ModeToggle />

          {/* Premium Status Indicator */}
          {session && isPremium && subscriptionStatus === 'premium' && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium shadow-sm animate-pulse"
              title="Premium Member"
              aria-label="Premium subscription active"
              role="status"
            >
              <Crown className="h-3 w-3" />
              <span className="hidden sm:inline">Premium</span>
            </div>
          )}

          <UserMenu />
        </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300">
          <div
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out"
            id="mobile-navigation-menu"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg" style={{ background: 'var(--mrs-gradient-primary)' }}>
                  <Image
                    src="/images/massachusetts-seal.svg"
                    alt="Massachusetts State Seal"
                    width={20}
                    height={20}
                    className="h-5 w-5 text-white"
                  />
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">MA Pension</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>

            {/* Mobile Menu Content */}
            <nav className="flex flex-col p-4 space-y-2">
              <Link
                href="/calculator"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  isActive("/calculator") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Calculator</span>
              </Link>

              {session && (
                <>
                  <Link
                    href="/wizard"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      isActive("/wizard") ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium">Retirement Wizard</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      isActive("/dashboard") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </>
              )}

              <Link
                href="/blog"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  isActive("/blog") ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium">Blog</span>
              </Link>

              {/* Dynamic Pricing/Billing Link */}
              {session ? (
                <Link
                  href="/billing"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isActive("/billing") ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium">Billing</span>
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isActive("/pricing") ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium">Pricing</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
