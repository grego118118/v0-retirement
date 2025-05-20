"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useSimpleAuth } from "@/components/auth/simple-auth-context"

export function SimpleHeader() {
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, loginWithGoogle, logout } = useSimpleAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">MA Pension Estimator</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/calculator"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/calculator") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Calculator
            </Link>
            <Link
              href="/blog"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/blog") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/about"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/about") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              About
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : isAuthenticated ? (
            <>
              <span className="text-sm">Hello, {user?.name || user?.email?.split("@")[0] || "User"}</span>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => loginWithGoogle()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
