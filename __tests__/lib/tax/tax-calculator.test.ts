/**
 * Comprehensive tests for the Tax Implications Calculator
 */

import { calculateTaxImplications, TaxCalculationInput } from '@/lib/tax/tax-calculator'

describe('Tax Implications Calculator', () => {
  const baseTaxInput: TaxCalculationInput = {
    pensionIncome: 48000,
    socialSecurityIncome: 28800,
    otherRetirementIncome: 12000,
    filingStatus: 'single',
    age: 65,
    state: 'MA'
  }

  describe('calculateTaxImplications', () => {
    it('should calculate basic tax implications correctly', () => {
      const result = calculateTaxImplications(baseTaxInput)
      
      expect(result).toBeDefined()
      expect(result.grossIncome).toBe(88800) // 48000 + 28800 + 12000
      expect(result.federalTax).toBeGreaterThan(0)
      expect(result.stateTax).toBeGreaterThanOrEqual(0)
      expect(result.totalTax).toBe(result.federalTax + result.stateTax)
      expect(result.netIncome).toBe(result.grossIncome - result.totalTax)
      expect(result.effectiveTaxRate).toBeGreaterThan(0)
      expect(result.effectiveTaxRate).toBeLessThan(100)
    })

    it('should handle Social Security taxability correctly', () => {
      const result = calculateTaxImplications(baseTaxInput)
      
      expect(result.socialSecurityTaxable).toBeGreaterThanOrEqual(0)
      expect(result.socialSecurityTaxable).toBeLessThanOrEqual(baseTaxInput.socialSecurityIncome)
      expect(result.socialSecurityTaxablePercentage).toBeGreaterThanOrEqual(0)
      expect(result.socialSecurityTaxablePercentage).toBeLessThanOrEqual(85)
    })

    it('should provide tax breakdown', () => {
      const result = calculateTaxImplications(baseTaxInput)
      
      expect(result.breakdown).toBeDefined()
      expect(result.breakdown.federal).toBeDefined()
      expect(result.breakdown.state).toBeDefined()
      expect(result.breakdown.socialSecurity).toBeDefined()
    })

    it('should generate tax recommendations', () => {
      const result = calculateTaxImplications(baseTaxInput)
      
      expect(result.recommendations).toBeDefined()
      expect(Array.isArray(result.recommendations)).toBe(true)
    })
  })

  describe('Filing status variations', () => {
    it('should handle married filing jointly', () => {
      const marriedInput = {
        ...baseTaxInput,
        filingStatus: 'marriedJoint' as const,
        spouseAge: 63
      }
      
      const result = calculateTaxImplications(marriedInput)
      
      expect(result).toBeDefined()
      expect(result.federalTax).toBeGreaterThanOrEqual(0)
    })

    it('should handle married filing separately', () => {
      const marriedSeparateInput = {
        ...baseTaxInput,
        filingStatus: 'marriedSeparate' as const
      }
      
      const result = calculateTaxImplications(marriedSeparateInput)
      
      expect(result).toBeDefined()
      expect(result.federalTax).toBeGreaterThanOrEqual(0)
    })

    it('should handle head of household', () => {
      const hohInput = {
        ...baseTaxInput,
        filingStatus: 'headOfHousehold' as const
      }
      
      const result = calculateTaxImplications(hohInput)
      
      expect(result).toBeDefined()
      expect(result.federalTax).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Massachusetts state tax calculations', () => {
    it('should calculate MA state tax correctly', () => {
      const result = calculateTaxImplications(baseTaxInput)
      
      expect(result.stateTax).toBeGreaterThanOrEqual(0)
      expect(result.breakdown.state.tax).toBe(result.stateTax)
    })

    it('should handle MA pension exemption for seniors', () => {
      const seniorInput = {
        ...baseTaxInput,
        age: 65
      }
      
      const result = calculateTaxImplications(seniorInput)
      
      // MA has pension exemption for seniors
      expect(result.breakdown.state.exemptions).toBeGreaterThan(0)
    })
  })

  describe('Age-based deductions', () => {
    it('should apply senior deductions for 65+', () => {
      const seniorInput = {
        ...baseTaxInput,
        age: 65
      }
      
      const result = calculateTaxImplications(seniorInput)
      
      expect(result.breakdown.federal.standardDeduction).toBeGreaterThan(13850) // 2024 standard + senior
    })

    it('should not apply senior deductions for under 65', () => {
      const youngerInput = {
        ...baseTaxInput,
        age: 62
      }
      
      const result = calculateTaxImplications(youngerInput)
      
      expect(result.breakdown.federal.standardDeduction).toBe(13850) // 2024 standard only
    })
  })

  describe('Social Security taxability scenarios', () => {
    it('should handle low income - no SS taxation', () => {
      const lowIncomeInput = {
        ...baseTaxInput,
        pensionIncome: 15000,
        socialSecurityIncome: 18000,
        otherRetirementIncome: 0
      }
      
      const result = calculateTaxImplications(lowIncomeInput)
      
      expect(result.socialSecurityTaxablePercentage).toBe(0)
      expect(result.socialSecurityTaxable).toBe(0)
    })

    it('should handle moderate income - 50% SS taxation', () => {
      const moderateIncomeInput = {
        ...baseTaxInput,
        pensionIncome: 25000,
        socialSecurityIncome: 24000,
        otherRetirementIncome: 5000
      }
      
      const result = calculateTaxImplications(moderateIncomeInput)
      
      expect(result.socialSecurityTaxablePercentage).toBeGreaterThan(0)
      expect(result.socialSecurityTaxablePercentage).toBeLessThanOrEqual(50)
    })

    it('should handle high income - 85% SS taxation', () => {
      const highIncomeInput = {
        ...baseTaxInput,
        pensionIncome: 60000,
        socialSecurityIncome: 36000,
        otherRetirementIncome: 20000
      }
      
      const result = calculateTaxImplications(highIncomeInput)
      
      expect(result.socialSecurityTaxablePercentage).toBeGreaterThan(50)
      expect(result.socialSecurityTaxablePercentage).toBeLessThanOrEqual(85)
    })
  })

  describe('Performance requirements', () => {
    it('should complete tax calculation within 2 seconds', () => {
      const startTime = Date.now()
      
      calculateTaxImplications(baseTaxInput)
      
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      expect(executionTime).toBeLessThan(2000) // 2 seconds
    })

    it('should handle multiple calculations efficiently', () => {
      const startTime = Date.now()
      
      // Run 100 calculations to test performance
      for (let i = 0; i < 100; i++) {
        calculateTaxImplications({
          ...baseTaxInput,
          pensionIncome: baseTaxInput.pensionIncome + i * 100
        })
      }
      
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      expect(executionTime).toBeLessThan(2000) // Should handle 100 calculations in under 2 seconds
    })
  })

  describe('Edge cases', () => {
    it('should handle zero income', () => {
      const zeroIncomeInput = {
        ...baseTaxInput,
        pensionIncome: 0,
        socialSecurityIncome: 0,
        otherRetirementIncome: 0
      }
      
      const result = calculateTaxImplications(zeroIncomeInput)
      
      expect(result.grossIncome).toBe(0)
      expect(result.federalTax).toBe(0)
      expect(result.stateTax).toBe(0)
      expect(result.totalTax).toBe(0)
      expect(result.netIncome).toBe(0)
    })

    it('should handle very high income', () => {
      const highIncomeInput = {
        ...baseTaxInput,
        pensionIncome: 200000,
        socialSecurityIncome: 50000,
        otherRetirementIncome: 100000
      }
      
      const result = calculateTaxImplications(highIncomeInput)
      
      expect(result.grossIncome).toBe(350000)
      expect(result.federalTax).toBeGreaterThan(50000)
      expect(result.effectiveTaxRate).toBeGreaterThan(20)
    })

    it('should handle negative other income', () => {
      const negativeIncomeInput = {
        ...baseTaxInput,
        otherRetirementIncome: -5000 // Losses
      }
      
      const result = calculateTaxImplications(negativeIncomeInput)
      
      expect(result.grossIncome).toBe(71800) // 48000 + 28800 - 5000
      expect(result.federalTax).toBeGreaterThanOrEqual(0)
    })
  })
})
