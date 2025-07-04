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

  const exportCalculation = async (calc: any) => {
    try {
      // Helper function to safely format currency values
      const safeCurrency = (value: any): string => {
        if (value === null || value === undefined || isNaN(Number(value))) {
          return '$0'
        }
        return `$${Number(value).toLocaleString()}`
      }

      // Create CSV data for the calculation with null safety
      const csvData = [
        ['Massachusetts Retirement Calculation Export'],
        ['Generated on:', new Date().toLocaleDateString()],
        [''],
        ['Basic Information'],
        ['Calculation Name:', calc.calculationName || 'Unnamed Calculation'],
        ['Created:', new Date(calc.createdAt).toLocaleDateString()],
        ['Retirement Age:', (calc.retirementAge || 0).toString()],
        ['Years of Service:', (calc.yearsOfService || 0).toString()],
        ['Average Salary:', safeCurrency(calc.averageSalary)],
        ['Retirement Group:', calc.retirementGroup || 'Unknown'],
        ['Retirement Option:', calc.retirementOption || 'Unknown'],
        [''],
        ['Calculated Benefits'],
        ['Monthly Benefit:', safeCurrency(calc.monthlyBenefit)],
        ['Annual Benefit:', safeCurrency(calc.annualBenefit)],
        ['Benefit Reduction:', `${calc.benefitReduction || 0}%`],
        ['Survivor Benefit:', safeCurrency(calc.survivorBenefit)],
        [''],
        ['Notes'],
        [calc.notes || 'No additional notes']
      ]

      // Convert to CSV string
      const csvContent = csvData.map(row => row.join(',')).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `MA_Retirement_${calc.calculationName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Calculation'}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: "Calculation data has been downloaded as CSV",
      })

    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your calculation",
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
                    title="Export calculation as CSV"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareCalculation(calc)}
                    title="Share calculation"
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