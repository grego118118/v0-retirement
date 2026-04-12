import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaxImplicationsCalculator } from '@/components/tax-implications-calculator'

// Mock the tax calculations module
jest.mock('@/lib/tax-calculations', () => ({
  calculateRetirementTaxes: jest.fn(() => ({
    grossIncome: 90000,
    federalTax: 12000,
    stateTax: 3000,
    totalTax: 15000,
    netIncome: 75000,
    effectiveRate: 0.1667,
    marginalRate: 0.22,
    breakdown: {
      federal: {
        brackets: [
          { rate: 0.10, income: 11600, tax: 1160 },
          { rate: 0.12, income: 35550, tax: 4266 },
          { rate: 0.22, income: 10850, tax: 2387 }
        ],
        totalTax: 12000,
        effectiveRate: 0.15,
        marginalRate: 0.22
      },
      state: {
        brackets: [
          { rate: 0.05, income: 60000, tax: 3000 }
        ],
        totalTax: 3000,
        effectiveRate: 0.05,
        marginalRate: 0.05
      }
    }
  })),
  FEDERAL_TAX_BRACKETS_2024: {
    single: [],
    marriedFilingJointly: [],
    marriedFilingSeparately: [],
    headOfHousehold: []
  },
  STANDARD_DEDUCTIONS_2024: {
    single: 14600,
    marriedFilingJointly: 29200,
    marriedFilingSeparately: 14600,
    headOfHousehold: 21900
  },
  MA_TAX_RATE: 0.05
}))

describe('TaxImplicationsCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the calculator form correctly', () => {
    render(<TaxImplicationsCalculator />)

    expect(screen.getByText('Tax Implications Calculator')).toBeInTheDocument()
    expect(screen.getByLabelText(/Annual Pension Income/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Annual Social Security/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Other Annual Income/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Filing Status/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Age 65 or older/)).toBeInTheDocument()
  })

  it('accepts initial values for pension and social security', () => {
    render(
      <TaxImplicationsCalculator 
        initialPensionIncome={60000} 
        initialSocialSecurity={25000} 
      />
    )

    const pensionInput = screen.getByLabelText(/Annual Pension Income/) as HTMLInputElement
    const ssInput = screen.getByLabelText(/Annual Social Security/) as HTMLInputElement

    expect(pensionInput.value).toBe('60000')
    expect(ssInput.value).toBe('25000')
  })

  it('updates form values when user types', async () => {
    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    const ssInput = screen.getByLabelText(/Annual Social Security/)
    const otherInput = screen.getByLabelText(/Other Annual Income/)

    await user.type(pensionInput, '60000')
    await user.type(ssInput, '25000')
    await user.type(otherInput, '5000')

    expect(pensionInput).toHaveValue(60000)
    expect(ssInput).toHaveValue(25000)
    expect(otherInput).toHaveValue(5000)
  })

  it('changes filing status when dropdown is used', async () => {
    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const filingStatusSelect = screen.getByRole('combobox', { name: /Filing Status/ })
    
    await user.click(filingStatusSelect)
    await user.click(screen.getByText('Married Filing Jointly'))

    expect(screen.getByText('Married Filing Jointly')).toBeInTheDocument()
  })

  it('toggles age 65+ checkbox', async () => {
    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const ageCheckbox = screen.getByLabelText(/Age 65 or older/) as HTMLInputElement

    expect(ageCheckbox.checked).toBe(false)

    await user.click(ageCheckbox)
    expect(ageCheckbox.checked).toBe(true)

    await user.click(ageCheckbox)
    expect(ageCheckbox.checked).toBe(false)
  })

  it('triggers calculation when Calculate Taxes button is clicked', async () => {
    const user = userEvent.setup()
    const { calculateRetirementTaxes } = require('@/lib/tax-calculations')
    
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    const calculateButton = screen.getByRole('button', { name: /Calculate Taxes/ })

    await user.type(pensionInput, '60000')
    await user.click(calculateButton)

    await waitFor(() => {
      expect(calculateRetirementTaxes).toHaveBeenCalled()
    })
  })

  it('displays calculation results after form submission', async () => {
    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    const ssInput = screen.getByLabelText(/Annual Social Security/)
    const calculateButton = screen.getByRole('button', { name: /Calculate Taxes/ })

    await user.type(pensionInput, '60000')
    await user.type(ssInput, '25000')
    await user.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText('$90,000')).toBeInTheDocument() // Gross Income
      expect(screen.getByText('$15,000')).toBeInTheDocument() // Total Taxes
      expect(screen.getByText('$75,000')).toBeInTheDocument() // Net Income
      expect(screen.getByText('16.7%')).toBeInTheDocument()   // Effective Rate
    })
  })

  it('shows loading state during calculation', async () => {
    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    const calculateButton = screen.getByRole('button', { name: /Calculate Taxes/ })

    await user.type(pensionInput, '60000')
    await user.click(calculateButton)

    expect(screen.getByText('Calculating...')).toBeInTheDocument()
  })

  it('displays detailed tax breakdown in tabs', async () => {
    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    const calculateButton = screen.getByRole('button', { name: /Calculate Taxes/ })

    await user.type(pensionInput, '60000')
    await user.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText('Tax Breakdown')).toBeInTheDocument()
    })

    // Test tab navigation
    const federalTab = screen.getByRole('tab', { name: /Federal Details/ })
    await user.click(federalTab)

    expect(screen.getByText('Federal Tax Calculation')).toBeInTheDocument()
    expect(screen.getByText('Standard Deduction')).toBeInTheDocument()

    const stateTab = screen.getByRole('tab', { name: /Massachusetts Details/ })
    await user.click(stateTab)

    expect(screen.getByText('Massachusetts Tax Calculation')).toBeInTheDocument()
    expect(screen.getByText('5.0% (flat rate)')).toBeInTheDocument()
  })

  it('auto-calculates when form values change', async () => {
    const user = userEvent.setup()
    const { calculateRetirementTaxes } = require('@/lib/tax-calculations')
    
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    
    await user.type(pensionInput, '60000')

    // Wait for debounced auto-calculation
    await waitFor(() => {
      expect(calculateRetirementTaxes).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('handles calculation errors gracefully', async () => {
    const { calculateRetirementTaxes } = require('@/lib/tax-calculations')
    calculateRetirementTaxes.mockImplementation(() => {
      throw new Error('Calculation error')
    })

    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    const calculateButton = screen.getByRole('button', { name: /Calculate Taxes/ })

    await user.type(pensionInput, '60000')
    await user.click(calculateButton)

    // Should not crash and should handle error gracefully
    await waitFor(() => {
      expect(screen.queryByText('$90,000')).not.toBeInTheDocument()
    })
  })

  it('formats currency values correctly', async () => {
    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    const calculateButton = screen.getByRole('button', { name: /Calculate Taxes/ })

    await user.type(pensionInput, '60000')
    await user.click(calculateButton)

    await waitFor(() => {
      // Check that currency is formatted with $ and commas
      expect(screen.getByText('$90,000')).toBeInTheDocument()
      expect(screen.getByText('$15,000')).toBeInTheDocument()
      expect(screen.getByText('$75,000')).toBeInTheDocument()
    })
  })

  it('formats percentage values correctly', async () => {
    const user = userEvent.setup()
    render(<TaxImplicationsCalculator />)

    const pensionInput = screen.getByLabelText(/Annual Pension Income/)
    const calculateButton = screen.getByRole('button', { name: /Calculate Taxes/ })

    await user.type(pensionInput, '60000')
    await user.click(calculateButton)

    await waitFor(() => {
      // Check that percentages are formatted correctly
      expect(screen.getByText('16.7%')).toBeInTheDocument()
      expect(screen.getByText('22.0%')).toBeInTheDocument()
    })
  })

  it('applies custom className prop', () => {
    const customClass = 'custom-tax-calculator'
    render(<TaxImplicationsCalculator className={customClass} />)

    const container = screen.getByText('Tax Implications Calculator').closest('div')
    expect(container).toHaveClass(customClass)
  })

  it('is accessible with proper ARIA labels', () => {
    render(<TaxImplicationsCalculator />)

    expect(screen.getByLabelText(/Annual Pension Income/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Annual Social Security/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Other Annual Income/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Filing Status/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Age 65 or older/)).toBeInTheDocument()

    // Check for button accessibility
    expect(screen.getByRole('button', { name: /Calculate Taxes/ })).toBeInTheDocument()
  })
})
