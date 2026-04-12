/**
 * Scenario Calculator Tests
 * 
 * Comprehensive tests for the retirement scenario calculation engine.
 */

import { calculateScenarioResults, calculateMultipleScenarios } from '@/lib/scenario-modeling/scenario-calculator'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'

// Mock the external calculation modules
jest.mock('@/lib/standardized-pension-calculator', () => ({
  calculateStandardizedPension: jest.fn(() => ({
    eligible: true,
    finalAnnualPension: 50000,
    finalMonthlyPension: 4166.67,
    optionReduction: 0,
    survivorPension: undefined
  }))
}))

jest.mock('@/lib/tax/tax-calculator', () => ({
  calculateTaxImplications: jest.fn(() => ({
    totalTax: 8000,
    netIncome: 67000,
    effectiveTaxRate: 10.67,
    marginalTaxRate: 12,
    federalTax: 6000,
    stateTax: 2000,
    socialSecurityTaxable: 0
  }))
}))

jest.mock('@/lib/social-security/spousal-benefits', () => ({
  calculateSpousalBenefits: jest.fn(() => ({
    spousalBenefit: 1000,
    ownBenefit: 2000,
    totalBenefit: 3000
  })),
  calculateSurvivorBenefits: jest.fn(() => ({
    survivorBenefit: 2500
  }))
}))

describe('Scenario Calculator', () => {
  const mockScenario: RetirementScenario = {
    id: 'test-scenario-1',
    name: 'Test Scenario',
    description: 'Test scenario for unit testing',
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

  describe('calculateScenarioResults', () => {
    it('should calculate comprehensive scenario results', async () => {
      const result = await calculateScenarioResults(mockScenario)
      
      expect(result).toBeDefined()
      expect(result.scenarioId).toBe('test-scenario-1')
      expect(result.calculatedAt).toBeDefined()
      
      // Pension benefits
      expect(result.pensionBenefits.monthlyBenefit).toBeCloseTo(4166.67, 2)
      expect(result.pensionBenefits.annualBenefit).toBe(50000)
      expect(result.pensionBenefits.lifetimeBenefits).toBeGreaterThan(0)
      
      // Social Security benefits
      expect(result.socialSecurityBenefits.monthlyBenefit).toBe(2500)
      expect(result.socialSecurityBenefits.annualBenefit).toBe(30000)
      expect(result.socialSecurityBenefits.lifetimeBenefits).toBeGreaterThan(0)
      
      // Income projections
      expect(result.incomeProjections.totalMonthlyIncome).toBeGreaterThan(0)
      expect(result.incomeProjections.totalAnnualIncome).toBe(80000) // 50k pension + 30k SS
      expect(result.incomeProjections.netAfterTaxIncome).toBe(67000)
      expect(result.incomeProjections.replacementRatio).toBeCloseTo(1.067, 2) // 80k / 75k
      expect(result.incomeProjections.yearlyProjections).toHaveLength(20) // 65 to 85
      
      // Tax analysis
      expect(result.taxAnalysis.annualTaxBurden).toBe(8000)
      expect(result.taxAnalysis.effectiveTaxRate).toBeCloseTo(0.1067, 4)
      expect(result.taxAnalysis.federalTax).toBe(6000)
      expect(result.taxAnalysis.stateTax).toBe(2000)
      
      // Portfolio analysis
      expect(result.portfolioAnalysis).toBeDefined()
      expect(result.portfolioAnalysis!.initialBalance).toBe(375000) // Sum of all accounts
      expect(result.portfolioAnalysis!.portfolioLongevity).toBeGreaterThan(0)
      
      // Key metrics
      expect(result.keyMetrics.totalLifetimeIncome).toBeGreaterThan(0)
      expect(result.keyMetrics.riskScore).toBeGreaterThanOrEqual(1)
      expect(result.keyMetrics.riskScore).toBeLessThanOrEqual(10)
      expect(result.keyMetrics.flexibilityScore).toBeGreaterThanOrEqual(1)
      expect(result.keyMetrics.flexibilityScore).toBeLessThanOrEqual(10)
      expect(result.keyMetrics.optimizationScore).toBeGreaterThanOrEqual(1)
      expect(result.keyMetrics.optimizationScore).toBeLessThanOrEqual(10)
    })

    it('should handle scenarios without portfolio assets', async () => {
      const scenarioWithoutPortfolio = {
        ...mockScenario,
        financialParameters: {
          ...mockScenario.financialParameters,
          rothIRABalance: 0,
          traditional401kBalance: 0,
          traditionalIRABalance: 0,
          savingsAccountBalance: 0
        }
      }
      
      const result = await calculateScenarioResults(scenarioWithoutPortfolio)
      
      expect(result.portfolioAnalysis).toBeUndefined()
      expect(result.incomeProjections.yearlyProjections[0].portfolioBalance).toBe(0)
      expect(result.incomeProjections.yearlyProjections[0].portfolioWithdrawal).toBe(0)
    })

    it('should handle married scenarios with spousal benefits', async () => {
      const marriedScenario = {
        ...mockScenario,
        socialSecurityParameters: {
          ...mockScenario.socialSecurityParameters,
          isMarried: true,
          spouseFullRetirementBenefit: 2000,
          spouseFullRetirementAge: 67,
          spouseClaimingAge: 67
        }
      }
      
      const result = await calculateScenarioResults(marriedScenario)
      
      expect(result.socialSecurityBenefits.spousalBenefit).toBe(1000)
      expect(result.socialSecurityBenefits.survivorBenefit).toBe(2500)
    })

    it('should complete calculations within performance requirements', async () => {
      const startTime = performance.now()
      
      await calculateScenarioResults(mockScenario)
      
      const endTime = performance.now()
      const calculationTime = endTime - startTime
      
      expect(calculationTime).toBeLessThan(2000) // Sub-2-second requirement
    })

    it('should generate accurate yearly projections', async () => {
      const result = await calculateScenarioResults(mockScenario)
      const projections = result.incomeProjections.yearlyProjections
      
      expect(projections).toHaveLength(20) // 20 years from 65 to 85
      
      // First year
      expect(projections[0].age).toBe(65)
      expect(projections[0].pensionIncome).toBe(50000)
      expect(projections[0].socialSecurityIncome).toBe(30000)
      
      // Last year
      expect(projections[19].age).toBe(84)
      
      // COLA adjustments should increase income over time
      expect(projections[19].pensionIncome).toBeGreaterThan(projections[0].pensionIncome)
      expect(projections[19].socialSecurityIncome).toBeGreaterThan(projections[0].socialSecurityIncome)
      
      // Portfolio should change over time (may grow if returns > withdrawals)
      expect(projections[19].portfolioBalance).not.toBe(projections[0].portfolioBalance!)

      // Verify portfolio withdrawals are happening
      expect(projections[0].portfolioWithdrawal).toBeGreaterThan(0)
      expect(projections[19].portfolioWithdrawal).toBeGreaterThan(0)
    })
  })

  describe('calculateMultipleScenarios', () => {
    it('should calculate multiple scenarios efficiently', async () => {
      const scenarios = [
        { ...mockScenario, id: 'scenario-1', name: 'Scenario 1' },
        { ...mockScenario, id: 'scenario-2', name: 'Scenario 2', personalParameters: { ...mockScenario.personalParameters, retirementAge: 62 } },
        { ...mockScenario, id: 'scenario-3', name: 'Scenario 3', personalParameters: { ...mockScenario.personalParameters, retirementAge: 70 } }
      ]
      
      const startTime = performance.now()
      const results = await calculateMultipleScenarios(scenarios)
      const endTime = performance.now()
      
      expect(results).toHaveLength(3)
      expect(results[0].scenarioId).toBe('scenario-1')
      expect(results[1].scenarioId).toBe('scenario-2')
      expect(results[2].scenarioId).toBe('scenario-3')
      
      // Should complete within reasonable time
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(6000) // 3 scenarios * 2 seconds max
    })

    it('should handle calculation errors gracefully', async () => {
      // Mock the pension calculator to throw an error for specific scenario
      const originalMock = require('@/lib/standardized-pension-calculator').calculateStandardizedPension
      require('@/lib/standardized-pension-calculator').calculateStandardizedPension = jest.fn((input) => {
        if (input.currentSalary === -1) {
          throw new Error('Invalid salary')
        }
        return originalMock()
      })

      const errorScenario = {
        ...mockScenario,
        id: 'error-scenario',
        pensionParameters: {
          ...mockScenario.pensionParameters,
          averageSalary: -1 // This will trigger the error
        }
      }

      const scenarios = [mockScenario, errorScenario]
      const results = await calculateMultipleScenarios(scenarios)

      expect(results).toHaveLength(2)
      expect(results[0].scenarioId).toBe('test-scenario-1')
      expect(results[1].scenarioId).toBe('error-scenario')

      // Error scenario should have placeholder values
      expect(results[1].pensionBenefits.annualBenefit).toBe(0)
      expect(results[1].keyMetrics.riskScore).toBe(5)

      // Restore original mock
      require('@/lib/standardized-pension-calculator').calculateStandardizedPension = originalMock
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle extreme retirement ages', async () => {
      const earlyRetirementScenario = {
        ...mockScenario,
        personalParameters: {
          ...mockScenario.personalParameters,
          retirementAge: 55
        }
      }
      
      const result = await calculateScenarioResults(earlyRetirementScenario)
      
      expect(result.keyMetrics.riskScore).toBeGreaterThan(5) // Higher risk for early retirement
      expect(result.incomeProjections.yearlyProjections).toHaveLength(30) // 30 years from 55 to 85
    })

    it('should handle high-income scenarios', async () => {
      const highIncomeScenario = {
        ...mockScenario,
        pensionParameters: {
          ...mockScenario.pensionParameters,
          averageSalary: 150000
        }
      }
      
      const result = await calculateScenarioResults(highIncomeScenario)
      
      expect(result.incomeProjections.replacementRatio).toBeLessThan(1) // Lower replacement ratio for high earners
      expect(result.taxAnalysis.effectiveTaxRate).toBeGreaterThan(0.1) // Higher tax rate
    })

    it('should handle conservative investment scenarios', async () => {
      const conservativeScenario = {
        ...mockScenario,
        financialParameters: {
          ...mockScenario.financialParameters,
          riskTolerance: 'conservative',
          expectedReturnRate: 0.04,
          withdrawalRate: 0.035
        }
      }
      
      const result = await calculateScenarioResults(conservativeScenario)
      
      expect(result.keyMetrics.riskScore).toBeLessThan(5) // Lower risk score
      expect(result.portfolioAnalysis!.portfolioLongevity).toBeGreaterThan(20) // Longer portfolio life
    })

    it('should handle aggressive investment scenarios', async () => {
      const aggressiveScenario = {
        ...mockScenario,
        financialParameters: {
          ...mockScenario.financialParameters,
          riskTolerance: 'aggressive',
          expectedReturnRate: 0.08,
          withdrawalRate: 0.045
        }
      }
      
      const result = await calculateScenarioResults(aggressiveScenario)
      
      expect(result.keyMetrics.riskScore).toBeGreaterThan(5) // Higher risk score
      expect(result.keyMetrics.flexibilityScore).toBeGreaterThan(5) // Higher flexibility
    })
  })
})
