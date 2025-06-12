"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Star, 
  Download, 
  Filter,
  ArrowUpDown,
  Crown,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { RetirementScenario, ScenarioResults, ComparisonMetrics } from '@/lib/scenario-modeling/scenario-types'
import { compareScenarios } from '@/lib/scenario-modeling/scenario-comparison'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { toast } from 'sonner'

interface ScenarioComparisonTableProps {
  scenarios: RetirementScenario[]
  results: ScenarioResults[]
  className?: string
  onExport?: () => void
  showOptimalIndicators?: boolean
  compactView?: boolean
}

type SortField = 'name' | 'monthlyIncome' | 'lifetimeIncome' | 'replacementRatio' | 'riskScore'
type SortDirection = 'asc' | 'desc'

export function ScenarioComparisonTable({
  scenarios,
  results,
  className,
  onExport,
  showOptimalIndicators = true,
  compactView = false
}: ScenarioComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('monthlyIncome')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'monthlyIncome',
    'lifetimeIncome',
    'replacementRatio',
    'riskScore'
  ])

  // Calculate comparison metrics
  const comparison = useMemo(() => {
    if (scenarios.length < 2 || results.length < 2) return null
    return compareScenarios(scenarios, results)
  }, [scenarios, results])

  // Sort scenarios based on selected criteria
  const sortedData = useMemo(() => {
    const combined = scenarios.map(scenario => {
      const result = results.find(r => r.scenarioId === scenario.id)
      return { scenario, result }
    }).filter(item => item.result)

    return combined.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case 'name':
          return sortDirection === 'asc' 
            ? a.scenario.name.localeCompare(b.scenario.name)
            : b.scenario.name.localeCompare(a.scenario.name)
        case 'monthlyIncome':
          aValue = a.result!.incomeProjections.totalMonthlyIncome
          bValue = b.result!.incomeProjections.totalMonthlyIncome
          break
        case 'lifetimeIncome':
          aValue = a.result!.keyMetrics.totalLifetimeIncome
          bValue = b.result!.keyMetrics.totalLifetimeIncome
          break
        case 'replacementRatio':
          aValue = a.result!.incomeProjections.replacementRatio
          bValue = b.result!.incomeProjections.replacementRatio
          break
        case 'riskScore':
          aValue = a.result!.keyMetrics.riskScore
          bValue = b.result!.keyMetrics.riskScore
          break
        default:
          return 0
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })
  }, [scenarios, results, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getOptimalIndicator = (scenarioId: string, metric: keyof ComparisonMetrics) => {
    if (!comparison || !showOptimalIndicators) return null

    const isOptimal = comparison.comparisonMetrics[metric] && 
      Object.values(comparison.comparisonMetrics[metric]).some(
        (item: any) => item.scenarioId === scenarioId
      )

    if (!isOptimal) return null

    return (
      <Crown className="h-4 w-4 text-yellow-500 ml-1" title="Optimal for this metric" />
    )
  }

  const getRiskBadge = (riskScore: number) => {
    if (riskScore <= 3) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low Risk</Badge>
    } else if (riskScore <= 6) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium Risk</Badge>
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High Risk</Badge>
    }
  }

  const getComparisonIcon = (value: number, baseline: number, higherIsBetter: boolean = true) => {
    const diff = ((value - baseline) / baseline) * 100
    
    if (Math.abs(diff) < 1) {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
    
    const isPositive = higherIsBetter ? diff > 0 : diff < 0
    return isPositive 
      ? <TrendingUp className="h-4 w-4 text-green-600" />
      : <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const baselineResult = results.find(r => 
    scenarios.find(s => s.id === r.scenarioId)?.isBaseline
  )

  if (scenarios.length === 0 || results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No scenarios to compare</h3>
          <p className="text-muted-foreground">
            Create at least 2 scenarios to see comparison data.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Scenario Comparison
            </CardTitle>
            <CardDescription>
              Compare key metrics across {scenarios.length} retirement scenarios
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Metrics
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedMetrics(['monthlyIncome', 'lifetimeIncome'])}>
                  Income Focus
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMetrics(['riskScore', 'flexibilityScore'])}>
                  Risk Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMetrics(['monthlyIncome', 'replacementRatio', 'riskScore'])}>
                  Balanced View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-medium"
                  >
                    Scenario
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Button>
                </TableHead>
                {selectedMetrics.includes('monthlyIncome') && (
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('monthlyIncome')}
                      className="h-auto p-0 font-medium"
                    >
                      Monthly Income
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </TableHead>
                )}
                {selectedMetrics.includes('lifetimeIncome') && (
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('lifetimeIncome')}
                      className="h-auto p-0 font-medium"
                    >
                      Lifetime Income
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </TableHead>
                )}
                {selectedMetrics.includes('replacementRatio') && (
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('replacementRatio')}
                      className="h-auto p-0 font-medium"
                    >
                      Replacement Ratio
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </TableHead>
                )}
                {selectedMetrics.includes('riskScore') && (
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('riskScore')}
                      className="h-auto p-0 font-medium"
                    >
                      Risk Level
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </TableHead>
                )}
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map(({ scenario, result }) => (
                <TableRow key={scenario.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scenario.name}</span>
                        {scenario.isBaseline && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Baseline
                          </Badge>
                        )}
                      </div>
                      {!compactView && scenario.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {scenario.description}
                        </p>
                      )}
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">
                          Retire at {scenario.personalParameters.retirementAge}
                        </Badge>
                        <Badge variant="outline">
                          Group {scenario.pensionParameters.retirementGroup}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  
                  {selectedMetrics.includes('monthlyIncome') && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium text-green-600">
                          {formatCurrency(result!.incomeProjections.totalMonthlyIncome)}
                        </span>
                        {baselineResult && baselineResult.scenarioId !== scenario.id && 
                          getComparisonIcon(
                            result!.incomeProjections.totalMonthlyIncome,
                            baselineResult.incomeProjections.totalMonthlyIncome
                          )
                        }
                        {getOptimalIndicator(scenario.id, 'incomeComparison')}
                      </div>
                    </TableCell>
                  )}
                  
                  {selectedMetrics.includes('lifetimeIncome') && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium text-blue-600">
                          {formatCurrency(result!.keyMetrics.totalLifetimeIncome)}
                        </span>
                        {baselineResult && baselineResult.scenarioId !== scenario.id && 
                          getComparisonIcon(
                            result!.keyMetrics.totalLifetimeIncome,
                            baselineResult.keyMetrics.totalLifetimeIncome
                          )
                        }
                        {getOptimalIndicator(scenario.id, 'incomeComparison')}
                      </div>
                    </TableCell>
                  )}
                  
                  {selectedMetrics.includes('replacementRatio') && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium text-purple-600">
                          {formatPercentage(result!.incomeProjections.replacementRatio)}
                        </span>
                        {baselineResult && baselineResult.scenarioId !== scenario.id && 
                          getComparisonIcon(
                            result!.incomeProjections.replacementRatio,
                            baselineResult.incomeProjections.replacementRatio
                          )
                        }
                        {getOptimalIndicator(scenario.id, 'incomeComparison')}
                      </div>
                    </TableCell>
                  )}
                  
                  {selectedMetrics.includes('riskScore') && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getRiskBadge(result!.keyMetrics.riskScore)}
                        {getOptimalIndicator(scenario.id, 'riskComparison')}
                      </div>
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <div className="flex gap-1">
                      {result!.taxAnalysis.effectiveTaxRate < 0.15 && (
                        <CheckCircle className="h-4 w-4 text-green-500" title="Tax efficient" />
                      )}
                      {result!.keyMetrics.flexibilityScore > 7 && (
                        <Shield className="h-4 w-4 text-blue-500" title="High flexibility" />
                      )}
                      {result!.keyMetrics.riskScore > 7 && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" title="High risk" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
