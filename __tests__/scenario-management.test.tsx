/**
 * Comprehensive test suite for Scenario Management System
 * Tests React hooks and UI components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScenarioDashboardCards } from '@/components/scenario-modeling/scenario-dashboard-cards'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn()
  }
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock the useScenarios hook
jest.mock('@/lib/hooks/use-scenarios', () => ({
  useScenarios: jest.fn()
}))

// Mock data
const mockScenarios: RetirementScenario[] = [
  {
    id: 'scenario-1',
    name: 'Early Retirement at 62',
    description: 'Retire early with reduced benefits',
    isBaseline: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    personalParameters: {
      retirementAge: 62,
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
      claimingAge: 62,
      fullRetirementAge: 67,
      estimatedBenefit: 2500,
      spousalBenefit: 1250
    },
    financialParameters: {
      currentSavings: 250000,
      monthlyContributions: 1000,
      expectedReturnRate: 0.07,
      riskTolerance: 'moderate',
      withdrawalRate: 0.04,
      otherRetirementIncome: 0
    },
    taxParameters: {
      filingStatus: 'married_filing_jointly',
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
  },
  {
    id: 'scenario-2',
    name: 'Full Retirement at 67',
    description: 'Standard retirement age with full benefits',
    isBaseline: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    personalParameters: {
      retirementAge: 67,
      lifeExpectancy: 85,
      currentAge: 45,
      birthYear: 1979
    },
    pensionParameters: {
      retirementGroup: '1',
      yearsOfService: 30,
      averageSalary: 75000,
      retirementOption: 'A',
      servicePurchases: []
    },
    socialSecurityParameters: {
      claimingAge: 67,
      fullRetirementAge: 67,
      estimatedBenefit: 3000,
      spousalBenefit: 1500
    },
    financialParameters: {
      currentSavings: 250000,
      monthlyContributions: 1000,
      expectedReturnRate: 0.07,
      riskTolerance: 'moderate',
      withdrawalRate: 0.04,
      otherRetirementIncome: 0
    },
    taxParameters: {
      filingStatus: 'married_filing_jointly',
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
]

const mockScenariosWithResults = mockScenarios.map(scenario => ({
  ...scenario,
  results: {
    pensionResults: {
      monthlyBenefit: 3000,
      annualBenefit: 36000,
      lifetimeBenefits: 720000,
      benefitReduction: 0,
      survivorBenefit: 1800
    },
    socialSecurityResults: {
      monthlyBenefit: scenario.socialSecurityParameters.estimatedBenefit,
      annualBenefit: scenario.socialSecurityParameters.estimatedBenefit * 12,
      lifetimeBenefits: scenario.socialSecurityParameters.estimatedBenefit * 12 * 20,
      spousalBenefit: scenario.socialSecurityParameters.spousalBenefit,
      survivorBenefit: scenario.socialSecurityParameters.estimatedBenefit
    },
    totalMonthlyIncome: 3000 + scenario.socialSecurityParameters.estimatedBenefit,
    totalAnnualIncome: (3000 + scenario.socialSecurityParameters.estimatedBenefit) * 12,
    netAfterTaxIncome: (3000 + scenario.socialSecurityParameters.estimatedBenefit) * 12 * 0.8,
    replacementRatio: 0.75,
    riskScore: scenario.id === 'scenario-1' ? 6 : 4,
    flexibilityScore: 7,
    optimizationScore: scenario.id === 'scenario-1' ? 6.5 : 8.2,
    taxResults: {
      totalTax: 12000,
      effectiveTaxRate: 0.2,
      marginalTaxRate: 0.22,
      federalTax: 8000,
      stateTax: 3000,
      socialSecurityTax: 1000
    },
    portfolioResults: {
      initialBalance: 250000,
      finalBalance: 150000,
      totalWithdrawals: 100000,
      longevity: 25,
      probabilityOfSuccess: 0.85
    },
    keyMetrics: {
      totalLifetimeIncome: 1200000,
      breakEvenAge: 78,
      riskScore: scenario.id === 'scenario-1' ? 6 : 4,
      flexibilityScore: 7,
      optimizationScore: scenario.id === 'scenario-1' ? 6.5 : 8.2
    },
    yearlyProjections: []
  }
}))

// Mock useScenarios hook implementation
const mockUseScenarios = {
  scenarios: mockScenariosWithResults,
  loading: false,
  error: null,
  pagination: {
    total: 2,
    limit: 20,
    offset: 0,
    hasMore: false
  },
  createScenario: jest.fn(),
  updateScenario: jest.fn(),
  deleteScenario: jest.fn(),
  duplicateScenario: jest.fn(),
  setBaseline: jest.fn(),
  recalculateScenario: jest.fn(),
  bulkDelete: jest.fn(),
  bulkDuplicate: jest.fn(),
  createComparison: jest.fn(),
  refreshScenarios: jest.fn(),
  loadMore: jest.fn(),
  searchScenarios: jest.fn(),
  filterByBaseline: jest.fn()
}

describe('Scenario Management System', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Set up the mock implementation
    const { useScenarios } = require('@/lib/hooks/use-scenarios')
    useScenarios.mockReturnValue(mockUseScenarios)
  })

  describe('ScenarioDashboardCards Component', () => {
    it('should render dashboard cards with scenario data', async () => {
      render(<ScenarioDashboardCards />)

      await waitFor(() => {
        expect(screen.getByText('Scenario Overview')).toBeInTheDocument()
        expect(screen.getByText('Baseline Scenario')).toBeInTheDocument()
        expect(screen.getByText('Performance Summary')).toBeInTheDocument()
      })
    })

    it('should show correct scenario counts', async () => {
      render(<ScenarioDashboardCards />)

      await waitFor(() => {
        expect(screen.getByText('Total Scenarios:')).toBeInTheDocument()
        expect(screen.getAllByText('2')).toHaveLength(2) // Total scenarios and calculated scenarios
      })
    })

    it('should display baseline scenario information', async () => {
      render(<ScenarioDashboardCards />)

      await waitFor(() => {
        expect(screen.getByText('Early Retirement at 62')).toBeInTheDocument()
      })
    })

    it('should handle empty state', async () => {
      // Mock empty scenarios
      const emptyMockUseScenarios = {
        ...mockUseScenarios,
        scenarios: []
      }

      const { useScenarios } = require('@/lib/hooks/use-scenarios')
      useScenarios.mockReturnValue(emptyMockUseScenarios)

      render(<ScenarioDashboardCards />)

      await waitFor(() => {
        expect(screen.getByText('No Retirement Scenarios')).toBeInTheDocument()
        expect(screen.getByText('Create First Scenario')).toBeInTheDocument()
      })
    })

    it('should show performance metrics', async () => {
      render(<ScenarioDashboardCards />)

      await waitFor(() => {
        expect(screen.getByText('Performance Summary')).toBeInTheDocument()
        // Should show average monthly income
        expect(screen.getByText(/\$5,500/)).toBeInTheDocument() // Average of 5500 and 5500
      })
    })

    it('should display quick action buttons', async () => {
      render(<ScenarioDashboardCards />)

      await waitFor(() => {
        expect(screen.getByText('New Scenario')).toBeInTheDocument()
        expect(screen.getByText('Manage All')).toBeInTheDocument()
        expect(screen.getByText('Compare')).toBeInTheDocument()
        expect(screen.getByText('Calculator')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Requirements', () => {
    it('should render components within performance requirements', async () => {
      const startTime = performance.now()

      render(<ScenarioDashboardCards />)

      await waitFor(() => {
        expect(screen.getByText('Scenario Overview')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(2000) // Sub-2-second requirement
    })
  })
})
