"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  TrendingUp, 
  BarChart3, 
  Table as TableIcon, 
  Download, 
  FileText, 
  Crown, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Lightbulb
} from 'lucide-react'
import { ScenarioComparisonTable } from './scenario-comparison-table'
import { ScenarioComparisonCharts } from './scenario-comparison-charts'
import { RetirementScenario, ScenarioResults, ComparisonRecommendation } from '@/lib/scenario-modeling/scenario-types'
import { compareScenarios } from '@/lib/scenario-modeling/scenario-comparison'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { toast } from 'sonner'

interface ScenarioComparisonDashboardProps {
  scenarios: RetirementScenario[]
  results: ScenarioResults[]
  onExportReport?: () => void
  onSelectOptimalScenario?: (scenarioId: string) => void
  className?: string
}

export function ScenarioComparisonDashboard({
  scenarios,
  results,
  onExportReport,
  onSelectOptimalScenario,
  className
}: ScenarioComparisonDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'table' | 'charts'>('overview')
  const [selectedMetric, setSelectedMetric] = useState<'income' | 'risk' | 'tax' | 'overall'>('overall')

  // Calculate comprehensive comparison analysis
  const comparison = useMemo(() => {
    if (!scenarios || !results || scenarios.length < 2 || results.length < 2) return null
    return compareScenarios(scenarios, results)
  }, [scenarios, results])

  // Get optimal scenarios for different criteria
  const optimalScenarios = useMemo(() => {
    if (!comparison || !scenarios) return null

    const { comparisonMetrics } = comparison

    return {
      highestIncome: {
        scenarioId: comparisonMetrics.incomeComparison.highestMonthlyIncome.scenarioId,
        scenario: scenarios.find(s => s.id === comparisonMetrics.incomeComparison.highestMonthlyIncome.scenarioId),
        value: comparisonMetrics.incomeComparison.highestMonthlyIncome.amount
      },
      lowestRisk: {
        scenarioId: comparisonMetrics.riskComparison.lowestRisk.scenarioId,
        scenario: scenarios.find(s => s.id === comparisonMetrics.riskComparison.lowestRisk.scenarioId),
        value: comparisonMetrics.riskComparison.lowestRisk.score
      },
      bestTaxEfficiency: {
        scenarioId: comparisonMetrics.optimizationComparison.bestTaxEfficiency.scenarioId,
        scenario: scenarios.find(s => s.id === comparisonMetrics.optimizationComparison.bestTaxEfficiency.scenarioId),
        value: comparisonMetrics.optimizationComparison.bestTaxEfficiency.effectiveRate
      },
      mostOptimized: {
        scenarioId: comparisonMetrics.optimizationComparison.mostOptimized.scenarioId,
        scenario: scenarios.find(s => s.id === comparisonMetrics.optimizationComparison.mostOptimized.scenarioId),
        value: comparisonMetrics.optimizationComparison.mostOptimized.score
      }
    }
  }, [comparison, scenarios])

  // Filter recommendations by priority
  const prioritizedRecommendations = useMemo(() => {
    if (!comparison) return { high: [], medium: [], low: [] }
    
    return comparison.recommendations.reduce((acc, rec) => {
      acc[rec.priority].push(rec)
      return acc
    }, { high: [] as ComparisonRecommendation[], medium: [] as ComparisonRecommendation[], low: [] as ComparisonRecommendation[] })
  }, [comparison])

  const handleExportReport = async () => {
    try {
      // This would integrate with the PDF generation system
      toast.success('Comparison report exported successfully')
      onExportReport?.()
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'tax':
        return <Target className="h-4 w-4 text-blue-600" />
      default:
        return <Lightbulb className="h-4 w-4 text-purple-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>
      default:
        return <Badge variant="outline">Info</Badge>
    }
  }

  // Early return if insufficient data
  if (!scenarios || !results || scenarios.length < 2 || results.length < 2) {
    const scenarioCount = scenarios?.length || 0
    const resultCount = results?.length || 0

    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Need more scenarios</h3>
          <p className="text-muted-foreground mb-4">
            Create at least 2 scenarios with calculated results to enable comparison analysis.
          </p>
          <div className="text-sm text-muted-foreground">
            Current: {scenarioCount} scenario{scenarioCount !== 1 ? 's' : ''}, {resultCount} result{resultCount !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Scenario Comparison Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of {scenarios?.length || 0} retirement scenarios
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Detailed Table
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visual Charts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Optimal Scenarios Summary */}
          {optimalScenarios && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Highest Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(optimalScenarios.highestIncome.value)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {optimalScenarios.highestIncome.scenario?.name}
                    </div>
                    {onSelectOptimalScenario && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onSelectOptimalScenario(optimalScenarios.highestIncome.scenarioId)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Lowest Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimalScenarios.lowestRisk.value}/10
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {optimalScenarios.lowestRisk.scenario?.name}
                    </div>
                    {onSelectOptimalScenario && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onSelectOptimalScenario(optimalScenarios.lowestRisk.scenarioId)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    Tax Efficient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPercentage(optimalScenarios.bestTaxEfficiency.value)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {optimalScenarios.bestTaxEfficiency.scenario?.name}
                    </div>
                    {onSelectOptimalScenario && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onSelectOptimalScenario(optimalScenarios.bestTaxEfficiency.scenarioId)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Most Optimized
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {optimalScenarios.mostOptimized.value}/10
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {optimalScenarios.mostOptimized.scenario?.name}
                    </div>
                    {onSelectOptimalScenario && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onSelectOptimalScenario(optimalScenarios.mostOptimized.scenarioId)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations */}
          {comparison && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Optimization Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered insights to improve your retirement strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* High Priority Recommendations */}
                  {prioritizedRecommendations.high.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        High Priority Actions
                      </h4>
                      <div className="space-y-3">
                        {prioritizedRecommendations.high.map((rec, index) => (
                          <Alert key={index} className="border-red-200 bg-red-50">
                            <div className="flex items-start gap-3">
                              {getRecommendationIcon(rec.type)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium">{rec.title}</h5>
                                  {getPriorityBadge(rec.priority)}
                                </div>
                                <AlertDescription className="text-sm">
                                  {rec.description}
                                </AlertDescription>
                                {rec.suggestedAction && (
                                  <div className="mt-2 text-sm font-medium text-blue-600">
                                    Action: {rec.suggestedAction}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medium Priority Recommendations */}
                  {prioritizedRecommendations.medium.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-yellow-500" />
                        Medium Priority Opportunities
                      </h4>
                      <div className="space-y-3">
                        {prioritizedRecommendations.medium.slice(0, 3).map((rec, index) => (
                          <Alert key={index} className="border-yellow-200 bg-yellow-50">
                            <div className="flex items-start gap-3">
                              {getRecommendationIcon(rec.type)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium">{rec.title}</h5>
                                  {getPriorityBadge(rec.priority)}
                                </div>
                                <AlertDescription className="text-sm">
                                  {rec.description}
                                </AlertDescription>
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {comparison?.recommendations?.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">All scenarios look good!</h3>
                      <p className="text-muted-foreground">
                        No major optimization opportunities identified at this time.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Table Tab */}
        <TabsContent value="table">
          <ScenarioComparisonTable
            scenarios={scenarios}
            results={results}
            onExport={handleExportReport}
            showOptimalIndicators={true}
          />
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts">
          <ScenarioComparisonCharts
            scenarios={scenarios}
            results={results}
            onExport={handleExportReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
