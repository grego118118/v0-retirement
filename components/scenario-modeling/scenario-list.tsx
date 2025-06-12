"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Star,
  StarOff,
  Search,
  Filter,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  Shield,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react'
import { RetirementScenario, ScenarioResults } from '@/lib/scenario-modeling/scenario-types'
import { calculateScenarioComplexity } from '@/lib/scenario-modeling/scenario-utils'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface ScenarioWithResults extends RetirementScenario {
  results?: ScenarioResults | null
}

interface ScenarioListProps {
  scenarios: ScenarioWithResults[]
  results?: ScenarioResults[] // Keep for backward compatibility
  onEdit: (scenario: RetirementScenario) => void
  onDuplicate: (scenario: RetirementScenario) => void
  onDelete: (scenarioId: string) => void
  onToggleBaseline: (scenarioId: string) => void
  onCreateNew: () => void
  onCompare: (scenarioIds: string[]) => void
  className?: string
}

export function ScenarioList({
  scenarios,
  results = [],
  onEdit,
  onDuplicate,
  onDelete,
  onToggleBaseline,
  onCreateNew,
  onCompare,
  className
}: ScenarioListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'income' | 'risk'>('created')
  const [filterBy, setFilterBy] = useState<'all' | 'baseline' | 'high-income' | 'low-risk'>('all')
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])

  // Filter and sort scenarios
  const filteredAndSortedScenarios = scenarios
    .filter(scenario => {
      // Search filter
      if (searchTerm && !scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !scenario.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Category filter
      switch (filterBy) {
        case 'baseline':
          return scenario.isBaseline
        case 'high-income':
          return scenario.pensionParameters.averageSalary > 100000
        case 'low-risk':
          return calculateScenarioComplexity(scenario) <= 3
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'income':
          const aResult = getScenarioResult(a)
          const bResult = getScenarioResult(b)
          const aIncome = aResult?.incomeProjections?.totalMonthlyIncome || aResult?.totalMonthlyIncome || 0
          const bIncome = bResult?.incomeProjections?.totalMonthlyIncome || bResult?.totalMonthlyIncome || 0
          return bIncome - aIncome
        case 'risk':
          const aRisk = calculateScenarioComplexity(a)
          const bRisk = calculateScenarioComplexity(b)
          return bRisk - aRisk
        default:
          return 0
      }
    })

  const handleSelectScenario = (scenarioId: string, selected: boolean) => {
    if (selected) {
      setSelectedScenarios(prev => [...prev, scenarioId])
    } else {
      setSelectedScenarios(prev => prev.filter(id => id !== scenarioId))
    }
  }

  const handleSelectAll = () => {
    if (selectedScenarios.length === filteredAndSortedScenarios.length) {
      setSelectedScenarios([])
    } else {
      setSelectedScenarios(filteredAndSortedScenarios.map(s => s.id))
    }
  }

  const handleCompareSelected = () => {
    if (selectedScenarios.length < 2) {
      toast.error('Please select at least 2 scenarios to compare')
      return
    }
    if (selectedScenarios.length > 5) {
      toast.error('Please select no more than 5 scenarios to compare')
      return
    }

    // Check if selected scenarios have calculated results
    const selectedScenariosWithResults = selectedScenarios.filter(id => {
      const scenario = scenarios.find(s => s.id === id)
      return scenario && getScenarioResult(scenario)
    })

    if (selectedScenariosWithResults.length < 2) {
      toast.error(`Only ${selectedScenariosWithResults.length} of your selected scenarios have calculated results. Please ensure at least 2 scenarios have been calculated before comparing.`)
      return
    }

    onCompare(selectedScenarios)
  }

  const getScenarioResult = (scenario: ScenarioWithResults) => {
    // First check if the scenario has embedded results
    if (scenario.results) {
      return scenario.results
    }
    // Fall back to separate results array for backward compatibility
    return results?.find(r => r.scenarioId === scenario.id)
  }

  const getRiskBadgeColor = (complexity: number) => {
    if (complexity <= 3) return 'bg-green-100 text-green-800'
    if (complexity <= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRiskLabel = (complexity: number) => {
    if (complexity <= 3) return 'Low Risk'
    if (complexity <= 6) return 'Medium Risk'
    return 'High Risk'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Retirement Scenarios ({scenarios.length})
              </CardTitle>
              <CardDescription>
                Manage and compare your retirement scenarios
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedScenarios.length > 0 && (
                <Button 
                  onClick={handleCompareSelected}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Compare ({selectedScenarios.length})
                </Button>
              )}
              <Button onClick={onCreateNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Scenario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search scenarios</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search scenarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="risk">Risk Level</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scenarios</SelectItem>
                  <SelectItem value="baseline">Baseline Only</SelectItem>
                  <SelectItem value="high-income">High Income</SelectItem>
                  <SelectItem value="low-risk">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {scenarios.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedScenarios.length === filteredAndSortedScenarios.length && filteredAndSortedScenarios.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <Label className="text-sm">
                  Select All ({filteredAndSortedScenarios.length})
                </Label>
              </div>
              {selectedScenarios.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedScenarios.length} selected
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      {filteredAndSortedScenarios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No scenarios found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first retirement scenario to get started'
              }
            </p>
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Scenario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedScenarios.map((scenario) => {
            const result = getScenarioResult(scenario)
            const complexity = calculateScenarioComplexity(scenario)
            const isSelected = selectedScenarios.includes(scenario.id)

            return (
              <Card 
                key={scenario.id} 
                className={`transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${scenario.isBaseline ? 'border-primary' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectScenario(scenario.id, e.target.checked)}
                        className="mt-1 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base truncate">
                            {scenario.name}
                          </CardTitle>
                          {scenario.isBaseline && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Baseline
                            </Badge>
                          )}
                          {result && (
                            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3" />
                              Calculated
                            </Badge>
                          )}
                          {!result && (
                            <Badge variant="outline" className="flex items-center gap-1 text-gray-500">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        {scenario.description && (
                          <CardDescription className="text-sm line-clamp-2">
                            {scenario.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(scenario)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(scenario)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleBaseline(scenario.id)}>
                          {scenario.isBaseline ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Remove Baseline
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Baseline
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(scenario.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  {result && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Monthly Income</div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(
                            result.incomeProjections?.totalMonthlyIncome ||
                            result.totalMonthlyIncome ||
                            0
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Replacement</div>
                        <div className="font-medium text-blue-600">
                          {(
                            (result.incomeProjections?.replacementRatio ||
                             result.replacementRatio ||
                             0) * 100
                          ).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scenario Details */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Retire at {scenario.personalParameters.retirementAge}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Group {scenario.pensionParameters.retirementGroup}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 ${getRiskBadgeColor(complexity)}`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {getRiskLabel(complexity)}
                    </Badge>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(scenario.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
