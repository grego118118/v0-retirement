"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { useSession } from "next-auth/react"
import { Crown } from "lucide-react"

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
      <div className="container flex h-16 items-center max-w-full overflow-x-hidden">
        <div className="mr-2 md:mr-4 flex min-w-0 flex-shrink-0">
          <Link
            href="/"
            className="mr-2 md:mr-6 flex items-center space-x-2 flex-shrink-0 group"
            aria-label="Massachusetts Pension Calculator - Home"
          >
            <div className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110" style={{ background: 'var(--mrs-gradient-primary)' }}>
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span className="mrs-heading-3 text-sm md:text-base truncate">MA Pension</span>
          </Link>
          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-sm font-medium"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link
              href="/calculator"
              className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                isActive("/calculator")
                  ? "text-white shadow-md"
                  : "text-gray-700 hover:text-white hover:shadow-md"
              }`}
              style={isActive("/calculator") ? { background: 'var(--mrs-gradient-primary)' } : {}}
            >
              Calculator
            </Link>
            <Link
              href="/social-security"
              className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                isActive("/social-security")
                  ? "text-white shadow-md"
                  : "text-gray-700 hover:text-white hover:shadow-md"
              }`}
              style={isActive("/social-security") ? { background: 'var(--mrs-gradient-primary)' } : {}}
            >
              Social Security
            </Link>
            <Link
              href="/tax-calculator"
              className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                isActive("/tax-calculator")
                  ? "text-white shadow-md"
                  : "text-gray-700 hover:text-white hover:shadow-md"
              }`}
              style={isActive("/tax-calculator") ? { background: 'var(--mrs-gradient-primary)' } : {}}
            >
              Tax Calculator
            </Link>
            <Link
              href="/wizard"
              className={`px-3 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap ${
                isActive("/wizard")
                  ? "text-white shadow-md"
                  : "text-gray-700 hover:text-white hover:shadow-md"
              }`}
              style={isActive("/wizard") ? { background: 'var(--mrs-gradient-primary)' } : {}}
            >
              Wizard
            </Link>
            {session && (
              <>
                <Link
                  href="/scenarios"
                  className={`transition-colors hover:text-foreground/80 whitespace-nowrap ${
                    isActive("/scenarios") ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  Scenarios
                </Link>
                <Link
                  href="/dashboard"
                  className={`transition-colors hover:text-foreground/80 whitespace-nowrap ${
                    isActive("/dashboard") ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
            <Link
              href="/blog"
              className={`transition-colors hover:text-foreground/80 whitespace-nowrap ${
                isActive("/blog") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* Mobile Navigation - Essential Links Only */}
          <nav
            className="flex lg:hidden items-center space-x-2 text-xs font-medium"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <Link
              href="/calculator"
              className={`transition-colors hover:text-foreground/80 whitespace-nowrap ${
                isActive("/calculator") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Calc
            </Link>
            <Link
              href="/wizard"
              className={`transition-colors hover:text-foreground/80 whitespace-nowrap ${
                isActive("/wizard") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Wizard
            </Link>
            {session && (
              <>
                <Link
                  href="/scenarios"
                  className={`transition-colors hover:text-foreground/80 whitespace-nowrap ${
                    isActive("/scenarios") ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  Scenarios
                </Link>
                <Link
                  href="/dashboard"
                  className={`transition-colors hover:text-foreground/80 whitespace-nowrap ${
                    isActive("/dashboard") ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
