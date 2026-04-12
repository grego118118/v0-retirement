/**
 * Scenario UI Components Tests
 * 
 * Comprehensive tests for scenario input UI components including form validation,
 * template selection, and scenario management.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScenarioForm } from '@/components/scenario-modeling/scenario-form'
import { ScenarioTemplateSelector } from '@/components/scenario-modeling/scenario-template-selector'
import { ScenarioList } from '@/components/scenario-modeling/scenario-list'
import { RetirementScenario, ScenarioResults } from '@/lib/scenario-modeling/scenario-types'
import { toast } from 'sonner'

// Mock external dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn()
  }
}))

jest.mock('@/lib/scenario-modeling/scenario-calculator', () => ({
  calculateScenarioResults: jest.fn(() => Promise.resolve({
    scenarioId: 'test-scenario',
    calculatedAt: '2024-01-01T00:00:00.000Z',
    pensionBenefits: {
      monthlyBenefit: 4166.67,
      annualBenefit: 50000,
      lifetimeBenefits: 1000000,
      benefitReduction: 0
    },
    socialSecurityBenefits: {
      monthlyBenefit: 2500,
      annualBenefit: 30000,
      lifetimeBenefits: 600000
    },
    incomeProjections: {
      totalMonthlyIncome: 6666.67,
      totalAnnualIncome: 80000,
      netAfterTaxIncome: 67000,
      replacementRatio: 1.067,
      yearlyProjections: []
    },
    taxAnalysis: {
      annualTaxBurden: 8000,
      effectiveTaxRate: 0.1067,
      marginalTaxRate: 0.12,
      federalTax: 6000,
      stateTax: 2000,
      socialSecurityTax: 0
    },
    keyMetrics: {
      totalLifetimeIncome: 1600000,
      breakEvenAge: 75,
      riskScore: 5,
      flexibilityScore: 6,
      optimizationScore: 7
    }
  }))
}))

const mockScenario: RetirementScenario = {
  id: 'test-scenario-1',
  name: 'Test Scenario',
  description: 'Test scenario for UI testing',
  isBaseline: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  
  personalParameters: {
    retirementAge: 65,
    lifeExpectancy: 85,
    currentAge: 45,
    birthYear: 1979
  },
  
  pensionParameters: {
    retirementGroup: '1',
    yearsOfService: 25,
    averageSalary: 75000,
    retirementOption: 'A',
    servicePurchases: []
  },
  
  socialSecurityParameters: {
    claimingAge: 67,
    fullRetirementAge: 67,
    fullRetirementBenefit: 2500,
    earlyRetirementBenefit: 1875,
    delayedRetirementBenefit: 3300,
    isMarried: false
  },
  
  financialParameters: {
    otherRetirementIncome: 0,
    rothIRABalance: 100000,
    traditional401kBalance: 200000,
    traditionalIRABalance: 50000,
    savingsAccountBalance: 25000,
    expectedReturnRate: 0.06,
    inflationRate: 0.025,
    riskTolerance: 'moderate',
    withdrawalStrategy: 'percentage',
    withdrawalRate: 0.04,
    estimatedMedicarePremiums: 174.70,
    longTermCareInsurance: false,
    healthcareCostInflation: 0.05
  },
  
  taxParameters: {
    filingStatus: 'single',
    stateOfResidence: 'MA',
    taxOptimizationStrategy: 'basic',
    rothConversions: false,
    taxLossHarvesting: false
  },
  
  colaParameters: {
    pensionCOLA: 0.03,
    socialSecurityCOLA: 0.025,
    colaScenario: 'moderate'
  }
}

const mockScenarioResults: ScenarioResults = {
  scenarioId: 'test-scenario-1',
  calculatedAt: '2024-01-01T00:00:00.000Z',
  pensionBenefits: {
    monthlyBenefit: 4166.67,
    annualBenefit: 50000,
    lifetimeBenefits: 1000000,
    benefitReduction: 0
  },
  socialSecurityBenefits: {
    monthlyBenefit: 2500,
    annualBenefit: 30000,
    lifetimeBenefits: 600000
  },
  incomeProjections: {
    totalMonthlyIncome: 6666.67,
    totalAnnualIncome: 80000,
    netAfterTaxIncome: 67000,
    replacementRatio: 1.067,
    yearlyProjections: []
  },
  taxAnalysis: {
    annualTaxBurden: 8000,
    effectiveTaxRate: 0.1067,
    marginalTaxRate: 0.12,
    federalTax: 6000,
    stateTax: 2000,
    socialSecurityTax: 0
  },
  keyMetrics: {
    totalLifetimeIncome: 1600000,
    breakEvenAge: 75,
    riskScore: 5,
    flexibilityScore: 6,
    optimizationScore: 7
  }
}

describe('ScenarioForm', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form with all required fields', () => {
    render(
      <ScenarioForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/current age/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/retirement age/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/retirement group/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/years of service/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/average salary/i)).toBeInTheDocument()
  })

  it('should populate form with existing scenario data', () => {
    render(
      <ScenarioForm 
        scenario={mockScenario}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    expect(screen.getByDisplayValue('Test Scenario')).toBeInTheDocument()
    expect(screen.getByDisplayValue('45')).toBeInTheDocument()
    expect(screen.getByDisplayValue('75000')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    // Clear the scenario name field
    const nameField = screen.getByLabelText(/scenario name/i)
    await user.clear(nameField)

    // Try to submit
    const saveButton = screen.getByRole('button', { name: /save scenario/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/scenario name is required/i)).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    // Fill in required fields
    await user.type(screen.getByLabelText(/scenario name/i), 'New Test Scenario')
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /save scenario/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test Scenario'
        })
      )
    })
  })

  it('should show real-time preview when form is valid', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioForm 
        scenario={mockScenario}
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    // Wait for preview to load
    await waitFor(() => {
      expect(screen.getByText(/scenario preview/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByText('$6,667')).toBeInTheDocument() // Monthly income
    expect(screen.getByText('106.7%')).toBeInTheDocument() // Replacement ratio
  })

  it('should handle tab navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    // Click on pension tab
    const pensionTab = screen.getByRole('tab', { name: /pension/i })
    await user.click(pensionTab)

    expect(screen.getByLabelText(/retirement group/i)).toBeVisible()
    expect(screen.getByLabelText(/years of service/i)).toBeVisible()

    // Click on social security tab
    const ssTab = screen.getByRole('tab', { name: /social security/i })
    await user.click(ssTab)

    expect(screen.getByLabelText(/claiming age/i)).toBeVisible()
    expect(screen.getByLabelText(/full retirement benefit/i)).toBeVisible()
  })

  it('should show spousal fields when married is selected', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    )

    // Navigate to Social Security tab
    const ssTab = screen.getByRole('tab', { name: /social security/i })
    await user.click(ssTab)

    // Toggle married switch
    const marriedSwitch = screen.getByRole('switch', { name: /married/i })
    await user.click(marriedSwitch)

    await waitFor(() => {
      expect(screen.getByLabelText(/spouse claiming age/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/spouse full retirement benefit/i)).toBeInTheDocument()
    })
  })
})

describe('ScenarioTemplateSelector', () => {
  const mockOnSelectTemplate = jest.fn()
  const mockOnCreateBlank = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render template categories', () => {
    render(
      <ScenarioTemplateSelector
        baseScenario={mockScenario}
        onSelectTemplate={mockOnSelectTemplate}
        onCreateBlank={mockOnCreateBlank}
      />
    )

    expect(screen.getByText(/choose a scenario template/i)).toBeInTheDocument()
    expect(screen.getByText(/popular templates/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create blank scenario/i })).toBeInTheDocument()
  })

  it('should show popular templates', () => {
    render(
      <ScenarioTemplateSelector
        baseScenario={mockScenario}
        onSelectTemplate={mockOnSelectTemplate}
        onCreateBlank={mockOnCreateBlank}
      />
    )

    expect(screen.getByText(/early retirement at 62/i)).toBeInTheDocument()
    expect(screen.getByText(/full retirement at 67/i)).toBeInTheDocument()
    expect(screen.getByText(/delayed retirement at 70/i)).toBeInTheDocument()
  })

  it('should handle template selection', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioTemplateSelector
        baseScenario={mockScenario}
        onSelectTemplate={mockOnSelectTemplate}
        onCreateBlank={mockOnCreateBlank}
      />
    )

    const earlyRetirementTemplate = screen.getByText(/early retirement at 62/i).closest('div')
    await user.click(earlyRetirementTemplate!)

    expect(mockOnSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining('Early Retirement at 62')
      })
    )
  })

  it('should handle create blank scenario', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioTemplateSelector
        baseScenario={mockScenario}
        onSelectTemplate={mockOnSelectTemplate}
        onCreateBlank={mockOnCreateBlank}
      />
    )

    const createBlankButton = screen.getByRole('button', { name: /create blank scenario/i })
    await user.click(createBlankButton)

    expect(mockOnCreateBlank).toHaveBeenCalled()
  })

  it('should filter templates by category', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioTemplateSelector
        baseScenario={mockScenario}
        onSelectTemplate={mockOnSelectTemplate}
        onCreateBlank={mockOnCreateBlank}
      />
    )

    // Click on investment tab
    const investmentTab = screen.getByRole('tab', { name: /investment/i })
    await user.click(investmentTab)

    expect(screen.getByText(/conservative investment strategy/i)).toBeInTheDocument()
    expect(screen.getByText(/aggressive investment strategy/i)).toBeInTheDocument()
  })
})

describe('ScenarioList', () => {
  const mockOnEdit = jest.fn()
  const mockOnDuplicate = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnToggleBaseline = jest.fn()
  const mockOnCreateNew = jest.fn()
  const mockOnCompare = jest.fn()

  const mockScenarios = [mockScenario]
  const mockResults = [mockScenarioResults]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render scenario list with scenarios', () => {
    render(
      <ScenarioList
        scenarios={mockScenarios}
        results={mockResults}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        onToggleBaseline={mockOnToggleBaseline}
        onCreateNew={mockOnCreateNew}
        onCompare={mockOnCompare}
      />
    )

    expect(screen.getByText(/retirement scenarios \(1\)/i)).toBeInTheDocument()
    expect(screen.getByText('Test Scenario')).toBeInTheDocument()
    expect(screen.getByText('$6,667')).toBeInTheDocument() // Monthly income
    expect(screen.getByText('106.7%')).toBeInTheDocument() // Replacement ratio
  })

  it('should handle search functionality', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioList
        scenarios={mockScenarios}
        results={mockResults}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        onToggleBaseline={mockOnToggleBaseline}
        onCreateNew={mockOnCreateNew}
        onCompare={mockOnCompare}
      />
    )

    const searchInput = screen.getByPlaceholderText(/search scenarios/i)
    await user.type(searchInput, 'Test')

    expect(screen.getByText('Test Scenario')).toBeInTheDocument()

    await user.clear(searchInput)
    await user.type(searchInput, 'Nonexistent')

    expect(screen.queryByText('Test Scenario')).not.toBeInTheDocument()
  })

  it('should handle scenario selection and comparison', async () => {
    const user = userEvent.setup()
    
    // Add more scenarios for comparison
    const scenarios = [
      mockScenario,
      { ...mockScenario, id: 'scenario-2', name: 'Scenario 2' }
    ]
    
    render(
      <ScenarioList
        scenarios={scenarios}
        results={mockResults}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        onToggleBaseline={mockOnToggleBaseline}
        onCreateNew={mockOnCreateNew}
        onCompare={mockOnCompare}
      />
    )

    // Select scenarios
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // First scenario checkbox
    await user.click(checkboxes[2]) // Second scenario checkbox

    // Click compare button
    const compareButton = screen.getByRole('button', { name: /compare \(2\)/i })
    await user.click(compareButton)

    expect(mockOnCompare).toHaveBeenCalledWith(['test-scenario-1', 'scenario-2'])
  })

  it('should show empty state when no scenarios', () => {
    render(
      <ScenarioList
        scenarios={[]}
        results={[]}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        onToggleBaseline={mockOnToggleBaseline}
        onCreateNew={mockOnCreateNew}
        onCompare={mockOnCompare}
      />
    )

    expect(screen.getByText(/no scenarios found/i)).toBeInTheDocument()
    expect(screen.getByText(/create your first retirement scenario/i)).toBeInTheDocument()
  })

  it('should handle scenario actions from dropdown menu', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioList
        scenarios={mockScenarios}
        results={mockResults}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        onToggleBaseline={mockOnToggleBaseline}
        onCreateNew={mockOnCreateNew}
        onCompare={mockOnCompare}
      />
    )

    // Open dropdown menu
    const menuButton = screen.getByRole('button', { name: '' }) // More options button
    await user.click(menuButton)

    // Click edit
    const editButton = screen.getByText(/edit/i)
    await user.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockScenario)
  })
})
