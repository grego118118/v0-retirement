/**
 * Simplified Navigation for Main Branch (Production-Ready Core Features)
 * Massachusetts Retirement System - Core Application
 */

'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Calculator, Home, User, BookOpen, Phone, HelpCircle, Info } from 'lucide-react'

export function MainBranchNavigation() {
  const { data: session } = useSession()

  const coreNavItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      description: 'Massachusetts Retirement System overview'
    },
    {
      name: 'Calculator',
      href: '/calculator',
      icon: Calculator,
      description: 'Basic pension calculator'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: User,
      description: 'Your retirement overview',
      requiresAuth: true
    },
    {
      name: 'Blog',
      href: '/blog',
      icon: BookOpen,
      description: 'Retirement planning insights'
    },
    {
      name: 'About',
      href: '/about',
      icon: Info,
      description: 'About the system'
    },
    {
      name: 'FAQ',
      href: '/faq',
      icon: HelpCircle,
      description: 'Frequently asked questions'
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: Phone,
      description: 'Get in touch'
    }
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                MA Retirement
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {coreNavItems.map((item) => {
                // Skip auth-required items if not logged in
                if (item.requiresAuth && !session) {
                  return null
                }

                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/account">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </Link>
                <Link href="/api/auth/signout">
                  <Button variant="outline" size="sm">
                    Sign Out
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/api/auth/signin">
                <Button size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {coreNavItems.map((item) => {
            if (item.requiresAuth && !session) {
              return null
            }

            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default MainBranchNavigation
