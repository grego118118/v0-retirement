"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Calculator, 
  Plus, 
  Target, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { ScenarioForm } from './scenario-form'
import { ScenarioTemplateSelector } from './scenario-template-selector'
import { ScenarioList } from './scenario-list'
import { RetirementScenario, ScenarioResults } from '@/lib/scenario-modeling/scenario-types'
import { createDefaultScenario, duplicateScenario } from '@/lib/scenario-modeling/scenario-utils'
import { calculateScenarioResults, calculateMultipleScenarios } from '@/lib/scenario-modeling/scenario-calculator'
import { toast } from 'sonner'

interface ScenarioManagerProps {
  initialScenarios?: RetirementScenario[]
  baseUserData?: Partial<RetirementScenario>
  onScenariosChange?: (scenarios: RetirementScenario[]) => void
  className?: string
}

export function ScenarioManager({ 
  initialScenarios = [], 
  baseUserData,
  onScenariosChange,
  className 
}: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<RetirementScenario[]>(initialScenarios)
  const [scenarioResults, setScenarioResults] = useState<ScenarioResults[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [editingScenario, setEditingScenario] = useState<RetirementScenario | null>(null)
  const [activeTab, setActiveTab] = useState('scenarios')

  // Calculate results for all scenarios when scenarios change
  useEffect(() => {
    const calculateAllResults = async () => {
      if (scenarios.length === 0) return
      
      setIsCalculating(true)
      try {
        const results = await calculateMultipleScenarios(scenarios)
        setScenarioResults(results)
      } catch (error) {
        console.error('Error calculating scenario results:', error)
        toast.error('Failed to calculate scenario results')
      } finally {
        setIsCalculating(false)
      }
    }

    calculateAllResults()
  }, [scenarios])

  // Notify parent component of scenario changes
  useEffect(() => {
    onScenariosChange?.(scenarios)
  }, [scenarios, onScenariosChange])

  const handleCreateScenario = () => {
    setEditingScenario(null)
    setShowTemplateSelector(true)
  }

  const handleCreateBlankScenario = () => {
    const defaultScenario = createDefaultScenario('New Scenario', baseUserData)
    setEditingScenario(defaultScenario)
    setShowTemplateSelector(false)
    setShowForm(true)
  }

  const handleSelectTemplate = (scenario: RetirementScenario) => {
    setEditingScenario(scenario)
    setShowTemplateSelector(false)
    setShowForm(true)
  }

  const handleEditScenario = (scenario: RetirementScenario) => {
    setEditingScenario(scenario)
    setShowForm(true)
  }

  const handleDuplicateScenario = (scenario: RetirementScenario) => {
    const duplicated = duplicateScenario(scenario)
    setScenarios(prev => [...prev, duplicated])
    toast.success(`Duplicated scenario: ${duplicated.name}`)
  }

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId))
    setScenarioResults(prev => prev.filter(r => r.scenarioId !== scenarioId))
    toast.success('Scenario deleted')
  }

  const handleToggleBaseline = (scenarioId: string) => {
    setScenarios(prev => prev.map(scenario => ({
      ...scenario,
      isBaseline: scenario.id === scenarioId ? !scenario.isBaseline : false
    })))
    
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (scenario) {
      toast.success(`${scenario.name} ${scenario.isBaseline ? 'removed as' : 'set as'} baseline`)
    }
  }

  const handleSaveScenario = (scenarioData: RetirementScenario) => {
    if (editingScenario && scenarios.find(s => s.id === editingScenario.id)) {
      // Update existing scenario
      setScenarios(prev => prev.map(s => 
        s.id === scenarioData.id ? scenarioData : s
      ))
      toast.success('Scenario updated successfully')
    } else {
      // Add new scenario
      setScenarios(prev => [...prev, scenarioData])
      toast.success('Scenario created successfully')
    }
    
    setShowForm(false)
    setEditingScenario(null)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingScenario(null)
  }

  const handleCompareScenarios = (scenarioIds: string[]) => {
    // This would typically navigate to a comparison page
    // For now, we'll just show a toast
    toast.success(`Comparing ${scenarioIds.length} scenarios`)
    setActiveTab('comparison')
  }

  const getBaseScenario = (): RetirementScenario => {
    return baseUserData ? createDefaultScenario('Base Scenario', baseUserData) : createDefaultScenario('Base Scenario')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Retirement Scenario Modeling
          </CardTitle>
          <CardDescription>
            Create, compare, and analyze different retirement scenarios to optimize your retirement planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleCreateScenario}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Scenario
            </Button>
            
            {isCalculating && (
              <Alert className="flex-1">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Calculating scenario results...
                </AlertDescription>
              </Alert>
            )}
            
            {scenarios.length > 0 && !isCalculating && (
              <Alert className="flex-1">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} ready for analysis
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scenarios ({scenarios.length})
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          {scenarios.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No scenarios created yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first retirement scenario to start modeling different retirement strategies.
                </p>
                <Button onClick={handleCreateScenario} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Scenario
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScenarioList
              scenarios={scenarios}
              results={scenarioResults}
              onEdit={handleEditScenario}
              onDuplicate={handleDuplicateScenario}
              onDelete={handleDeleteScenario}
              onToggleBaseline={handleToggleBaseline}
              onCreateNew={handleCreateScenario}
              onCompare={handleCompareScenarios}
            />
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>
                Compare multiple scenarios side by side to identify the best retirement strategy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scenarios.length < 2 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Need more scenarios</h3>
                  <p className="text-muted-foreground mb-4">
                    Create at least 2 scenarios to enable comparison features.
                  </p>
                  <Button onClick={handleCreateScenario} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Another Scenario
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Comparison View</h3>
                  <p className="text-muted-foreground">
                    Select scenarios from the Scenarios tab to compare them here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analysis</CardTitle>
              <CardDescription>
                Deep dive into scenario analytics, risk assessment, and optimization recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed analysis features will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Scenario Template</DialogTitle>
            <DialogDescription>
              Start with a predefined template or create a custom scenario from scratch.
            </DialogDescription>
          </DialogHeader>
          <ScenarioTemplateSelector
            baseScenario={getBaseScenario()}
            onSelectTemplate={handleSelectTemplate}
            onCreateBlank={handleCreateBlankScenario}
          />
        </DialogContent>
      </Dialog>

      {/* Scenario Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingScenario && scenarios.find(s => s.id === editingScenario.id) 
                ? 'Edit Scenario' 
                : 'Create New Scenario'
              }
            </DialogTitle>
            <DialogDescription>
              Configure retirement parameters to model different scenarios and compare outcomes.
            </DialogDescription>
          </DialogHeader>
          <ScenarioForm
            scenario={editingScenario || undefined}
            onSave={handleSaveScenario}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
