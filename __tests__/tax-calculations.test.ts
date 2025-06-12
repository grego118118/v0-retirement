import {
  calculateFederalTax,
  calculateMassachusettsTax,
  calculateSocialSecurityTax,
  calculateRetirementTaxes,
  FEDERAL_TAX_BRACKETS_2024,
  STANDARD_DEDUCTIONS_2024,
  MA_TAX_RATE
} from '@/lib/tax-calculations'

describe('Tax Calculations', () => {
  describe('calculateFederalTax', () => {
    it('should calculate federal tax for single filer correctly', () => {
      // Test case: $58,000 taxable income for single filer
      const result = calculateFederalTax(58000, 'single')
      
      // Expected calculation:
      // 10% on first $11,600 = $1,160
      // 12% on next $35,550 ($47,150 - $11,600) = $4,266
      // 22% on remaining $10,850 ($58,000 - $47,150) = $2,387
      // Total: $7,813
      
      expect(result.totalTax).toBeCloseTo(7813, 0)
      expect(result.brackets).toHaveLength(3)
      expect(result.effectiveRate).toBeCloseTo(0.1347, 3) // 13.47%
      expect(result.marginalRate).toBe(0.22) // 22%
    })

    it('should calculate federal tax for married filing jointly', () => {
      const result = calculateFederalTax(100000, 'marriedFilingJointly')
      
      // Expected calculation:
      // 10% on first $23,200 = $2,320
      // 12% on next $71,100 ($94,300 - $23,200) = $8,532
      // 22% on remaining $5,700 ($100,000 - $94,300) = $1,254
      // Total: $12,106
      
      expect(result.totalTax).toBeCloseTo(12106, 0)
      expect(result.marginalRate).toBe(0.22)
    })

    it('should handle zero income', () => {
      const result = calculateFederalTax(0, 'single')
      
      expect(result.totalTax).toBe(0)
      expect(result.effectiveRate).toBe(0)
      expect(result.brackets).toHaveLength(0)
    })
  })

  describe('calculateMassachusettsTax', () => {
    it('should calculate MA tax for single filer', () => {
      // Test case: $60,000 federal AGI, single, under 65
      const result = calculateMassachusettsTax(60000, 'single', false)
      
      // Expected calculation:
      // AGI: $60,000
      // Less standard deduction: $4,400
      // Less personal exemption: $4,400
      // Taxable income: $51,200
      // Tax at 5%: $2,560
      
      expect(result.totalTax).toBeCloseTo(2560, 0)
      expect(result.marginalRate).toBe(MA_TAX_RATE)
    })

    it('should apply age 65+ exemption', () => {
      const result = calculateMassachusettsTax(60000, 'single', true)
      
      // Expected calculation:
      // AGI: $60,000
      // Less standard deduction: $4,400
      // Less personal exemption: $4,400
      // Less age 65+ exemption: $700
      // Taxable income: $50,500
      // Tax at 5%: $2,525
      
      expect(result.totalTax).toBeCloseTo(2525, 0)
    })

    it('should handle married filing jointly', () => {
      const result = calculateMassachusettsTax(100000, 'marriedFilingJointly', false)
      
      // Expected calculation:
      // AGI: $100,000
      // Less standard deduction: $8,800 (2 x $4,400)
      // Less personal exemptions: $8,800 (2 x $4,400)
      // Taxable income: $82,400
      // Tax at 5%: $4,120
      
      expect(result.totalTax).toBeCloseTo(4120, 0)
    })
  })

  describe('calculateSocialSecurityTax', () => {
    it('should not tax SS below threshold for single filer', () => {
      const result = calculateSocialSecurityTax(20000, 20000, 'single')
      
      // Combined income: $20,000 + ($20,000 * 0.5) = $30,000
      // Below $25,000 threshold for single filer
      
      expect(result.taxableAmount).toBe(0)
      expect(result.taxablePercentage).toBe(0)
    })

    it('should tax SS at 50% rate for single filer in middle range', () => {
      const result = calculateSocialSecurityTax(20000, 15000, 'single')
      
      // Combined income: $15,000 + ($20,000 * 0.5) = $25,000
      // Exactly at threshold, so minimal taxation
      
      expect(result.taxableAmount).toBeCloseTo(0, 0)
      expect(result.taxablePercentage).toBeCloseTo(0, 2)
    })

    it('should tax SS at 85% rate for high income single filer', () => {
      const result = calculateSocialSecurityTax(30000, 50000, 'single')
      
      // Combined income: $50,000 + ($30,000 * 0.5) = $65,000
      // Above $34,000 threshold, so up to 85% taxable
      
      expect(result.taxableAmount).toBeGreaterThan(0)
      expect(result.taxablePercentage).toBeGreaterThan(0.5)
    })

    it('should handle married filing jointly thresholds', () => {
      const result = calculateSocialSecurityTax(40000, 30000, 'marriedFilingJointly')
      
      // Combined income: $30,000 + ($40,000 * 0.5) = $50,000
      // Above $32,000 but below $44,000 threshold for MFJ
      
      expect(result.taxableAmount).toBeGreaterThan(0)
      expect(result.taxableAmount).toBeLessThanOrEqual(40000 * 0.5) // Max 50% in this range
    })
  })

  describe('calculateRetirementTaxes', () => {
    it('should calculate comprehensive retirement taxes', () => {
      const result = calculateRetirementTaxes(
        60000, // pension income
        25000, // social security
        5000,  // other income
        'single',
        false
      )

      expect(result.grossIncome).toBe(90000) // 60k + 25k + 5k
      expect(result.federalTax).toBeGreaterThan(0)
      expect(result.stateTax).toBeGreaterThan(0)
      expect(result.totalTax).toBe(result.federalTax + result.stateTax)
      expect(result.netIncome).toBe(result.grossIncome - result.totalTax)
      expect(result.effectiveRate).toBeGreaterThan(0)
      expect(result.effectiveRate).toBeLessThan(1)
    })

    it('should handle zero income scenarios', () => {
      const result = calculateRetirementTaxes(0, 0, 0, 'single', false)

      expect(result.grossIncome).toBe(0)
      expect(result.federalTax).toBe(0)
      expect(result.stateTax).toBe(0)
      expect(result.totalTax).toBe(0)
      expect(result.netIncome).toBe(0)
      expect(result.effectiveRate).toBe(0)
    })

    it('should apply standard deductions correctly', () => {
      const singleResult = calculateRetirementTaxes(50000, 0, 0, 'single', false)
      const marriedResult = calculateRetirementTaxes(50000, 0, 0, 'marriedFilingJointly', false)

      // Married filing jointly should have lower federal tax due to higher standard deduction
      expect(marriedResult.federalTax).toBeLessThan(singleResult.federalTax)
    })

    it('should not tax Social Security in Massachusetts', () => {
      const withSS = calculateRetirementTaxes(50000, 20000, 0, 'single', false)
      const withoutSS = calculateRetirementTaxes(50000, 0, 0, 'single', false)

      // MA state tax should be the same regardless of Social Security income
      expect(withSS.stateTax).toBeCloseTo(withoutSS.stateTax, 0)
    })

    it('should apply age 65+ benefits', () => {
      const under65 = calculateRetirementTaxes(60000, 20000, 0, 'single', false)
      const over65 = calculateRetirementTaxes(60000, 20000, 0, 'single', true)

      // Over 65 should have lower MA state tax due to additional exemption
      expect(over65.stateTax).toBeLessThan(under65.stateTax)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very high income', () => {
      const result = calculateRetirementTaxes(500000, 50000, 100000, 'single', false)
      
      expect(result.marginalRate).toBe(0.37) // Top federal bracket
      expect(result.totalTax).toBeGreaterThan(100000)
    })

    it('should handle negative inputs gracefully', () => {
      const result = calculateRetirementTaxes(-1000, -500, -200, 'single', false)
      
      expect(result.grossIncome).toBeLessThanOrEqual(0)
      expect(result.federalTax).toBe(0)
      expect(result.stateTax).toBe(0)
    })

    it('should validate filing status', () => {
      expect(() => {
        calculateRetirementTaxes(50000, 20000, 0, 'invalid' as any, false)
      }).toThrow()
    })
  })
})
