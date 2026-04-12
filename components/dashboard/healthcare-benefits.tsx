"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Heart, 
  Shield, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Calculator,
  FileText,
  Clock
} from "lucide-react"
import { 
  calculateHealthcareCosts, 
  calculateHSABenefits,
  MA_HEALTH_PLANS,
  formatHealthcareCurrency,
  type HealthcareCosts 
} from "@/lib/healthcare-calculator"

interface HealthcareBenefitsProps {
  profile?: {
    dateOfBirth?: string
    currentSalary?: number
    yearsOfService?: number
    plannedRetirementAge?: number
    retirementGroup?: string
  }
  className?: string
}

export function HealthcareBenefits({ profile, className }: HealthcareBenefitsProps) {
  const [selectedPlan, setSelectedPlan] = useState('hmo-premium')
  const [coverageType, setCoverageType] = useState<'individual' | 'family'>('individual')
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate current age
  const currentAge = useMemo(() => {
    if (!profile?.dateOfBirth) return 50
    const birthDate = new Date(profile.dateOfBirth)
    const today = new Date()
    return Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  }, [profile?.dateOfBirth])

  // Calculate healthcare costs
  const healthcareCosts = useMemo(() => {
    return calculateHealthcareCosts(
      currentAge,
      profile?.yearsOfService || 0,
      profile?.currentSalary || 0,
      profile?.plannedRetirementAge || 65,
      coverageType,
      selectedPlan
    )
  }, [currentAge, profile?.yearsOfService, profile?.currentSalary, profile?.plannedRetirementAge, coverageType, selectedPlan])

  // Calculate HSA benefits if applicable
  const hsaBenefits = useMemo(() => {
    if (selectedPlan !== 'hdhp') return null
    return calculateHSABenefits(currentAge, profile?.currentSalary || 0, coverageType)
  }, [currentAge, profile?.currentSalary, coverageType, selectedPlan])

  // Years to Medicare eligibility
  const yearsToMedicare = Math.max(0, 65 - currentAge)
  const medicareProgress = Math.min(100, ((65 - yearsToMedicare) / 65) * 100)

  return (
    <TooltipProvider>
      <Card className={`border-0 shadow-lg bg-gradient-to-br from-rose-50 via-pink-50/50 to-purple-50/30 dark:from-rose-950/20 dark:via-pink-950/20 dark:to-purple-950/20 ${className}`}>
        <CardHeader className="pb-4 lg:pb-6 px-4 lg:px-6 pt-4 lg:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-start gap-3 text-lg sm:text-xl lg:text-2xl">
                <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg flex-shrink-0">
                  <Heart className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <span className="leading-tight">Healthcare Benefits</span>
              </CardTitle>
              <CardDescription className="text-sm lg:text-base leading-relaxed mt-2">
                Comprehensive healthcare cost analysis and Medicare planning
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                className={`shadow-md px-3 py-2 text-xs font-medium flex-shrink-0 ${
                  healthcareCosts.retireeInsurance.eligible
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                }`}
              >
                {healthcareCosts.retireeInsurance.eligible ? 'Eligible' : 'Not Eligible'}
              </Badge>
              {yearsToMedicare <= 5 && (
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md px-3 py-2 text-xs font-medium">
                  Medicare Soon
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Plans</span>
              </TabsTrigger>
              <TabsTrigger value="medicare" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Medicare</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Calculator</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Medicare Countdown */}
              <Card className="bg-white/50 dark:bg-slate-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Medicare Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Progress to Age 65</span>
                      <span className="text-sm font-medium">{65 - yearsToMedicare} / 65 years</span>
                    </div>
                    <Progress value={medicareProgress} className="h-2" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {yearsToMedicare === 0 ? 'Eligible Now!' : `${yearsToMedicare} years`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {yearsToMedicare === 0 ? 'You can enroll in Medicare' : 'until Medicare eligibility'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Healthcare Costs */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-rose-600 mb-1">
                      {formatHealthcareCurrency(healthcareCosts.preMedicare.monthlyPremium)}
                    </div>
                    <div className="text-xs text-muted-foreground">Monthly Premium</div>
                    <div className="text-xs text-green-600 mt-1">
                      State pays {formatHealthcareCurrency(healthcareCosts.preMedicare.stateContribution)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {healthcareCosts.retireeInsurance.stateContributionPercent}%
                    </div>
                    <div className="text-xs text-muted-foreground">State Contribution</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Based on {profile?.yearsOfService || 0} years of service
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {formatHealthcareCurrency(healthcareCosts.totalLifetimeCosts)}
                    </div>
                    <div className="text-xs text-muted-foreground">Lifetime Healthcare Costs</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Estimated total through retirement
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Eligibility Status */}
              {!healthcareCosts.retireeInsurance.eligible && (
                <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                          Healthcare Benefits Not Available
                        </h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          You need at least 10 years of creditable service to be eligible for retiree health insurance benefits.
                          Currently you have {profile?.yearsOfService || 0} years of service.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="plans" className="space-y-4">
              {/* Plan Selection */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Coverage Type</label>
                  <Select value={coverageType} onValueChange={(value: 'individual' | 'family') => setCoverageType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Coverage</SelectItem>
                      <SelectItem value="family">Family Coverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Health Plan</label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MA_HEALTH_PLANS.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} ({plan.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Plan Details */}
              <div className="grid gap-4">
                {MA_HEALTH_PLANS.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/20' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <Badge variant={plan.type === 'HDHP' ? 'secondary' : 'outline'}>
                          {plan.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Monthly Premium</div>
                          <div className="text-muted-foreground">
                            {formatHealthcareCurrency(plan.monthlyPremium[coverageType])}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Deductible</div>
                          <div className="text-muted-foreground">
                            {formatHealthcareCurrency(plan.deductible[coverageType])}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Out-of-Pocket Max</div>
                          <div className="text-muted-foreground">
                            {formatHealthcareCurrency(plan.outOfPocketMax[coverageType])}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* HSA Benefits for HDHP */}
              {selectedPlan === 'hdhp' && hsaBenefits && (
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Health Savings Account Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {formatHealthcareCurrency(hsaBenefits.totalContribution)}
                        </div>
                        <div className="text-sm text-muted-foreground">Annual Contribution Limit</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {formatHealthcareCurrency(hsaBenefits.taxSavings)}
                        </div>
                        <div className="text-sm text-muted-foreground">Annual Tax Savings</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="medicare" className="space-y-4">
              {/* Medicare Cost Breakdown */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-xl font-bold text-blue-600 mb-1">
                      {formatHealthcareCurrency(healthcareCosts.medicare.partB)}
                    </div>
                    <div className="text-xs text-muted-foreground">Medicare Part B</div>
                    <div className="text-xs text-muted-foreground mt-1">Monthly premium</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-xl font-bold text-purple-600 mb-1">
                      {formatHealthcareCurrency(healthcareCosts.medicare.partD)}
                    </div>
                    <div className="text-xs text-muted-foreground">Medicare Part D</div>
                    <div className="text-xs text-muted-foreground mt-1">Prescription drugs</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-xl font-bold text-green-600 mb-1">
                      {formatHealthcareCurrency(healthcareCosts.medicare.supplement)}
                    </div>
                    <div className="text-xs text-muted-foreground">Medigap</div>
                    <div className="text-xs text-muted-foreground mt-1">Supplement insurance</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-xl font-bold text-orange-600 mb-1">
                      {formatHealthcareCurrency(healthcareCosts.medicare.total)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Monthly</div>
                    <div className="text-xs text-muted-foreground mt-1">All Medicare costs</div>
                  </CardContent>
                </Card>
              </div>

              {/* Medicare Information */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-4 w-4 text-blue-600" />
                    Medicare Enrollment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>You become eligible for Medicare at age 65</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Initial enrollment period is 7 months (3 months before to 3 months after your 65th birthday)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Part B premiums may be higher if you delay enrollment without creditable coverage</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Massachusetts retiree health insurance may coordinate with Medicare</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-4">
              {/* Cost Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Healthcare Cost Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <div className="font-medium">Pre-Medicare (Age {currentAge}-64)</div>
                        <div className="text-sm text-muted-foreground">
                          {healthcareCosts.yearsToMedicare} years • {healthcareCosts.preMedicare.planType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {formatHealthcareCurrency(healthcareCosts.retireeInsurance.monthlyPremium)}/month
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatHealthcareCurrency(healthcareCosts.retireeInsurance.annualPremium)}/year
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <div className="font-medium">Medicare (Age 65+)</div>
                        <div className="text-sm text-muted-foreground">
                          Parts B + D + Supplement
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {formatHealthcareCurrency(healthcareCosts.medicare.total)}/month
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatHealthcareCurrency(healthcareCosts.medicare.total * 12)}/year
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold">Estimated Lifetime Healthcare Costs</div>
                        <div className="text-xl font-bold text-rose-600">
                          {formatHealthcareCurrency(healthcareCosts.totalLifetimeCosts)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        From retirement through age 85
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
