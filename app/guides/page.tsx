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
  Heart,
  Home,
  ChevronRight,
  Info
} from "lucide-react"

export default function RetirementGuidePage() {
  const [activeSection, setActiveSection] = useState("overview")

  const retirementGroups = [
    {
      group: "Group 1",
      description: "General employees, teachers, most state workers",
      minAge: 60,
      minService: 10,
      multiplier: "2.0% at age 60, increases 0.1% yearly to 2.5% at age 65",
      maxBenefit: "80%",
      examples: ["Administrative staff", "Clerical workers", "Teachers", "Social workers"]
    },
    {
      group: "Group 2", 
      description: "Probation officers, court officers, certain corrections",
      minAge: 55,
      minService: 10,
      multiplier: "2.0% at age 55, increases 0.1% yearly to 2.5% at age 60",
      maxBenefit: "80%",
      examples: ["Probation officers", "Court officers", "Some corrections staff"]
    },
    {
      group: "Group 3",
      description: "State Police",
      minAge: "Any age",
      minService: 20,
      multiplier: "2.5% (flat rate)",
      maxBenefit: "80%",
      examples: ["State Police officers", "State Police detectives"]
    },
    {
      group: "Group 4",
      description: "Public safety, corrections, parole officers",
      minAge: 50,
      minService: 10,
      multiplier: "2.0% at age 50, increases 0.1% yearly to 2.5% at age 55",
      maxBenefit: "80%",
      examples: ["Corrections officers", "Parole officers", "Public safety personnel"]
    }
  ]

  const retirementOptions = [
    {
      option: "Option A",
      description: "Maximum Allowance (100%)",
      details: "Highest monthly benefit, no survivor benefits",
      bestFor: "Single individuals or those with adequate life insurance"
    },
    {
      option: "Option B",
      description: "Annuity Protection",
      details: "Reduced monthly benefit (1-5% less), beneficiary receives remaining accumulated deductions",
      bestFor: "Individuals wanting some protection for beneficiaries with minimal reduction"
    },
    {
      option: "Option C",
      description: "Joint & Survivor (66.67%)",
      details: "Moderate reduction (7-15% less), survivor receives exactly 66.67% of benefit for life",
      bestFor: "Married couples balancing current income with survivor protection"
    }
  ]

  const planningTimeline = [
    {
      timeframe: "5+ Years Before Retirement",
      progress: 20,
      tasks: [
        "Review your retirement group classification",
        "Estimate your years of creditable service",
        "Consider purchasing additional service time",
        "Maximize your highest 3-year average salary",
        "Review and update beneficiary information"
      ]
    },
    {
      timeframe: "2-3 Years Before Retirement", 
      progress: 50,
      tasks: [
        "Attend MSRB retirement seminars",
        "Request official service verification",
        "Plan healthcare transition strategy",
        "Consider Social Security timing",
        "Review retirement option choices"
      ]
    },
    {
      timeframe: "1 Year Before Retirement",
      progress: 75,
      tasks: [
        "Submit retirement application (90 days prior)",
        "Complete required medical exams if applicable",
        "Finalize retirement option selection",
        "Plan GIC to Medicare transition",
        "Organize required documentation"
      ]
    },
    {
      timeframe: "Retirement Year",
      progress: 100,
      tasks: [
        "Complete final paperwork",
        "Attend exit interview",
        "Set up direct deposit for pension",
        "Enroll in Medicare (if age 65+)",
        "Begin receiving retirement benefits"
      ]
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
          <span className="text-foreground font-medium">Retirement Planning Guide</span>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Massachusetts State Employee Retirement Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your comprehensive guide to planning and preparing for retirement as a Massachusetts state employee. 
            Learn about your benefits, understand your options, and create a successful retirement strategy.
          </p>
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Calculate Benefits</h3>
                <p className="text-sm text-gray-600 mb-3">Get personalized retirement estimates</p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/calculator">Use Calculator</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Official Resources</h3>
                <p className="text-sm text-gray-600 mb-3">Access MSRB forms and documents</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/resources">View Resources</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Get Support</h3>
                <p className="text-sm text-gray-600 mb-3">Contact retirement counselors</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="flex flex-col items-center p-3">
              <BookOpen className="h-4 w-4 mb-1" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex flex-col items-center p-3">
              <Users className="h-4 w-4 mb-1" />
              <span className="text-xs">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="options" className="flex flex-col items-center p-3">
              <Shield className="h-4 w-4 mb-1" />
              <span className="text-xs">Options</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex flex-col items-center p-3">
              <Calendar className="h-4 w-4 mb-1" />
              <span className="text-xs">Planning</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex flex-col items-center p-3">
              <DollarSign className="h-4 w-4 mb-1" />
              <span className="text-xs">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex flex-col items-center p-3">
              <CheckCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">Checklist</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Understanding Your Massachusetts Retirement Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What is MSERS?</h3>
                    <p className="text-gray-600 mb-4">
                      The Massachusetts State Employees' Retirement System (MSERS) is a defined benefit pension plan 
                      that provides retirement, disability, and survivor benefits to eligible state employees and their families.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Guaranteed monthly income for life</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Cost-of-living adjustments (COLA)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Survivor benefits for your family</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Disability protection</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Key Benefit Features</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Benefit Calculation</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Your retirement benefit is calculated using your years of service, 
                          benefit percentage, and average of your highest 3 consecutive years of salary.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="h-4 w-4 text-green-600" />
                          <span className="font-medium">COLA Adjustments</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Annual cost-of-living adjustments help protect your purchasing power. 
                          Current rate is 3% on the first $13,000 of your annual benefit.
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
                        This guide provides general information about Massachusetts state retirement benefits. 
                        Always verify specific details with the Massachusetts State Retirement Board (MSRB) 
                        and consult official documentation for your individual situation.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Retirement Group Classifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  All Massachusetts state employees are classified into one of four retirement groups based on their job duties.
                  Your group determines your minimum retirement age, benefit multiplier, and eligibility requirements.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {retirementGroups.map((group, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{group.group}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            Min Age: {group.minAge}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Minimum Service:</span>
                            <p className="text-gray-600">{group.minService} years</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Max Benefit:</span>
                            <p className="text-gray-600">{group.maxBenefit}</p>
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-900 text-sm">Benefit Multiplier:</span>
                          <p className="text-sm text-gray-600 mt-1">{group.multiplier}</p>
                        </div>

                        <div>
                          <span className="font-medium text-gray-900 text-sm">Common Positions:</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {group.examples.map((example, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Special Considerations for Members Hired After April 2, 2012</h4>
                  <p className="text-sm text-blue-800">
                    If you were hired after April 2, 2012, different rules may apply to your retirement benefits,
                    including pro-rated service calculations and modified benefit structures. Contact MSRB for specific details about your situation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Retirement Benefit Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  When you retire, you must choose how to receive your pension benefits. This decision is permanent
                  and affects both your monthly income and any survivor benefits for your family.
                </p>

                <div className="space-y-6">
                  {retirementOptions.map((option, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{option.option}</h3>
                            <p className="text-primary font-medium">{option.description}</p>
                          </div>
                          <Badge variant="outline" className="mt-2 md:mt-0 w-fit">
                            {option.option === "Option A" ? "Highest Payment" :
                             option.option === "Option B" ? "Maximum Protection" : "Balanced Choice"}
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-3">{option.details}</p>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">Best for: </span>
                          <span className="text-sm text-gray-600">{option.bestFor}</span>
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
                        <h4 className="font-medium text-amber-900 mb-1">Important Decision</h4>
                        <p className="text-sm text-amber-800">
                          Your retirement option choice is permanent and cannot be changed after you begin receiving benefits.
                          Consider your family situation, health, and financial needs carefully.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button asChild>
                      <Link href="/calculator" className="inline-flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Compare Options with Calculator
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Retirement Planning Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Successful retirement planning requires preparation over several years. Follow this timeline to ensure
                  you're ready for a smooth transition to retirement.
                </p>

                <div className="space-y-8">
                  {planningTimeline.map((phase, index) => (
                    <div key={index} className="relative">
                      {index < planningTimeline.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-24 bg-gray-200"></div>
                      )}

                      <Card className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                            </div>

                            <div className="flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{phase.timeframe}</h3>
                                <div className="flex items-center gap-2 mt-2 md:mt-0">
                                  <span className="text-sm text-gray-600">Progress:</span>
                                  <Progress value={phase.progress} className="w-24" />
                                  <span className="text-sm font-medium">{phase.progress}%</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {phase.tasks.map((task, taskIndex) => (
                                  <div key={taskIndex} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{task}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Pro Tip: Start Early</h4>
                  <p className="text-sm text-green-800">
                    The earlier you start planning, the more options you'll have. Even if retirement seems far away,
                    understanding your benefits now can help you make better career and financial decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pension Calculation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5 text-primary" />
                    Pension Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Basic Formula</h4>
                    <p className="text-sm text-blue-800 font-mono">
                      Years of Service × Benefit % × Average Highest 3 Years = Annual Pension
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Years of Service</h5>
                      <p className="text-sm text-gray-600">All creditable service time, including purchased service</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Benefit Percentage</h5>
                      <p className="text-sm text-gray-600">Based on your retirement group and age at retirement</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Average Highest 3 Years</h5>
                      <p className="text-sm text-gray-600">Average of your 3 consecutive highest-paid years</p>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href="/calculator">Calculate Your Pension</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Social Security Coordination */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Social Security Coordination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    As a government employee, your Social Security benefits may be affected by special provisions.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <h5 className="font-medium text-amber-900 text-sm mb-1">Windfall Elimination Provision (WEP)</h5>
                      <p className="text-xs text-amber-800">May reduce your Social Security benefits if you receive a pension from work not covered by Social Security</p>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <h5 className="font-medium text-amber-900 text-sm mb-1">Government Pension Offset (GPO)</h5>
                      <p className="text-xs text-amber-800">May reduce spousal or survivor Social Security benefits based on your government pension</p>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href="/resources" target="_blank">Learn More About WEP/GPO</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Healthcare Transition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    Healthcare Transition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Plan your transition from GIC coverage to Medicare and supplemental insurance.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Before Age 65</h5>
                      <p className="text-xs text-gray-600">Continue GIC coverage or explore COBRA options</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Age 65+</h5>
                      <p className="text-xs text-gray-600">Enroll in Medicare Parts A & B, consider GIC Medicare Extension</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Medicare Premiums</h5>
                      <p className="text-xs text-gray-600">Current Part B premium: ~$174.70/month (may be deducted from pension)</p>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href="https://www.medicare.gov/" target="_blank">Medicare Information</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Tax Implications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Tax Implications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Understand how your retirement income will be taxed at federal and state levels.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Massachusetts State Tax</h5>
                      <p className="text-xs text-gray-600">Pension income is generally exempt from MA state income tax</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Federal Tax</h5>
                      <p className="text-xs text-gray-600">Pension income is subject to federal income tax</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Tax Withholding</h5>
                      <p className="text-xs text-gray-600">You can elect to have taxes withheld from your pension payments</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Tip:</strong> Consult with a tax professional to understand your specific tax situation in retirement.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Pre-Retirement Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Use this comprehensive checklist to ensure you've completed all necessary steps before retiring.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Documentation Checklist */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Required Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "Birth certificate or passport",
                        "Marriage certificate (if applicable)",
                        "Divorce decree (if applicable)",
                        "Military service records (if applicable)",
                        "Social Security card",
                        "Beneficiary designation forms",
                        "Direct deposit information",
                        "Tax withholding elections"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Forms Checklist */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        Required Forms
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "Application for Retirement Benefits",
                        "Retirement Option Selection Form",
                        "Direct Deposit Authorization",
                        "Federal Tax Withholding Form",
                        "Beneficiary Designation Form",
                        "Health Insurance Election Form",
                        "Final payroll verification",
                        "Exit interview completion"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Financial Checklist */}
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        Financial Preparation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "Review retirement benefit calculation",
                        "Understand Social Security timing",
                        "Plan healthcare coverage transition",
                        "Review life insurance needs",
                        "Update estate planning documents",
                        "Consider tax withholding strategy",
                        "Plan for COLA adjustments",
                        "Review investment accounts"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Timeline Checklist */}
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        Important Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        "Submit retirement application (90 days prior)",
                        "Complete medical exams (if required)",
                        "Attend pre-retirement seminar",
                        "Finalize retirement option selection",
                        "Complete exit interview",
                        "Enroll in Medicare (if age 65+)",
                        "Set up pension direct deposit",
                        "Notify payroll of final work date"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 text-center space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Ready to Get Started?</h4>
                    <p className="text-sm text-green-800 mb-4">
                      Use our retirement calculator to estimate your benefits and start planning your retirement strategy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button asChild>
                        <Link href="/calculator" className="inline-flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          Calculate My Benefits
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/resources" className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Download Forms
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
                Take the Next Step in Your Retirement Planning
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                This guide provides a foundation for understanding your Massachusetts state retirement benefits.
                For personalized estimates and detailed planning, use our retirement calculator or contact MSRB directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/calculator" className="inline-flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Start Retirement Calculator
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact" className="inline-flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Get Personal Assistance
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
