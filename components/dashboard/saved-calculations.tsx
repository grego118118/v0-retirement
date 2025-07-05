"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  Calendar,
  DollarSign,
  Users,
  Plus,
  Eye,
  Trash2,
  AlertCircle,
  Download,
  Share2
} from "lucide-react"
import Link from "next/link"
import { CalculationAnalysisModal } from "./calculation-analysis-modal"
import { useRetirementDataContext } from "@/contexts/retirement-data-context"
import { useToast } from "@/hooks/use-toast"
import { getBenefitFactor, calculatePensionWithOption } from "@/lib/pension-calculations"
// Temporarily removed year-by-year projections to fix production API issues
// import {
//   calculateRetirementBenefitsProjection,
//   ProjectionParameters,
//   ProjectionYear
// } from "@/lib/retirement-benefits-projection"

interface SavedCalculation {
  id: string
  calculationName: string | null
  retirementDate: string
  retirementAge: number
  yearsOfService: number
  averageSalary: number
  retirementGroup: string
  retirementOption: string
  monthlyBenefit: number
  annualBenefit: number
  createdAt: string
  updatedAt: string
}

export function SavedCalculations() {
  const { data: session } = useSession()
  const { calculations: hookCalculations, loading, error, fetchCalculations } = useRetirementDataContext()
  const [selectedCalculation, setSelectedCalculation] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  // Convert hook calculations to component format with proper type safety
  const calculations = hookCalculations.map(calc => ({
    id: calc.id || '',
    calculationName: calc.calculationName || '',
    retirementDate: calc.retirementDate,
    retirementAge: calc.retirementAge,
    yearsOfService: calc.yearsOfService,
    averageSalary: calc.averageSalary,
    retirementGroup: calc.retirementGroup,
    retirementOption: calc.retirementOption,
    monthlyBenefit: calc.monthlyBenefit,
    annualBenefit: calc.annualBenefit,
    benefitReduction: calc.benefitReduction,
    survivorBenefit: calc.survivorBenefit,
    notes: calc.notes,
    isFavorite: calc.isFavorite,
    createdAt: calc.createdAt || '',
    updatedAt: calc.updatedAt || '',
    socialSecurityData: calc.socialSecurityData
  })).filter(calc => calc.id) // Filter out any calculations without valid IDs

  // No need for useEffect or fetchCalculations - using data from useRetirementData hook

  const deleteCalculation = async (id: string) => {
    try {
      const response = await fetch(`/api/retirement/calculations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh calculations from the hook
        fetchCalculations()
      }
    } catch (err) {
      console.error('Error deleting calculation:', err)
    }
  }

  // Transform saved calculation data to proper PDF format
  const transformCalculationForPDF = (calc: any) => {
    console.log('🔄 Transforming calculation for PDF:', calc)

    // Validate required fields
    if (!calc.averageSalary || !calc.yearsOfService || !calc.retirementAge) {
      console.error('❌ Missing required fields:', {
        averageSalary: calc.averageSalary,
        yearsOfService: calc.yearsOfService,
        retirementAge: calc.retirementAge
      })
      throw new Error('Missing required calculation data for PDF generation')
    }

    // Prepare calculation parameters
    const group = `GROUP_${calc.retirementGroup || '1'}`
    const serviceEntry = 'before_2012' // Default - could be enhanced with actual data
    const beneficiaryAge = '65' // Default beneficiary age

    // Calculate base pension using proper MSRB methodology
    const benefitFactor = getBenefitFactor(calc.retirementAge, group, serviceEntry, calc.yearsOfService)
    let basePension = calc.averageSalary * calc.yearsOfService * benefitFactor

    // Apply 80% cap
    const maxPension = calc.averageSalary * 0.8
    if (basePension > maxPension) {
      basePension = maxPension
    }

    // If we have saved annual benefit, use it as the base (it should match our calculation)
    if (calc.annualBenefit && calc.annualBenefit > 0) {
      basePension = calc.annualBenefit
    }

    const totalBenefitPercentage = (basePension / calc.averageSalary) * 100
    const cappedAt80Percent = totalBenefitPercentage >= 80

    // Calculate all retirement options using proper MSRB functions
    let optionAResult, optionBResult, optionCResult
    try {
      optionAResult = calculatePensionWithOption(basePension, 'A', calc.retirementAge, beneficiaryAge, group)
      optionBResult = calculatePensionWithOption(basePension, 'B', calc.retirementAge, beneficiaryAge, group)
      optionCResult = calculatePensionWithOption(basePension, 'C', calc.retirementAge, beneficiaryAge, group)
      console.log('✅ Pension calculations successful:', { optionAResult, optionBResult, optionCResult })
    } catch (error) {
      console.error('❌ Error in pension calculations:', error)
      // Fallback to simple calculations
      optionAResult = { pension: basePension, description: 'Option A: Full Allowance (100%)', survivorPension: 0 }
      optionBResult = { pension: basePension * 0.99, description: 'Option B: Annuity Protection (1% reduction)', survivorPension: 0 }
      optionCResult = { pension: basePension * 0.9295, description: 'Option C: Joint & Survivor (66.67%)', survivorPension: basePension * 0.9295 * (2/3) }
    }

    // Generate retirement options structure for PDF
    const options = {
      A: {
        annual: optionAResult.pension,
        monthly: optionAResult.pension / 12,
        description: optionAResult.description
      },
      B: {
        annual: optionBResult.pension,
        monthly: optionBResult.pension / 12,
        description: optionBResult.description,
        reduction: (basePension - optionBResult.pension) / basePension // Calculate actual reduction
      },
      C: {
        annual: optionCResult.pension,
        monthly: optionCResult.pension / 12,
        description: optionCResult.description,
        reduction: (basePension - optionCResult.pension) / basePension, // Calculate actual reduction
        survivorAnnual: optionCResult.survivorPension,
        survivorMonthly: optionCResult.survivorPension / 12,
        beneficiaryAge: parseInt(beneficiaryAge)
      }
    }

    console.log('✅ Generated options for PDF:', options)

    // Temporarily removed year-by-year projections to fix production API issues
    // Year-by-year projections will be re-added in a future update
    const yearlyProjections: any[] = []

    const result = {
      // Personal Information
      name: calc.calculationName || 'Retirement Analysis',
      currentAge: calc.retirementAge - calc.yearsOfService, // Estimate current age
      plannedRetirementAge: calc.retirementAge,
      retirementGroup: calc.retirementGroup || '1',
      serviceEntry: serviceEntry,

      // Calculation Details
      averageSalary: calc.averageSalary,
      yearsOfService: calc.yearsOfService,
      projectedYearsAtRetirement: calc.yearsOfService,

      // Pension Results
      basePension: basePension,
      benefitFactor: benefitFactor,
      totalBenefitPercentage: totalBenefitPercentage,
      cappedAt80Percent: cappedAt80Percent,

      // Retirement Options
      options: options,

      // Year-by-Year Projections
      yearlyProjections: yearlyProjections,

      // Additional Information
      calculationDate: calc.createdAt ? new Date(calc.createdAt) : new Date(),
      isVeteran: false, // Default - could be enhanced with actual data
      veteranBenefit: 0
    }

    console.log('📄 Final PDF data structure:', result)
    return result
  }

  const exportCalculation = async (calc: any) => {
    console.log('🔄 PDF Export: Starting export for calculation:', calc.id)

    try {
      // Check if user has premium access for PDF generation
      console.log('🔄 PDF Export: Checking subscription status...')
      const subscriptionResponse = await fetch('/api/subscription/status')
      console.log('🔄 PDF Export: Subscription response status:', subscriptionResponse.status)

      if (!subscriptionResponse.ok) {
        throw new Error(`Subscription check failed: ${subscriptionResponse.status}`)
      }

      const subscriptionData = await subscriptionResponse.json()
      console.log('🔄 PDF Export: Subscription data:', subscriptionData)
      const isPremium = subscriptionData.isPremium

      if (!isPremium) {
        console.log('❌ PDF Export: User is not premium, redirecting to pricing')
        // Redirect non-premium users to pricing page
        window.location.href = '/pricing?feature=pdf-export&context=dashboard_export'
        return
      }

      console.log('✅ PDF Export: Premium access confirmed')

      // Convert calculation data to proper PDF format with all required fields
      console.log('🔄 PDF Export: Transforming calculation data...')
      const pensionData = transformCalculationForPDF(calc)
      console.log('🔄 PDF Export: Transformed data:', pensionData)

      // Validate the transformed data has all required fields
      if (!pensionData.options || !pensionData.options.A || !pensionData.options.B || !pensionData.options.C) {
        throw new Error('Failed to generate complete pension options data for PDF')
      }

      console.log('✅ PDF Export: Data validation passed')

      // Show loading state
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your retirement report",
      })

      console.log('🔄 PDF Export: Calling PDF generation API...')
      // Call PDF generation API
      const pdfResponse = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: pensionData,
          reportType: 'pension',
          options: {
            includeCharts: true,
            includeCOLAProjections: true,
            reportType: 'basic'
          }
        })
      })

      console.log('🔄 PDF Export: PDF API response status:', pdfResponse.status)

      if (!pdfResponse.ok) {
        const errorData = await pdfResponse.json()
        console.error('❌ PDF Export: API error:', errorData)
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      console.log('✅ PDF Export: PDF generated successfully, downloading...')

      // Download the PDF
      const pdfBlob = await pdfResponse.blob()
      console.log('🔄 PDF Export: PDF blob size:', pdfBlob.size)

      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')

      link.href = url
      link.download = `MassPension_${calc.calculationName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Retirement_Report'}_${new Date().toISOString().split('T')[0]}.pdf`
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      URL.revokeObjectURL(url)

      console.log('✅ PDF Export: Download completed successfully')

      toast({
        title: "PDF Export Successful",
        description: "Your retirement report has been downloaded",
      })

    } catch (error) {
      console.error('❌ PDF Export error:', error)
      toast({
        title: "PDF Export Failed",
        description: error instanceof Error ? error.message : "There was an error generating your PDF report",
        variant: "destructive",
      })
    }
  }

  // Debug function to test PDF generation
  const testPDFGeneration = async () => {
    console.log('🧪 Testing PDF generation...')
    try {
      const response = await fetch('/api/test-pension-pdf')
      console.log('🧪 Test PDF response status:', response.status)

      if (response.ok) {
        const blob = await response.blob()
        console.log('🧪 Test PDF blob size:', blob.size)

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'test-pension-report.pdf'
        link.click()
        URL.revokeObjectURL(url)

        toast({
          title: "Test PDF Generated",
          description: "Test PDF downloaded successfully",
        })
      } else {
        throw new Error(`Test PDF failed: ${response.status}`)
      }
    } catch (error) {
      console.error('🧪 Test PDF error:', error)
      toast({
        title: "Test PDF Failed",
        description: error instanceof Error ? error.message : "Test PDF generation failed",
        variant: "destructive",
      })
    }
  }

  const shareCalculation = async (calc: any) => {
    try {
      // Create shareable URL
      const shareUrl = `${window.location.origin}/calculator?shared=${calc.id}`

      // Create share text
      const shareText = `Check out my Massachusetts Retirement Calculation:

${calc.calculationName || 'My Retirement Plan'}
Retirement Age: ${calc.retirementAge}
Monthly Benefit: $${calc.monthlyBenefit.toLocaleString()}
Annual Benefit: $${calc.annualBenefit.toLocaleString()}

View full calculation: ${shareUrl}`

      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Massachusetts Retirement Calculation',
          text: shareText,
          url: shareUrl,
        })

        toast({
          title: "Shared Successfully",
          description: "Calculation has been shared",
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
        const shareUrl = `${window.location.origin}/calculator?shared=${calc.id}`
        await navigator.clipboard.writeText(shareUrl)

        toast({
          title: "URL Copied",
          description: "Calculation URL has been copied to your clipboard",
        })
      } catch (clipboardError) {
        toast({
          title: "Share Failed",
          description: "Unable to share or copy calculation data",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewCalculation = (calculation: SavedCalculation) => {
    // Convert SavedCalculation to RetirementCalculation format for the modal
    const retirementCalculation = {
      id: calculation.id,
      calculationName: calculation.calculationName,
      retirementDate: calculation.retirementDate,
      retirementAge: calculation.retirementAge,
      yearsOfService: calculation.yearsOfService,
      averageSalary: calculation.averageSalary,
      retirementGroup: calculation.retirementGroup,
      benefitPercentage: (calculation.monthlyBenefit * 12) / calculation.averageSalary * 100, // Calculate benefit percentage
      retirementOption: calculation.retirementOption,
      monthlyBenefit: calculation.monthlyBenefit,
      annualBenefit: calculation.annualBenefit,
      createdAt: calculation.createdAt,
      updatedAt: calculation.updatedAt
    }

    setSelectedCalculation(retirementCalculation as any)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCalculation(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getGroupLabel = (group: string) => {
    const groupLabels: Record<string, string> = {
      'GROUP_1': 'Group 1',
      'GROUP_2': 'Group 2',
      'GROUP_3': 'Group 3',
      'GROUP_4': 'Group 4'
    }
    return groupLabels[group] || group
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (calculations.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Saved Calculations</h3>
          <p className="text-gray-600 mb-4">
            Start by creating your first retirement calculation to see your pension benefits.
          </p>
          <div className="space-y-2">
            <Link href="/calculator">
              <Button>
                <Calculator className="mr-2 h-4 w-4" />
                Start Calculator
              </Button>
            </Link>
            <Link href="/wizard">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Use Wizard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Calculations ({calculations.length})</h3>
        <div className="space-x-2">
          <Button size="sm" variant="secondary" onClick={testPDFGeneration}>
            🧪 Test PDF
          </Button>
          <Link href="/calculator">
            <Button size="sm">
              <Calculator className="mr-2 h-4 w-4" />
              New Calculation
            </Button>
          </Link>
          <Link href="/wizard">
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Use Wizard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {calculations.map((calc) => (
          <Card key={calc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {calc.calculationName || `Calculation ${calc.id.slice(-6)}`}
                  </CardTitle>
                  <CardDescription>
                    Created {formatDate(calc.createdAt)}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {getGroupLabel(calc.retirementGroup)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Retirement Age</div>
                    <div className="font-semibold">{calc.retirementAge}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Years of Service</div>
                    <div className="font-semibold">{calc.yearsOfService}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Average Salary</div>
                    <div className="font-semibold">{formatCurrency(calc.averageSalary)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-600">Monthly Benefit</div>
                    <div className="font-semibold text-green-600">{formatCurrency(calc.monthlyBenefit)}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Option {calc.retirementOption} • Annual: {formatCurrency(calc.annualBenefit)}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewCalculation(calc)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportCalculation(calc)}
                    title="Generate professional PDF report with charts, COLA projections, and MassPension.com branding (Premium feature)"
                    className="hover:border-blue-300 hover:bg-blue-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-md">PDF</span>
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-md flex items-center">
                      <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      Premium
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareCalculation(calc)}
                    title="Share calculation summary with basic pension details via Web Share API or clipboard"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCalculation(calc.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete calculation"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis Modal */}
      <CalculationAnalysisModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        calculation={selectedCalculation}
      />
    </div>
  )
}