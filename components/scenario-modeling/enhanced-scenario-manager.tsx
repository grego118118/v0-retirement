"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Calculator, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Copy,
  Trash2,
  Star,
  StarOff,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { ScenarioForm } from './scenario-form'
import { ScenarioTemplateSelector } from './scenario-template-selector'
import { ScenarioComparisonDashboard } from './scenario-comparison-dashboard'
import { useScenarios } from '@/lib/hooks/use-scenarios'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface EnhancedScenarioManagerProps {
  className?: string
  onScenarioSelect?: (scenario: RetirementScenario) => void
  showComparison?: boolean
}

export function EnhancedScenarioManager({ 
  className,
  onScenarioSelect,
  showComparison = true
}: EnhancedScenarioManagerProps) {
  const {
    scenarios,
    loading,
    error,
    pagination,
    createScenario,
    updateScenario,
    deleteScenario,
    duplicateScenario,
    setBaseline,
    recalculateScenario,
    bulkDelete,
    bulkDuplicate,
    createComparison,
    refreshScenarios,
    loadMore,
    searchScenarios,
    filterByBaseline
  } = useScenarios({ initialLimit: 20, autoRefresh: false })

  // UI State
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBaseline, setFilterBaseline] = useState<boolean | undefined>(undefined)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [editingScenario, setEditingScenario] = useState<RetirementScenario | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [activeTab, setActiveTab] = useState('scenarios')

  // Handle search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchScenarios(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, searchScenarios])

  // Handle filter changes
  useEffect(() => {
    filterByBaseline(filterBaseline)
  }, [filterBaseline, filterByBaseline])

  const handleSelectAll = () => {
    if (selectedScenarios.length === scenarios.length) {
      setSelectedScenarios([])
    } else {
      setSelectedScenarios(scenarios.map(s => s.id))
    }
  }

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    )
  }

  const handleCreateFromTemplate = async (scenario: RetirementScenario) => {
    // Create the scenario using the template data
    try {
      await createScenario(scenario)
      setShowTemplateSelector(false)
      toast.success(`Scenario "${scenario.name}" created successfully!`)
    } catch (error) {
      console.error('Error creating scenario from template:', error)
      toast.error('Failed to create scenario from template')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedScenarios.length === 0) return
    
    const success = await bulkDelete(selectedScenarios)
    if (success) {
      setSelectedScenarios([])
      setShowBulkActions(false)
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedScenarios.length === 0) return
    
    const duplicated = await bulkDuplicate(selectedScenarios)
    if (duplicated.length > 0) {
      setSelectedScenarios([])
      setShowBulkActions(false)
    }
  }

  const handleCreateComparison = async () => {
    if (selectedScenarios.length < 2) {
      toast.error('Please select at least 2 scenarios to compare')
      return
    }
    
    const comparison = await createComparison(
      selectedScenarios,
      `Comparison of ${selectedScenarios.length} scenarios`,
      `Created on ${new Date().toLocaleDateString()}`
    )
    
    if (comparison) {
      setSelectedScenarios([])
      setActiveTab('comparison')
    }
  }

  const getScenarioStatusIcon = (scenario: RetirementScenario) => {
    if (scenario.isBaseline) return <Star className="h-4 w-4 text-yellow-500" />
    if (scenario.results) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <Clock className="h-4 w-4 text-gray-400" />
  }

  const getScenarioStatusText = (scenario: RetirementScenario) => {
    if (scenario.isBaseline) return 'Baseline'
    if (scenario.results) return 'Calculated'
    return 'Pending'
  }

  const getRiskBadgeColor = (riskScore?: number) => {
    if (!riskScore) return 'secondary'
    if (riskScore <= 3) return 'default' // Low risk - green
    if (riskScore <= 6) return 'secondary' // Medium risk - yellow
    return 'destructive' // High risk - red
  }

  const getRiskText = (riskScore?: number) => {
    if (!riskScore) return 'Unknown'
    if (riskScore <= 3) return 'Low Risk'
    if (riskScore <= 6) return 'Medium Risk'
    return 'High Risk'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scenario Management</h2>
          <p className="text-gray-600">
            Create, compare, and manage your retirement scenarios
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowTemplateSelector(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Scenario
          </Button>
          
          <Button
            variant="outline"
            onClick={refreshScenarios}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {selectedScenarios.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Bulk Actions ({selectedScenarios.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Selected
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleCreateComparison}
                  disabled={selectedScenarios.length < 2}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Compare Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleBulkDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search scenarios by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filterBaseline?.toString() || 'all'}
                onValueChange={(value) => 
                  setFilterBaseline(value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scenarios</SelectItem>
                  <SelectItem value="true">Baseline Only</SelectItem>
                  <SelectItem value="false">Non-Baseline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Scenarios ({scenarios.length})
          </TabsTrigger>
          {showComparison && (
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparison
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          {/* Bulk Selection Header */}
          {scenarios.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                checked={selectedScenarios.length === scenarios.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">
                {selectedScenarios.length > 0 
                  ? `${selectedScenarios.length} of ${scenarios.length} selected`
                  : 'Select all scenarios'
                }
              </span>
            </div>
          )}

          {/* Scenarios Grid */}
          {loading && scenarios.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : scenarios.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No scenarios found
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Create your first retirement scenario to get started with planning and comparisons.
                </p>
                <Button onClick={() => setShowTemplateSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Scenario
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((scenario) => (
                <Card 
                  key={scenario.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedScenarios.includes(scenario.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : ''
                  } ${scenario.isBaseline ? 'border-yellow-300 bg-yellow-50' : ''}`}
                  onClick={() => onScenarioSelect?.(scenario)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedScenarios.includes(scenario.id)}
                          onCheckedChange={() => handleSelectScenario(scenario.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {getScenarioStatusIcon(scenario)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {scenario.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {getScenarioStatusText(scenario)}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingScenario(scenario)}>
                            Edit Scenario
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateScenario(scenario.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setBaseline(scenario.id)}
                            disabled={scenario.isBaseline}
                          >
                            {scenario.isBaseline ? (
                              <StarOff className="h-4 w-4 mr-2" />
                            ) : (
                              <Star className="h-4 w-4 mr-2" />
                            )}
                            {scenario.isBaseline ? 'Remove Baseline' : 'Set as Baseline'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => recalculateScenario(scenario.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Recalculate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteScenario(scenario.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {scenario.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {scenario.description}
                      </p>
                    )}
                    
                    {scenario.results && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Income:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(scenario.results.totalMonthlyIncome)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Replacement Ratio:</span>
                          <span className="font-semibold">
                            {(scenario.results.replacementRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Risk Level:</span>
                          <Badge variant={getRiskBadgeColor(scenario.results.riskScore)}>
                            {getRiskText(scenario.results.riskScore)}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-xs text-gray-500">
                        Retirement Age: {scenario.personalParameters.retirementAge}
                      </span>
                      <span className="text-xs text-gray-500">
                        Updated: {new Date(scenario.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {pagination.hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Load More Scenarios
              </Button>
            </div>
          )}
        </TabsContent>

        {showComparison && (
          <TabsContent value="comparison">
            <ScenarioComparisonDashboard
              scenarios={scenarios.filter(s => selectedScenarios.includes(s.id))}
              results={scenarios
                .filter(s => selectedScenarios.includes(s.id) && s.results)
                .map(s => s.results!)
              }
              onSelectOptimalScenario={onScenarioSelect}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose a Scenario Template</DialogTitle>
            <DialogDescription>
              Select a template to get started with your new retirement scenario
            </DialogDescription>
          </DialogHeader>
          <ScenarioTemplateSelector
            onSelectTemplate={handleCreateFromTemplate}
            onCancel={() => setShowTemplateSelector(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
            </DialogTitle>
            <DialogDescription>
              {editingScenario 
                ? 'Modify your retirement scenario parameters'
                : 'Configure your retirement scenario parameters'
              }
            </DialogDescription>
          </DialogHeader>
          <ScenarioForm
            scenario={editingScenario}
            onSave={async (scenarioData) => {
              if (editingScenario) {
                await updateScenario(editingScenario.id, scenarioData)
              } else {
                await createScenario(scenarioData)
              }
              setShowCreateDialog(false)
              setEditingScenario(null)
            }}
            onCancel={() => {
              setShowCreateDialog(false)
              setEditingScenario(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
