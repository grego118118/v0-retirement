"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { useSession } from "next-auth/react"
import Image from "next/image"

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
              className={`px-4 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                isActive("/calculator")
                  ? "text-white shadow-md"
                  : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
              }`}
              style={isActive("/calculator") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
            >
              Calculator
            </Link>

            {session && (
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive("/dashboard")
                    ? "text-white shadow-md"
                    : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
                }`}
                style={isActive("/dashboard") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                isActive("/blog")
                  ? "text-white shadow-md"
                  : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
              }`}
              style={isActive("/blog") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
            >
              Blog
            </Link>

            {/* Dynamic Pricing/Billing Link */}
            {session ? (
              <Link
                href="/billing"
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive("/billing")
                    ? "text-white shadow-md"
                    : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
                }`}
                style={isActive("/billing") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
              >
                Billing
              </Link>
            ) : (
              <Link
                href="/pricing"
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive("/pricing")
                    ? "text-white shadow-md"
                    : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
                }`}
                style={isActive("/pricing") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
              >
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
              className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap text-xs ${
                isActive("/calculator")
                  ? "text-white shadow-md"
                  : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
              }`}
              style={isActive("/calculator") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
            >
              Calc
            </Link>

            {session && (
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap text-xs ${
                  isActive("/dashboard")
                    ? "text-white shadow-md"
                    : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
                }`}
                style={isActive("/dashboard") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
              >
                Dashboard
              </Link>
            )}

            <Link
              href="/blog"
              className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap text-xs ${
                isActive("/blog")
                  ? "text-white shadow-md"
                  : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
              }`}
              style={isActive("/blog") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
            >
              Blog
            </Link>

            {/* Dynamic Pricing/Billing Link - Mobile */}
            {session ? (
              <Link
                href="/billing"
                className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap text-xs ${
                  isActive("/billing")
                    ? "text-white shadow-md"
                    : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
                }`}
                style={isActive("/billing") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
              >
                Billing
              </Link>
            ) : (
              <Link
                href="/pricing"
                className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap text-xs ${
                  isActive("/pricing")
                    ? "text-white shadow-md"
                    : "text-gray-700 dark:text-gray-200 hover:text-white hover:shadow-md"
                }`}
                style={isActive("/pricing") ? { background: 'var(--mrs-gradient-primary)' } : { background: 'transparent' }}
              >
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
