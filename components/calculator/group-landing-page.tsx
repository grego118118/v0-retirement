"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, Users, Clock, DollarSign, CheckCircle, ArrowRight, 
  BookOpen, TrendingUp, Shield, FileText, Info, AlertCircle
} from "lucide-react"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"

export interface GroupInfo {
  group: "1" | "2" | "3" | "4"
  name: string
  shortName: string
  description: string
  minAge: number
  minService: number
  multiplierRange: string
  maxBenefit: string
  eligibilityNote: string
  examples: string[]
  colorClass: string
  iconBgClass: string
}

interface GroupLandingPageProps {
  groupInfo: GroupInfo
  relatedBlogPosts: Array<{
    href: string
    title: string
    description: string
    badge: string
  }>
}

export function GroupLandingPage({ groupInfo, relatedBlogPosts }: GroupLandingPageProps) {
  const { group, name, shortName, description, minAge, minService, multiplierRange, maxBenefit, eligibilityNote, examples, colorClass, iconBgClass } = groupInfo

  return (
    <div className="container py-8 max-w-6xl mx-auto px-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Calculator", href: "/calculator" },
          { label: `Group ${group}` }
        ]}
        className="mb-6"
      />

      {/* Hero Section */}
      <div className="text-center mb-10">
        <Badge className={`mb-4 ${colorClass}`}>
          <Users className="w-3 h-3 mr-1" />
          {shortName}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Massachusetts Group {group} Pension Calculator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          {description}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/calculator?group=${group}`}>
            <Button size="lg" className="gap-2">
              <Calculator className="h-5 w-5" />
              Calculate My Group {group} Pension
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/wizard">
            <Button size="lg" variant="outline" className="gap-2">
              Use Step-by-Step Wizard
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Facts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center mx-auto mb-3`}>
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{minAge === 0 ? "Any" : minAge}</p>
            <p className="text-sm text-muted-foreground">Min. Retirement Age</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center mx-auto mb-3`}>
              <Users className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{minService}+</p>
            <p className="text-sm text-muted-foreground">Years of Service</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center mx-auto mb-3`}>
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{multiplierRange}</p>
            <p className="text-sm text-muted-foreground">Benefit Multiplier</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center mx-auto mb-3`}>
              <DollarSign className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{maxBenefit}</p>
            <p className="text-sm text-muted-foreground">Max Benefit Cap</p>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Alert */}
      <Card className="mb-10 border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Group {group} Eligibility Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{eligibilityNote}</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <Badge key={idx} variant="secondary" className="text-sm">
                {example}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-center">How Group {group} Benefits Are Calculated</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-2">1</div>
              <CardTitle className="text-lg">Average Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your pension is based on the average of your highest 3 consecutive years of salary (or 5 years if hired after 2012).
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-2">2</div>
              <CardTitle className="text-lg">Benefit Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Multiply by the Group {group} benefit factor ({multiplierRange} per year of service based on retirement age).
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-2">3</div>
              <CardTitle className="text-lg">Apply Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your benefit is capped at 80% of your average salary. Option B/C survivor benefits reduce this further.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Guides */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Essential Retirement Guides</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {relatedBlogPosts.map((post, idx) => (
            <Link key={idx} href={post.href} className="group" title={post.title}>
              <Card className="h-full hover:shadow-lg transition-all hover:border-blue-300">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 text-xs">{post.badge}</Badge>
                  <CardTitle className="text-base group-hover:text-blue-600 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-sm">{post.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Guide <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Related Resources */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/resources/groups" className="group" title="All Massachusetts Retirement Groups">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <Users className="h-5 w-5 mb-2 text-muted-foreground group-hover:text-blue-600" />
                <p className="text-sm font-medium group-hover:text-blue-600">All Groups</p>
                <p className="text-xs text-muted-foreground">Compare Groups 1-4</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/resources/cola" className="group" title="COLA Information">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <TrendingUp className="h-5 w-5 mb-2 text-muted-foreground group-hover:text-blue-600" />
                <p className="text-sm font-medium group-hover:text-blue-600">COLA</p>
                <p className="text-xs text-muted-foreground">Cost of living adjustments</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/resources/options" className="group" title="Pension Options A, B, C">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <FileText className="h-5 w-5 mb-2 text-muted-foreground group-hover:text-blue-600" />
                <p className="text-sm font-medium group-hover:text-blue-600">Options</p>
                <p className="text-xs text-muted-foreground">Compare A, B, C</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/social-security" className="group" title="Social Security & WEP/GPO">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <Shield className="h-5 w-5 mb-2 text-muted-foreground group-hover:text-blue-600" />
                <p className="text-sm font-medium group-hover:text-blue-600">Social Security</p>
                <p className="text-xs text-muted-foreground">WEP/GPO changes</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Final CTA */}
      <Card className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="py-8">
          <h2 className="text-2xl font-bold mb-2">Ready to Calculate Your Group {group} Pension?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Get your personalized pension estimate in under 60 seconds using official MSRB formulas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/calculator?group=${group}`}>
              <Button size="lg" className="gap-2">
                <Calculator className="h-5 w-5" />
                Start Calculating
              </Button>
            </Link>
            <Link href="/wizard">
              <Button size="lg" variant="outline" className="gap-2">
                Try Full Retirement Wizard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Other Group Links */}
      <div className="mt-10 text-center">
        <p className="text-sm text-muted-foreground mb-3">Not in Group {group}? Calculate for other groups:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["1", "2", "3", "4"].filter(g => g !== group).map(g => (
            <Link key={g} href={`/calculator/group-${g}`}>
              <Button variant="ghost" size="sm">Group {g} Calculator</Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

