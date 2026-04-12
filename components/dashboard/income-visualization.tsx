"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Import recharts components directly - SSR handled by making entire component dynamic
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Calendar, 
  Target,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RetirementCalculation {
  id?: string
  calculationName?: string
  retirementDate: string
  retirementAge: number
  yearsOfService: number
  averageSalary: number
  retirementGroup: string
  monthlyBenefit: number
  annualBenefit: number
  socialSecurityData?: {
    selectedClaimingAge?: number
    selectedMonthlyBenefit?: number
    fullRetirementBenefit?: number
    replacementRatio?: number
  }
}

interface IncomeVisualizationProps {
  calculation: RetirementCalculation | null
  className?: string
}

const COLORS = {
  pension: '#3b82f6',      // Blue
  socialSecurity: '#10b981', // Green
  other: '#8b5cf6',        // Purple
  total: '#f59e0b'         // Amber
}

export function IncomeVisualization({ calculation, className = "" }: IncomeVisualizationProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle null/undefined calculation case
  if (!calculation || !calculation.monthlyBenefit) {
    return (
      <Card className={className}>
        <CardHeader className="px-4 lg:px-6 xl:px-8 py-4 lg:py-6 xl:py-8">
          <CardTitle className="flex items-center gap-2 lg:gap-3 text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
            <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
            Retirement Income Analysis
          </CardTitle>
          <CardDescription className="text-sm lg:text-base xl:text-lg">
            Run your first calculation to see your comprehensive retirement income breakdown
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
          <div className="text-center py-12 lg:py-16 xl:py-20">
            <div className="max-w-md mx-auto space-y-6 lg:space-y-8">
              <div className="p-4 lg:p-6 rounded-full bg-blue-50 dark:bg-blue-950/20 w-fit mx-auto">
                <TrendingUp className="h-12 w-12 lg:h-16 lg:w-16 xl:h-20 xl:w-20 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-slate-800 dark:text-slate-200">
                  No Income Analysis Available
                </h3>
                <p className="text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed">
                  Complete your first pension calculation to see a detailed breakdown of your retirement income,
                  including pension benefits, Social Security projections, and replacement ratio analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-sm lg:text-base">
                <div className="p-4 lg:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed">
                  <div className="font-medium text-slate-600 dark:text-slate-400 mb-1">Monthly Income</div>
                  <div className="text-2xl lg:text-3xl font-bold text-slate-400 dark:text-slate-500">--</div>
                </div>
                <div className="p-4 lg:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed">
                  <div className="font-medium text-slate-600 dark:text-slate-400 mb-1">Replacement Ratio</div>
                  <div className="text-2xl lg:text-3xl font-bold text-slate-400 dark:text-slate-500">--%</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
                <Button asChild className="shadow-sm hover:shadow-md transition-all duration-200">
                  <a href="/calculator">
                    <DollarSign className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                    Calculate Pension Benefits
                  </a>
                </Button>
                <Button variant="outline" asChild className="shadow-sm hover:shadow-md transition-all duration-200">
                  <a href="/wizard">
                    <Target className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                    Start Retirement Wizard
                  </a>
                </Button>
              </div>

              <div className="text-xs lg:text-sm text-muted-foreground">
                <p>💡 <strong>Tip:</strong> Complete your profile first for more accurate calculations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate income components
  const monthlyPension = calculation.monthlyBenefit
  const monthlySS = calculation.socialSecurityData?.selectedMonthlyBenefit || 0
  const monthlyOther = 0 // Could be expanded to include other income sources
  const totalMonthlyIncome = monthlyPension + monthlySS + monthlyOther

  const annualPension = monthlyPension * 12
  const annualSS = monthlySS * 12
  const annualOther = monthlyOther * 12
  const totalAnnualIncome = totalMonthlyIncome * 12

  // Calculate replacement ratio
  const replacementRatio = calculation.averageSalary > 0 
    ? (totalAnnualIncome / calculation.averageSalary) * 100 
    : 0

  // Prepare data for charts
  const pieData = [
    { name: 'MA Pension', value: monthlyPension, color: COLORS.pension },
    { name: 'Social Security', value: monthlySS, color: COLORS.socialSecurity },
    ...(monthlyOther > 0 ? [{ name: 'Other Income', value: monthlyOther, color: COLORS.other }] : [])
  ]

  const comparisonData = [
    {
      category: 'Pre-Retirement',
      salary: calculation.averageSalary / 12,
      pension: 0,
      socialSecurity: 0,
      total: calculation.averageSalary / 12
    },
    {
      category: 'Retirement',
      salary: 0,
      pension: monthlyPension,
      socialSecurity: monthlySS,
      total: totalMonthlyIncome
    }
  ]

  // Generate projection data for next 20 years
  const projectionData = Array.from({ length: 21 }, (_, i) => {
    const year = new Date().getFullYear() + i
    const inflationRate = 0.025 // 2.5% annual inflation
    const colaAdjustment = Math.pow(1 + inflationRate, i)
    
    return {
      year,
      pension: monthlyPension * colaAdjustment * 12,
      socialSecurity: monthlySS * colaAdjustment * 12,
      total: totalMonthlyIncome * colaAdjustment * 12
    }
  })

  // Determine income adequacy
  const getIncomeAdequacy = () => {
    if (replacementRatio >= 80) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle }
    if (replacementRatio >= 70) return { status: 'good', color: 'text-blue-600', icon: CheckCircle }
    if (replacementRatio >= 60) return { status: 'adequate', color: 'text-yellow-600', icon: AlertTriangle }
    return { status: 'needs attention', color: 'text-red-600', icon: AlertTriangle }
  }

  const adequacy = getIncomeAdequacy()
  const AdequacyIcon = adequacy.icon

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="px-4 lg:px-6 xl:px-8 py-4 lg:py-6 xl:py-8">
        <CardTitle className="flex items-center gap-2 lg:gap-3 text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
          <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
          Retirement Income Analysis
        </CardTitle>
        <CardDescription className="text-sm lg:text-base xl:text-lg">
          Comprehensive breakdown of your projected retirement income
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6 xl:space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 lg:p-2">
            <TabsTrigger value="overview" className="text-sm lg:text-base py-2 lg:py-3">Overview</TabsTrigger>
            <TabsTrigger value="breakdown" className="text-sm lg:text-base py-2 lg:py-3">Breakdown</TabsTrigger>
            <TabsTrigger value="comparison" className="text-sm lg:text-base py-2 lg:py-3">Comparison</TabsTrigger>
            <TabsTrigger value="projection" className="text-sm lg:text-base py-2 lg:py-3">Projection</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 lg:space-y-8 xl:space-y-10">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
              <div className="text-center p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                <DollarSign className="h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-blue-600 mx-auto mb-2 lg:mb-3" />
                <div className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-blue-600">{formatCurrency(totalMonthlyIncome)}</div>
                <div className="text-sm lg:text-base xl:text-lg text-muted-foreground">Monthly Income</div>
              </div>

              <div className="text-center p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                <Target className="h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-green-600 mx-auto mb-2 lg:mb-3" />
                <div className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-green-600">{replacementRatio.toFixed(1)}%</div>
                <div className="text-sm lg:text-base xl:text-lg text-muted-foreground">Replacement Ratio</div>
              </div>

              <div className="text-center p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
                <Calendar className="h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-purple-600 mx-auto mb-2 lg:mb-3" />
                <div className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-purple-600">{formatCurrency(totalAnnualIncome)}</div>
                <div className="text-sm lg:text-base xl:text-lg text-muted-foreground">Annual Income</div>
              </div>
            </div>

            {/* Income Adequacy Assessment */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AdequacyIcon className={`h-5 w-5 ${adequacy.color}`} />
                <h3 className="font-semibold">Income Adequacy Assessment</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Replacement Ratio</span>
                  <span className={`font-medium ${adequacy.color}`}>
                    {replacementRatio.toFixed(1)}% - {adequacy.status}
                  </span>
                </div>
                <Progress value={Math.min(replacementRatio, 100)} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Financial experts typically recommend 70-80% income replacement in retirement
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center p-3 border rounded-lg">
                <div className="font-medium text-blue-600">{formatCurrency(monthlyPension)}</div>
                <div className="text-muted-foreground">MA Pension</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="font-medium text-green-600">{formatCurrency(monthlySS)}</div>
                <div className="text-muted-foreground">Social Security</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="font-medium text-purple-600">{calculation.retirementAge}</div>
                <div className="text-muted-foreground">Retirement Age</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="font-medium text-orange-600">{calculation.yearsOfService}</div>
                <div className="text-muted-foreground">Years of Service</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="space-y-4">
                <h3 className="font-semibold">Monthly Income Sources</h3>
                <div className="h-64">
                  {isClient ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="text-sm text-muted-foreground">Loading chart...</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold">Income Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">MA State Pension</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(monthlyPension)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((monthlyPension / totalMonthlyIncome) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Social Security</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(monthlySS)}</div>
                      <div className="text-xs text-muted-foreground">
                        {monthlySS > 0 ? ((monthlySS / totalMonthlyIncome) * 100).toFixed(1) : '0'}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed">
                    <span className="font-semibold">Total Monthly Income</span>
                    <span className="font-bold text-lg">{formatCurrency(totalMonthlyIncome)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Pre-Retirement vs. Retirement Income</h3>
              <div className="h-64">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="salary" stackId="a" fill="#94a3b8" name="Salary" />
                      <Bar dataKey="pension" stackId="a" fill={COLORS.pension} name="Pension" />
                      <Bar dataKey="socialSecurity" stackId="a" fill={COLORS.socialSecurity} name="Social Security" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading chart...</div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="font-medium mb-2">Pre-Retirement</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Monthly Salary:</span>
                      <span className="font-medium">{formatCurrency(calculation.averageSalary / 12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Salary:</span>
                      <span className="font-medium">{formatCurrency(calculation.averageSalary)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="font-medium mb-2">Retirement</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Monthly Income:</span>
                      <span className="font-medium">{formatCurrency(totalMonthlyIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Income:</span>
                      <span className="font-medium">{formatCurrency(totalAnnualIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Replacement Ratio:</span>
                      <span className={`font-medium ${adequacy.color}`}>{replacementRatio.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projection" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">20-Year Income Projection</h3>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p>MA Pension COLA: 3% on first $13,000 (FY2025)</p>
                        <p>Social Security COLA: ~2.5% annually (estimated)</p>
                        <p className="text-xs text-muted-foreground">COLA rates subject to annual legislative approval</p>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              
              <div className="h-80">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="pension"
                        stackId="1"
                        stroke={COLORS.pension}
                        fill={COLORS.pension}
                        name="Pension"
                      />
                      <Area
                        type="monotone"
                        dataKey="socialSecurity"
                        stackId="1"
                        stroke={COLORS.socialSecurity}
                        fill={COLORS.socialSecurity}
                        name="Social Security"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading chart...</div>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <div>* MA Pension COLA: 3% applied to first $13,000 of annual benefit (FY2025)</div>
                <div>* Social Security COLA: ~2.5% annually (historical average)</div>
                <div>* COLA adjustments are subject to annual legislative approval and may vary</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
