"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const pathname = usePathname()

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
              href="/resources"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/resources") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Resources
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
              href="/faq"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/faq") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/about") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/contact") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <Button size="sm" asChild>
            <Link href="/calculator">Start Calculation</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
