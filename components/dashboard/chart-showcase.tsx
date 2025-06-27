"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BenefitProjectionChart,
  ComparisonChart,
  IncomeBreakdownChart,
  generateSampleBenefitData,
  generateSampleComparisonData,
  generateSampleIncomeBreakdownData,
  type BenefitProjectionData,
  type ComparisonData,
  type IncomeBreakdownData
} from '@/components/charts'
import { RefreshCw, TrendingUp, PieChart, BarChart3 } from 'lucide-react'

interface ChartShowcaseProps {
  pensionAmount?: number
  socialSecurityAmount?: number
  currentIncome?: number
  className?: string
}

export function ChartShowcase({
  pensionAmount = 3960,
  socialSecurityAmount = 2000,
  currentIncome = 8500,
  className = ''
}: ChartShowcaseProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('projections')

  // Generate sample data for demonstrations
  const benefitData = useMemo((): BenefitProjectionData[] => {
    return generateSampleBenefitData(62, 85, pensionAmount, socialSecurityAmount, 0.025)
  }, [pensionAmount, socialSecurityAmount, refreshKey])

  const comparisonData = useMemo((): ComparisonData[] => {
    const monthlyPension = pensionAmount
    const monthlySS = socialSecurityAmount
    const totalRetirement = monthlyPension + monthlySS
    
    return [
      {
        category: 'monthly-income',
        label: 'Monthly Income',
        currentValue: currentIncome,
        projectedValue: totalRetirement,
        targetValue: currentIncome * 0.8, // 80% replacement ratio
        difference: totalRetirement - currentIncome,
        percentChange: ((totalRetirement - currentIncome) / currentIncome) * 100,
        description: 'Total monthly income before and after retirement'
      },
      {
        category: 'pension-only',
        label: 'Pension Benefits',
        currentValue: 0,
        projectedValue: monthlyPension,
        targetValue: currentIncome * 0.5, // 50% from pension
        difference: monthlyPension,
        percentChange: 100,
        description: 'Massachusetts pension system benefits'
      },
      {
        category: 'social-security',
        label: 'Social Security',
        currentValue: 0,
        projectedValue: monthlySS,
        targetValue: currentIncome * 0.3, // 30% from SS
        difference: monthlySS,
        percentChange: 100,
        description: 'Federal Social Security benefits'
      },
      {
        category: 'healthcare',
        label: 'Healthcare Costs',
        currentValue: 200,
        projectedValue: 350,
        targetValue: 300,
        difference: 150,
        percentChange: 75,
        description: 'Monthly healthcare and Medicare costs'
      }
    ]
  }, [pensionAmount, socialSecurityAmount, currentIncome, refreshKey])

  const incomeBreakdownData = useMemo((): IncomeBreakdownData[] => {
    const totalAnnual = (pensionAmount + socialSecurityAmount) * 12
    const pensionAnnual = pensionAmount * 12
    const ssAnnual = socialSecurityAmount * 12
    
    return [
      {
        category: 'Massachusetts Pension',
        value: pensionAnnual,
        percentage: (pensionAnnual / totalAnnual) * 100,
        description: 'Massachusetts State Retirement System pension benefits',
        subcategories: [
          { name: 'Base Pension', value: pensionAnnual * 0.9, percentage: (pensionAnnual * 0.9 / totalAnnual) * 100 },
          { name: 'COLA Adjustment', value: pensionAnnual * 0.1, percentage: (pensionAnnual * 0.1 / totalAnnual) * 100 }
        ]
      },
      {
        category: 'Social Security',
        value: ssAnnual,
        percentage: (ssAnnual / totalAnnual) * 100,
        description: 'Federal Social Security retirement benefits',
        subcategories: [
          { name: 'Primary Benefit', value: ssAnnual * 0.85, percentage: (ssAnnual * 0.85 / totalAnnual) * 100 },
          { name: 'COLA Adjustment', value: ssAnnual * 0.15, percentage: (ssAnnual * 0.15 / totalAnnual) * 100 }
        ]
      }
    ]
  }, [pensionAmount, socialSecurityAmount, refreshKey])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Handle chart interactions
  const handleComparisonClick = (data: ComparisonData) => {
    console.log('Comparison chart clicked:', data)
    // Could open a detailed view or modal
  }

  const handleIncomeSegmentClick = (data: IncomeBreakdownData) => {
    console.log('Income segment clicked:', data)
    // Could show detailed breakdown
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Interactive Charts & Data Visualizations
              </CardTitle>
              <CardDescription>
                Comprehensive retirement planning visualizations with advanced interactivity
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Recharts v2.15.3
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-8 w-8 p-0"
                title="Refresh all charts"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chart Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="projections" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Benefit Projections</span>
            <span className="sm:hidden">Projections</span>
          </TabsTrigger>
          <TabsTrigger value="comparisons" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Income Comparison</span>
            <span className="sm:hidden">Comparison</span>
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Income Breakdown</span>
            <span className="sm:hidden">Breakdown</span>
          </TabsTrigger>
        </TabsList>

        {/* Benefit Projections Tab */}
        <TabsContent value="projections" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Line Chart */}
            <BenefitProjectionChart
              data={benefitData}
              title="Benefit Growth Over Time"
              description="Line chart showing benefit progression with COLA adjustments"
              showCOLA={true}
              chartType="line"
              enableZoom={true}
              enableBrush={false}
              highlightRetirementAge={67}
              onRefresh={handleRefresh}
            />

            {/* Area Chart */}
            <BenefitProjectionChart
              data={benefitData}
              title="Stacked Income Areas"
              description="Area chart showing cumulative retirement income sources"
              showCOLA={false}
              chartType="area"
              enableZoom={true}
              enableBrush={true}
              highlightRetirementAge={67}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Full Width Chart with Brush */}
          <BenefitProjectionChart
            data={benefitData}
            title="Comprehensive Benefit Analysis"
            description="Interactive chart with zoom and brush controls for detailed analysis"
            showCOLA={true}
            chartType="area"
            enableZoom={true}
            enableBrush={true}
            highlightRetirementAge={67}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        {/* Income Comparison Tab */}
        <TabsContent value="comparisons" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vertical Bar Chart */}
            <ComparisonChart
              data={comparisonData}
              title="Income Comparison (Vertical)"
              description="Compare current vs projected retirement income"
              chartType="grouped"
              showTarget={true}
              orientation="vertical"
              colorScheme="income"
              onRefresh={handleRefresh}
              onBarClick={handleComparisonClick}
            />

            {/* Horizontal Bar Chart */}
            <ComparisonChart
              data={comparisonData}
              title="Income Comparison (Horizontal)"
              description="Horizontal view for better label readability"
              chartType="grouped"
              showTarget={true}
              orientation="horizontal"
              colorScheme="performance"
              onRefresh={handleRefresh}
              onBarClick={handleComparisonClick}
            />
          </div>
        </TabsContent>

        {/* Income Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pie Chart */}
            <IncomeBreakdownChart
              data={incomeBreakdownData}
              title="Income Sources (Pie Chart)"
              description="Traditional pie chart showing income distribution"
              chartType="pie"
              showPercentages={true}
              showValues={true}
              enableHover={true}
              enableClick={true}
              colorScheme="income"
              onRefresh={handleRefresh}
              onSegmentClick={handleIncomeSegmentClick}
            />

            {/* Donut Chart */}
            <IncomeBreakdownChart
              data={incomeBreakdownData}
              title="Income Sources (Donut Chart)"
              description="Modern donut chart with center total display"
              chartType="donut"
              showPercentages={true}
              showValues={true}
              enableHover={true}
              enableClick={true}
              colorScheme="income"
              onRefresh={handleRefresh}
              onSegmentClick={handleIncomeSegmentClick}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Chart Features Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chart Features & Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Interactivity</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Hover tooltips</li>
                <li>• Click interactions</li>
                <li>• Zoom & pan</li>
                <li>• Brush selection</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Responsive Design</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Mobile (375px)</li>
                <li>• Tablet (768px)</li>
                <li>• Desktop (1024px)</li>
                <li>• Large (1920px)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Performance</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Sub-2s rendering</li>
                <li>• Optimized animations</li>
                <li>• Memory efficient</li>
                <li>• Lazy loading</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Accessibility</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• ARIA labels</li>
                <li>• Keyboard navigation</li>
                <li>• Screen reader support</li>
                <li>• High contrast mode</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
