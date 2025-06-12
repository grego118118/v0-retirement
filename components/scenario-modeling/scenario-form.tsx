"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { 
  Calculator, 
  HelpCircle, 
  Save, 
  Copy, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Shield,
  Target,
  Settings
} from 'lucide-react'
import { RetirementScenario, DEFAULT_SCENARIO_TEMPLATES } from '@/lib/scenario-modeling/scenario-types'
import { validateScenario, createDefaultScenario } from '@/lib/scenario-modeling/scenario-utils'
import { calculateScenarioResults } from '@/lib/scenario-modeling/scenario-calculator'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

// Validation schema for scenario form
const scenarioFormSchema = z.object({
  name: z.string().min(1, 'Scenario name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  
  // Personal parameters
  retirementAge: z.number().min(50).max(80),
  lifeExpectancy: z.number().min(70).max(100),
  currentAge: z.number().min(18).max(75),
  
  // Pension parameters
  retirementGroup: z.enum(['1', '2', '3', '4']),
  yearsOfService: z.number().min(0).max(50),
  averageSalary: z.number().min(1000).max(500000),
  retirementOption: z.enum(['A', 'B', 'C', 'D']),
  beneficiaryAge: z.number().min(18).max(100).optional(),
  
  // Social Security parameters
  claimingAge: z.number().min(62).max(70),
  fullRetirementAge: z.number().min(65).max(67),
  fullRetirementBenefit: z.number().min(0).max(10000),
  isMarried: z.boolean(),
  spouseClaimingAge: z.number().min(62).max(70).optional(),
  spouseFullRetirementBenefit: z.number().min(0).max(10000).optional(),
  
  // Financial parameters
  otherRetirementIncome: z.number().min(0).max(100000),
  rothIRABalance: z.number().min(0).max(10000000),
  traditional401kBalance: z.number().min(0).max(10000000),
  traditionalIRABalance: z.number().min(0).max(10000000),
  savingsAccountBalance: z.number().min(0).max(10000000),
  expectedReturnRate: z.number().min(0.01).max(0.15),
  inflationRate: z.number().min(0.005).max(0.1),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
  withdrawalRate: z.number().min(0.02).max(0.08),
  
  // Tax parameters
  filingStatus: z.enum(['single', 'marriedJoint', 'marriedSeparate']),
  taxOptimizationStrategy: z.enum(['none', 'basic', 'advanced']),
  rothConversions: z.boolean(),
  
  // COLA parameters
  pensionCOLA: z.number().min(0).max(0.1),
  socialSecurityCOLA: z.number().min(0).max(0.1),
  colaScenario: z.enum(['conservative', 'moderate', 'optimistic'])
})

type ScenarioFormData = z.infer<typeof scenarioFormSchema>

interface ScenarioFormProps {
  scenario?: RetirementScenario
  onSave: (scenario: RetirementScenario) => void
  onCancel: () => void
  className?: string
}

export function ScenarioForm({ scenario, onSave, onCancel, className }: ScenarioFormProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [previewResults, setPreviewResults] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  const form = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioFormSchema),
    defaultValues: scenario ? {
      name: scenario.name,
      description: scenario.description || '',
      retirementAge: scenario.personalParameters.retirementAge,
      lifeExpectancy: scenario.personalParameters.lifeExpectancy,
      currentAge: scenario.personalParameters.currentAge,
      retirementGroup: scenario.pensionParameters.retirementGroup,
      yearsOfService: scenario.pensionParameters.yearsOfService,
      averageSalary: scenario.pensionParameters.averageSalary,
      retirementOption: scenario.pensionParameters.retirementOption,
      beneficiaryAge: scenario.pensionParameters.beneficiaryAge,
      claimingAge: scenario.socialSecurityParameters.claimingAge,
      fullRetirementAge: scenario.socialSecurityParameters.fullRetirementAge,
      fullRetirementBenefit: scenario.socialSecurityParameters.fullRetirementBenefit,
      isMarried: scenario.socialSecurityParameters.isMarried,
      spouseClaimingAge: scenario.socialSecurityParameters.spouseClaimingAge,
      spouseFullRetirementBenefit: scenario.socialSecurityParameters.spouseFullRetirementBenefit,
      otherRetirementIncome: scenario.financialParameters.otherRetirementIncome,
      rothIRABalance: scenario.financialParameters.rothIRABalance,
      traditional401kBalance: scenario.financialParameters.traditional401kBalance,
      traditionalIRABalance: scenario.financialParameters.traditionalIRABalance,
      savingsAccountBalance: scenario.financialParameters.savingsAccountBalance,
      expectedReturnRate: scenario.financialParameters.expectedReturnRate,
      inflationRate: scenario.financialParameters.inflationRate,
      riskTolerance: scenario.financialParameters.riskTolerance,
      withdrawalRate: scenario.financialParameters.withdrawalRate,
      filingStatus: scenario.taxParameters.filingStatus,
      taxOptimizationStrategy: scenario.taxParameters.taxOptimizationStrategy,
      rothConversions: scenario.taxParameters.rothConversions,
      pensionCOLA: scenario.colaParameters.pensionCOLA,
      socialSecurityCOLA: scenario.colaParameters.socialSecurityCOLA,
      colaScenario: scenario.colaParameters.colaScenario
    } : {
      name: 'New Scenario',
      description: '',
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAge: 45,
      retirementGroup: '1',
      yearsOfService: 20,
      averageSalary: 75000,
      retirementOption: 'A',
      claimingAge: 67,
      fullRetirementAge: 67,
      fullRetirementBenefit: 2500,
      isMarried: false,
      otherRetirementIncome: 0,
      rothIRABalance: 0,
      traditional401kBalance: 0,
      traditionalIRABalance: 0,
      savingsAccountBalance: 0,
      expectedReturnRate: 0.06,
      inflationRate: 0.025,
      riskTolerance: 'moderate',
      withdrawalRate: 0.04,
      filingStatus: 'single',
      taxOptimizationStrategy: 'basic',
      rothConversions: false,
      pensionCOLA: 0.03,
      socialSecurityCOLA: 0.025,
      colaScenario: 'moderate'
    }
  })

  // Watch form values for real-time preview
  const watchedValues = form.watch()

  // Calculate preview when form values change
  useEffect(() => {
    const calculatePreview = async () => {
      if (!form.formState.isValid) return
      
      setIsCalculating(true)
      try {
        const formData = form.getValues()
        const scenarioData = convertFormDataToScenario(formData)
        const results = await calculateScenarioResults(scenarioData)
        setPreviewResults(results)
      } catch (error) {
        console.error('Preview calculation error:', error)
      } finally {
        setIsCalculating(false)
      }
    }

    // Debounce the calculation
    const timeoutId = setTimeout(calculatePreview, 500)
    return () => clearTimeout(timeoutId)
  }, [watchedValues, form.formState.isValid])

  const convertFormDataToScenario = (formData: ScenarioFormData): RetirementScenario => {
    const now = new Date().toISOString()
    
    return {
      id: scenario?.id || `scenario_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      isBaseline: scenario?.isBaseline || false,
      createdAt: scenario?.createdAt || now,
      updatedAt: now,
      
      personalParameters: {
        retirementAge: formData.retirementAge,
        lifeExpectancy: formData.lifeExpectancy,
        currentAge: formData.currentAge,
        birthYear: new Date().getFullYear() - formData.currentAge
      },
      
      pensionParameters: {
        retirementGroup: formData.retirementGroup,
        yearsOfService: formData.yearsOfService,
        averageSalary: formData.averageSalary,
        retirementOption: formData.retirementOption,
        beneficiaryAge: formData.beneficiaryAge,
        servicePurchases: scenario?.pensionParameters.servicePurchases || []
      },
      
      socialSecurityParameters: {
        claimingAge: formData.claimingAge,
        fullRetirementAge: formData.fullRetirementAge,
        fullRetirementBenefit: formData.fullRetirementBenefit,
        earlyRetirementBenefit: formData.fullRetirementBenefit * 0.75, // Simplified calculation
        delayedRetirementBenefit: formData.fullRetirementBenefit * 1.32, // Simplified calculation
        isMarried: formData.isMarried,
        spouseClaimingAge: formData.spouseClaimingAge,
        spouseFullRetirementBenefit: formData.spouseFullRetirementBenefit,
        spouseFullRetirementAge: formData.fullRetirementAge
      },
      
      financialParameters: {
        otherRetirementIncome: formData.otherRetirementIncome,
        rothIRABalance: formData.rothIRABalance,
        traditional401kBalance: formData.traditional401kBalance,
        traditionalIRABalance: formData.traditionalIRABalance,
        savingsAccountBalance: formData.savingsAccountBalance,
        expectedReturnRate: formData.expectedReturnRate,
        inflationRate: formData.inflationRate,
        riskTolerance: formData.riskTolerance,
        withdrawalStrategy: 'percentage',
        withdrawalRate: formData.withdrawalRate,
        estimatedMedicarePremiums: 174.70,
        longTermCareInsurance: false,
        healthcareCostInflation: 0.05
      },
      
      taxParameters: {
        filingStatus: formData.filingStatus,
        stateOfResidence: 'MA',
        taxOptimizationStrategy: formData.taxOptimizationStrategy,
        rothConversions: formData.rothConversions,
        taxLossHarvesting: false
      },
      
      colaParameters: {
        pensionCOLA: formData.pensionCOLA,
        socialSecurityCOLA: formData.socialSecurityCOLA,
        colaScenario: formData.colaScenario
      }
    }
  }

  const onSubmit = async (data: ScenarioFormData) => {
    try {
      const scenarioData = convertFormDataToScenario(data)
      
      // Validate the scenario
      const validation = validateScenario(scenarioData)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast.error('Please fix validation errors before saving')
        return
      }
      
      if (validation.warnings.length > 0) {
        toast.warning(`Warnings: ${validation.warnings.join(', ')}`)
      }
      
      onSave(scenarioData)
      toast.success('Scenario saved successfully')
    } catch (error) {
      console.error('Error saving scenario:', error)
      toast.error('Failed to save scenario')
    }
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {scenario ? 'Edit Scenario' : 'Create New Scenario'}
            </CardTitle>
            <CardDescription>
              Configure retirement parameters to model different scenarios and compare outcomes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scenario Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Early Retirement at 62" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of this scenario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tabbed Interface for Parameters */}
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="pension" className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Pension
                    </TabsTrigger>
                    <TabsTrigger value="social-security" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Social Security
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Financial
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Parameters Tab */}
                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="currentAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Current Age
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Your current age in years</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="18" 
                                max="75" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="retirementAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Retirement Age
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Age when you plan to retire</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  min={50}
                                  max={80}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="text-center text-sm text-muted-foreground">
                                  {field.value} years old
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lifeExpectancy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Life Expectancy
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Expected lifespan for planning purposes</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="70" 
                                max="100" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Pension Parameters Tab */}
                  <TabsContent value="pension" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="retirementGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retirement Group</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Group 1 - General Employees</SelectItem>
                                <SelectItem value="2">Group 2 - Certain Public Safety</SelectItem>
                                <SelectItem value="3">Group 3 - State Police</SelectItem>
                                <SelectItem value="4">Group 4 - Public Safety</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearsOfService"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Years of Service
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Total years of creditable service</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  min={0}
                                  max={50}
                                  step={0.5}
                                  className="w-full"
                                />
                                <div className="text-center text-sm text-muted-foreground">
                                  {field.value} years
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="averageSalary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average Salary</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1000"
                                max="500000"
                                placeholder="75000"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Average of highest 3 years
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="retirementOption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retirement Option</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A">Option A - Full Allowance</SelectItem>
                                <SelectItem value="B">Option B - 66% Survivor Benefit</SelectItem>
                                <SelectItem value="C">Option C - 50% Survivor Benefit</SelectItem>
                                <SelectItem value="D">Option D - Pop-up Provision</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(form.watch('retirementOption') === 'B' || form.watch('retirementOption') === 'C') && (
                        <FormField
                          control={form.control}
                          name="beneficiaryAge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Beneficiary Age</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="18"
                                  max="100"
                                  placeholder="65"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </TabsContent>

                  {/* Social Security Parameters Tab */}
                  <TabsContent value="social-security" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="claimingAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Claiming Age
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Age when you start claiming Social Security</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  min={62}
                                  max={70}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="text-center text-sm text-muted-foreground">
                                  Age {field.value}
                                  {field.value < 67 && <Badge variant="secondary" className="ml-2">Early</Badge>}
                                  {field.value === 67 && <Badge variant="default" className="ml-2">Full</Badge>}
                                  {field.value > 67 && <Badge variant="outline" className="ml-2">Delayed</Badge>}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fullRetirementAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Retirement Age</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select age" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="65">65</SelectItem>
                                <SelectItem value="66">66</SelectItem>
                                <SelectItem value="67">67</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fullRetirementBenefit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Retirement Benefit</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="10000"
                                placeholder="2500"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Monthly benefit at full retirement age
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isMarried"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Married</FormLabel>
                              <FormDescription>
                                Include spousal benefits in calculations
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch('isMarried') && (
                        <>
                          <FormField
                            control={form.control}
                            name="spouseClaimingAge"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Spouse Claiming Age</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="62"
                                    max="70"
                                    placeholder="67"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="spouseFullRetirementBenefit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Spouse Full Retirement Benefit</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10000"
                                    placeholder="2000"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                  </TabsContent>

                  {/* Financial Parameters Tab */}
                  <TabsContent value="financial" className="space-y-4">
                    <div className="space-y-6">
                      {/* Retirement Accounts */}
                      <div>
                        <h4 className="text-lg font-medium mb-4">Retirement Accounts</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name="traditional401kBalance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>401(k) Balance</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10000000"
                                    placeholder="200000"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="rothIRABalance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Roth IRA Balance</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10000000"
                                    placeholder="100000"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="traditionalIRABalance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Traditional IRA Balance</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10000000"
                                    placeholder="50000"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="savingsAccountBalance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Savings Balance</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10000000"
                                    placeholder="25000"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Investment Strategy */}
                      <div>
                        <h4 className="text-lg font-medium mb-4">Investment Strategy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="riskTolerance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Risk Tolerance</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select risk level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="conservative">Conservative (Lower risk, stable returns)</SelectItem>
                                    <SelectItem value="moderate">Moderate (Balanced approach)</SelectItem>
                                    <SelectItem value="aggressive">Aggressive (Higher risk, higher potential returns)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="expectedReturnRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  Expected Return Rate
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Annual expected return on investments</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[field.value * 100]}
                                      onValueChange={(value) => field.onChange(value[0] / 100)}
                                      min={1}
                                      max={15}
                                      step={0.1}
                                      className="w-full"
                                    />
                                    <div className="text-center text-sm text-muted-foreground">
                                      {(field.value * 100).toFixed(1)}% annually
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="withdrawalRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  Withdrawal Rate
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Annual withdrawal rate from portfolio</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[field.value * 100]}
                                      onValueChange={(value) => field.onChange(value[0] / 100)}
                                      min={2}
                                      max={8}
                                      step={0.1}
                                      className="w-full"
                                    />
                                    <div className="text-center text-sm text-muted-foreground">
                                      {(field.value * 100).toFixed(1)}% annually
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Other Income */}
                      <div>
                        <h4 className="text-lg font-medium mb-4">Other Income</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="otherRetirementIncome"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Other Retirement Income</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100000"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Annual income from other sources (rental, part-time work, etc.)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="inflationRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inflation Rate</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[field.value * 100]}
                                      onValueChange={(value) => field.onChange(value[0] / 100)}
                                      min={0.5}
                                      max={10}
                                      step={0.1}
                                      className="w-full"
                                    />
                                    <div className="text-center text-sm text-muted-foreground">
                                      {(field.value * 100).toFixed(1)}% annually
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Advanced Parameters Tab */}
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-6">
                      {/* Tax Settings */}
                      <div>
                        <h4 className="text-lg font-medium mb-4">Tax Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="filingStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Filing Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="single">Single</SelectItem>
                                    <SelectItem value="marriedJoint">Married Filing Jointly</SelectItem>
                                    <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="taxOptimizationStrategy"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax Optimization</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select strategy" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="basic">Basic Optimization</SelectItem>
                                    <SelectItem value="advanced">Advanced Strategies</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="rothConversions"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Roth Conversions</FormLabel>
                                  <FormDescription>
                                    Include Roth conversion strategies
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* COLA Settings */}
                      <div>
                        <h4 className="text-lg font-medium mb-4">Cost of Living Adjustments</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="pensionCOLA"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pension COLA Rate</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[field.value * 100]}
                                      onValueChange={(value) => field.onChange(value[0] / 100)}
                                      min={0}
                                      max={10}
                                      step={0.1}
                                      className="w-full"
                                    />
                                    <div className="text-center text-sm text-muted-foreground">
                                      {(field.value * 100).toFixed(1)}% annually
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="socialSecurityCOLA"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Social Security COLA Rate</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[field.value * 100]}
                                      onValueChange={(value) => field.onChange(value[0] / 100)}
                                      min={0}
                                      max={10}
                                      step={0.1}
                                      className="w-full"
                                    />
                                    <div className="text-center text-sm text-muted-foreground">
                                      {(field.value * 100).toFixed(1)}% annually
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="colaScenario"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>COLA Scenario</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select scenario" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="conservative">Conservative (Lower COLA)</SelectItem>
                                    <SelectItem value="moderate">Moderate (Historical Average)</SelectItem>
                                    <SelectItem value="optimistic">Optimistic (Higher COLA)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isCalculating}>
                      <Save className="h-4 w-4 mr-2" />
                      {scenario ? 'Update Scenario' : 'Save Scenario'}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Real-time Preview */}
        {previewResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Scenario Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(previewResults.incomeProjections.totalMonthlyIncome)}
                  </div>
                  <div className="text-sm text-muted-foreground">Monthly Income</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(previewResults.incomeProjections.replacementRatio * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Replacement Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(previewResults.keyMetrics.totalLifetimeIncome)}
                  </div>
                  <div className="text-sm text-muted-foreground">Lifetime Income</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
