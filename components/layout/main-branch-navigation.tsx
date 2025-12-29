/**
 * Simplified Navigation for Main Branch (Production-Ready Core Features)
 * Massachusetts Retirement System - Core Application
 */

'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Calculator, Home, User, BookOpen, Phone, HelpCircle, Info, FolderOpen, ChevronDown, TrendingUp, Users, FileText, Shield } from 'lucide-react'

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
      name: 'Resources',
      href: '/resources',
      icon: FolderOpen,
      description: 'Resource hub',
      hasDropdown: true,
      dropdownItems: [
        { name: 'All Resources', href: '/resources', icon: FolderOpen },
        { name: 'COLA Information', href: '/resources/cola', icon: TrendingUp },
        { name: 'Retirement Groups', href: '/resources/groups', icon: Users },
        { name: 'Pension Options', href: '/resources/options', icon: FileText },
        { name: 'WEP/GPO', href: '/resources/wep-gpo', icon: Shield },
      ]
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

                // Handle dropdown items
                if (item.hasDropdown && item.dropdownItems) {
                  return (
                    <DropdownMenu key={item.name}>
                      <DropdownMenuTrigger className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors outline-none">
                        <Icon className="h-4 w-4 mr-1" />
                        {item.name}
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {item.dropdownItems.map((dropdownItem, index) => {
                          const DropdownIcon = dropdownItem.icon
                          return (
                            <div key={dropdownItem.name}>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={dropdownItem.href}
                                  className="flex items-center gap-2 cursor-pointer"
                                  title={dropdownItem.name}
                                >
                                  <DropdownIcon className="h-4 w-4" />
                                  {dropdownItem.name}
                                </Link>
                              </DropdownMenuItem>
                              {index === 0 && <DropdownMenuSeparator />}
                            </div>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }

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

            // Handle dropdown items in mobile view
            if (item.hasDropdown && item.dropdownItems) {
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </div>
                  </Link>
                  {/* Mobile submenu items */}
                  <div className="pl-8 space-y-1">
                    {item.dropdownItems.slice(1).map((dropdownItem) => {
                      const DropdownIcon = dropdownItem.icon
                      return (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="block pl-3 pr-4 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <DropdownIcon className="h-3 w-3 mr-2" />
                            {dropdownItem.name}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

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
