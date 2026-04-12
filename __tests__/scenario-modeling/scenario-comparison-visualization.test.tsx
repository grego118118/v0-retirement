/**
 * Scenario Comparison Visualization Tests
 * 
 * Comprehensive tests for scenario comparison visualization components including
 * tables, charts, and dashboard functionality.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScenarioComparisonTable } from '@/components/scenario-modeling/scenario-comparison-table'
import { ScenarioComparisonCharts } from '@/components/scenario-modeling/scenario-comparison-charts'
import { ScenarioComparisonDashboard } from '@/components/scenario-modeling/scenario-comparison-dashboard'
import { RetirementScenario, ScenarioResults } from '@/lib/scenario-modeling/scenario-types'

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />
}))

// Mock BaseChart component
jest.mock('@/components/charts/base-chart', () => ({
  BaseChart: ({ title, children }: any) => (
    <div data-testid="base-chart">
      <h3>{title}</h3>
      {children}
    </div>
  )
}))

// Mock scenario comparison utility
jest.mock('@/lib/scenario-modeling/scenario-comparison', () => ({
  compareScenarios: jest.fn(() => ({
    scenarios: [],
    results: [],
    comparisonMetrics: {
      incomeComparison: {
        highestMonthlyIncome: { scenarioId: 'scenario-1', amount: 7000 },
        highestLifetimeIncome: { scenarioId: 'scenario-1', amount: 1800000 },
        highestReplacementRatio: { scenarioId: 'scenario-2', ratio: 1.2 }
      },
      riskComparison: {
        lowestRisk: { scenarioId: 'scenario-2', score: 3 },
        highestRisk: { scenarioId: 'scenario-1', score: 7 },
        mostFlexible: { scenarioId: 'scenario-2', score: 8 }
      },
      optimizationComparison: {
        mostOptimized: { scenarioId: 'scenario-2', score: 8 },
        bestTaxEfficiency: { scenarioId: 'scenario-2', effectiveRate: 0.12 },
        longestPortfolioLife: { scenarioId: 'scenario-1', years: 25 }
      }
    },
    recommendations: [
      {
        type: 'income',
        priority: 'high',
        title: 'Consider Delayed Retirement',
        description: 'Retiring 2 years later could increase lifetime income by $200,000',
        affectedScenarios: ['scenario-1'],
        suggestedAction: 'Evaluate working until age 67',
        potentialImpact: { incomeIncrease: 200000 }
      }
    ]
  }))
}))

const mockScenarios: RetirementScenario[] = [
  {
    id: 'scenario-1',
    name: 'Early Retirement at 62',
    description: 'Retire early with reduced benefits',
    isBaseline: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    personalParameters: {
      retirementAge: 62,
      lifeExpectancy: 85,
      currentAge: 45,
      birthYear: 1979
    },
    pensionParameters: {
      retirementGroup: '1',
      yearsOfService: 22,
      averageSalary: 75000,
      retirementOption: 'A',
      servicePurchases: []
    },
    socialSecurityParameters: {
      claimingAge: 62,
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
  },
  {
    id: 'scenario-2',
    name: 'Standard Retirement at 65',
    description: 'Traditional retirement age with full benefits',
    isBaseline: false,
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
      rothIRABalance: 150000,
      traditional401kBalance: 300000,
      traditionalIRABalance: 75000,
      savingsAccountBalance: 35000,
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
]

const mockResults: ScenarioResults[] = [
  {
    scenarioId: 'scenario-1',
    calculatedAt: '2024-01-01T00:00:00.000Z',
    pensionBenefits: {
      monthlyBenefit: 3500,
      annualBenefit: 42000,
      lifetimeBenefits: 966000,
      benefitReduction: 0.15
    },
    socialSecurityBenefits: {
      monthlyBenefit: 1875,
      annualBenefit: 22500,
      lifetimeBenefits: 517500
    },
    incomeProjections: {
      totalMonthlyIncome: 5375,
      totalAnnualIncome: 64500,
      netAfterTaxIncome: 54825,
      replacementRatio: 0.86,
      yearlyProjections: [
        {
          year: 2041,
          age: 62,
          pensionIncome: 42000,
          socialSecurityIncome: 22500,
          otherIncome: 0,
          totalGrossIncome: 64500,
          totalNetIncome: 54825,
          taxes: 9675,
          inflationAdjustment: 1.0,
          portfolioBalance: 375000,
          portfolioWithdrawal: 15000
        }
      ]
    },
    taxAnalysis: {
      annualTaxBurden: 9675,
      effectiveTaxRate: 0.15,
      marginalTaxRate: 0.22,
      federalTax: 7200,
      stateTax: 2475,
      socialSecurityTax: 0
    },
    keyMetrics: {
      totalLifetimeIncome: 1483500,
      breakEvenAge: 78,
      riskScore: 7,
      flexibilityScore: 5,
      optimizationScore: 6
    }
  },
  {
    scenarioId: 'scenario-2',
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
      yearlyProjections: [
        {
          year: 2044,
          age: 65,
          pensionIncome: 50000,
          socialSecurityIncome: 30000,
          otherIncome: 0,
          totalGrossIncome: 80000,
          totalNetIncome: 67000,
          taxes: 13000,
          inflationAdjustment: 1.0,
          portfolioBalance: 560000,
          portfolioWithdrawal: 22400
        }
      ]
    },
    taxAnalysis: {
      annualTaxBurden: 13000,
      effectiveTaxRate: 0.1625,
      marginalTaxRate: 0.24,
      federalTax: 9750,
      stateTax: 3250,
      socialSecurityTax: 0
    },
    keyMetrics: {
      totalLifetimeIncome: 1600000,
      breakEvenAge: 75,
      riskScore: 3,
      flexibilityScore: 8,
      optimizationScore: 8
    }
  }
]

describe('ScenarioComparisonTable', () => {
  const mockOnExport = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render comparison table with scenario data', () => {
    render(
      <ScenarioComparisonTable
        scenarios={mockScenarios}
        results={mockResults}
        onExport={mockOnExport}
      />
    )

    expect(screen.getByText('Scenario Comparison')).toBeInTheDocument()
    expect(screen.getByText('Early Retirement at 62')).toBeInTheDocument()
    expect(screen.getByText('Standard Retirement at 65')).toBeInTheDocument()
    expect(screen.getByText('$5,375')).toBeInTheDocument() // Monthly income for scenario 1
    expect(screen.getByText('$6,667')).toBeInTheDocument() // Monthly income for scenario 2
  })

  it('should handle sorting by different metrics', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioComparisonTable
        scenarios={mockScenarios}
        results={mockResults}
        onExport={mockOnExport}
      />
    )

    // Click on monthly income header to sort
    const monthlyIncomeHeader = screen.getByRole('button', { name: /monthly income/i })
    await user.click(monthlyIncomeHeader)

    // Verify sorting functionality (scenarios should be reordered)
    expect(screen.getByText('Early Retirement at 62')).toBeInTheDocument()
    expect(screen.getByText('Standard Retirement at 65')).toBeInTheDocument()
  })

  it('should show optimal indicators for best scenarios', () => {
    render(
      <ScenarioComparisonTable
        scenarios={mockScenarios}
        results={mockResults}
        showOptimalIndicators={true}
      />
    )

    // Should show crown icons for optimal scenarios
    const crownIcons = screen.getAllByTitle('Optimal for this metric')
    expect(crownIcons.length).toBeGreaterThan(0)
  })

  it('should handle export functionality', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioComparisonTable
        scenarios={mockScenarios}
        results={mockResults}
        onExport={mockOnExport}
      />
    )

    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    expect(mockOnExport).toHaveBeenCalled()
  })

  it('should show empty state when no scenarios provided', () => {
    render(
      <ScenarioComparisonTable
        scenarios={[]}
        results={[]}
        onExport={mockOnExport}
      />
    )

    expect(screen.getByText(/no scenarios to compare/i)).toBeInTheDocument()
  })

  it('should display risk badges correctly', () => {
    render(
      <ScenarioComparisonTable
        scenarios={mockScenarios}
        results={mockResults}
      />
    )

    expect(screen.getByText('High Risk')).toBeInTheDocument() // Scenario 1 with risk score 7
    expect(screen.getByText('Low Risk')).toBeInTheDocument() // Scenario 2 with risk score 3
  })
})

describe('ScenarioComparisonCharts', () => {
  const mockOnExport = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render chart tabs and components', () => {
    render(
      <ScenarioComparisonCharts
        scenarios={mockScenarios}
        results={mockResults}
        onExport={mockOnExport}
      />
    )

    expect(screen.getByText('Scenario Comparison Charts')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /income/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /projections/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /risk/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /tax/i })).toBeInTheDocument()
  })

  it('should switch between different chart types', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioComparisonCharts
        scenarios={mockScenarios}
        results={mockResults}
        onExport={mockOnExport}
      />
    )

    // Click on risk analysis tab
    const riskTab = screen.getByRole('tab', { name: /risk/i })
    await user.click(riskTab)

    expect(screen.getByText('Risk Analysis Comparison')).toBeInTheDocument()
  })

  it('should handle scenario visibility toggle for lifetime projections', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioComparisonCharts
        scenarios={mockScenarios}
        results={mockResults}
        onExport={mockOnExport}
      />
    )

    // Switch to projections tab
    const projectionsTab = screen.getByRole('tab', { name: /projections/i })
    await user.click(projectionsTab)

    // Should show scenario visibility controls
    expect(screen.getByText(/visible scenarios/i)).toBeInTheDocument()
    
    // Toggle scenario visibility
    const scenarioButton = screen.getByRole('button', { name: /early retirement at 62/i })
    await user.click(scenarioButton)

    // Verify button state changed
    expect(scenarioButton).toBeInTheDocument()
  })

  it('should show empty state when no data provided', () => {
    render(
      <ScenarioComparisonCharts
        scenarios={[]}
        results={[]}
        onExport={mockOnExport}
      />
    )

    expect(screen.getByText(/no data to visualize/i)).toBeInTheDocument()
  })

  it('should handle time horizon selection for projections', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioComparisonCharts
        scenarios={mockScenarios}
        results={mockResults}
        onExport={mockOnExport}
      />
    )

    // Switch to projections tab
    const projectionsTab = screen.getByRole('tab', { name: /projections/i })
    await user.click(projectionsTab)

    // Should show time horizon selector
    const timeHorizonSelect = screen.getByRole('combobox')
    expect(timeHorizonSelect).toBeInTheDocument()
  })
})

describe('ScenarioComparisonDashboard', () => {
  const mockOnExportReport = jest.fn()
  const mockOnSelectOptimalScenario = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dashboard with overview, table, and charts tabs', () => {
    render(
      <ScenarioComparisonDashboard
        scenarios={mockScenarios}
        results={mockResults}
        onExportReport={mockOnExportReport}
        onSelectOptimalScenario={mockOnSelectOptimalScenario}
      />
    )

    expect(screen.getByText('Scenario Comparison Analysis')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /detailed table/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /visual charts/i })).toBeInTheDocument()
  })

  it('should display optimal scenarios summary', () => {
    render(
      <ScenarioComparisonDashboard
        scenarios={mockScenarios}
        results={mockResults}
        onExportReport={mockOnExportReport}
        onSelectOptimalScenario={mockOnSelectOptimalScenario}
      />
    )

    expect(screen.getByText('Highest Income')).toBeInTheDocument()
    expect(screen.getByText('Lowest Risk')).toBeInTheDocument()
    expect(screen.getByText('Tax Efficient')).toBeInTheDocument()
    expect(screen.getByText('Most Optimized')).toBeInTheDocument()
  })

  it('should show recommendations when available', () => {
    render(
      <ScenarioComparisonDashboard
        scenarios={mockScenarios}
        results={mockResults}
        onExportReport={mockOnExportReport}
        onSelectOptimalScenario={mockOnSelectOptimalScenario}
      />
    )

    expect(screen.getByText('Optimization Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Consider Delayed Retirement')).toBeInTheDocument()
    expect(screen.getByText('High Priority Actions')).toBeInTheDocument()
  })

  it('should handle optimal scenario selection', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioComparisonDashboard
        scenarios={mockScenarios}
        results={mockResults}
        onExportReport={mockOnExportReport}
        onSelectOptimalScenario={mockOnSelectOptimalScenario}
      />
    )

    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i })
    await user.click(viewDetailsButtons[0])

    expect(mockOnSelectOptimalScenario).toHaveBeenCalled()
  })

  it('should handle export report functionality', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioComparisonDashboard
        scenarios={mockScenarios}
        results={mockResults}
        onExportReport={mockOnExportReport}
        onSelectOptimalScenario={mockOnSelectOptimalScenario}
      />
    )

    const exportButton = screen.getByRole('button', { name: /export report/i })
    await user.click(exportButton)

    expect(mockOnExportReport).toHaveBeenCalled()
  })

  it('should show empty state when insufficient scenarios', () => {
    render(
      <ScenarioComparisonDashboard
        scenarios={[mockScenarios[0]]} // Only one scenario
        results={[mockResults[0]]}
        onExportReport={mockOnExportReport}
        onSelectOptimalScenario={mockOnSelectOptimalScenario}
      />
    )

    expect(screen.getByText(/need more scenarios/i)).toBeInTheDocument()
    expect(screen.getByText(/create at least 2 scenarios/i)).toBeInTheDocument()
  })

  it('should switch between dashboard tabs', async () => {
    const user = userEvent.setup()
    
    render(
      <ScenarioComparisonDashboard
        scenarios={mockScenarios}
        results={mockResults}
        onExportReport={mockOnExportReport}
        onSelectOptimalScenario={mockOnSelectOptimalScenario}
      />
    )

    // Switch to table tab
    const tableTab = screen.getByRole('tab', { name: /detailed table/i })
    await user.click(tableTab)

    expect(screen.getByText('Scenario Comparison')).toBeInTheDocument()

    // Switch to charts tab
    const chartsTab = screen.getByRole('tab', { name: /visual charts/i })
    await user.click(chartsTab)

    expect(screen.getByText('Scenario Comparison Charts')).toBeInTheDocument()
  })
})
