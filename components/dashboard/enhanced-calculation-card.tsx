"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Shield,
  Eye,
  Edit,
  Star,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Target
} from "lucide-react"
import { formatCurrency, formatDate, parseDate } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

interface EnhancedCalculationCardProps {
  calculation: RetirementCalculation
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  isExpanded?: boolean
}

export function EnhancedCalculationCard({ 
  calculation, 
  onView, 
  onEdit, 
  onToggleFavorite,
  isExpanded: initialExpanded = false 
}: EnhancedCalculationCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  // Calculate derived metrics with error handling
  const totalMonthlyIncome = (calculation.monthlyBenefit || 0) + (calculation.socialSecurityData?.selectedMonthlyBenefit || 0)
  const totalAnnualIncome = totalMonthlyIncome * 12
  const replacementRatio = calculation.socialSecurityData?.replacementRatio ||
    (calculation.averageSalary && calculation.averageSalary > 0 ? (totalAnnualIncome / calculation.averageSalary) * 100 : 0)
  
  // Determine retirement option details
  const getRetirementOptionInfo = (option: string) => {
    switch (option) {
      case 'A':
        return { name: 'Maximum Benefit', description: 'No survivor benefits', color: 'bg-blue-100 text-blue-800' }
      case 'B':
        return { name: 'Joint & Survivor', description: '100% survivor benefit', color: 'bg-green-100 text-green-800' }
      case 'C':
        return { name: 'Joint & Survivor', description: '66.7% survivor benefit', color: 'bg-purple-100 text-purple-800' }
      case 'D':
        return { name: 'Pop-Up Option', description: 'Benefit increases if spouse predeceases', color: 'bg-orange-100 text-orange-800' }
      default:
        return { name: 'Unknown', description: '', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const optionInfo = getRetirementOptionInfo(calculation.retirementOption)

  // Calculate years until retirement with error handling
  const yearsUntilRetirement = () => {
    try {
      const retirementDate = parseDate(calculation.retirementDate)
      if (!retirementDate) {
        return 0 // If we can't parse the date, assume already retired or invalid
      }

      const now = new Date()
      const diffTime = retirementDate.getTime() - now.getTime()
      const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365.25)) // Use 365.25 for leap years
      return Math.max(0, diffYears)
    } catch (error) {
      console.warn('Error calculating years until retirement:', error)
      return 0
    }
  }

  const yearsLeft = yearsUntilRetirement()
  const isRetired = yearsLeft === 0

  return (
    <Card className={`group transition-all duration-300 hover:shadow-xl border-0 shadow-md bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 ${
      calculation.isFavorite
        ? 'ring-2 ring-amber-300 shadow-amber-100 dark:shadow-amber-900/20'
        : 'hover:shadow-slate-200 dark:hover:shadow-slate-800/50'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 truncate">
                {calculation.calculationName || 'Retirement Analysis'}
              </CardTitle>
              {calculation.isFavorite && (
                <div className="flex-shrink-0">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{formatDate(calculation.retirementDate)}</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span>Group {calculation.retirementGroup}</span>
              </span>
              <Badge
                variant="outline"
                className={`${optionInfo.color} text-xs px-2 py-1 border-0 shadow-sm w-fit`}
              >
                Option {calculation.retirementOption}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 self-start">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => calculation.id && onToggleFavorite?.(calculation.id)}
                    disabled={!calculation.id}
                    className="h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors duration-200"
                  >
                    <Star className={`h-4 w-4 transition-all duration-200 ${
                      calculation.isFavorite
                        ? 'text-amber-500 fill-amber-500 scale-110'
                        : 'text-slate-400 hover:text-amber-400 group-hover:scale-105'
                    }`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {calculation.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enhanced Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="group text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xs text-muted-foreground mb-1 font-medium">MA Pension</div>
            <div className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
              {formatCurrency(calculation.monthlyBenefit)}
            </div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>

          <div className="group text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30 hover:shadow-md transition-all duration-300">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-xs text-muted-foreground mb-1 font-medium">Social Security</div>
            <div className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400 mb-1">
              {formatCurrency(calculation.socialSecurityData?.selectedMonthlyBenefit || 0)}
            </div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>

          <div className="group text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/30 hover:shadow-md transition-all duration-300">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xs text-muted-foreground mb-1 font-medium">Total Income</div>
            <div className="text-sm sm:text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>

          <div className="group text-center p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-all duration-300">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-xs text-muted-foreground mb-1 font-medium">Replacement</div>
            <div className="text-sm sm:text-lg font-bold text-amber-600 dark:text-amber-400 mb-1">
              {replacementRatio.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">of salary</div>
          </div>
        </div>

        {/* Retirement Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Retirement Progress</span>
            <span className="font-medium">
              {isRetired ? '🎉 Retired!' : `${yearsLeft} years remaining`}
            </span>
          </div>
          <Progress
            value={isRetired ? 100 : Math.max(0, Math.min(100, 100 - (yearsLeft / 40) * 100))}
            className="h-2"
          />
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">View Details</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <Separator />
            
            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Pension Details</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Years of Service:</span>
                    <span className="font-medium">{calculation.yearsOfService || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Salary:</span>
                    <span className="font-medium">{formatCurrency(calculation.averageSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Benefit Percentage:</span>
                    <span className="font-medium">{(calculation.benefitPercentage || 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Benefit:</span>
                    <span className="font-medium">{formatCurrency(calculation.annualBenefit || 0)}</span>
                  </div>
                </div>
              </div>
              
              {calculation.socialSecurityData && (
                <div className="space-y-2">
                  <h4 className="font-medium text-muted-foreground">Social Security</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Claiming Age:</span>
                      <span className="font-medium">{calculation.socialSecurityData.selectedClaimingAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Retirement Age:</span>
                      <span className="font-medium">{calculation.socialSecurityData.fullRetirementAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Benefit:</span>
                      <span className="font-medium">{formatCurrency(calculation.socialSecurityData.fullRetirementBenefit || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual SS Income:</span>
                      <span className="font-medium">{formatCurrency((calculation.socialSecurityData.selectedMonthlyBenefit || 0) * 12)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Retirement Option Details */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{optionInfo.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{optionInfo.description}</p>
              {calculation.survivorBenefit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Survivor benefit: {formatCurrency(calculation.survivorBenefit)}/month
                </p>
              )}
            </div>

            {/* Notes */}
            {calculation.notes && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm text-blue-800 dark:text-blue-200">Notes</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">{calculation.notes}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            variant="outline"
            size="default"
            className="flex-1 shadow-sm hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 min-h-[44px]"
            onClick={() => calculation.id && onView?.(calculation.id)}
            disabled={!calculation.id}
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm">View Analysis</span>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="flex-1 shadow-sm hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 min-h-[44px]"
            onClick={() => calculation.id && onEdit?.(calculation.id)}
            disabled={!calculation.id}
          >
            <Edit className="h-3 w-3 mr-2" />
            <span className="text-xs sm:text-sm">Edit Scenario</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
