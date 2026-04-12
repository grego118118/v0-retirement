"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Award,
  Home,
  ChevronRight,
  Info,
  CreditCard,
  Building,
  Briefcase,
  GraduationCap,
  Heart
} from "lucide-react"

export default function ServiceCreditGuidePage() {
  const [activeSection, setActiveSection] = useState("fundamentals")

  const serviceTypes = [
    {
      type: "Regular Service",
      description: "Standard employment with Massachusetts state government",
      icon: Building,
      color: "blue",
      details: "Full-time and part-time employment periods where retirement contributions were made",
      examples: ["Full-time state employment", "Part-time positions with retirement contributions", "Temporary positions with contributions"]
    },
    {
      type: "Military Service",
      description: "Active duty military service that can be credited toward retirement",
      icon: Shield,
      color: "green",
      details: "Military service during wartime or peacetime, subject to specific conditions",
      examples: ["Active duty service", "National Guard duty", "Reserve service (qualifying periods)"]
    },
    {
      type: "Prior Service",
      description: "Previous employment with other Massachusetts retirement systems",
      icon: Briefcase,
      color: "purple",
      details: "Service with other MA public employers that can be transferred or combined",
      examples: ["Municipal employment", "County service", "Other state agency employment"]
    },
    {
      type: "Purchased Service",
      description: "Service time that can be bought back or purchased",
      icon: CreditCard,
      color: "orange",
      details: "Periods of employment or leave that can be made creditable through payment",
      examples: ["Leave without pay", "Non-contributory service", "Out-of-state public service"]
    }
  ]

  const purchaseOptions = [
    {
      category: "Military Service Buyback",
      description: "Purchase credit for military service",
      cost: "Varies based on salary and service period",
      timeLimit: "Must be purchased within specific timeframes",
      benefit: "Can significantly increase retirement benefits",
      requirements: ["DD-214 or military service records", "Proof of honorable discharge", "Service during qualifying periods"]
    },
    {
      category: "Leave Without Pay",
      description: "Purchase credit for unpaid leave periods",
      cost: "Based on salary during leave period plus interest",
      timeLimit: "Generally within 3 years of return to service",
      benefit: "Maintains continuous service credit",
      requirements: ["Employment records", "Leave documentation", "Salary verification"]
    },
    {
      category: "Prior Public Service",
      description: "Purchase credit for previous public employment",
      cost: "Actuarial cost based on age and service",
      timeLimit: "Must be purchased before retirement",
      benefit: "Combines service from multiple employers",
      requirements: ["Employment verification", "Salary records", "Retirement system documentation"]
    },
    {
      category: "Educational Leave",
      description: "Purchase credit for approved educational leave",
      cost: "Employee and employer contributions plus interest",
      timeLimit: "Within 5 years of completing education",
      benefit: "Maintains career progression",
      requirements: ["Educational institution records", "Approval documentation", "Completion certificates"]
    }
  ]

  const calculationExamples = [
    {
      scenario: "Standard Career Path",
      description: "Employee with 30 years regular service",
      details: {
        regularService: 30,
        militaryService: 0,
        purchasedService: 0,
        totalService: 30,
        benefitMultiplier: "2.5%",
        estimatedBenefit: "75% of highest 3-year average"
      }
    },
    {
      scenario: "Military Service Credit",
      description: "Employee with 25 years regular + 4 years military",
      details: {
        regularService: 25,
        militaryService: 4,
        purchasedService: 0,
        totalService: 29,
        benefitMultiplier: "2.4%",
        estimatedBenefit: "69.6% of highest 3-year average"
      }
    },
    {
      scenario: "Purchased Service",
      description: "Employee with 28 years regular + 2 years purchased",
      details: {
        regularService: 28,
        militaryService: 0,
        purchasedService: 2,
        totalService: 30,
        benefitMultiplier: "2.5%",
        estimatedBenefit: "75% of highest 3-year average"
      }
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
          <span className="text-foreground font-medium">Service Credit Guide</span>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Massachusetts Service Credit Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Understanding creditable service is essential for maximizing your retirement benefits. 
            Learn how different types of service count toward your pension and what options you have to increase your service credit.
          </p>
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Calculate Impact</h3>
                <p className="text-sm text-gray-600 mb-3">See how service credit affects your benefits</p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/calculator">Use Calculator</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Official Forms</h3>
                <p className="text-sm text-gray-600 mb-3">Access MSRB service credit forms</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/resources">View Forms</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Get Help</h3>
                <p className="text-sm text-gray-600 mb-3">Contact service credit specialists</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/contact">Contact Support</Link>
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
            <TabsTrigger value="types" className="flex flex-col items-center p-3">
              <Award className="h-4 w-4 mb-1" />
              <span className="text-xs">Types</span>
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex flex-col items-center p-3">
              <CreditCard className="h-4 w-4 mb-1" />
              <span className="text-xs">Purchase</span>
            </TabsTrigger>
            <TabsTrigger value="calculations" className="flex flex-col items-center p-3">
              <Calculator className="h-4 w-4 mb-1" />
              <span className="text-xs">Examples</span>
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex flex-col items-center p-3">
              <FileText className="h-4 w-4 mb-1" />
              <span className="text-xs">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="flex flex-col items-center p-3">
              <Clock className="h-4 w-4 mb-1" />
              <span className="text-xs">Deadlines</span>
            </TabsTrigger>
          </TabsList>

          {/* Fundamentals Tab */}
          <TabsContent value="fundamentals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Service Credit Fundamentals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What is Creditable Service?</h3>
                    <p className="text-gray-600 mb-4">
                      Creditable service is the total amount of time that counts toward your retirement benefits calculation. 
                      It includes periods of employment where you made retirement contributions, plus any additional service 
                      you may purchase or transfer from other qualifying employment.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Determines your years of service multiplier</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Affects your minimum retirement age eligibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Impacts your final retirement benefit amount</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Can be increased through service purchases</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">How Service Credit is Calculated</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Basic Calculation</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Service credit is typically calculated in years and months. Full-time employment 
                          earns 1 year of service credit per calendar year. Part-time employment is prorated 
                          based on your work schedule.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Benefit Impact</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Each year of service credit increases your retirement benefit. The exact impact 
                          depends on your retirement group and age at retirement, with multipliers ranging 
                          from 2.0% to 2.5% per year of service.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-900 mb-1">Important Note</h4>
                      <p className="text-sm text-amber-800">
                        Service credit rules can be complex and may vary based on your employment history, 
                        retirement group, and when you were hired. Always verify your specific situation 
                        with the Massachusetts State Retirement Board (MSRB) for accurate information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Types Tab */}
          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Types of Service Credit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Massachusetts recognizes several different types of service that can count toward your retirement.
                  Understanding these categories helps you identify all potential sources of creditable service.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {serviceTypes.map((service, index) => {
                    const IconComponent = service.icon
                    return (
                      <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${service.color}-100`}>
                              <IconComponent className={`h-6 w-6 text-${service.color}-600`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{service.type}</CardTitle>
                              <p className="text-sm text-gray-600">{service.description}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-700">{service.details}</p>

                          <div>
                            <span className="font-medium text-gray-900 text-sm">Examples:</span>
                            <ul className="mt-2 space-y-1">
                              {service.examples.map((example, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {example}
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
                  <h4 className="font-medium text-blue-900 mb-2">Service Credit Verification</h4>
                  <p className="text-sm text-blue-800">
                    MSRB maintains detailed records of your service credit. You can request an official
                    service verification statement to review your current creditable service and identify
                    any periods that might be missing or eligible for purchase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Tab */}
          <TabsContent value="purchase" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Service Purchase Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  You may be able to purchase additional service credit to increase your retirement benefits.
                  Each type of purchase has specific requirements, costs, and deadlines.
                </p>

                <div className="space-y-6">
                  {purchaseOptions.map((option, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{option.category}</h3>
                            <p className="text-gray-600">{option.description}</p>
                          </div>
                          <Badge variant="outline" className="mt-2 md:mt-0 w-fit">
                            Purchase Option
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">Cost:</span>
                            <p className="text-sm text-gray-600 mt-1">{option.cost}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">Time Limit:</span>
                            <p className="text-sm text-gray-600 mt-1">{option.timeLimit}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">Benefit:</span>
                            <p className="text-sm text-gray-600 mt-1">{option.benefit}</p>
                          </div>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-900">Required Documentation:</span>
                          <ul className="mt-2 space-y-1">
                            {option.requirements.map((req, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-900 mb-1">Cost Considerations</h4>
                        <p className="text-sm text-amber-800">
                          Service purchase costs are calculated actuarially and can be significant.
                          Consider the cost versus the increased retirement benefit to determine if
                          a purchase makes financial sense for your situation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button asChild>
                      <Link href="/calculator" className="inline-flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Calculate Purchase Impact
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculations Tab */}
          <TabsContent value="calculations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Service Credit Calculation Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  See how different types of service credit affect your retirement benefits with these practical examples.
                  These scenarios show the impact of various service combinations on your final retirement calculation.
                </p>

                <div className="space-y-6">
                  {calculationExamples.map((example, index) => (
                    <Card key={index} className="border-2 border-gray-200 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{example.scenario}</CardTitle>
                          <Badge variant="secondary">Example {index + 1}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{example.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{example.details.regularService}</div>
                            <div className="text-xs text-gray-600">Regular Service Years</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{example.details.militaryService}</div>
                            <div className="text-xs text-gray-600">Military Service Years</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{example.details.purchasedService}</div>
                            <div className="text-xs text-gray-600">Purchased Service Years</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{example.details.totalService}</div>
                            <div className="text-xs text-gray-600">Total Service Years</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">Benefit Multiplier:</span>
                            <p className="text-lg font-semibold text-primary">{example.details.benefitMultiplier} per year</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">Estimated Benefit:</span>
                            <p className="text-lg font-semibold text-primary">{example.details.estimatedBenefit}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Calculation Formula</h4>
                  <p className="text-sm text-green-800 mb-3">
                    <strong>Annual Retirement Benefit = </strong>
                    Total Service Years × Benefit Multiplier × Average Highest 3 Years Salary
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> These examples assume Group 1 retirement with maximum benefit multipliers.
                    Your actual calculation may vary based on your retirement group, age at retirement, and specific service details.
                  </p>
                </div>

                <div className="text-center mt-6">
                  <Button asChild size="lg">
                    <Link href="/calculator" className="inline-flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Calculate Your Specific Benefits
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documentation Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Proper documentation is essential for verifying and purchasing service credit.
                  Having the right paperwork ready can expedite the process and ensure accurate service credit calculations.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Service Verification Documents */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        Service Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "Employment records and personnel files",
                        "Pay stubs and salary verification",
                        "Retirement contribution statements",
                        "Union membership records (if applicable)",
                        "Personnel action forms (PAFs)",
                        "Leave and attendance records",
                        "Position descriptions and job classifications"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Military Service Documents */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Military Service
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "DD-214 (Certificate of Release or Discharge)",
                        "Military service records (DD-2586)",
                        "Active duty orders and assignments",
                        "Reserve/National Guard service records",
                        "Combat service verification",
                        "Honorable discharge documentation",
                        "Military pay records"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Prior Service Documents */}
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        Prior Public Service
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "Previous employer service verification",
                        "Retirement system benefit statements",
                        "Municipal or county employment records",
                        "Federal service records (SF-50)",
                        "Out-of-state public employment verification",
                        "Teacher retirement system records",
                        "Social Security earnings statements"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Briefcase className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Educational/Leave Documents */}
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-orange-600" />
                        Educational Leave & Other
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "Educational institution transcripts",
                        "Degree or certificate completion records",
                        "Approved educational leave documentation",
                        "Leave without pay authorization forms",
                        "Medical leave documentation",
                        "Family leave records (FMLA)",
                        "Sabbatical leave approvals"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <GraduationCap className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Document Preparation Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Keep original documents safe - submit certified copies when possible</li>
                      <li>• Organize documents chronologically by employment period</li>
                      <li>• Include cover letters explaining any gaps or special circumstances</li>
                      <li>• Allow extra time for obtaining records from previous employers</li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <Button asChild variant="outline">
                      <Link href="/resources" className="inline-flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Download Required Forms
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deadlines Tab */}
          <TabsContent value="deadlines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Deadlines and Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Understanding deadlines and restrictions is crucial for maximizing your service credit opportunities.
                  Missing these deadlines can result in lost opportunities to increase your retirement benefits.
                </p>

                <div className="space-y-6">
                  {/* Critical Deadlines */}
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Critical Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-2">Military Service Purchase</h4>
                          <p className="text-sm text-red-800 mb-2">
                            Must be purchased before retirement application is submitted
                          </p>
                          <div className="text-xs text-red-700">
                            <strong>Deadline:</strong> Prior to retirement date
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-2">Leave Without Pay</h4>
                          <p className="text-sm text-red-800 mb-2">
                            Generally must be purchased within 3 years of return to service
                          </p>
                          <div className="text-xs text-red-700">
                            <strong>Deadline:</strong> 3 years after return
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-2">Educational Leave</h4>
                          <p className="text-sm text-red-800 mb-2">
                            Must be purchased within 5 years of completing education
                          </p>
                          <div className="text-xs text-red-700">
                            <strong>Deadline:</strong> 5 years after completion
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-2">Prior Service Transfer</h4>
                          <p className="text-sm text-red-800 mb-2">
                            Must be completed before retirement application
                          </p>
                          <div className="text-xs text-red-700">
                            <strong>Deadline:</strong> Before retirement
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Important Restrictions */}
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                        <Info className="h-5 w-5 text-amber-600" />
                        Important Restrictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h5 className="font-medium text-amber-900">Maximum Service Credit</h5>
                            <p className="text-sm text-amber-800">
                              Total creditable service is generally capped at 32 years for benefit calculation purposes,
                              though you may continue working beyond this limit.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h5 className="font-medium text-amber-900">Concurrent Service</h5>
                            <p className="text-sm text-amber-800">
                              You cannot receive credit for overlapping periods of service from different sources.
                              Concurrent employment periods must be carefully documented.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h5 className="font-medium text-amber-900">Payment Requirements</h5>
                            <p className="text-sm text-amber-800">
                              Service purchases must be paid in full before the service credit is officially added
                              to your record. Payment plans may be available for large purchases.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h5 className="font-medium text-amber-900">Refund Limitations</h5>
                            <p className="text-sm text-amber-800">
                              Service purchase payments are generally non-refundable once processed.
                              Carefully consider all options before making payment.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Timeline */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Recommended Action Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            1
                          </div>
                          <div>
                            <h5 className="font-medium text-green-900">Early Career (First 5 Years)</h5>
                            <p className="text-sm text-green-800">
                              Request service verification to establish baseline. Identify any military service
                              or prior public employment that could be credited.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            2
                          </div>
                          <div>
                            <h5 className="font-medium text-green-900">Mid-Career (10-15 Years)</h5>
                            <p className="text-sm text-green-800">
                              Review service purchase options and costs. Consider purchasing military service
                              or other eligible periods while you have time to benefit from the investment.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            3
                          </div>
                          <div>
                            <h5 className="font-medium text-green-900">Pre-Retirement (5 Years Before)</h5>
                            <p className="text-sm text-green-800">
                              Complete all service purchases and transfers. Ensure all documentation is
                              submitted and processed before retirement application.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 text-center space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Need Help with Service Credit?</h4>
                    <p className="text-sm text-blue-800 mb-4">
                      Service credit rules can be complex. Contact MSRB service credit specialists for
                      personalized guidance on your specific situation and available options.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button asChild>
                        <Link href="/contact" className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Contact Service Credit Specialists
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/resources" className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Download Service Credit Forms
                        </Link>
                      </Button>
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
                Maximize Your Service Credit Benefits
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Understanding and optimizing your service credit is one of the most important steps in retirement planning.
                Use our calculator to see how different service scenarios affect your benefits, or contact MSRB for personalized guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/calculator" className="inline-flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculate Service Credit Impact
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
