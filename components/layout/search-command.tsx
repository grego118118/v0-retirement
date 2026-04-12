"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Calculator,
  ShieldAlert,
  Shield,
  DollarSign,
  BookOpen,
  FileText,
  HelpCircle,
  Crown,
  Mail,
  Users,
  Search,
} from "lucide-react"

const pages = [
  { name: "Pension Calculator", href: "/calculator", icon: Calculator, group: "Tools" },
  { name: "SSFA Back-Pay Auditor", href: "/ssfa-auditor", icon: Shield, group: "Tools" },
  { name: "Tax Bomb Defuser", href: "/tax-bomb", icon: ShieldAlert, group: "Tools" },
  { name: "Social Security Calculator", href: "/social-security", icon: DollarSign, group: "Tools" },
  { name: "Retirement Wizard", href: "/wizard", icon: Calculator, group: "Tools" },
  { name: "Blog", href: "/blog", icon: BookOpen, group: "Resources" },
  { name: "Retirement Guides", href: "/guides", icon: FileText, group: "Resources" },
  { name: "Resource Library", href: "/resources", icon: FileText, group: "Resources" },
  { name: "FAQ", href: "/faq", icon: HelpCircle, group: "Resources" },
  { name: "Retirement Checklist", href: "/checklist", icon: FileText, group: "Resources" },
  { name: "COLA 2026 Guide", href: "/blog/massachusetts-cola-2026-complete-guide", icon: BookOpen, group: "Guides" },
  { name: "Pension Options A, B, C", href: "/blog/understanding-massachusetts-pension-options", icon: BookOpen, group: "Guides" },
  { name: "Social Security Fairness Act", href: "/blog/social-security-fairness-act-what-massachusetts-state-employees-need-to-know", icon: BookOpen, group: "Guides" },
  { name: "Retirement Groups 1-4", href: "/blog/massachusetts-retirement-groups-1-4-complete-guide", icon: Users, group: "Guides" },
  { name: "Pricing", href: "/pricing", icon: Crown, group: "Other" },
  { name: "About", href: "/about", icon: Users, group: "Other" },
  { name: "Contact", href: "/contact", icon: Mail, group: "Other" },
]

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const groups = [...new Set(pages.map((p) => p.group))]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        aria-label="Search (Ctrl+K)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-slate-600 bg-slate-800 px-1.5 font-mono text-[10px] text-slate-400">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, tools, guides..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group, i) => (
            <div key={group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {pages
                  .filter((p) => p.group === group)
                  .map((page) => {
                    const Icon = page.icon
                    return (
                      <CommandItem
                        key={page.href}
                        value={page.name}
                        onSelect={() => runCommand(page.href)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {page.name}
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
