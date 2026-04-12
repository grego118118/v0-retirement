import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, ShieldAlert, Shield, DollarSign, ArrowRight } from "lucide-react"

const tools = [
  {
    slug: "calculator",
    title: "Pension Calculator",
    description: "Calculate your exact MA pension with official MSRB formulas for Groups 1-4.",
    href: "/calculator",
    icon: Calculator,
    color: "bg-blue-100 text-blue-600",
  },
  {
    slug: "tax-bomb",
    title: "Tax Bomb Defuser",
    description: "See if your new Social Security benefits will push you into a higher tax bracket.",
    href: "/tax-bomb",
    icon: ShieldAlert,
    color: "bg-red-100 text-red-600",
  },
  {
    slug: "ssfa-auditor",
    title: "SSFA Back-Pay Auditor",
    description: "Calculate your retroactive back-pay under the WEP/GPO repeal.",
    href: "/ssfa-auditor",
    icon: Shield,
    color: "bg-purple-100 text-purple-600",
  },
  {
    slug: "social-security",
    title: "Social Security Calculator",
    description: "Estimate your Social Security benefits alongside your MA state pension.",
    href: "/social-security",
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
  },
]

interface RelatedToolsProps {
  currentSlug: string
}

export function RelatedTools({ currentSlug }: RelatedToolsProps) {
  const related = tools.filter((t) => t.slug !== currentSlug)

  return (
    <section className="mt-16 border-t border-slate-200 pt-12">
      <h2 className="text-2xl md:text-3xl font-heading font-bold text-mrs-navy-900 mb-2 text-center">
        Related Tools
      </h2>
      <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto">
        Maximize your retirement benefits with our full suite of planning tools.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.slug} href={tool.href} className="group">
              <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-slate-200">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-mrs-navy-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
                  <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                    Try now <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
