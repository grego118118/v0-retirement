"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { 
  calculatePensionWithOption, 
  getBenefitFactor,
  calculateAnnualPension 
} from "@/lib/pension-calculations"
import { 
  calculateEnhancedMAPensionCOLA,
  calculateEnhancedMAPensionCOLAProjections,
  getCOLADisplayInfo 
} from "@/lib/pension/ma-cola-calculator"
import { 
  calculateRetirementBenefitsProjection,
  ProjectionParameters 
} from "@/lib/retirement-benefits-projection"
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  Info,
  Calculator,
  X,
  Download,
  Share2,
  AlertCircle
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

interface CalculationAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  calculation: RetirementCalculation | null
  loading?: boolean
}

export function CalculationAnalysisModal({
  isOpen,
  onClose,
  calculation,
  loading = false
}: CalculationAnalysisModalProps) {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Calculate detailed analysis when calculation changes
  useEffect(() => {
    if (calculation && isOpen) {
      calculateDetailedAnalysis()
    }
  }, [calculation, isOpen])

  const calculateDetailedAnalysis = async () => {
    if (!calculation) return

    setAnalysisLoading(true)
    setError(null)

    try {
      // Calculate pension options (A, B, C)
      const optionA = calculatePensionWithOption(
        calculation.annualBenefit,
        "A",
        calculation.retirementAge,
        "",
        calculation.retirementGroup
      )

      const optionB = calculatePensionWithOption(
        calculation.annualBenefit,
        "B",
        calculation.retirementAge,
        "65", // Default beneficiary age
        calculation.retirementGroup
      )

      const optionC = calculatePensionWithOption(
        calculation.annualBenefit,
        "C",
        calculation.retirementAge,
        "65", // Default beneficiary age
        calculation.retirementGroup
      )

      // Calculate reduction percentages
      const optionBReduction = ((calculation.annualBenefit - optionB.pension) / calculation.annualBenefit) * 100
      const optionCReduction = ((calculation.annualBenefit - optionC.pension) / calculation.annualBenefit) * 100

      // Add calculated properties to the results
      const enhancedOptionA = { ...optionA, reductionPercentage: 0, survivorBenefit: 0 }
      const enhancedOptionB = { ...optionB, reductionPercentage: optionBReduction, survivorBenefit: optionB.survivorPension }
      const enhancedOptionC = { ...optionC, reductionPercentage: optionCReduction, survivorBenefit: optionC.survivorPension }

      // Calculate COLA projections
      const colaProjections = calculateEnhancedMAPensionCOLAProjections(
        calculation.annualBenefit, 
        10
      )
      const colaInfo = getCOLADisplayInfo(calculation.annualBenefit)

      // Calculate comprehensive projection if we have enough data
      let comprehensiveProjection = null
      if (calculation.socialSecurityData?.selectedClaimingAge && 
          calculation.socialSecurityData?.fullRetirementBenefit) {
        
        const projectionParams: ProjectionParameters = {
          currentAge: calculation.retirementAge - 1, // Approximate current age
          plannedRetirementAge: calculation.retirementAge,
          currentYearsOfService: calculation.yearsOfService,
          averageSalary: calculation.averageSalary,
          retirementGroup: `GROUP_${calculation.retirementGroup}`,
          serviceEntry: 'before_2012', // Default assumption
          pensionOption: calculation.retirementOption as 'A' | 'B' | 'C',
          beneficiaryAge: "65",
          socialSecurityClaimingAge: calculation.socialSecurityData.selectedClaimingAge,
          socialSecurityFullBenefit: calculation.socialSecurityData.fullRetirementBenefit,
          projectionEndAge: calculation.retirementAge + 20,
          includeCOLA: true,
          colaRate: 0.03
        }

        comprehensiveProjection = calculateRetirementBenefitsProjection(projectionParams)
      }

      setAnalysisData({
        pensionOptions: {
          optionA: enhancedOptionA,
          optionB: enhancedOptionB,
          optionC: enhancedOptionC
        },
        colaProjections,
        colaInfo,
        comprehensiveProjection,
        calculation
      })

    } catch (err) {
      console.error("Error calculating detailed analysis:", err)
      setError("Failed to calculate detailed analysis. Please try again.")
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleExport = async () => {
    if (!analysisData || !calculation) {
      toast({
        title: "Export Failed",
        description: "No analysis data available to export",
        variant: "destructive",
      })
      return
    }

    try {
      // Create CSV data for export
      const csvData = [
        ['Massachusetts Retirement Analysis Export'],
        ['Generated on:', new Date().toLocaleDateString()],
        [''],
        ['Basic Information'],
        ['Calculation Name:', calculation.calculationName || 'Unnamed Calculation'],
        ['Retirement Age:', calculation.retirementAge.toString()],
        ['Years of Service:', calculation.yearsOfService.toString()],
        ['Average Salary:', `$${calculation.averageSalary.toLocaleString()}`],
        ['Retirement Group:', calculation.retirementGroup],
        [''],
        ['Pension Options'],
        ['Option A - Monthly:', `$${analysisData.pensionOptions.optionA.monthly.toLocaleString()}`],
        ['Option A - Annual:', `$${analysisData.pensionOptions.optionA.annual.toLocaleString()}`],
        ['Option B - Monthly:', `$${analysisData.pensionOptions.optionB.monthly.toLocaleString()}`],
        ['Option B - Annual:', `$${analysisData.pensionOptions.optionB.annual.toLocaleString()}`],
        ['Option C - Monthly:', `$${analysisData.pensionOptions.optionC.monthly.toLocaleString()}`],
        ['Option C - Annual:', `$${analysisData.pensionOptions.optionC.annual.toLocaleString()}`],
        [''],
        ['COLA Information'],
        ['COLA Rate:', `${analysisData.colaInfo.rate}%`],
        ['Annual Cap:', `$${analysisData.colaInfo.annualCap.toLocaleString()}`],
        ['First Year COLA:', `$${analysisData.colaProjections.firstYear.toLocaleString()}`],
        ['Five Year COLA:', `$${analysisData.colaProjections.fiveYear.toLocaleString()}`],
        ['Ten Year COLA:', `$${analysisData.colaProjections.tenYear.toLocaleString()}`]
      ]

      // Convert to CSV string
      const csvContent = csvData.map(row => row.join(',')).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `MA_Retirement_Analysis_${calculation.calculationName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Export'}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: "Analysis data has been downloaded as CSV",
      })

    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your analysis data",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (!analysisData || !calculation) {
      toast({
        title: "Share Failed",
        description: "No analysis data available to share",
        variant: "destructive",
      })
      return
    }

    try {
      // Create shareable URL with calculation ID
      const shareUrl = `${window.location.origin}/calculator?shared=${calculation.id}`

      // Create share text
      const shareText = `Check out my Massachusetts Retirement Analysis:

Retirement Age: ${calculation.retirementAge}
Monthly Pension (Option A): $${analysisData.pensionOptions.optionA.monthly.toLocaleString()}
Annual Pension (Option A): $${analysisData.pensionOptions.optionA.annual.toLocaleString()}

View full analysis: ${shareUrl}`

      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Massachusetts Retirement Analysis',
          text: shareText,
          url: shareUrl,
        })

        toast({
          title: "Shared Successfully",
          description: "Analysis has been shared",
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)

        toast({
          title: "Copied to Clipboard",
          description: "Share text has been copied to your clipboard",
        })
      }

    } catch (error) {
      console.error('Share error:', error)

      // Final fallback - just copy the URL
      try {
        const shareUrl = `${window.location.origin}/calculator?shared=${calculation.id}`
        await navigator.clipboard.writeText(shareUrl)

        toast({
          title: "URL Copied",
          description: "Analysis URL has been copied to your clipboard",
        })
      } catch (clipboardError) {
        toast({
          title: "Share Failed",
          description: "Unable to share or copy analysis data",
          variant: "destructive",
        })
      }
    }
  }

  if (loading || analysisLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Loading Analysis...</DialogTitle>
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

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Analysis Error
            </DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={calculateDetailedAnalysis}>Retry</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!calculation || !analysisData) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {calculation.calculationName || 'Retirement Analysis'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Comprehensive breakdown of your Massachusetts retirement benefits
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pension-options">Pension Options</TabsTrigger>
              <TabsTrigger value="cola-projections">COLA Projections</TabsTrigger>
              <TabsTrigger value="comprehensive">Full Analysis</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      Monthly Pension
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculation.monthlyBenefit)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Option {calculation.retirementOption}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      Annual Pension
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculation.annualBenefit)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Before COLA adjustments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      Retirement Group
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      Group {calculation.retirementGroup}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calculation.yearsOfService} years of service
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      Replacement Ratio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {((calculation.annualBenefit / calculation.averageSalary) * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Of average salary
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Basic Calculation Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Calculation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Salary</p>
                      <p className="text-lg font-semibold">{formatCurrency(calculation.averageSalary)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Retirement Age</p>
                      <p className="text-lg font-semibold">{calculation.retirementAge} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Years of Service</p>
                      <p className="text-lg font-semibold">{calculation.yearsOfService} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Benefit Percentage</p>
                      <p className="text-lg font-semibold">{calculation.benefitPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Retirement Option</p>
                      <p className="text-lg font-semibold">Option {calculation.retirementOption}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p className="text-lg font-semibold">
                        {calculation.createdAt ? formatDate(calculation.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Security Summary if available */}
              {calculation.socialSecurityData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Social Security Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly SS Benefit</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(calculation.socialSecurityData.selectedMonthlyBenefit || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Claiming Age</p>
                        <p className="text-lg font-semibold">
                          {calculation.socialSecurityData.selectedClaimingAge || 'N/A'} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Combined Monthly Income</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(calculation.socialSecurityData.combinedMonthlyIncome || 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pension Options Tab */}
            <TabsContent value="pension-options" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Massachusetts Pension Options Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare the three pension options available to Massachusetts state employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Option A */}
                    <Card className={`border-2 ${calculation.retirementOption === 'A' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          Option A
                          {calculation.retirementOption === 'A' && (
                            <Badge variant="default">Current Selection</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>Maximum Allowance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monthly Benefit</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(analysisData.pensionOptions.optionA.pension / 12)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Annual Benefit</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(analysisData.pensionOptions.optionA.pension)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Survivor Benefit</p>
                          <p className="text-sm text-red-600">None</p>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Provides the highest benefit amount but no survivor protection.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Option B */}
                    <Card className={`border-2 ${calculation.retirementOption === 'B' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          Option B
                          {calculation.retirementOption === 'B' && (
                            <Badge variant="default">Current Selection</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>Joint & Survivor (Variable)</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monthly Benefit</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(analysisData.pensionOptions.optionB.pension / 12)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Annual Benefit</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(analysisData.pensionOptions.optionB.pension)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Reduction</p>
                          <p className="text-sm text-orange-600">
                            {analysisData.pensionOptions.optionB.reductionPercentage?.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Survivor Benefit</p>
                          <p className="text-sm text-green-600">
                            {formatCurrency(analysisData.pensionOptions.optionB.survivorBenefit || 0)}
                          </p>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Reduced benefit with variable survivor protection based on ages.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Option C */}
                    <Card className={`border-2 ${calculation.retirementOption === 'C' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          Option C
                          {calculation.retirementOption === 'C' && (
                            <Badge variant="default">Current Selection</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>Joint & 2/3 Survivor</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monthly Benefit</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(analysisData.pensionOptions.optionC.pension / 12)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Annual Benefit</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(analysisData.pensionOptions.optionC.pension)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Reduction</p>
                          <p className="text-sm text-orange-600">
                            {analysisData.pensionOptions.optionC.reductionPercentage?.toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Survivor Benefit</p>
                          <p className="text-sm text-green-600">
                            {formatCurrency(analysisData.pensionOptions.optionC.survivorBenefit || 0)}
                          </p>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Provides 66.67% survivor benefit with moderate reduction.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* COLA Projections Tab */}
            <TabsContent value="cola-projections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Massachusetts COLA Projections
                  </CardTitle>
                  <CardDescription>
                    Cost of Living Adjustments (COLA) applied to your pension over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* COLA Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-green-700">
                          Annual COLA Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">3.0%</div>
                        <p className="text-xs text-green-600 mt-1">
                          Applied to first $13,000 only
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-700">
                          Maximum Annual COLA
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">$390</div>
                        <p className="text-xs text-blue-600 mt-1">
                          Cap on yearly increase
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-purple-700">
                          Your Annual COLA
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(analysisData.colaInfo.annualCOLA)}
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                          Based on your pension
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* COLA Information Alert */}
                  <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Massachusetts COLA Rules:</strong> The 3% COLA is applied only to the first $13,000
                      of your annual pension allowance, with a maximum increase of $390 per year. COLA begins
                      the first year after retirement and compounds annually.
                    </AlertDescription>
                  </Alert>

                  {/* 10-Year COLA Projection Table */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">10-Year COLA Projection</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 p-3 text-left">Year</th>
                            <th className="border border-gray-200 p-3 text-right">Starting Pension</th>
                            <th className="border border-gray-200 p-3 text-right">COLA Increase</th>
                            <th className="border border-gray-200 p-3 text-right">Ending Pension</th>
                            <th className="border border-gray-200 p-3 text-right">Monthly Amount</th>
                            <th className="border border-gray-200 p-3 text-right">Cumulative Increase</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisData.colaProjections.slice(0, 10).map((projection: any, index: number) => (
                            <tr key={projection.year} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="border border-gray-200 p-3 font-medium">
                                Year {projection.year}
                              </td>
                              <td className="border border-gray-200 p-3 text-right">
                                {formatCurrency(projection.startingPension)}
                              </td>
                              <td className="border border-gray-200 p-3 text-right text-green-600">
                                +{formatCurrency(projection.colaIncrease)}
                              </td>
                              <td className="border border-gray-200 p-3 text-right font-semibold">
                                {formatCurrency(projection.endingPension)}
                              </td>
                              <td className="border border-gray-200 p-3 text-right">
                                {formatCurrency(projection.monthlyPension)}
                              </td>
                              <td className="border border-gray-200 p-3 text-right text-blue-600">
                                +{formatCurrency(projection.endingPension - analysisData.colaProjections[0].startingPension)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* COLA Impact Summary */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-green-700">10-Year COLA Impact</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total COLA Increases</p>
                          <p className="text-xl font-bold text-green-700">
                            {formatCurrency(
                              analysisData.colaProjections[9]?.endingPension -
                              analysisData.colaProjections[0]?.startingPension || 0
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600">Final Monthly Pension</p>
                          <p className="text-xl font-bold text-green-700">
                            {formatCurrency(analysisData.colaProjections[9]?.monthlyPension || 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-blue-700">COLA Effectiveness</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Purchasing Power Protection</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {analysisData.colaInfo.isMaxCOLA ? 'Partial' : 'Full'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600">Annual Protection Rate</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {(analysisData.colaInfo.effectiveRate * 100).toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comprehensive Analysis Tab */}
            <TabsContent value="comprehensive" className="space-y-6">
              {analysisData.comprehensiveProjection ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      Comprehensive Retirement Projection
                    </CardTitle>
                    <CardDescription>
                      Year-by-year breakdown including pension, COLA, and Social Security benefits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 p-2 text-left">Age</th>
                            <th className="border border-gray-200 p-2 text-right">Years Service</th>
                            <th className="border border-gray-200 p-2 text-right">Base Pension</th>
                            <th className="border border-gray-200 p-2 text-right">COLA Adj.</th>
                            <th className="border border-gray-200 p-2 text-right">Total Pension</th>
                            <th className="border border-gray-200 p-2 text-right">Social Security</th>
                            <th className="border border-gray-200 p-2 text-right">Combined Monthly</th>
                            <th className="border border-gray-200 p-2 text-right">Combined Annual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisData.comprehensiveProjection.slice(0, 15).map((year: any, index: number) => (
                            <tr key={year.age} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="border border-gray-200 p-2 font-medium">{year.age}</td>
                              <td className="border border-gray-200 p-2 text-right">{year.yearsOfService.toFixed(1)}</td>
                              <td className="border border-gray-200 p-2 text-right">
                                {formatCurrency(year.pensionWithOption)}
                              </td>
                              <td className="border border-gray-200 p-2 text-right text-green-600">
                                +{formatCurrency(year.colaAdjustment)}
                              </td>
                              <td className="border border-gray-200 p-2 text-right font-semibold">
                                {formatCurrency(year.totalPensionAnnual)}
                              </td>
                              <td className="border border-gray-200 p-2 text-right text-blue-600">
                                {formatCurrency(year.socialSecurityAnnual)}
                              </td>
                              <td className="border border-gray-200 p-2 text-right font-bold text-purple-600">
                                {formatCurrency(year.combinedTotalMonthly)}
                              </td>
                              <td className="border border-gray-200 p-2 text-right font-bold">
                                {formatCurrency(year.combinedTotalAnnual)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Projection Summary */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-blue-700">Retirement Age</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-blue-600">
                            {calculation.retirementAge}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-green-700">First Year Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(analysisData.comprehensiveProjection[0]?.combinedTotalAnnual || 0)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-purple-50 border-purple-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-purple-700">Peak Income Year</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-purple-600">
                            {formatCurrency(
                              Math.max(...analysisData.comprehensiveProjection.map((y: any) => y.combinedTotalAnnual))
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50 border-orange-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-orange-700">Replacement Ratio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-orange-600">
                            {(
                              (analysisData.comprehensiveProjection[0]?.combinedTotalAnnual / calculation.averageSalary) * 100
                            ).toFixed(1)}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      Comprehensive Analysis Unavailable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Comprehensive analysis requires Social Security data. Complete your Social Security
                        information in the wizard to see the full year-by-year projection including combined
                        pension and Social Security benefits.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
