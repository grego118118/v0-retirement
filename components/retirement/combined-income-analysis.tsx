"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, PieChart, Crown, DollarSign, Calendar, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts"

interface PensionData {
  annualPension: number
  monthlyPension: number
  retirementAge: number
  survivorBenefit?: number
}

interface SocialSecurityData {
  fullRetirement: {
    age: number
    monthlyBenefit: number
  }
  earlyRetirement: {
    age: number
    monthlyBenefit: number
  }
  delayedRetirement: {
    age: number
    monthlyBenefit: number
  }
}

interface CombinedIncomeAnalysisProps {
  pensionData: PensionData
  socialSecurityData: SocialSecurityData
}

const COLORS = ['#4f46e5', '#059669', '#dc2626', '#7c3aed']

export function CombinedIncomeAnalysis({ pensionData, socialSecurityData }: CombinedIncomeAnalysisProps) {
  const [selectedSSAge, setSelectedSSAge] = useState<'early' | 'full' | 'delayed'>('full')
  
  // Calculate combined income scenarios
  const scenarios = [
    {
      name: 'Early SS (62)',
      ssAge: 62,
      pensionMonthly: pensionData.monthlyPension,
      ssMonthly: socialSecurityData.earlyRetirement.monthlyBenefit,
      totalMonthly: pensionData.monthlyPension + socialSecurityData.earlyRetirement.monthlyBenefit,
      totalAnnual: (pensionData.monthlyPension + socialSecurityData.earlyRetirement.monthlyBenefit) * 12
    },
    {
      name: 'Full SS',
      ssAge: socialSecurityData.fullRetirement.age,
      pensionMonthly: pensionData.monthlyPension,
      ssMonthly: socialSecurityData.fullRetirement.monthlyBenefit,
      totalMonthly: pensionData.monthlyPension + socialSecurityData.fullRetirement.monthlyBenefit,
      totalAnnual: (pensionData.monthlyPension + socialSecurityData.fullRetirement.monthlyBenefit) * 12
    },
    {
      name: 'Delayed SS (70)',
      ssAge: 70,
      pensionMonthly: pensionData.monthlyPension,
      ssMonthly: socialSecurityData.delayedRetirement.monthlyBenefit,
      totalMonthly: pensionData.monthlyPension + socialSecurityData.delayedRetirement.monthlyBenefit,
      totalAnnual: (pensionData.monthlyPension + socialSecurityData.delayedRetirement.monthlyBenefit) * 12
    }
  ]

  // Calculate income replacement ratio (assuming 80% of pre-retirement income is the goal)
  const estimatedPreRetirementIncome = 85000 // This would come from user input
  const currentScenario = scenarios.find(s => 
    (selectedSSAge === 'early' && s.ssAge === 62) ||
    (selectedSSAge === 'full' && s.ssAge === socialSecurityData.fullRetirement.age) ||
    (selectedSSAge === 'delayed' && s.ssAge === 70)
  ) || scenarios[1]

  const replacementRatio = (currentScenario.totalAnnual / estimatedPreRetirementIncome) * 100

  // Pie chart data for income breakdown
  const pieData = [
    { name: 'MA State Pension', value: pensionData.annualPension, color: COLORS[0] },
    { name: 'Social Security', value: currentScenario.ssMonthly * 12, color: COLORS[1] },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle>Combined Retirement Income Analysis</CardTitle>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            </div>
          </div>
          <CardDescription>
            Comprehensive view of your pension and Social Security benefits combined
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This analysis combines your Massachusetts state pension with estimated Social Security benefits to give you a complete retirement income picture.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
              <TabsTrigger value="overview" className="text-sm px-3 py-2">
                <span className="hidden sm:inline">Income Overview</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="text-sm px-3 py-2">Scenarios</TabsTrigger>
              <TabsTrigger value="breakdown" className="text-sm px-3 py-2">
                <span className="hidden sm:inline">Income Breakdown</span>
                <span className="sm:hidden">Breakdown</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Main Income Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">MA State Pension</span>
                    </div>
                    <div className="text-2xl font-bold">${pensionData.monthlyPension.toFixed(0)}/mo</div>
                    <div className="text-sm text-muted-foreground">
                      ${pensionData.annualPension.toFixed(0)}/year
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Social Security</span>
                    </div>
                    <div className="text-2xl font-bold">${currentScenario.ssMonthly.toFixed(0)}/mo</div>
                    <div className="text-sm text-muted-foreground">
                      At age {currentScenario.ssAge}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">Combined Total</span>
                    </div>
                    <div className="text-2xl font-bold">${currentScenario.totalMonthly.toFixed(0)}/mo</div>
                    <div className="text-sm text-muted-foreground">
                      ${currentScenario.totalAnnual.toFixed(0)}/year
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Income Replacement Ratio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Income Replacement Analysis</CardTitle>
                  <CardDescription>
                    How your retirement income compares to pre-retirement income
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Income Replacement Ratio</span>
                      <span className="text-2xl font-bold text-green-600">
                        {replacementRatio.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(replacementRatio, 100)} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Target: 70-80%</span>
                      <span>Excellent: 80%+</span>
                    </div>
                    {replacementRatio >= 80 && (
                      <Alert className="bg-green-50 border-green-200 text-green-800">
                        <AlertDescription>
                          Excellent! Your combined retirement income meets or exceeds the recommended 80% replacement ratio.
                        </AlertDescription>
                      </Alert>
                    )}
                    {replacementRatio < 70 && (
                      <Alert className="bg-orange-50 border-orange-200 text-orange-800">
                        <AlertDescription>
                          Consider additional retirement savings or adjusting your retirement timeline to improve your income replacement ratio.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Security Timing Scenarios</CardTitle>
                  <CardDescription>
                    Compare different Social Security claiming strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scenarios.map((scenario, index) => (
                      <Card 
                        key={scenario.name} 
                        className={`cursor-pointer transition-colors ${
                          scenario.ssAge === currentScenario.ssAge 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          if (scenario.ssAge === 62) setSelectedSSAge('early')
                          else if (scenario.ssAge === 70) setSelectedSSAge('delayed')
                          else setSelectedSSAge('full')
                        }}
                      >
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-4 gap-4 items-center">
                            <div>
                              <div className="font-medium">{scenario.name}</div>
                              <div className="text-sm text-muted-foreground">Age {scenario.ssAge}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Monthly Total</div>
                              <div className="font-bold">${scenario.totalMonthly.toFixed(0)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Annual Total</div>
                              <div className="font-bold">${scenario.totalAnnual.toFixed(0)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">vs Full Retirement</div>
                              <div className={`font-bold ${
                                scenario.totalAnnual > scenarios[1].totalAnnual ? 'text-green-600' : 
                                scenario.totalAnnual < scenarios[1].totalAnnual ? 'text-orange-600' : 
                                'text-muted-foreground'
                              }`}>
                                {scenario.totalAnnual === scenarios[1].totalAnnual ? '—' :
                                 (scenario.totalAnnual > scenarios[1].totalAnnual ? '+' : '') +
                                 ((scenario.totalAnnual - scenarios[1].totalAnnual) / scenarios[1].totalAnnual * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Income Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Income Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <span className="font-medium">MA State Pension</span>
                        <span className="font-bold text-blue-600">
                          ${pensionData.monthlyPension.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <span className="font-medium">Social Security</span>
                        <span className="font-bold text-green-600">
                          ${currentScenario.ssMonthly.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-2 border-purple-200">
                        <span className="font-bold">Total Monthly Income</span>
                        <span className="font-bold text-purple-600 text-lg">
                          ${currentScenario.totalMonthly.toFixed(0)}
                        </span>
                      </div>
                      
                      {pensionData.survivorBenefit && (
                        <div className="mt-6 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                            Survivor Benefit
                          </div>
                          <div className="text-sm text-muted-foreground">
                            If selected pension option includes survivor benefits: ${pensionData.survivorBenefit.toFixed(0)}/year
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 