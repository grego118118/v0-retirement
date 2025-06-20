"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Calculator, 
  Clock, 
  FileText, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  BookOpen,
  Shield,
  TrendingUp,
  PiggyBank,
  Home,
  ChevronRight,
  Info,
  CreditCard,
  Building,
  Briefcase,
  GraduationCap,
  Heart,
  Target,
  BarChart3,
  Wallet,
  FileCheck,
  Download
} from "lucide-react"

export default function FinancialLiteracyPage() {
  const [activeSection, setActiveSection] = useState("fundamentals")

  const fundamentalConcepts = [
    {
      concept: "Emergency Fund",
      description: "3-6 months of expenses for unexpected costs",
      icon: Shield,
      color: "blue",
      details: "Build a safety net before focusing on retirement investments",
      tips: ["Start with $1,000 minimum", "Use high-yield savings account", "Automate monthly contributions", "Keep separate from other savings"]
    },
    {
      concept: "Debt Management",
      description: "Strategic approach to paying down high-interest debt",
      icon: CreditCard,
      color: "red",
      details: "Prioritize high-interest debt while maintaining retirement contributions",
      tips: ["Pay minimums on all debts", "Focus extra payments on highest interest", "Consider debt consolidation", "Avoid new debt accumulation"]
    },
    {
      concept: "Budgeting",
      description: "Track income and expenses to maximize savings",
      icon: Calculator,
      color: "green",
      details: "Create a sustainable spending plan that includes retirement savings",
      tips: ["Use 50/30/20 rule as starting point", "Track expenses for 3 months", "Automate savings first", "Review and adjust monthly"]
    },
    {
      concept: "Investment Basics",
      description: "Understanding risk, return, and time horizon",
      icon: TrendingUp,
      color: "purple",
      details: "Learn fundamental investment principles for long-term growth",
      tips: ["Start early for compound growth", "Diversify across asset classes", "Keep costs low", "Stay disciplined during market volatility"]
    }
  ]

  const retirementIncomeStreams = [
    {
      source: "MSERS Pension",
      description: "Guaranteed monthly income based on service and salary",
      percentage: "40-60%",
      details: "Primary retirement income for most state employees",
      optimization: ["Maximize years of service", "Increase highest 3-year average", "Choose appropriate retirement option", "Understand COLA adjustments"]
    },
    {
      source: "Social Security",
      description: "Federal retirement benefits with WEP/GPO considerations",
      percentage: "20-30%",
      details: "Supplemental income with potential reductions for government employees",
      optimization: ["Understand WEP impact", "Plan optimal claiming age", "Coordinate with spouse benefits", "Consider working longer if beneficial"]
    },
    {
      source: "Deferred Compensation",
      description: "457(b) and other voluntary retirement savings",
      percentage: "10-20%",
      details: "Tax-advantaged savings to supplement pension and Social Security",
      optimization: ["Maximize employer match", "Contribute consistently", "Choose appropriate investments", "Consider Roth options"]
    },
    {
      source: "Personal Savings",
      description: "IRAs, taxable investments, and other assets",
      percentage: "10-20%",
      details: "Additional savings for flexibility and security",
      optimization: ["Use tax-advantaged accounts first", "Diversify investment types", "Plan withdrawal strategies", "Consider tax implications"]
    }
  ]

  const investmentStrategies = [
    {
      strategy: "Target-Date Funds",
      riskLevel: "Moderate",
      description: "Automatically adjusts allocation as you approach retirement",
      pros: ["Simple and hands-off", "Professional management", "Age-appropriate allocation"],
      cons: ["Less control", "May not fit specific needs", "Higher fees than index funds"],
      bestFor: "Beginners or those wanting simplicity"
    },
    {
      strategy: "Three-Fund Portfolio",
      riskLevel: "Moderate",
      description: "Total stock market, international stocks, and bonds",
      pros: ["Low cost", "Broad diversification", "Simple to maintain"],
      cons: ["Requires rebalancing", "No active management", "Market risk exposure"],
      bestFor: "DIY investors seeking low-cost diversification"
    },
    {
      strategy: "Conservative Allocation",
      riskLevel: "Low",
      description: "Higher bond allocation for capital preservation",
      pros: ["Lower volatility", "Income generation", "Capital preservation"],
      cons: ["Lower long-term returns", "Inflation risk", "Interest rate sensitivity"],
      bestFor: "Near-retirees or risk-averse investors"
    },
    {
      strategy: "Aggressive Growth",
      riskLevel: "High",
      description: "Higher stock allocation for maximum growth potential",
      pros: ["Higher return potential", "Long-term wealth building", "Inflation protection"],
      cons: ["Higher volatility", "Potential for losses", "Requires long time horizon"],
      bestFor: "Young investors with long time horizons"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Financial Literacy</span>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Financial Literacy for Massachusetts State Employees
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Build the financial knowledge and skills you need for a secure retirement. 
            Learn essential concepts, strategies, and tools to maximize your financial well-being as a Massachusetts state employee.
          </p>
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Financial Calculators</h3>
                <p className="text-sm text-gray-600 mb-3">Use planning tools and calculators</p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/calculator">Access Tools</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Planning Resources</h3>
                <p className="text-sm text-gray-600 mb-3">Access planning resources and guides</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/resources">View Resources</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Get Guidance</h3>
                <p className="text-sm text-gray-600 mb-3">Connect with financial advisors</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/contact">Find Advisors</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="fundamentals" className="flex flex-col items-center p-3">
              <BookOpen className="h-4 w-4 mb-1" />
              <span className="text-xs">Fundamentals</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex flex-col items-center p-3">
              <DollarSign className="h-4 w-4 mb-1" />
              <span className="text-xs">Income</span>
            </TabsTrigger>
            <TabsTrigger value="investing" className="flex flex-col items-center p-3">
              <TrendingUp className="h-4 w-4 mb-1" />
              <span className="text-xs">Investing</span>
            </TabsTrigger>
            <TabsTrigger value="taxes" className="flex flex-col items-center p-3">
              <FileCheck className="h-4 w-4 mb-1" />
              <span className="text-xs">Taxes</span>
            </TabsTrigger>
            <TabsTrigger value="estate" className="flex flex-col items-center p-3">
              <Shield className="h-4 w-4 mb-1" />
              <span className="text-xs">Estate</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex flex-col items-center p-3">
              <Calculator className="h-4 w-4 mb-1" />
              <span className="text-xs">Tools</span>
            </TabsTrigger>
          </TabsList>

          {/* Fundamentals Tab */}
          <TabsContent value="fundamentals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Financial Planning Fundamentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Building a strong financial foundation is essential for successful retirement planning. 
                  These fundamental concepts will help you create a solid base for your financial future.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {fundamentalConcepts.map((concept, index) => {
                    const IconComponent = concept.icon
                    return (
                      <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${concept.color}-100`}>
                              <IconComponent className={`h-6 w-6 text-${concept.color}-600`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{concept.concept}</CardTitle>
                              <p className="text-sm text-gray-600">{concept.description}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-700">{concept.details}</p>
                          
                          <div>
                            <span className="font-medium text-gray-900 text-sm">Key Tips:</span>
                            <ul className="mt-2 space-y-1">
                              {concept.tips.map((tip, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                                  {tip === "Use 50/30/20 rule as starting point" ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            className="text-left hover:text-blue-600 transition-colors underline decoration-dotted underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                                            aria-describedby="budget-rule-tooltip"
                                          >
                                            {tip}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          id="budget-rule-tooltip"
                                          className="max-w-xs p-3 text-sm"
                                          side="top"
                                          align="start"
                                        >
                                          <div className="space-y-2">
                                            <p className="font-medium text-gray-900">50/30/20 Budgeting Rule:</p>
                                            <ul className="space-y-1 text-xs">
                                              <li><strong>50% Needs:</strong> Housing, utilities, groceries, minimum debt payments</li>
                                              <li><strong>30% Wants:</strong> Entertainment, dining out, hobbies, subscriptions</li>
                                              <li><strong>20% Savings:</strong> Emergency fund, retirement contributions, debt repayment</li>
                                            </ul>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    tip
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Getting Started</h4>
                  <p className="text-sm text-blue-800">
                    Focus on building these fundamentals in order: emergency fund, debt management, 
                    budgeting, then investing. Each step builds upon the previous one to create a 
                    strong financial foundation for your retirement planning.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Retirement Income Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Successful retirement requires multiple income streams. Understanding how each source works
                  and how to optimize them is crucial for financial security in retirement.
                </p>

                <div className="space-y-6">
                  {retirementIncomeStreams.map((stream, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{stream.source}</h3>
                            <p className="text-gray-600">{stream.description}</p>
                          </div>
                          <div className="mt-2 md:mt-0 text-center">
                            <div className="text-2xl font-bold text-primary">{stream.percentage}</div>
                            <div className="text-xs text-gray-600">of retirement income</div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">{stream.details}</p>

                        <div>
                          <span className="text-sm font-medium text-gray-900">Optimization Strategies:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {stream.optimization.map((strategy, idx) => (
                              <div key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <Target className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                                {strategy}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Income Replacement Goal</h4>
                    <p className="text-sm text-green-800">
                      Most financial experts recommend replacing 70-90% of your pre-retirement income.
                      Massachusetts state employees often achieve this through the combination of pension,
                      Social Security, and personal savings.
                    </p>
                  </div>

                  <div className="text-center">
                    <Button asChild>
                      <Link href="/calculator" className="inline-flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Calculate Your Income Replacement
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investing Tab */}
          <TabsContent value="investing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Investment Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Understanding investment fundamentals helps you make informed decisions about your
                  deferred compensation and personal retirement savings.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Asset Allocation */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Asset Allocation by Age
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Age 20-30</span>
                            <span className="text-sm text-gray-600">90% Stocks / 10% Bonds</span>
                          </div>
                          <Progress value={90} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Age 40-50</span>
                            <span className="text-sm text-gray-600">70% Stocks / 30% Bonds</span>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Age 60+</span>
                            <span className="text-sm text-gray-600">50% Stocks / 50% Bonds</span>
                          </div>
                          <Progress value={50} className="h-2" />
                        </div>
                      </div>
                      <p className="text-xs text-blue-800">
                        These are general guidelines. Your allocation should reflect your risk tolerance and time horizon.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Investment Principles */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Key Investment Principles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "Start early to benefit from compound growth",
                        "Diversify across asset classes and sectors",
                        "Keep investment costs low (under 1% annually)",
                        "Stay disciplined during market volatility",
                        "Rebalance periodically to maintain allocation",
                        "Don't try to time the market",
                        "Focus on time in market, not timing market"
                      ].map((principle, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{principle}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Investment Strategy Options</h3>
                  <div className="space-y-4">
                    {investmentStrategies.map((strategy, index) => (
                      <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{strategy.strategy}</h4>
                              <p className="text-gray-600">{strategy.description}</p>
                            </div>
                            <Badge
                              variant={strategy.riskLevel === 'Low' ? 'secondary' :
                                     strategy.riskLevel === 'Moderate' ? 'default' : 'destructive'}
                              className="mt-2 md:mt-0 w-fit"
                            >
                              {strategy.riskLevel} Risk
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <span className="text-sm font-medium text-green-900">Pros:</span>
                              <ul className="mt-1 space-y-1">
                                {strategy.pros.map((pro, idx) => (
                                  <li key={idx} className="text-xs text-green-800 flex items-start gap-1">
                                    <span className="w-1 h-1 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-red-900">Cons:</span>
                              <ul className="mt-1 space-y-1">
                                {strategy.cons.map((con, idx) => (
                                  <li key={idx} className="text-xs text-red-800 flex items-start gap-1">
                                    <span className="w-1 h-1 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">Best For:</span>
                              <p className="text-xs text-gray-700 mt-1">{strategy.bestFor}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Tax Planning for Retirement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Understanding tax implications of your retirement income helps you keep more of what you've earned.
                  Massachusetts offers unique benefits for state employee retirees.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Massachusetts Tax Benefits */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5 text-green-600" />
                        Massachusetts Tax Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-900 mb-1">Pension Income Exemption</h5>
                          <p className="text-sm text-green-800">
                            MSERS pension income is generally exempt from Massachusetts state income tax
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-900 mb-1">Social Security Benefits</h5>
                          <p className="text-sm text-green-800">
                            Social Security benefits are not taxed by Massachusetts
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-900 mb-1">Senior Circuit Breaker</h5>
                          <p className="text-sm text-green-800">
                            Property tax relief for seniors 65+ with income limits
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Federal Tax Considerations */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Federal Tax Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-900 mb-1">Pension Taxation</h5>
                          <p className="text-sm text-blue-800">
                            MSERS pension is subject to federal income tax as ordinary income
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-900 mb-1">Social Security Taxation</h5>
                          <p className="text-sm text-blue-800">
                            Up to 85% of benefits may be taxable depending on total income
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-900 mb-1">Required Distributions</h5>
                          <p className="text-sm text-blue-800">
                            457(b) and IRA withdrawals required starting at age 73
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax-Efficient Strategies */}
                  <Card className="border-purple-200 bg-purple-50 lg:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Tax-Efficient Withdrawal Strategies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white rounded-lg border border-purple-200">
                          <h5 className="font-medium text-purple-900 mb-2">Early Retirement (Before 65)</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Use taxable accounts first</li>
                            <li>• Consider Roth conversions</li>
                            <li>• Manage tax brackets carefully</li>
                            <li>• Plan for healthcare costs</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-purple-200">
                          <h5 className="font-medium text-purple-900 mb-2">Traditional Retirement (65-73)</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Optimize Social Security timing</li>
                            <li>• Use tax-deferred accounts</li>
                            <li>• Consider tax bracket management</li>
                            <li>• Plan for Medicare premiums</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-purple-200">
                          <h5 className="font-medium text-purple-900 mb-2">Later Years (73+)</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Manage required distributions</li>
                            <li>• Use Roth accounts strategically</li>
                            <li>• Consider charitable giving</li>
                            <li>• Plan for estate taxes</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-900 mb-1">Professional Tax Advice</h4>
                      <p className="text-sm text-amber-800">
                        Tax laws are complex and change frequently. Consider consulting with a qualified
                        tax professional or financial advisor to develop a personalized tax strategy
                        for your retirement situation.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estate Tab */}
          <TabsContent value="estate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Estate Planning Essentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Proper estate planning protects your family and ensures your wishes are carried out.
                  These essential documents and strategies help secure your legacy.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Essential Documents */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Essential Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          doc: "Will",
                          description: "Directs distribution of assets and names guardians for minor children"
                        },
                        {
                          doc: "Power of Attorney",
                          description: "Authorizes someone to handle financial matters if you're incapacitated"
                        },
                        {
                          doc: "Healthcare Proxy",
                          description: "Designates someone to make medical decisions on your behalf"
                        },
                        {
                          doc: "Living Will",
                          description: "Specifies your wishes for end-of-life medical care"
                        },
                        {
                          doc: "HIPAA Authorization",
                          description: "Allows designated people to access your medical information"
                        }
                      ].map((item, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-900 mb-1">{item.doc}</h5>
                          <p className="text-sm text-blue-800">{item.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Beneficiary Planning */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Beneficiary Planning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-900 mb-2">MSERS Pension Benefits</h5>
                          <p className="text-sm text-green-800 mb-2">
                            Your retirement option choice affects survivor benefits
                          </p>
                          <ul className="text-xs text-green-700 space-y-1">
                            <li>• Option A: No survivor benefits</li>
                            <li>• Option B: 100% survivor benefit</li>
                            <li>• Option C: 66⅔% survivor benefit</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-900 mb-2">Retirement Accounts</h5>
                          <p className="text-sm text-green-800 mb-2">
                            Keep beneficiaries updated on all accounts
                          </p>
                          <ul className="text-xs text-green-700 space-y-1">
                            <li>• 457(b) deferred compensation</li>
                            <li>• IRAs and Roth IRAs</li>
                            <li>• Life insurance policies</li>
                            <li>• Bank and investment accounts</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trust Considerations */}
                  <Card className="border-purple-200 bg-purple-50 lg:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5 text-purple-600" />
                        Trust Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-purple-900 mb-2">When Trusts May Be Helpful:</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Large estates (over federal exemption)</li>
                            <li>• Minor children or grandchildren</li>
                            <li>• Special needs family members</li>
                            <li>• Blended families</li>
                            <li>• Privacy concerns</li>
                            <li>• Avoiding probate</li>
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-purple-900 mb-2">Common Trust Types:</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Revocable living trust</li>
                            <li>• Irrevocable life insurance trust</li>
                            <li>• Charitable remainder trust</li>
                            <li>• Special needs trust</li>
                            <li>• Qualified personal residence trust</li>
                            <li>• Generation-skipping trust</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Estate Planning Action Steps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
                      <p className="text-sm text-blue-800">Review and update all beneficiary designations annually</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">2</div>
                      <p className="text-sm text-blue-800">Create or update essential estate planning documents</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">3</div>
                      <p className="text-sm text-blue-800">Consult with an estate planning attorney for complex situations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Interactive Tools & Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Use these tools and resources to put your financial knowledge into practice.
                  These interactive calculators and planning tools help you create a personalized financial plan.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Financial Calculators */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        Financial Calculators
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          tool: "Retirement Calculator",
                          description: "Calculate your MSERS pension and total retirement income",
                          link: "/calculator"
                        },
                        {
                          tool: "Emergency Fund Calculator",
                          description: "Determine how much to save for emergencies",
                          link: "https://www.calculator.net/emergency-fund-calculator.html"
                        },
                        {
                          tool: "Debt Payoff Calculator",
                          description: "Create a strategy to pay off debt faster",
                          link: "https://www.calculator.net/debt-payoff-calculator.html"
                        },
                        {
                          tool: "Investment Return Calculator",
                          description: "Project investment growth over time",
                          link: "https://www.calculator.net/investment-calculator.html"
                        },
                        {
                          tool: "Social Security Calculator",
                          description: "Estimate your Social Security benefits",
                          link: "https://www.ssa.gov/benefits/retirement/estimator.html"
                        }
                      ].map((tool, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-900 mb-1">{tool.tool}</h5>
                          <p className="text-sm text-blue-800 mb-2">{tool.description}</p>
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <Link href={tool.link} target={tool.link.startsWith('http') ? '_blank' : '_self'}>
                              Use Calculator
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>



                  {/* Educational Resources */}
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        Educational Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          resource: "MSRB Financial Education",
                          description: "Official retirement planning resources",
                          link: "https://www.mass.gov/orgs/massachusetts-state-retirement-board"
                        },
                        {
                          resource: "SEC Investor.gov",
                          description: "Investment education and fraud protection",
                          link: "https://www.investor.gov/"
                        },
                        {
                          resource: "CFPB Financial Resources",
                          description: "Consumer financial protection resources",
                          link: "https://www.consumerfinance.gov/"
                        },
                        {
                          resource: "IRS Retirement Plans",
                          description: "Tax information for retirement accounts",
                          link: "https://www.irs.gov/retirement-plans"
                        }
                      ].map((resource, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-purple-200">
                          <h5 className="font-medium text-purple-900 mb-1">{resource.resource}</h5>
                          <p className="text-sm text-purple-800 mb-2">{resource.description}</p>
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <Link href={resource.link} target="_blank">
                              Visit Resource
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Professional Services */}
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-600" />
                        Professional Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        {
                          service: "Fee-Only Financial Planners",
                          description: "Find certified financial planners who work for fees, not commissions",
                          link: "https://www.napfa.org/"
                        },
                        {
                          service: "Estate Planning Attorneys",
                          description: "Find qualified estate planning attorneys in Massachusetts",
                          link: "https://www.massbar.org/"
                        },
                        {
                          service: "Tax Professionals",
                          description: "Find certified public accountants and tax preparers",
                          link: "https://www.aicpa.org/"
                        },
                        {
                          service: "MSRB Counselors",
                          description: "Contact retirement counselors for personalized guidance",
                          link: "/contact"
                        }
                      ].map((service, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-orange-200">
                          <h5 className="font-medium text-orange-900 mb-1">{service.service}</h5>
                          <p className="text-sm text-orange-800 mb-2">{service.description}</p>
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <Link href={service.link} target={service.link.startsWith('http') ? '_blank' : '_self'}>
                              Find Professionals
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Getting Started with Financial Planning</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
                      <p className="text-sm text-blue-800">Assess your current financial situation</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">2</div>
                      <p className="text-sm text-blue-800">Set specific, measurable financial goals</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">3</div>
                      <p className="text-sm text-blue-800">Create and implement your financial plan</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">4</div>
                      <p className="text-sm text-blue-800">Review and adjust your plan regularly</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer CTA Section */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-100 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Start Building Your Financial Future Today
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Financial literacy is the foundation of a secure retirement. Use the knowledge and tools
                you've learned here to create a comprehensive financial plan that will serve you throughout
                your career and into retirement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/calculator" className="inline-flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Start Your Financial Plan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/guides" className="inline-flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    View Retirement Planning Guide
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
