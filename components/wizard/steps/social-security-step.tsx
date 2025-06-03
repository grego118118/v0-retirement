"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, DollarSign, ExternalLink, Info, Heart, Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SocialSecurityData {
  fullRetirementAge: number
  earlyRetirementBenefit: number
  fullRetirementBenefit: number
  delayedRetirementBenefit: number
  selectedClaimingAge: number
  selectedMonthlyBenefit: number
  isMarried: boolean
  spouseFullRetirementBenefit?: number
  spouseFullRetirementAge?: number
  spouseBirthYear?: number
}

interface SocialSecurityStepProps {
  data: SocialSecurityData
  onComplete: (data: { socialSecurityData: SocialSecurityData }) => void
}

export function SocialSecurityStep({ data, onComplete }: SocialSecurityStepProps) {
  const [formData, setFormData] = useState<SocialSecurityData>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showEstimator, setShowEstimator] = useState(false)

  // Validate and trigger completion when data changes
  useEffect(() => {
    const newErrors = validateForm(formData)
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && formData.fullRetirementBenefit > 0) {
      onComplete({ socialSecurityData: formData })
    }
  }, [formData.fullRetirementAge, formData.earlyRetirementBenefit, formData.fullRetirementBenefit, formData.delayedRetirementBenefit, formData.selectedClaimingAge, formData.selectedMonthlyBenefit, formData.isMarried, formData.spouseFullRetirementBenefit, formData.spouseFullRetirementAge, formData.spouseBirthYear])

  const handleInputChange = (field: keyof SocialSecurityData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? (isNaN(Number(value)) ? value : Number(value)) : value
    }))
  }

  const validateForm = (data: SocialSecurityData): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!data.fullRetirementBenefit || data.fullRetirementBenefit <= 0) {
      errors.fullRetirementBenefit = 'Full retirement benefit is required'
    }

    if (data.fullRetirementBenefit > 5000) {
      errors.fullRetirementBenefit = 'Please verify benefit amount (seems unusually high)'
    }

    if (!data.fullRetirementAge || data.fullRetirementAge < 65 || data.fullRetirementAge > 67) {
      errors.fullRetirementAge = 'Full retirement age must be between 65 and 67'
    }

    if (data.isMarried) {
      if (!data.spouseFullRetirementBenefit || data.spouseFullRetirementBenefit <= 0) {
        errors.spouseFullRetirementBenefit = 'Spouse benefit is required for married filing'
      }
      if (!data.spouseFullRetirementAge || data.spouseFullRetirementAge < 65 || data.spouseFullRetirementAge > 67) {
        errors.spouseFullRetirementAge = 'Spouse full retirement age must be between 65 and 67'
      }
    }

    return errors
  }

  // Auto-calculate early and delayed benefits if not provided
  useEffect(() => {
    if (formData.fullRetirementBenefit > 0 && formData.fullRetirementAge > 0) {
      if (formData.earlyRetirementBenefit === 0) {
        // Early retirement at 62 is typically 75-80% of full benefit
        const earlyBenefit = Math.round(formData.fullRetirementBenefit * 0.75)
        setFormData(prev => ({ ...prev, earlyRetirementBenefit: earlyBenefit }))
      }
      
      if (formData.delayedRetirementBenefit === 0) {
        // Delayed retirement at 70 is typically 132% of full benefit
        const delayedBenefit = Math.round(formData.fullRetirementBenefit * 1.32)
        setFormData(prev => ({ ...prev, delayedRetirementBenefit: delayedBenefit }))
      }

      // Set default claiming age and benefit to full retirement
      if (formData.selectedClaimingAge === 0) {
        setFormData(prev => ({ 
          ...prev, 
          selectedClaimingAge: formData.fullRetirementAge,
          selectedMonthlyBenefit: formData.fullRetirementBenefit
        }))
      }
    }
  }, [formData.fullRetirementBenefit, formData.fullRetirementAge])

  const handleClaimingAgeChange = (age: number) => {
    let benefit = formData.fullRetirementBenefit
    
    if (age === 62) {
      benefit = formData.earlyRetirementBenefit
    } else if (age === 70) {
      benefit = formData.delayedRetirementBenefit
    } else if (age === formData.fullRetirementAge) {
      benefit = formData.fullRetirementBenefit
    } else {
      // Calculate proportional benefit for other ages
      const reductionFactor = calculateReductionFactor(age, formData.fullRetirementAge)
      benefit = Math.round(formData.fullRetirementBenefit * reductionFactor)
    }

    setFormData(prev => ({
      ...prev,
      selectedClaimingAge: age,
      selectedMonthlyBenefit: benefit
    }))
  }

  const calculateReductionFactor = (claimingAge: number, fullRetirementAge: number): number => {
    if (claimingAge === fullRetirementAge) return 1.0
    
    if (claimingAge < fullRetirementAge) {
      // Early retirement reduction (roughly 6.67% per year)
      const yearsEarly = fullRetirementAge - claimingAge
      return Math.max(0.75, 1 - (yearsEarly * 0.0667))
    } else {
      // Delayed retirement credits (8% per year)
      const yearsDelayed = claimingAge - fullRetirementAge
      return Math.min(1.32, 1 + (yearsDelayed * 0.08))
    }
  }

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Enter your Social Security benefit estimates from your official SSA.gov statement. 
          <Button 
            variant="link" 
            className="p-0 h-auto ml-1"
            onClick={() => window.open('https://www.ssa.gov/myaccount/', '_blank')}
          >
            Get your statement here <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Social Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Your Social Security Benefits
            </CardTitle>
            <CardDescription>
              From your official SSA.gov statement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullRetirementAge">Your Full Retirement Age</Label>
              <Input
                id="fullRetirementAge"
                type="number"
                placeholder="e.g., 67"
                value={formData.fullRetirementAge || ''}
                onChange={(e) => handleInputChange('fullRetirementAge', e.target.value)}
                className={errors.fullRetirementAge ? 'border-red-500' : ''}
              />
              {errors.fullRetirementAge && (
                <p className="text-sm text-red-500">{errors.fullRetirementAge}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="fullRetirementBenefit">Full Retirement Monthly Benefit</Label>
                <span className="text-red-500">*</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Monthly benefit amount at your full retirement age (required)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="fullRetirementBenefit"
                type="number"
                placeholder="e.g., 2800"
                value={formData.fullRetirementBenefit || ''}
                onChange={(e) => handleInputChange('fullRetirementBenefit', e.target.value)}
                className={errors.fullRetirementBenefit ? 'border-red-500' : ''}
              />
              {errors.fullRetirementBenefit && (
                <p className="text-sm text-red-500">{errors.fullRetirementBenefit}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="earlyRetirementBenefit">Early (Age 62) Benefit</Label>
                <Input
                  id="earlyRetirementBenefit"
                  type="number"
                  placeholder="Auto-calculated"
                  value={formData.earlyRetirementBenefit || ''}
                  onChange={(e) => handleInputChange('earlyRetirementBenefit', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delayedRetirementBenefit">Delayed (Age 70) Benefit</Label>
                <Input
                  id="delayedRetirementBenefit"
                  type="number"
                  placeholder="Auto-calculated"
                  value={formData.delayedRetirementBenefit || ''}
                  onChange={(e) => handleInputChange('delayedRetirementBenefit', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claiming Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Claiming Strategy
            </CardTitle>
            <CardDescription>
              Choose when you plan to claim Social Security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Planned Claiming Age</Label>
              <div className="grid grid-cols-3 gap-2">
                {[62, formData.fullRetirementAge, 70].map((age) => (
                  <Button
                    key={age}
                    variant={formData.selectedClaimingAge === age ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleClaimingAgeChange(age)}
                    className="text-xs"
                  >
                    Age {age}
                  </Button>
                ))}
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium">Selected Strategy:</div>
                <div className="text-lg font-bold text-green-600">
                  ${formData.selectedMonthlyBenefit?.toLocaleString()}/month
                </div>
                <div className="text-xs text-muted-foreground">
                  Claiming at age {formData.selectedClaimingAge}
                </div>
              </div>
            </div>

            {/* Benefit Comparison */}
            {formData.fullRetirementBenefit > 0 && (
              <div className="space-y-2">
                <Label>Benefit Comparison</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Age 62 (Early):</span>
                    <span>${formData.earlyRetirementBenefit?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Age {formData.fullRetirementAge} (Full):</span>
                    <span>${formData.fullRetirementBenefit?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age 70 (Delayed):</span>
                    <span>${formData.delayedRetirementBenefit?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spousal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Spousal Information
          </CardTitle>
          <CardDescription>
            Include spouse information for comprehensive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isMarried"
              checked={formData.isMarried}
              onCheckedChange={(checked) => handleInputChange('isMarried', checked as boolean)}
            />
            <Label htmlFor="isMarried" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              I am married (include spousal benefits analysis)
            </Label>
          </div>

          {formData.isMarried && (
            <div className="grid md:grid-cols-3 gap-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="spouseFullRetirementBenefit">Spouse's Full Retirement Benefit</Label>
                <Input
                  id="spouseFullRetirementBenefit"
                  type="number"
                  placeholder="e.g., 1800"
                  value={formData.spouseFullRetirementBenefit || ''}
                  onChange={(e) => handleInputChange('spouseFullRetirementBenefit', e.target.value)}
                  className={errors.spouseFullRetirementBenefit ? 'border-red-500' : ''}
                />
                {errors.spouseFullRetirementBenefit && (
                  <p className="text-sm text-red-500">{errors.spouseFullRetirementBenefit}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouseFullRetirementAge">Spouse's Full Retirement Age</Label>
                <Input
                  id="spouseFullRetirementAge"
                  type="number"
                  placeholder="e.g., 67"
                  value={formData.spouseFullRetirementAge || ''}
                  onChange={(e) => handleInputChange('spouseFullRetirementAge', e.target.value)}
                  className={errors.spouseFullRetirementAge ? 'border-red-500' : ''}
                />
                {errors.spouseFullRetirementAge && (
                  <p className="text-sm text-red-500">{errors.spouseFullRetirementAge}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouseBirthYear">Spouse's Birth Year</Label>
                <Input
                  id="spouseBirthYear"
                  type="number"
                  placeholder="e.g., 1957"
                  value={formData.spouseBirthYear || ''}
                  onChange={(e) => handleInputChange('spouseBirthYear', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {Object.keys(errors).length === 0 && formData.fullRetirementBenefit > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Social Security Information Complete
              </Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Claiming Strategy:</span> Age {formData.selectedClaimingAge}
              </div>
              <div>
                <span className="font-medium">Monthly Benefit:</span> ${formData.selectedMonthlyBenefit?.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Annual Benefit:</span> ${((formData.selectedMonthlyBenefit || 0) * 12).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
