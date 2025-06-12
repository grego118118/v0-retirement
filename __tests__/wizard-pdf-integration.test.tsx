/**
 * Wizard PDF Integration Test
 * 
 * Test to verify the PDF generation button works correctly
 * in the wizard review step component.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewSaveStep } from '@/components/wizard/steps/review-save-step'
import { CombinedCalculationData, OptimizationResult } from '@/lib/wizard/wizard-types'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User'
      }
    }
  }))
}))

jest.mock('@/hooks/use-pdf-generation', () => ({
  usePDFGeneration: jest.fn(() => ({
    isGenerating: false,
    generatePDF: jest.fn(() => Promise.resolve({
      success: true,
      data: { user: { id: 'test-user-123' } },
      generationTime: 1500
    })),
    canGenerate: true,
    missingRequirements: [],
    warnings: []
  }))
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn()
  }
}))

// Mock window.print
Object.defineProperty(window, 'print', {
  value: jest.fn(),
  writable: true
})

const mockData: CombinedCalculationData = {
  personalInfo: {
    currentAge: 45,
    retirementGoalAge: 65,
    filingStatus: 'single'
  },
  pensionData: {
    retirementGroup: '1',
    yearsOfService: 25,
    averageSalary: 75000,
    retirementOption: 'A',
    monthlyBenefit: 4166.67
  },
  socialSecurityData: {
    fullRetirementAge: 67,
    selectedClaimingAge: 67,
    selectedMonthlyBenefit: 2500,
    isMarried: false
  },
  preferences: {
    retirementIncomeGoal: 6000,
    includeTaxOptimization: true,
    includeMonteCarloAnalysis: false
  }
}

const mockResults: OptimizationResult = {
  recommendedStrategy: {
    pensionClaimingAge: 65,
    socialSecurityClaimingAge: 67,
    totalLifetimeBenefits: 1600000,
    netAfterTaxIncome: 5500
  },
  alternativeStrategies: [],
  riskAnalysis: {
    riskLevel: 'moderate',
    confidenceInterval: 0.95
  }
}

describe('Wizard PDF Integration', () => {
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render PDF generation button', () => {
    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /generate pdf/i })
    expect(pdfButton).toBeInTheDocument()
    expect(pdfButton).not.toBeDisabled()
  })

  it('should show loading state when generating PDF', () => {
    const { usePDFGeneration } = require('@/hooks/use-pdf-generation')
    usePDFGeneration.mockReturnValue({
      isGenerating: true,
      generatePDF: jest.fn(),
      canGenerate: true,
      missingRequirements: [],
      warnings: []
    })

    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /generating/i })
    expect(pdfButton).toBeInTheDocument()
    expect(pdfButton).toBeDisabled()
  })

  it('should handle successful PDF generation', async () => {
    const user = userEvent.setup()
    const mockGeneratePDF = jest.fn(() => Promise.resolve({
      success: true,
      data: { user: { id: 'test-user-123' } },
      generationTime: 1500
    }))

    const { usePDFGeneration } = require('@/hooks/use-pdf-generation')
    usePDFGeneration.mockReturnValue({
      isGenerating: false,
      generatePDF: mockGeneratePDF,
      canGenerate: true,
      missingRequirements: [],
      warnings: []
    })

    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /generate pdf/i })
    await user.click(pdfButton)

    await waitFor(() => {
      expect(mockGeneratePDF).toHaveBeenCalledWith({
        reportType: 'comprehensive',
        includeCharts: true,
        includeActionItems: true,
        includeSocialSecurity: true
      })
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'PDF report generated successfully!',
        { description: 'Generated in 1500ms' }
      )
    })

    // Verify print dialog is triggered
    await waitFor(() => {
      expect(window.print).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('should handle PDF generation errors', async () => {
    const user = userEvent.setup()
    const mockGeneratePDF = jest.fn(() => Promise.resolve({
      success: false,
      error: 'Failed to generate PDF'
    }))

    const { usePDFGeneration } = require('@/hooks/use-pdf-generation')
    usePDFGeneration.mockReturnValue({
      isGenerating: false,
      generatePDF: mockGeneratePDF,
      canGenerate: true,
      missingRequirements: [],
      warnings: []
    })

    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /generate pdf/i })
    await user.click(pdfButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to generate PDF',
        { description: 'Failed to generate PDF' }
      )
    })
  })

  it('should show authentication required message when not signed in', () => {
    const { useSession } = require('next-auth/react')
    useSession.mockReturnValue({ data: null })

    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    expect(screen.getByText(/sign in required/i)).toBeInTheDocument()
    expect(screen.getByText(/pdf report generation requires authentication/i)).toBeInTheDocument()
  })

  it('should show missing requirements when cannot generate', () => {
    const { usePDFGeneration } = require('@/hooks/use-pdf-generation')
    usePDFGeneration.mockReturnValue({
      isGenerating: false,
      generatePDF: jest.fn(),
      canGenerate: false,
      missingRequirements: ['Retirement profile must be completed'],
      warnings: []
    })

    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    expect(screen.getByText(/required:/i)).toBeInTheDocument()
    expect(screen.getByText(/retirement profile must be completed/i)).toBeInTheDocument()

    const pdfButton = screen.getByRole('button', { name: /generate pdf/i })
    expect(pdfButton).toBeDisabled()
  })

  it('should show warnings when available', () => {
    const { usePDFGeneration } = require('@/hooks/use-pdf-generation')
    usePDFGeneration.mockReturnValue({
      isGenerating: false,
      generatePDF: jest.fn(),
      canGenerate: true,
      missingRequirements: [],
      warnings: ['Current salary not provided - may affect calculation accuracy']
    })

    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    expect(screen.getByText(/warnings:/i)).toBeInTheDocument()
    expect(screen.getByText(/current salary not provided/i)).toBeInTheDocument()
  })

  it('should show ready status when can generate', () => {
    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    expect(screen.getByText(/ready to generate comprehensive pdf report/i)).toBeInTheDocument()
  })

  it('should handle unauthenticated PDF generation attempt', async () => {
    const user = userEvent.setup()
    const { useSession } = require('next-auth/react')
    useSession.mockReturnValue({ data: null })

    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /generate pdf/i })
    await user.click(pdfButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please sign in to generate PDF reports')
    })
  })

  it('should handle cannot generate PDF attempt', async () => {
    const user = userEvent.setup()
    const { usePDFGeneration } = require('@/hooks/use-pdf-generation')
    usePDFGeneration.mockReturnValue({
      isGenerating: false,
      generatePDF: jest.fn(),
      canGenerate: false,
      missingRequirements: ['Profile required'],
      warnings: []
    })

    render(
      <ReviewSaveStep
        data={mockData}
        results={mockResults}
        onComplete={mockOnComplete}
        isSaving={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: /generate pdf/i })
    await user.click(pdfButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Cannot generate PDF',
        { description: 'Profile required' }
      )
    })
  })
})
