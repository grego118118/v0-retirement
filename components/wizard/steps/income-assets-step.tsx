"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PiggyBank, TrendingUp, DollarSign, Info } from "lucide-react"

interface IncomeData {
  totalAnnualIncome: number
  otherRetirementIncome: number
  hasRothIRA: boolean
  rothIRABalance: number
  has401k: boolean
  traditional401kBalance: number
  estimatedMedicarePremiums: number
}

interface IncomeAssetsStepProps {
  data: IncomeData
  onComplete: (data: { incomeData: IncomeData }) => void
}

export function IncomeAssetsStep({ data, onComplete }: IncomeAssetsStepProps) {
  const [formData, setFormData] = useState<IncomeData>(data)

  useEffect(() => {
    onComplete({ incomeData: formData })
  }, [formData.totalAnnualIncome, formData.otherRetirementIncome, formData.hasRothIRA, formData.rothIRABalance, formData.has401k, formData.traditional401kBalance, formData.estimatedMedicarePremiums])

  const handleInputChange = (field: keyof IncomeData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? (isNaN(Number(value)) ? value : Number(value)) : value
    }))
  }

  return (
    <div className="space-y-6">
      <Alert>
        <PiggyBank className="h-4 w-4" />
        <AlertDescription>
          This information helps us provide more accurate tax calculations and withdrawal strategies. All fields are optional.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Additional Income
            </CardTitle>
            <CardDescription>Other sources of retirement income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otherRetirementIncome">Other Annual Retirement Income</Label>
              <Input
                id="otherRetirementIncome"
                type="number"
                placeholder="e.g., 12000"
                value={formData.otherRetirementIncome || ''}
                onChange={(e) => handleInputChange('otherRetirementIncome', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Rental income, part-time work, annuities, etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedMedicarePremiums">Estimated Medicare Premiums</Label>
              <Input
                id="estimatedMedicarePremiums"
                type="number"
                placeholder="174.70"
                value={formData.estimatedMedicarePremiums || ''}
                onChange={(e) => handleInputChange('estimatedMedicarePremiums', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Monthly Medicare Part B premium (2024: $174.70)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Retirement Accounts
            </CardTitle>
            <CardDescription>401(k), IRA, and other retirement savings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="has401k"
                  checked={formData.has401k}
                  onCheckedChange={(checked) => handleInputChange('has401k', checked as boolean)}
                />
                <Label htmlFor="has401k">I have a 401(k) or Traditional IRA</Label>
              </div>

              {formData.has401k && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="traditional401kBalance">Traditional 401(k)/IRA Balance</Label>
                  <Input
                    id="traditional401kBalance"
                    type="number"
                    placeholder="e.g., 250000"
                    value={formData.traditional401kBalance || ''}
                    onChange={(e) => handleInputChange('traditional401kBalance', e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasRothIRA"
                  checked={formData.hasRothIRA}
                  onCheckedChange={(checked) => handleInputChange('hasRothIRA', checked as boolean)}
                />
                <Label htmlFor="hasRothIRA">I have a Roth IRA</Label>
              </div>

              {formData.hasRothIRA && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="rothIRABalance">Roth IRA Balance</Label>
                  <Input
                    id="rothIRABalance"
                    type="number"
                    placeholder="e.g., 150000"
                    value={formData.rothIRABalance || ''}
                    onChange={(e) => handleInputChange('rothIRABalance', e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4">
            Optional Information Complete
          </Badge>
          <p className="text-sm text-muted-foreground">
            This information will be used to provide tax-efficient withdrawal strategies and more accurate retirement income projections.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
