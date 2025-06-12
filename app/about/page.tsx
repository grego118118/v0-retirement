import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Shield, TrendingUp, Calculator, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "About | MA Pension Estimator",
  description: "Learn about our mission to help Massachusetts state employees plan for a secure retirement with accurate pension calculations and expert guidance.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              About
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                MA Pension Estimator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Empowering Massachusetts state employees with the tools and knowledge
              they need to plan for a <strong>secure and comfortable retirement</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">

        {/* Mission Section */}
        <section className="mb-12">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
            <CardHeader className="text-center pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="text-2xl lg:text-3xl xl:text-4xl flex items-center justify-center gap-3 lg:gap-4">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                  <Target className="h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
                </div>
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <p className="text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-4xl mx-auto text-slate-700 dark:text-slate-300">
                We believe every Massachusetts state employee deserves clear, accurate information
                about their retirement benefits. Our mission is to simplify complex pension calculations
                and provide the tools needed to make informed decisions about your financial future.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Why We Built This */}
        <section className="mb-12">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-center mb-8 lg:mb-12 text-slate-800 dark:text-slate-200">Why We Built This Tool</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-green-50/50 dark:from-slate-900 dark:to-green-950/20">
              <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
                <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-300">
                    <Calculator className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-green-600 dark:text-green-400" />
                  </div>
                  Complex Calculations
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
                <p className="text-muted-foreground text-sm lg:text-base xl:text-lg leading-relaxed">
                  Massachusetts pension calculations involve multiple variables, group classifications,
                  and benefit formulas that can be confusing to navigate alone.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20">
              <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
                <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  Lack of Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
                <p className="text-muted-foreground text-sm lg:text-base xl:text-lg leading-relaxed">
                  Many state employees struggle to find user-friendly tools that provide
                  accurate estimates and help them understand their retirement options.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-purple-950/20">
              <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
                <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  Planning Importance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
                <p className="text-muted-foreground text-sm lg:text-base xl:text-lg leading-relaxed">
                  Proper retirement planning can significantly impact your financial security.
                  Small decisions made today can have major effects on your future income.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

      {/* What We Offer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Free Basic Calculator</CardTitle>
              <CardDescription>
                Essential pension calculations for all Massachusetts state employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Group 1, 2, and 3 benefit calculations</li>
                <li>• COLA adjustment estimates</li>
                <li>• Retirement eligibility checker</li>
                <li>• Basic scenario planning</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Premium Features
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Premium
                </Badge>
              </CardTitle>
              <CardDescription>
                Advanced tools for comprehensive retirement planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Social Security optimization</li>
                <li>• Combined calculation wizard</li>
                <li>• Tax implications analysis</li>
                <li>• Detailed PDF reports</li>
                <li>• Spousal benefit calculations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Our Commitment</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle>Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Our calculations are based on official Massachusetts retirement formulas 
                and are regularly updated to reflect current regulations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle>Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                We believe retirement planning tools should be accessible to everyone, 
                which is why we offer essential features for free.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                We're here to help you understand your benefits and make informed 
                decisions about your retirement future.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

        {/* Disclaimer */}
        <section>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 via-amber-50/50 to-orange-50/30 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20">
            <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="text-lg lg:text-xl xl:text-2xl text-slate-800 dark:text-slate-200">Important Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <p className="text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed">
                This tool provides estimates based on current Massachusetts retirement regulations
                and should be used for planning purposes only. For official benefit calculations
                and retirement decisions, please consult with the Massachusetts State Retirement Board
                or a qualified financial advisor. Benefit formulas and regulations may change over time.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
