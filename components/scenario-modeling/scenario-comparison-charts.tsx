"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart,
  Download,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { RetirementScenario, ScenarioResults, YearlyProjection } from '@/lib/scenario-modeling/scenario-types'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { BaseChart } from '@/components/charts/base-chart'

interface ScenarioComparisonChartsProps {
  scenarios: RetirementScenario[]
  results: ScenarioResults[]
  className?: string
  onExport?: () => void
}

type ChartType = 'income-comparison' | 'lifetime-projection' | 'risk-analysis' | 'tax-efficiency'
type TimeHorizon = 'retirement-year' | '5-years' | '10-years' | 'lifetime'

const SCENARIO_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green  
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
]

export function ScenarioComparisonCharts({
  scenarios,
  results,
  className,
  onExport
}: ScenarioComparisonChartsProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('income-comparison')
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('retirement-year')
  const [visibleScenarios, setVisibleScenarios] = useState<string[]>(
    scenarios.map(s => s.id)
  )

  // Prepare data for income comparison chart
  const incomeComparisonData = useMemo(() => {
    return scenarios.map((scenario, index) => {
      const result = results.find(r => r.scenarioId === scenario.id)
      if (!result) return null

      return {
        name: scenario.name.length > 15 ? scenario.name.substring(0, 15) + '...' : scenario.name,
        fullName: scenario.name,
        scenarioId: scenario.id,
        pensionIncome: result.pensionBenefits.monthlyBenefit,
        socialSecurityIncome: result.socialSecurityBenefits.monthlyBenefit,
        totalIncome: result.incomeProjections.totalMonthlyIncome,
        netIncome: result.incomeProjections.netAfterTaxIncome / 12, // Convert to monthly
        replacementRatio: result.incomeProjections.replacementRatio * 100,
        color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
        isBaseline: scenario.isBaseline
      }
    }).filter(Boolean)
  }, [scenarios, results])

  // Prepare data for lifetime projection chart
  const lifetimeProjectionData = useMemo(() => {
    const allProjections: any[] = []
    
    scenarios.forEach((scenario, scenarioIndex) => {
      const result = results.find(r => r.scenarioId === scenario.id)
      if (!result || !visibleScenarios.includes(scenario.id)) return

      result.incomeProjections.yearlyProjections.forEach((projection, yearIndex) => {
        // Filter based on time horizon
        const yearsFromRetirement = yearIndex
        let includeYear = true
        
        switch (timeHorizon) {
          case 'retirement-year':
            includeYear = yearIndex === 0
            break
          case '5-years':
            includeYear = yearsFromRetirement <= 5
            break
          case '10-years':
            includeYear = yearsFromRetirement <= 10
            break
          case 'lifetime':
            includeYear = true
            break
        }

        if (!includeYear) return

        const existingYear = allProjections.find(p => p.year === projection.year)
        if (existingYear) {
          existingYear[`${scenario.name}_total`] = projection.totalNetIncome
          existingYear[`${scenario.name}_pension`] = projection.pensionIncome
          existingYear[`${scenario.name}_ss`] = projection.socialSecurityIncome
        } else {
          allProjections.push({
            year: projection.year,
            age: projection.age,
            [`${scenario.name}_total`]: projection.totalNetIncome,
            [`${scenario.name}_pension`]: projection.pensionIncome,
            [`${scenario.name}_ss`]: projection.socialSecurityIncome,
          })
        }
      })
    })

    return allProjections.sort((a, b) => a.year - b.year)
  }, [scenarios, results, visibleScenarios, timeHorizon])

  // Prepare data for risk analysis chart
  const riskAnalysisData = useMemo(() => {
    return scenarios.map((scenario, index) => {
      const result = results.find(r => r.scenarioId === scenario.id)
      if (!result) return null

      return {
        name: scenario.name.length > 15 ? scenario.name.substring(0, 15) + '...' : scenario.name,
        fullName: scenario.name,
        scenarioId: scenario.id,
        riskScore: result.keyMetrics.riskScore,
        flexibilityScore: result.keyMetrics.flexibilityScore,
        optimizationScore: result.keyMetrics.optimizationScore,
        color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
        isBaseline: scenario.isBaseline
      }
    }).filter(Boolean)
  }, [scenarios, results])

  // Prepare data for tax efficiency chart
  const taxEfficiencyData = useMemo(() => {
    return scenarios.map((scenario, index) => {
      const result = results.find(r => r.scenarioId === scenario.id)
      if (!result) return null

      return {
        name: scenario.name.length > 15 ? scenario.name.substring(0, 15) + '...' : scenario.name,
        fullName: scenario.name,
        scenarioId: scenario.id,
        effectiveTaxRate: result.taxAnalysis.effectiveTaxRate * 100,
        federalTax: result.taxAnalysis.federalTax,
        stateTax: result.taxAnalysis.stateTax,
        totalTax: result.taxAnalysis.annualTaxBurden,
        netIncome: result.incomeProjections.netAfterTaxIncome,
        color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
        isBaseline: scenario.isBaseline
      }
    }).filter(Boolean)
  }, [scenarios, results])

  const toggleScenarioVisibility = (scenarioId: string) => {
    setVisibleScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('Rate') || entry.name.includes('Ratio') 
                  ? formatPercentage(entry.value / 100)
                  : formatCurrency(entry.value)
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderIncomeComparisonChart = () => (
    <BaseChart
      title="Monthly Income Comparison"
      description="Compare monthly retirement income across scenarios"
      data={incomeComparisonData}
      height={400}
      showExport={true}
      onExport={onExport}
    >
      <BarChart data={incomeComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis tickFormatter={(value) => formatCurrency(value, 0)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="pensionIncome" 
          name="Pension Income" 
          stackId="income"
          fill="#3B82F6" 
        />
        <Bar 
          dataKey="socialSecurityIncome" 
          name="Social Security" 
          stackId="income"
          fill="#10B981" 
        />
        <ReferenceLine 
          y={6000} 
          stroke="#EF4444" 
          strokeDasharray="5 5" 
          label="Target Income"
        />
      </BarChart>
    </BaseChart>
  )

  const renderLifetimeProjectionChart = () => (
    <BaseChart
      title="Lifetime Income Projections"
      description={`Income projections over ${timeHorizon.replace('-', ' ')}`}
      data={lifetimeProjectionData}
      height={400}
      showExport={true}
      onExport={onExport}
    >
      <LineChart data={lifetimeProjectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
        <YAxis tickFormatter={(value) => formatCurrency(value, 0)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {scenarios.map((scenario, index) => (
          visibleScenarios.includes(scenario.id) && (
            <Line
              key={scenario.id}
              type="monotone"
              dataKey={`${scenario.name}_total`}
              name={scenario.name}
              stroke={SCENARIO_COLORS[index % SCENARIO_COLORS.length]}
              strokeWidth={scenario.isBaseline ? 3 : 2}
              strokeDasharray={scenario.isBaseline ? "0" : "5 5"}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )
        ))}
      </LineChart>
    </BaseChart>
  )

  const renderRiskAnalysisChart = () => (
    <BaseChart
      title="Risk Analysis Comparison"
      description="Compare risk, flexibility, and optimization scores"
      data={riskAnalysisData}
      height={400}
      showExport={true}
      onExport={onExport}
    >
      <BarChart data={riskAnalysisData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis domain={[0, 10]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="riskScore" name="Risk Score" fill="#EF4444" />
        <Bar dataKey="flexibilityScore" name="Flexibility Score" fill="#3B82F6" />
        <Bar dataKey="optimizationScore" name="Optimization Score" fill="#10B981" />
      </BarChart>
    </BaseChart>
  )

  const renderTaxEfficiencyChart = () => (
    <BaseChart
      title="Tax Efficiency Analysis"
      description="Compare effective tax rates and tax burden across scenarios"
      data={taxEfficiencyData}
      height={400}
      showExport={true}
      onExport={onExport}
    >
      <BarChart data={taxEfficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="effectiveTaxRate" 
          name="Effective Tax Rate %" 
          fill="#F59E0B" 
        />
        <ReferenceLine 
          y={15} 
          stroke="#EF4444" 
          strokeDasharray="5 5" 
          label="15% Target"
        />
      </BarChart>
    </BaseChart>
  )

  if (scenarios.length === 0 || results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No data to visualize</h3>
          <p className="text-muted-foreground">
            Create scenarios and run calculations to see comparison charts.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Scenario Comparison Charts
            </CardTitle>
            <CardDescription>
              Interactive visualizations comparing {scenarios.length} retirement scenarios
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeChart === 'lifetime-projection' && (
              <Select value={timeHorizon} onValueChange={(value: TimeHorizon) => setTimeHorizon(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retirement-year">First Year</SelectItem>
                  <SelectItem value="5-years">First 5 Years</SelectItem>
                  <SelectItem value="10-years">First 10 Years</SelectItem>
                  <SelectItem value="lifetime">Full Lifetime</SelectItem>
                </SelectContent>
              </Select>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChart} onValueChange={(value: ChartType) => setActiveChart(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="income-comparison" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Income</span>
            </TabsTrigger>
            <TabsTrigger value="lifetime-projection" className="flex items-center gap-1">
              <LineChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Projections</span>
            </TabsTrigger>
            <TabsTrigger value="risk-analysis" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Risk</span>
            </TabsTrigger>
            <TabsTrigger value="tax-efficiency" className="flex items-center gap-1">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Tax</span>
            </TabsTrigger>
          </TabsList>

          {/* Scenario visibility controls for lifetime projection */}
          {activeChart === 'lifetime-projection' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">Visible scenarios:</span>
                {scenarios.map((scenario, index) => (
                  <Button
                    key={scenario.id}
                    variant={visibleScenarios.includes(scenario.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleScenarioVisibility(scenario.id)}
                    className="h-7 text-xs"
                  >
                    {visibleScenarios.includes(scenario.id) ? (
                      <Eye className="h-3 w-3 mr-1" />
                    ) : (
                      <EyeOff className="h-3 w-3 mr-1" />
                    )}
                    {scenario.name}
                    {scenario.isBaseline && <Badge variant="secondary" className="ml-1 text-xs">Base</Badge>}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <TabsContent value="income-comparison" className="mt-6">
            {renderIncomeComparisonChart()}
          </TabsContent>

          <TabsContent value="lifetime-projection" className="mt-6">
            {renderLifetimeProjectionChart()}
          </TabsContent>

          <TabsContent value="risk-analysis" className="mt-6">
            {renderRiskAnalysisChart()}
          </TabsContent>

          <TabsContent value="tax-efficiency" className="mt-6">
            {renderTaxEfficiencyChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
