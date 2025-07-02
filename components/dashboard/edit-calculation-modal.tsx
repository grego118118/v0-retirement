"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { 
  calculatePensionWithOption, 
  calculateAnnualPension,
  getBenefitFactor 
} from "@/lib/pension-calculations"
import {
  Save,
  X,
  Calculator,
  AlertCircle,
  Info,
  Calendar,
  DollarSign,
  Users,
  Shield
} from "lucide-react"

interface RetirementCalculation {
  id?: string
  calculationName?: string
  retirementDate: string
  retirementAge: number
  yearsOfService: number
  averageSalary: number
  retirementGroup: string
  benefitPercentage: number
  retirementOption: string
  monthlyBenefit: number
  annualBenefit: number
  benefitReduction?: number
  survivorBenefit?: number
  notes?: string
  isFavorite?: boolean
  createdAt?: string
  updatedAt?: string
  socialSecurityData?: {
    fullRetirementAge?: number
    earlyRetirementBenefit?: number
    fullRetirementBenefit?: number
    delayedRetirementBenefit?: number
    selectedClaimingAge?: number
    selectedMonthlyBenefit?: number
    combinedMonthlyIncome?: number
    replacementRatio?: number
  }
}

interface EditCalculationModalProps {
  isOpen: boolean
  onClose: () => void
  calculation: RetirementCalculation | null
  onSave: (id: string, updates: Partial<RetirementCalculation>) => Promise<void>
  loading?: boolean
}

export function EditCalculationModal({ 
  isOpen, 
  onClose, 
  calculation, 
  onSave,
  loading = false 
}: EditCalculationModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<RetirementCalculation>>({})
  const [saving, setSaving] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when calculation changes
  useEffect(() => {
    if (calculation && isOpen) {
      setFormData({
        calculationName: calculation.calculationName || '',
        retirementAge: calculation.retirementAge,
        yearsOfService: calculation.yearsOfService,
        averageSalary: calculation.averageSalary,
        retirementGroup: calculation.retirementGroup,
        retirementOption: calculation.retirementOption,
        notes: calculation.notes || '',
        isFavorite: calculation.isFavorite || false
      })
      setErrors({})
    }
  }, [calculation, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.calculationName?.trim()) {
      newErrors.calculationName = "Calculation name is required"
    }

    if (!formData.retirementAge || formData.retirementAge < 50 || formData.retirementAge > 80) {
      newErrors.retirementAge = "Retirement age must be between 50 and 80"
    }

    if (!formData.yearsOfService || formData.yearsOfService < 0 || formData.yearsOfService > 50) {
      newErrors.yearsOfService = "Years of service must be between 0 and 50"
    }

    if (!formData.averageSalary || formData.averageSalary < 1000 || formData.averageSalary > 500000) {
      newErrors.averageSalary = "Average salary must be between $1,000 and $500,000"
    }

    if (!formData.retirementGroup) {
      newErrors.retirementGroup = "Retirement group is required"
    }

    if (!formData.retirementOption) {
      newErrors.retirementOption = "Retirement option is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const recalculateBenefits = async () => {
    if (!formData.retirementAge || !formData.yearsOfService || !formData.averageSalary || !formData.retirementGroup) {
      return
    }

    setRecalculating(true)
    try {
      // Calculate new pension amounts
      const annualPension = calculateAnnualPension(
        formData.averageSalary,
        formData.retirementAge,
        formData.yearsOfService,
        formData.retirementOption as 'A' | 'B' | 'C',
        `GROUP_${formData.retirementGroup}`,
        'before_2012', // Default assumption
        "65", // Default beneficiary age
        false // Default veteran status
      )

      const optionResult = calculatePensionWithOption(
        annualPension,
        formData.retirementOption as 'A' | 'B' | 'C',
        formData.retirementAge,
        "65",
        formData.retirementGroup
      )

      const benefitFactor = getBenefitFactor(
        formData.retirementAge,
        `GROUP_${formData.retirementGroup}`,
        'before_2012',
        formData.yearsOfService
      )

      // Calculate reduction percentage
      const reductionPercentage = ((annualPension - optionResult.pension) / annualPension) * 100

      setFormData(prev => ({
        ...prev,
        monthlyBenefit: optionResult.pension / 12,
        annualBenefit: optionResult.pension,
        benefitPercentage: benefitFactor * 100,
        benefitReduction: reductionPercentage || 0,
        survivorBenefit: optionResult.survivorPension || 0
      }))

    } catch (error) {
      console.error("Error recalculating benefits:", error)
      toast({
        title: "Calculation Error",
        description: "Failed to recalculate benefits. Please check your inputs.",
        variant: "destructive"
      })
    } finally {
      setRecalculating(false)
    }
  }

  // Recalculate when key fields change
  useEffect(() => {
    if (formData.retirementAge && formData.yearsOfService && formData.averageSalary && formData.retirementGroup && formData.retirementOption) {
      const timeoutId = setTimeout(() => {
        recalculateBenefits()
      }, 500) // Debounce recalculation

      return () => clearTimeout(timeoutId)
    }
  }, [formData.retirementAge, formData.yearsOfService, formData.averageSalary, formData.retirementGroup, formData.retirementOption])

  const handleSave = async () => {
    if (!calculation?.id || !validateForm()) {
      return
    }

    setSaving(true)
    try {
      await onSave(calculation.id, formData)
      toast({
        title: "Calculation Updated",
        description: "Your retirement calculation has been successfully updated.",
      })
      onClose()
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast({
        title: "Save Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof RetirementCalculation, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!calculation) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Edit Retirement Calculation
              </DialogTitle>
              <DialogDescription className="mt-1">
                Modify your retirement calculation parameters and see updated projections
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calculationName">Calculation Name *</Label>
                  <Input
                    id="calculationName"
                    value={formData.calculationName || ''}
                    onChange={(e) => handleInputChange('calculationName', e.target.value)}
                    placeholder="My Retirement Scenario"
                    className={errors.calculationName ? 'border-red-500' : ''}
                  />
                  {errors.calculationName && (
                    <p className="text-sm text-red-500 mt-1">{errors.calculationName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="isFavorite">Mark as Favorite</Label>
                  <Select 
                    value={formData.isFavorite ? 'true' : 'false'} 
                    onValueChange={(value) => handleInputChange('isFavorite', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any notes about this calculation..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Calculation Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-green-600" />
                Calculation Parameters
              </CardTitle>
              <CardDescription>
                Modify these values to recalculate your retirement benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="retirementAge">Retirement Age *</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    min="50"
                    max="80"
                    value={formData.retirementAge || ''}
                    onChange={(e) => handleInputChange('retirementAge', parseInt(e.target.value) || 0)}
                    className={errors.retirementAge ? 'border-red-500' : ''}
                  />
                  {errors.retirementAge && (
                    <p className="text-sm text-red-500 mt-1">{errors.retirementAge}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="yearsOfService">Years of Service *</Label>
                  <Input
                    id="yearsOfService"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={formData.yearsOfService || ''}
                    onChange={(e) => handleInputChange('yearsOfService', parseFloat(e.target.value) || 0)}
                    className={errors.yearsOfService ? 'border-red-500' : ''}
                  />
                  {errors.yearsOfService && (
                    <p className="text-sm text-red-500 mt-1">{errors.yearsOfService}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="averageSalary">Average Salary *</Label>
                  <Input
                    id="averageSalary"
                    type="number"
                    min="1000"
                    max="500000"
                    value={formData.averageSalary || ''}
                    onChange={(e) => handleInputChange('averageSalary', parseFloat(e.target.value) || 0)}
                    className={errors.averageSalary ? 'border-red-500' : ''}
                  />
                  {errors.averageSalary && (
                    <p className="text-sm text-red-500 mt-1">{errors.averageSalary}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="retirementGroup">Retirement Group *</Label>
                  <Select
                    value={formData.retirementGroup || ''}
                    onValueChange={(value) => handleInputChange('retirementGroup', value)}
                  >
                    <SelectTrigger className={errors.retirementGroup ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Group 1 - General Employees</SelectItem>
                      <SelectItem value="2">Group 2 - Probation/Court Officers</SelectItem>
                      <SelectItem value="3">Group 3 - State Police</SelectItem>
                      <SelectItem value="4">Group 4 - Public Safety</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.retirementGroup && (
                    <p className="text-sm text-red-500 mt-1">{errors.retirementGroup}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="retirementOption">Retirement Option *</Label>
                  <Select
                    value={formData.retirementOption || ''}
                    onValueChange={(value) => handleInputChange('retirementOption', value)}
                  >
                    <SelectTrigger className={errors.retirementOption ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Option A - Maximum Allowance</SelectItem>
                      <SelectItem value="B">Option B - Joint & Survivor (Variable)</SelectItem>
                      <SelectItem value="C">Option C - Joint & 2/3 Survivor</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.retirementOption && (
                    <p className="text-sm text-red-500 mt-1">{errors.retirementOption}</p>
                  )}
                </div>
              </div>

              {recalculating && (
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    Recalculating benefits based on your changes...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Updated Results Preview */}
          {formData.monthlyBenefit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Updated Calculation Results
                </CardTitle>
                <CardDescription>
                  Preview of your updated retirement benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-blue-700">
                        Monthly Pension
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(formData.monthlyBenefit)}
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Option {formData.retirementOption}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-green-700">
                        Annual Pension
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(formData.annualBenefit || 0)}
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Before COLA
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-purple-700">
                        Benefit Factor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {formData.benefitPercentage?.toFixed(2)}%
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        Per year of service
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-orange-700">
                        Replacement Ratio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {formData.averageSalary && formData.annualBenefit ?
                          ((formData.annualBenefit / formData.averageSalary) * 100).toFixed(1) : '0'}%
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        Of average salary
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {formData.benefitReduction && formData.benefitReduction > 0 && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Option {formData.retirementOption} Reduction:</strong> Your pension is reduced by{' '}
                      {formData.benefitReduction.toFixed(2)}% due to the survivor benefit option selected.
                      {formData.survivorBenefit && formData.survivorBenefit > 0 && (
                        <> Survivor benefit: {formatCurrency(formData.survivorBenefit)} annually.</>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || recalculating}>
              {saving ? (
                <>
                  <Calculator className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
