"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Heart, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PersonalInfoData {
  birthYear: number
  retirementGoalAge: number
  lifeExpectancy: number
  filingStatus: 'single' | 'married' | 'marriedSeparate'
  currentAge: number
}

interface PersonalInfoStepProps {
  data: PersonalInfoData
  onComplete: (data: { personalInfo: PersonalInfoData }) => void
}

export function PersonalInfoStep({ data, onComplete }: PersonalInfoStepProps) {
  const [formData, setFormData] = useState<PersonalInfoData>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate current age when birth year changes
  useEffect(() => {
    if (formData.birthYear) {
      const currentAge = new Date().getFullYear() - formData.birthYear
      setFormData(prev => ({ ...prev, currentAge }))
    }
  }, [formData.birthYear])

  // Validate and trigger completion when data changes
  useEffect(() => {
    const newErrors = validateForm(formData)
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onComplete({ personalInfo: formData })
    }
  }, [formData.birthYear, formData.retirementGoalAge, formData.lifeExpectancy, formData.filingStatus, formData.currentAge])

  const handleInputChange = (field: keyof PersonalInfoData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? (isNaN(Number(value)) ? value : Number(value)) : value
    }))
  }

  const validateForm = (data: PersonalInfoData): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!data.birthYear || data.birthYear < 1940 || data.birthYear > 2010) {
      errors.birthYear = 'Please enter a valid birth year between 1940 and 2010'
    }

    if (!data.retirementGoalAge || data.retirementGoalAge < 55 || data.retirementGoalAge > 75) {
      errors.retirementGoalAge = 'Retirement age must be between 55 and 75'
    }

    if (data.currentAge && data.retirementGoalAge && data.retirementGoalAge <= data.currentAge) {
      errors.retirementGoalAge = 'Retirement age must be greater than your current age'
    }

    if (!data.lifeExpectancy || data.lifeExpectancy < 70 || data.lifeExpectancy > 100) {
      errors.lifeExpectancy = 'Life expectancy must be between 70 and 100'
    }

    if (data.retirementGoalAge && data.lifeExpectancy && data.lifeExpectancy <= data.retirementGoalAge) {
      errors.lifeExpectancy = 'Life expectancy must be greater than retirement age'
    }

    return errors
  }

  const getLifeExpectancyGuidance = (age: number, gender?: string): number => {
    // Simplified life expectancy calculation based on current age
    // Real implementation would use actuarial tables
    const baseLifeExpectancy = gender === 'female' ? 83 : 80
    const ageAdjustment = Math.max(0, (65 - age) * 0.1)
    return Math.round(baseLifeExpectancy + ageAdjustment)
  }

  const suggestedLifeExpectancy = getLifeExpectancyGuidance(formData.currentAge)

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Alert>
        <User className="h-4 w-4" />
        <AlertDescription>
          Let's start with some basic information about you and your retirement timeline. This helps us provide personalized recommendations.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your age and retirement timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthYear">Birth Year</Label>
              <Input
                id="birthYear"
                type="number"
                placeholder="e.g., 1968"
                value={formData.birthYear || ''}
                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                className={errors.birthYear ? 'border-red-500' : ''}
              />
              {errors.birthYear && (
                <p className="text-sm text-red-500">{errors.birthYear}</p>
              )}
              {formData.currentAge > 0 && (
                <p className="text-sm text-muted-foreground">
                  Current age: {formData.currentAge} years old
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="retirementGoalAge">Target Retirement Age</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The age at which you plan to retire and start receiving benefits</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="retirementGoalAge"
                type="number"
                placeholder="e.g., 65"
                value={formData.retirementGoalAge || ''}
                onChange={(e) => handleInputChange('retirementGoalAge', e.target.value)}
                className={errors.retirementGoalAge ? 'border-red-500' : ''}
              />
              {errors.retirementGoalAge && (
                <p className="text-sm text-red-500">{errors.retirementGoalAge}</p>
              )}
              {formData.currentAge > 0 && formData.retirementGoalAge > 0 && (
                <p className="text-sm text-muted-foreground">
                  Years until retirement: {Math.max(0, formData.retirementGoalAge - formData.currentAge)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Used to calculate lifetime benefits. Average is around 80-85 years.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-2">
                <Input
                  id="lifeExpectancy"
                  type="number"
                  placeholder="e.g., 85"
                  value={formData.lifeExpectancy || ''}
                  onChange={(e) => handleInputChange('lifeExpectancy', e.target.value)}
                  className={errors.lifeExpectancy ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('lifeExpectancy', suggestedLifeExpectancy)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Use {suggestedLifeExpectancy}
                </button>
              </div>
              {errors.lifeExpectancy && (
                <p className="text-sm text-red-500">{errors.lifeExpectancy}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Suggested: {suggestedLifeExpectancy} years (based on current averages)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tax Filing Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Tax Filing Status
            </CardTitle>
            <CardDescription>
              This affects your tax calculations and Social Security benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filingStatus">Filing Status</Label>
              <Select
                value={formData.filingStatus}
                onValueChange={(value: 'single' | 'married' | 'marriedSeparate') => 
                  handleInputChange('filingStatus', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married Filing Jointly</SelectItem>
                  <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filing Status Impact */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Impact on Your Analysis:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {formData.filingStatus === 'married' ? (
                  <>
                    <li>• Higher Social Security taxation thresholds</li>
                    <li>• Spousal benefits analysis included</li>
                    <li>• Joint tax bracket calculations</li>
                    <li>• Survivor benefits planning</li>
                  </>
                ) : (
                  <>
                    <li>• Single person tax brackets</li>
                    <li>• Individual Social Security thresholds</li>
                    <li>• Personal retirement planning focus</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {Object.keys(errors).length === 0 && formData.birthYear && formData.retirementGoalAge && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Information Complete
              </Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Current Age:</span> {formData.currentAge} years
              </div>
              <div>
                <span className="font-medium">Retirement in:</span> {Math.max(0, formData.retirementGoalAge - formData.currentAge)} years
              </div>
              <div>
                <span className="font-medium">Retirement Duration:</span> {Math.max(0, formData.lifeExpectancy - formData.retirementGoalAge)} years
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
