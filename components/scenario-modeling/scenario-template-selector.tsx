"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  Shield, 
  TrendingUp, 
  Calculator, 
  Star,
  ArrowRight,
  Calendar,
  DollarSign,
  Target
} from 'lucide-react'
import { DEFAULT_SCENARIO_TEMPLATES, ScenarioTemplate, RetirementScenario } from '@/lib/scenario-modeling/scenario-types'
import { createScenarioFromTemplate } from '@/lib/scenario-modeling/scenario-utils'

interface ScenarioTemplateSelectorProps {
  baseScenario?: RetirementScenario
  onSelectTemplate: (scenario: RetirementScenario) => void
  onCreateBlank?: () => void
  onCancel?: () => void
  className?: string
}

export function ScenarioTemplateSelector({
  baseScenario,
  onSelectTemplate,
  onCreateBlank,
  onCancel,
  className
}: ScenarioTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Create a default base scenario if none provided
  const defaultBaseScenario: RetirementScenario = {
    id: 'temp',
    name: 'New Scenario',
    description: '',
    isBaseline: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personalParameters: {
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAge: 45,
      birthYear: new Date().getFullYear() - 45
    },
    pensionParameters: {
      retirementGroup: '1',
      yearsOfService: 20,
      averageSalary: 75000,
      retirementOption: 'A'
    },
    socialSecurityParameters: {
      claimingAge: 67,
      fullRetirementAge: 67,
      estimatedBenefit: 2000, // Required field for Zod validation
      spousalBenefit: 0,
      survivorBenefit: 0
    },
    financialParameters: {
      currentSavings: 50000, // Required field for Zod validation
      monthlyContributions: 500, // Required field for Zod validation
      expectedReturnRate: 0.06,
      riskTolerance: 'moderate' as const,
      withdrawalRate: 0.04,
      otherRetirementIncome: 0
    },
    taxParameters: {
      filingStatus: 'single' as const,
      stateOfResidence: 'MA',
      taxOptimizationStrategy: 'basic' as const,
      rothConversions: false,
      taxLossHarvesting: false
    },
    colaParameters: {
      pensionCOLA: 0.03,
      socialSecurityCOLA: 0.025,
      colaScenario: 'moderate' as const
    }
  }

  const effectiveBaseScenario = baseScenario || defaultBaseScenario

  // Group templates by category
  const templatesByCategory = DEFAULT_SCENARIO_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, ScenarioTemplate[]>)

  const popularTemplates = DEFAULT_SCENARIO_TEMPLATES.filter(t => t.isPopular)

  const handleTemplateSelect = (template: ScenarioTemplate) => {
    try {
      const newScenario = createScenarioFromTemplate(template.id, effectiveBaseScenario.name, effectiveBaseScenario)
      onSelectTemplate(newScenario)
    } catch (error) {
      console.error('Error creating scenario from template:', error)
    }
  }

  const handleCreateBlank = () => {
    if (onCreateBlank) {
      onCreateBlank()
    } else if (onCancel) {
      // If no onCreateBlank provided, just close the dialog
      onCancel()
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'retirement_age':
        return <Calendar className="h-4 w-4" />
      case 'benefit_option':
        return <Shield className="h-4 w-4" />
      case 'investment':
        return <TrendingUp className="h-4 w-4" />
      case 'tax':
        return <Calculator className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'retirement_age':
        return 'Retirement Age Scenarios'
      case 'benefit_option':
        return 'Benefit Option Scenarios'
      case 'investment':
        return 'Investment Strategy Scenarios'
      case 'tax':
        return 'Tax Optimization Scenarios'
      default:
        return 'Other Scenarios'
    }
  }

  const TemplateCard = ({ template }: { template: ScenarioTemplate }) => (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
      onClick={() => handleTemplateSelect(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(template.category)}
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {template.name}
            </CardTitle>
          </div>
          {template.isPopular && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Popular
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Applicable to: Groups {template.applicableGroups.join(', ')}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Choose a Scenario Template
          </CardTitle>
          <CardDescription>
            Start with a predefined template or create a custom scenario from scratch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateBlank} variant="outline" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Create Blank Scenario
              </Button>
            </div>

            {/* Popular Templates */}
            {popularTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Popular Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates by Category */}
            <div>
              <h3 className="text-lg font-medium mb-4">All Templates</h3>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="retirement_age" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Age</span>
                  </TabsTrigger>
                  <TabsTrigger value="benefit_option" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Benefits</span>
                  </TabsTrigger>
                  <TabsTrigger value="investment" className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Investment</span>
                  </TabsTrigger>
                  <TabsTrigger value="tax" className="flex items-center gap-1">
                    <Calculator className="h-4 w-4" />
                    <span className="hidden sm:inline">Tax</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="space-y-6">
                    {Object.entries(templatesByCategory).map(([category, templates]) => (
                      <div key={category}>
                        <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                          {getCategoryIcon(category)}
                          {getCategoryTitle(category)}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {templates.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {Object.entries(templatesByCategory).map(([category, templates]) => (
                  <TabsContent key={category} value={category} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Details */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Template Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <div className="font-medium">Save Time</div>
                <div className="text-muted-foreground">Pre-configured parameters based on common scenarios</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Best Practices</div>
                <div className="text-muted-foreground">Templates follow recommended retirement planning strategies</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-purple-500 mt-0.5" />
              <div>
                <div className="font-medium">Optimized</div>
                <div className="text-muted-foreground">Parameters optimized for Massachusetts Retirement System</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
