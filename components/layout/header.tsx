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
  Crown,
  FolderOpen,
  ChevronDown,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Bot
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { SearchCommand } from "@/components/layout/search-command"

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
      className="sticky top-0 z-50 w-full bg-mrs-navy-900 border-b border-mrs-gold-600/30 shadow-lg"
      role="banner"
      aria-label="Site header"
    >
      <div className="mrs-page-wrapper">
        <div className="mrs-content-container flex h-14 items-center max-w-full">
          <div className="mr-2 md:mr-4 flex min-w-0 flex-shrink-0">
            <Link
              href="/"
              className="mr-2 md:mr-6 flex items-center space-x-2 flex-shrink-0 group"
              aria-label="Massachusetts Pension Calculator - Home"
            >
              <div className="transition-all duration-300 group-hover:scale-110">
                <Image
                  src="/images/icon.svg"
                  alt="Mass Pension Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <span className="mrs-heading-3 text-sm md:text-base truncate font-semibold text-white">Mass Pension</span>
            </Link>
            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center space-x-3 xl:space-x-4 text-sm font-medium"
              role="navigation"
              aria-label="Main navigation"
            >
              <Link
                href="/calculator"
                className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/calculator") ? "text-white bg-white/10" : ""
                  }`}
              >
                <Calculator className="h-4 w-4 text-mrs-gold-500" />
                Calculator
              </Link>

              {session && (
                <>
                  <Link
                    href="/wizard"
                    className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/wizard") ? "text-white bg-white/10" : ""
                      }`}
                  >
                    <Wand2 className="h-4 w-4 text-purple-400" />
                    Retirement Wizard
                  </Link>

                  <Link
                    href="/chatbot"
                    className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/chatbot") ? "text-white bg-white/10" : ""
                      }`}
                  >
                    <Bot className="h-4 w-4 text-pink-400" />
                    Assistant
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/dashboard") ? "text-white bg-white/10" : ""
                      }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-green-400" />
                    Dashboard
                  </Link>
                </>
              )}

              <Link
                href="/ssfa-auditor"
                className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/ssfa-auditor") ? "text-white bg-white/10" : ""
                  }`}
              >
                <Shield className="h-4 w-4 text-cyan-400" />
                SSFA Auditor
              </Link>

              <Link
                href="/tax-bomb"
                className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/tax-bomb") ? "text-white bg-white/10" : ""
                  }`}
              >
                <TrendingUp className="h-4 w-4 text-red-400" />
                Tax Bomb
              </Link>

              <Link
                href="/blog"
                className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/blog") ? "text-white bg-white/10" : ""
                  }`}
              >
                <BookOpen className="h-4 w-4 text-orange-400" />
                Blog
              </Link>

              <Link
                href="/about"
                className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/about") ? "text-white bg-white/10" : ""
                  }`}
              >
                <Users className="h-4 w-4 text-blue-400" />
                About
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger suppressHydrationWarning className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 outline-none ${pathname?.startsWith("/resources") ? "text-white bg-white/10" : ""
                  }`}>
                  <FolderOpen className="h-4 w-4 text-teal-400" />
                  Resources
                  <ChevronDown className="h-3 w-3 ml-0.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-mrs-navy-800 border-mrs-navy-700 text-white">
                  <DropdownMenuItem asChild className="focus:bg-mrs-navy-700 focus:text-white">
                    <Link href="/resources" className="flex items-center gap-2 cursor-pointer">
                      <FolderOpen className="h-4 w-4 text-teal-400" />
                      All Resources
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-mrs-navy-700" />
                  <DropdownMenuItem asChild className="focus:bg-mrs-navy-700 focus:text-white">
                    <Link href="/resources/cola" className="flex items-center gap-2 cursor-pointer">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      COLA Information
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-mrs-navy-700 focus:text-white">
                    <Link href="/resources/groups" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4 text-blue-400" />
                      Retirement Groups
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-mrs-navy-700 focus:text-white">
                    <Link href="/resources/options" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-purple-400" />
                      Pension Options
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-mrs-navy-700 focus:text-white">
                    <Link href="/resources/wep-gpo" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4 text-orange-400" />
                      WEP/GPO
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dynamic Pricing/Billing Link */}
              {session ? (
                <Link
                  href="/billing"
                  className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/billing") ? "text-white bg-white/10" : ""
                    }`}
                >
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  Billing
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className={`nav-link text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 ${isActive("/pricing") ? "text-white bg-white/10" : ""
                    }`}
                >
                  <DollarSign className="h-4 w-4 text-mrs-gold-400" />
                  Pricing
                </Link>
              )}
            </nav>

            {/* Mobile Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="ml-auto flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            <SearchCommand />
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
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-mrs-navy-900 border-l border-mrs-gold-600/30 shadow-2xl transform transition-transform duration-300 ease-in-out"
            id="mobile-navigation-menu"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-mrs-navy-800 bg-mrs-navy-900">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg shadow-sm">
                  <Image
                    src="/images/icon.svg"
                    alt="Mass Pension Logo"
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                </div>
                <span className="font-semibold text-white">Mass Pension</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
                className="p-2 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Menu Content */}
            <nav className="flex flex-col p-4 space-y-2 bg-mrs-navy-900 max-h-[calc(100vh-64px)] overflow-y-auto">
              <Link
                href="/calculator"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/calculator")
                  ? "bg-white/10 text-white shadow-sm border border-mrs-gold-500/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Calculator className="h-5 w-5 text-mrs-gold-500 flex-shrink-0" />
                <span className="font-medium">Calculator</span>
              </Link>

              {session && (
                <>
                  <Link
                    href="/wizard"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/wizard")
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <Wand2 className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <span className="font-medium">Retirement Wizard</span>
                  </Link>

                  <Link
                    href="/chatbot"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/chatbot")
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <Bot className="h-5 w-5 text-pink-400 flex-shrink-0" />
                    <span className="font-medium">Assistant</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/dashboard")
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <LayoutDashboard className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </>
              )}

              <Link
                href="/ssfa-auditor"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/ssfa-auditor")
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Shield className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                <span className="font-medium">SSFA Auditor</span>
              </Link>

              <Link
                href="/tax-bomb"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/tax-bomb")
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <TrendingUp className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="font-medium">Tax Bomb Auditor</span>
              </Link>

              <Link
                href="/blog"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/blog")
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <BookOpen className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <span className="font-medium">Blog</span>
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/about")
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Users className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="font-medium">About</span>
              </Link>

              {/* Resources Section */}
              <div className="pt-2">
                <Link
                  href="/resources"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${pathname === "/resources"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <FolderOpen className="h-5 w-5 text-teal-400 flex-shrink-0" />
                  <span className="font-medium">Resources</span>
                </Link>
                {/* Resources Sub-items */}
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-mrs-navy-700 pl-3">
                  <Link
                    href="/resources/cola"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    COLA Information
                  </Link>
                  <Link
                    href="/resources/groups"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <Users className="h-4 w-4 text-blue-400" />
                    Retirement Groups
                  </Link>
                  <Link
                    href="/resources/options"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <FileText className="h-4 w-4 text-purple-400" />
                    Pension Options
                  </Link>
                  <Link
                    href="/resources/wep-gpo"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <Shield className="h-4 w-4 text-orange-400" />
                    WEP/GPO
                  </Link>
                </div>
              </div>

              {/* Dynamic Pricing/Billing Link */}
              {session ? (
                <Link
                  href="/billing"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/billing")
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <CreditCard className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span className="font-medium">Billing</span>
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 min-h-[48px] ${isActive("/pricing")
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <DollarSign className="h-5 w-5 text-mrs-gold-400 flex-shrink-0" />
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

