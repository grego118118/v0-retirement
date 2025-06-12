"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  TrendingUp, 
  Star, 
  BarChart3, 
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Plus
} from 'lucide-react'
import { useScenarios } from '@/lib/hooks/use-scenarios'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface ScenarioDashboardCardsProps {
  className?: string
  onCreateScenario?: () => void
  onViewScenarios?: () => void
}

export function ScenarioDashboardCards({ 
  className,
  onCreateScenario,
  onViewScenarios
}: ScenarioDashboardCardsProps) {
  const { scenarios, loading, error } = useScenarios({ 
    initialLimit: 10,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  })

  const baselineScenario = scenarios.find(s => s.isBaseline)
  const calculatedScenarios = scenarios.filter(s => s.results)
  const pendingScenarios = scenarios.filter(s => !s.results)

  const averageMonthlyIncome = calculatedScenarios.length > 0
    ? calculatedScenarios.reduce((sum, s) => sum + (s.results?.totalMonthlyIncome || 0), 0) / calculatedScenarios.length
    : 0

  const averageReplacementRatio = calculatedScenarios.length > 0
    ? calculatedScenarios.reduce((sum, s) => sum + (s.results?.replacementRatio || 0), 0) / calculatedScenarios.length
    : 0

  const averageRiskScore = calculatedScenarios.length > 0
    ? calculatedScenarios.reduce((sum, s) => sum + (s.results?.riskScore || 0), 0) / calculatedScenarios.length
    : 0

  const bestScenario = calculatedScenarios.reduce((best, current) => 
    (current.results?.optimizationScore || 0) > (best.results?.optimizationScore || 0) 
      ? current : best, calculatedScenarios[0])

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600'
    if (score <= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskBadgeVariant = (score: number) => {
    if (score <= 3) return 'default'
    if (score <= 6) return 'secondary'
    return 'destructive'
  }

  if (loading && scenarios.length === 0) {
    return (
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (scenarios.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calculator className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Retirement Scenarios
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Create your first retirement scenario to start planning and comparing different retirement strategies.
          </p>
          <Button onClick={onCreateScenario} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create First Scenario
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {/* Scenario Overview Card */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scenario Overview</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Scenarios:</span>
              <span className="text-2xl font-bold">{scenarios.length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Calculated:</span>
              <span className="text-lg font-semibold text-green-600">
                {calculatedScenarios.length}
              </span>
            </div>
            
            {pendingScenarios.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="text-lg font-semibold text-yellow-600">
                  {pendingScenarios.length}
                </span>
              </div>
            )}

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Completion Rate</span>
                <span className="text-xs text-gray-500">
                  {Math.round((calculatedScenarios.length / scenarios.length) * 100)}%
                </span>
              </div>
              <Progress
                value={(calculatedScenarios.length / scenarios.length) * 100}
                className="h-2"
                aria-label="Scenario completion progress"
              />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewScenarios}
              className="w-full flex items-center gap-2"
            >
              View All Scenarios
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Baseline Scenario Card */}
      {baselineScenario ? (
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baseline Scenario</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg truncate">{baselineScenario.name}</h3>
                {baselineScenario.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {baselineScenario.description}
                  </p>
                )}
              </div>

              {baselineScenario.results && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Income:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(baselineScenario.results?.totalMonthlyIncome || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Replacement Ratio:</span>
                    <span className="font-semibold">
                      {((baselineScenario.results?.replacementRatio || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risk Score:</span>
                    <Badge variant={getRiskBadgeVariant(baselineScenario.results?.riskScore || 0)}>
                      {(baselineScenario.results?.riskScore || 0).toFixed(1)}/10
                    </Badge>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-2 border-t">
                Retirement Age: {baselineScenario.personalParameters.retirementAge} • 
                Updated: {new Date(baselineScenario.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baseline Scenario</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-sm text-gray-600 mb-3">
                No baseline scenario set. Choose a scenario to use as your primary comparison point.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onViewScenarios}
                className="flex items-center gap-2"
              >
                <Target className="h-3 w-3" />
                Set Baseline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Summary Card */}
      {calculatedScenarios.length > 0 && (
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Summary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Monthly Income:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(averageMonthlyIncome)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Replacement:</span>
                <span className="font-semibold">
                  {(averageReplacementRatio * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Risk Score:</span>
                <span className={`font-semibold ${getRiskColor(averageRiskScore)}`}>
                  {averageRiskScore.toFixed(1)}/10
                </span>
              </div>

              {bestScenario && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-gray-700">Best Performer:</span>
                  </div>
                  <p className="text-sm font-semibold truncate">{bestScenario.name}</p>
                  <p className="text-xs text-gray-600">
                    Score: {(bestScenario.results?.optimizationScore || 0).toFixed(1)}/10
                  </p>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={onViewScenarios}
                className="w-full flex items-center gap-2"
              >
                <BarChart3 className="h-3 w-3" />
                Compare Scenarios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Card */}
      <Card className="lg:col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          <CardDescription>
            Common scenario management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCreateScenario}
              className="flex items-center gap-2"
            >
              <Plus className="h-3 w-3" />
              New Scenario
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewScenarios}
              className="flex items-center gap-2"
            >
              <Calculator className="h-3 w-3" />
              Manage All
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewScenarios}
              className="flex items-center gap-2"
              disabled={calculatedScenarios.length < 2}
            >
              <BarChart3 className="h-3 w-3" />
              Compare
            </Button>
            
            <Link href="/retirement-calculator">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center gap-2"
              >
                <Target className="h-3 w-3" />
                Calculator
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
