import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PensionCalculator } from '@/components/pension-calculator'

// Mock the pension calculations module
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
  })),
  calculateBenefitMultiplier: jest.fn(() => 0.022),
  calculateRetirementEligibility: jest.fn(() => true),
  calculateAverageHighestSalary: jest.fn(() => 72000)
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('PensionCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('renders the calculator with all form sections', () => {
    render(<PensionCalculator />)

    expect(screen.getByText('Complete Your Pension Calculation')).toBeInTheDocument()
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Salary Information')).toBeInTheDocument()
    expect(screen.getByText('Retirement Options')).toBeInTheDocument()
  })

  it('displays progress indicator correctly', () => {
    render(<PensionCalculator />)

    expect(screen.getByText('Massachusetts Pension Estimator')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument() // Initial progress
  })

  it('fills personal information form fields', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    // Fill service entry date
    const serviceEntrySelect = screen.getByRole('combobox', { name: /Service Entry Period/ })
    await user.click(serviceEntrySelect)
    await user.click(screen.getByText('Before April 2, 2012'))

    // Fill age
    const ageInput = screen.getByLabelText(/Age at Retirement/)
    await user.type(ageInput, '62')

    // Fill years of service
    const yearsInput = screen.getByLabelText(/Years of Service/)
    await user.type(yearsInput, '30')

    // Fill employee group
    const groupSelect = screen.getByRole('combobox', { name: /Employee Group/ })
    await user.click(groupSelect)
    await user.click(screen.getByText('Group I (General Employees)'))

    expect(ageInput).toHaveValue(62)
    expect(yearsInput).toHaveValue(30)
  })

  it('fills salary information form fields', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    const salary1Input = screen.getByLabelText(/Highest Salary - Year 1/)
    const salary2Input = screen.getByLabelText(/Highest Salary - Year 2/)
    const salary3Input = screen.getByLabelText(/Highest Salary - Year 3/)

    await user.type(salary1Input, '70000')
    await user.type(salary2Input, '72000')
    await user.type(salary3Input, '74000')

    expect(salary1Input).toHaveValue(70000)
    expect(salary2Input).toHaveValue(72000)
    expect(salary3Input).toHaveValue(74000)

    // Should show average salary calculation
    await waitFor(() => {
      expect(screen.getByText('$72,000')).toBeInTheDocument()
    })
  })

  it('selects retirement options correctly', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    // Test Option A selection
    const optionA = screen.getByLabelText(/Option A: Full Allowance/)
    await user.click(optionA)
    expect(optionA).toBeChecked()

    // Test Option B selection
    const optionB = screen.getByLabelText(/Option B: Annuity Protection/)
    await user.click(optionB)
    expect(optionB).toBeChecked()
    expect(optionA).not.toBeChecked()

    // Test Option C selection
    const optionC = screen.getByLabelText(/Option C: Joint Survivor/)
    await user.click(optionC)
    expect(optionC).toBeChecked()

    // Should show beneficiary age field for Option C
    expect(screen.getByLabelText(/Beneficiary's Age/)).toBeInTheDocument()
  })

  it('shows beneficiary age field only for Option C', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    // Initially Option A is selected, no beneficiary field
    expect(screen.queryByLabelText(/Beneficiary's Age/)).not.toBeInTheDocument()

    // Select Option C
    const optionC = screen.getByLabelText(/Option C: Joint Survivor/)
    await user.click(optionC)

    // Now beneficiary field should appear
    expect(screen.getByLabelText(/Beneficiary's Age/)).toBeInTheDocument()

    // Fill beneficiary age
    const beneficiaryAgeInput = screen.getByLabelText(/Beneficiary's Age/)
    await user.type(beneficiaryAgeInput, '58')
    expect(beneficiaryAgeInput).toHaveValue(58)
  })

  it('navigates to advanced options step', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    // Fill required fields first
    await fillRequiredFields(user)

    // Click Continue button
    const continueButton = screen.getByRole('button', { name: /Continue/ })
    await user.click(continueButton)

    // Should navigate to advanced options
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
      expect(screen.getByText('Advanced Options')).toBeInTheDocument()
    })
  })

  it('calculates pension when form is complete', async () => {
    const user = userEvent.setup()
    const { calculatePensionBenefit } = require('@/lib/pension-calculations')
    
    render(<PensionCalculator />)

    // Fill all required fields
    await fillRequiredFields(user)

    // Click Calculate button
    const calculateButton = screen.getByRole('button', { name: /Calculate My Pension/ })
    await user.click(calculateButton)

    await waitFor(() => {
      expect(calculatePensionBenefit).toHaveBeenCalled()
    })
  })

  it('displays calculation results', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    // Fill required fields and calculate
    await fillRequiredFields(user)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My Pension/ })
    await user.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
      expect(screen.getByText('$3,960')).toBeInTheDocument() // Monthly pension
      expect(screen.getByText('$47,520')).toBeInTheDocument() // Annual pension
    })
  })

  it('validates required fields before proceeding', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    // Try to calculate without filling required fields
    const calculateButton = screen.getByRole('button', { name: /Calculate My Pension/ })
    await user.click(calculateButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Please select your service entry period/)).toBeInTheDocument()
      expect(screen.getByText(/Valid age at retirement is required/)).toBeInTheDocument()
    })
  })

  it('saves form data to localStorage', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    const ageInput = screen.getByLabelText(/Age at Retirement/)
    await user.type(ageInput, '62')

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pensionCalculatorData',
        expect.stringContaining('"age":"62"')
      )
    })
  })

  it('loads saved data from localStorage', () => {
    const savedData = JSON.stringify({
      age: '62',
      yearsOfService: '30',
      group: 'GROUP_1'
    })
    localStorageMock.getItem.mockReturnValue(savedData)

    render(<PensionCalculator />)

    const ageInput = screen.getByLabelText(/Age at Retirement/) as HTMLInputElement
    expect(ageInput.value).toBe('62')
  })

  it('clears saved data when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    // Fill some data first
    const ageInput = screen.getByLabelText(/Age at Retirement/)
    await user.type(ageInput, '62')

    // Click clear button
    const clearButton = screen.getByRole('button', { name: /Clear Data/ })
    await user.click(clearButton)

    expect(ageInput).toHaveValue(null)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('pensionCalculatorData')
  })

  it('shows loading state during calculation', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    await fillRequiredFields(user)

    const calculateButton = screen.getByRole('button', { name: /Calculate My Pension/ })
    await user.click(calculateButton)

    expect(screen.getByText('Calculating...')).toBeInTheDocument()
  })

  it('displays data summary cards', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    await fillRequiredFields(user)

    // Should show data summary
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Employment Data')).toBeInTheDocument()
    expect(screen.getByText('Retirement Options')).toBeInTheDocument()
  })

  it('handles advanced options correctly', async () => {
    const user = userEvent.setup()
    render(<PensionCalculator />)

    await fillRequiredFields(user)

    // Navigate to advanced options
    const continueButton = screen.getByRole('button', { name: /Continue/ })
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Service Purchase Options')).toBeInTheDocument()
      expect(screen.getByText('Healthcare & Benefits')).toBeInTheDocument()
    })

    // Fill some advanced options
    const servicePurchaseInput = screen.getByLabelText(/Additional Service Years to Purchase/)
    await user.type(servicePurchaseInput, '2.5')

    const healthcareSelect = screen.getByRole('combobox', { name: /Healthcare Election/ })
    await user.click(healthcareSelect)
    await user.click(screen.getByText('Continue Current Coverage'))

    expect(servicePurchaseInput).toHaveValue(2.5)
  })

  // Helper function to fill required fields
  async function fillRequiredFields(user: any) {
    // Service entry date
    const serviceEntrySelect = screen.getByRole('combobox', { name: /Service Entry Period/ })
    await user.click(serviceEntrySelect)
    await user.click(screen.getByText('Before April 2, 2012'))

    // Age
    const ageInput = screen.getByLabelText(/Age at Retirement/)
    await user.type(ageInput, '62')

    // Years of service
    const yearsInput = screen.getByLabelText(/Years of Service/)
    await user.type(yearsInput, '30')

    // Employee group
    const groupSelect = screen.getByRole('combobox', { name: /Employee Group/ })
    await user.click(groupSelect)
    await user.click(screen.getByText('Group I (General Employees)'))

    // Salaries
    await user.type(screen.getByLabelText(/Highest Salary - Year 1/), '70000')
    await user.type(screen.getByLabelText(/Highest Salary - Year 2/), '72000')
    await user.type(screen.getByLabelText(/Highest Salary - Year 3/), '74000')
  }
})
