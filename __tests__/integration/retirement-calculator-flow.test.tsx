import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CombinedRetirementCalculator } from '@/components/combined-retirement-calculator'

// Mock the calculation modules
jest.mock('@/lib/pension-calculations', () => ({
  calculatePensionBenefit: jest.fn(() => ({
    averageSalary: 72000,
    benefitMultiplier: 0.022,
    annualPension: 47520,
    monthlyPension: 3960,
    eligible: true,
    retirementOption: 'A',
    group: 'GROUP_1',
    yearsOfService: 30,
    age: 62
  }))
}))

jest.mock('@/lib/social-security-calculations', () => ({
  calculateSocialSecurityBenefit: jest.fn(() => ({
    monthlyBenefit: 2000,
    annualBenefit: 24000,
    fullRetirementAge: 67,
    eligible: true,
    reductionPercentage: 0,
    delayedRetirementCredits: 0
  })),
  calculateSpousalBenefit: jest.fn(() => ({
    spousalBenefit: 1000,
    totalBenefit: 1000
  })),
  calculateMedicarePremium: jest.fn(() => ({
    partB: 174.70,
    irmaaAdjustment: 0,
    totalPremium: 174.70
  }))
}))

jest.mock('@/lib/tax-calculations', () => ({
  calculateRetirementTaxes: jest.fn(() => ({
    grossIncome: 95520,
    federalTax: 12000,
    stateTax: 2376,
    totalTax: 14376,
    netIncome: 81144,
    effectiveRate: 0.1505,
    marginalRate: 0.22,
    breakdown: {
      federal: {
        brackets: [],
        totalTax: 12000,
        effectiveRate: 0.1256,
        marginalRate: 0.22
      },
      state: {
        brackets: [],
        totalTax: 2376,
        effectiveRate: 0.0249,
        marginalRate: 0.05
      }
    }
  }))
}))

describe('Retirement Calculator Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('completes full retirement planning workflow', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Step 1: Verify initial state
    expect(screen.getByText('Combined Retirement Calculator')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Social Security Setup/ })).toBeInTheDocument()

    // Step 2: Fill Social Security information
    const birthYearInput = screen.getByLabelText(/Birth Year/)
    await user.type(birthYearInput, '1960')

    const retirementAgeInput = screen.getByLabelText(/Planned Retirement Age/)
    await user.type(retirementAgeInput, '67')

    const earningsInput = screen.getByLabelText(/Average Monthly Earnings/)
    await user.type(earningsInput, '5000')

    // Step 3: Navigate to Combined Results
    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    await waitFor(() => {
      expect(screen.getByText('Retirement Income Summary')).toBeInTheDocument()
    })

    // Step 4: Verify pension data is displayed
    expect(screen.getByText('$3,960')).toBeInTheDocument() // Monthly pension
    expect(screen.getByText('$47,520')).toBeInTheDocument() // Annual pension

    // Step 5: Verify Social Security data is displayed
    expect(screen.getByText('$2,000')).toBeInTheDocument() // Monthly SS
    expect(screen.getByText('$24,000')).toBeInTheDocument() // Annual SS

    // Step 6: Navigate to Tax Implications
    const taxTab = screen.getByRole('tab', { name: /Tax Implications/ })
    await user.click(taxTab)

    await waitFor(() => {
      expect(screen.getByText('Tax Implications Calculator')).toBeInTheDocument()
    })

    // Step 7: Verify tax calculations are auto-populated
    const pensionIncomeInput = screen.getByLabelText(/Annual Pension Income/) as HTMLInputElement
    const ssIncomeInput = screen.getByLabelText(/Annual Social Security/) as HTMLInputElement

    expect(pensionIncomeInput.value).toBe('47520')
    expect(ssIncomeInput.value).toBe('24000')

    // Step 8: Verify tax results are calculated
    await waitFor(() => {
      expect(screen.getByText('$95,520')).toBeInTheDocument() // Gross income
      expect(screen.getByText('$14,376')).toBeInTheDocument() // Total taxes
      expect(screen.getByText('$81,144')).toBeInTheDocument() // Net income
    })
  })

  it('handles pension data updates across tabs', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Update pension data (simulated from pension calculator)
    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    // Verify pension data is reflected
    await waitFor(() => {
      expect(screen.getByText('$3,960')).toBeInTheDocument()
    })

    // Navigate to tax tab and verify data flows through
    const taxTab = screen.getByRole('tab', { name: /Tax Implications/ })
    await user.click(taxTab)

    const pensionIncomeInput = screen.getByLabelText(/Annual Pension Income/) as HTMLInputElement
    expect(pensionIncomeInput.value).toBe('47520')
  })

  it('calculates spousal benefits correctly', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Enable spousal benefits
    const spouseCheckbox = screen.getByLabelText(/Include Spouse Benefits/)
    await user.click(spouseCheckbox)

    // Fill spouse information
    const spouseBirthYearInput = screen.getByLabelText(/Spouse Birth Year/)
    await user.type(spouseBirthYearInput, '1962')

    const spouseEarningsInput = screen.getByLabelText(/Spouse Average Monthly Earnings/)
    await user.type(spouseEarningsInput, '3000')

    // Navigate to results
    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    await waitFor(() => {
      expect(screen.getByText('Spousal Benefits')).toBeInTheDocument()
      expect(screen.getByText('$1,000')).toBeInTheDocument() // Spousal benefit
    })
  })

  it('displays Medicare premium calculations', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    await waitFor(() => {
      expect(screen.getByText('Medicare Premiums')).toBeInTheDocument()
      expect(screen.getByText('$174.70')).toBeInTheDocument() // Part B premium
    })
  })

  it('handles COLA projections correctly', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Enable COLA projections
    const colaCheckbox = screen.getByLabelText(/Include COLA Projections/)
    await user.click(colaCheckbox)

    const colaRateInput = screen.getByLabelText(/Annual COLA Rate/)
    await user.type(colaRateInput, '2.5')

    const projectionYearsInput = screen.getByLabelText(/Projection Years/)
    await user.type(projectionYearsInput, '10')

    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    await waitFor(() => {
      expect(screen.getByText('COLA Projections')).toBeInTheDocument()
    })
  })

  it('validates required fields across all tabs', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Try to navigate to results without filling required fields
    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    // Should show validation messages
    await waitFor(() => {
      expect(screen.getByText(/Please complete Social Security information/)).toBeInTheDocument()
    })
  })

  it('persists data across tab navigation', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Fill data in Social Security tab
    const birthYearInput = screen.getByLabelText(/Birth Year/)
    await user.type(birthYearInput, '1960')

    // Navigate away and back
    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    const socialSecurityTab = screen.getByRole('tab', { name: /Social Security Setup/ })
    await user.click(socialSecurityTab)

    // Data should be preserved
    expect(birthYearInput).toHaveValue(1960)
  })

  it('calculates total retirement income correctly', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Fill Social Security data
    const birthYearInput = screen.getByLabelText(/Birth Year/)
    await user.type(birthYearInput, '1960')

    const retirementAgeInput = screen.getByLabelText(/Planned Retirement Age/)
    await user.type(retirementAgeInput, '67')

    const earningsInput = screen.getByLabelText(/Average Monthly Earnings/)
    await user.type(earningsInput, '5000')

    // Navigate to results
    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    await waitFor(() => {
      // Should show total monthly income (pension + SS)
      expect(screen.getByText('Total Monthly Income')).toBeInTheDocument()
      expect(screen.getByText('$5,960')).toBeInTheDocument() // $3,960 + $2,000
    })
  })

  it('handles different filing statuses in tax calculations', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Navigate to tax tab
    const taxTab = screen.getByRole('tab', { name: /Tax Implications/ })
    await user.click(taxTab)

    // Change filing status
    const filingStatusSelect = screen.getByRole('combobox', { name: /Filing Status/ })
    await user.click(filingStatusSelect)
    await user.click(screen.getByText('Married Filing Jointly'))

    // Should recalculate taxes with new filing status
    await waitFor(() => {
      expect(screen.getByText('Married Filing Jointly')).toBeInTheDocument()
    })
  })

  it('displays comprehensive retirement summary', async () => {
    const user = userEvent.setup()
    render(<CombinedRetirementCalculator />)

    // Fill required data
    const birthYearInput = screen.getByLabelText(/Birth Year/)
    await user.type(birthYearInput, '1960')

    const retirementAgeInput = screen.getByLabelText(/Planned Retirement Age/)
    await user.type(retirementAgeInput, '67')

    const earningsInput = screen.getByLabelText(/Average Monthly Earnings/)
    await user.type(earningsInput, '5000')

    // Navigate to results
    const combinedResultsTab = screen.getByRole('tab', { name: /Combined Results/ })
    await user.click(combinedResultsTab)

    await waitFor(() => {
      // Verify all major components are displayed
      expect(screen.getByText('Pension Benefits')).toBeInTheDocument()
      expect(screen.getByText('Social Security Benefits')).toBeInTheDocument()
      expect(screen.getByText('Medicare Premiums')).toBeInTheDocument()
      expect(screen.getByText('Total Monthly Income')).toBeInTheDocument()
      expect(screen.getByText('Net Monthly Income')).toBeInTheDocument()
    })
  })
})
