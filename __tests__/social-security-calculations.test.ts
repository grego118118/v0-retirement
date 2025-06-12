import {
  calculateSocialSecurityBenefit,
  calculateSpousalBenefit,
  calculateCOLAAdjustment,
  calculateMedicarePremium,
  calculateOptimalClaimingAge,
  calculateDelayedRetirementCredits,
  type SocialSecurityCalculationParams,
  type SocialSecurityResult
} from '@/lib/social-security-calculations'

describe('Social Security Calculations', () => {
  describe('calculateSocialSecurityBenefit', () => {
    it('should calculate basic Social Security benefit correctly', () => {
      const params: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 67,
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const result = calculateSocialSecurityBenefit(params)

      expect(result.monthlyBenefit).toBeGreaterThan(0)
      expect(result.fullRetirementAge).toBe(67)
      expect(result.eligible).toBe(true)
    })

    it('should apply early retirement reduction correctly', () => {
      const fullAgeParams: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 67, // Full retirement age
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const earlyAgeParams: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 62, // Early retirement
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const fullResult = calculateSocialSecurityBenefit(fullAgeParams)
      const earlyResult = calculateSocialSecurityBenefit(earlyAgeParams)

      // Early retirement should result in reduced benefits
      expect(earlyResult.monthlyBenefit).toBeLessThan(fullResult.monthlyBenefit)
      expect(earlyResult.reductionPercentage).toBeGreaterThan(0)
    })

    it('should apply delayed retirement credits correctly', () => {
      const fullAgeParams: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 67, // Full retirement age
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const delayedAgeParams: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 70, // Delayed retirement
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const fullResult = calculateSocialSecurityBenefit(fullAgeParams)
      const delayedResult = calculateSocialSecurityBenefit(delayedAgeParams)

      // Delayed retirement should result in increased benefits
      expect(delayedResult.monthlyBenefit).toBeGreaterThan(fullResult.monthlyBenefit)
      expect(delayedResult.delayedRetirementCredits).toBeGreaterThan(0)
    })

    it('should handle different birth years and full retirement ages', () => {
      const params1955: SocialSecurityCalculationParams = {
        birthYear: 1955,
        retirementAge: 66.2, // FRA for 1955
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const params1960: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 67, // FRA for 1960+
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const result1955 = calculateSocialSecurityBenefit(params1955)
      const result1960 = calculateSocialSecurityBenefit(params1960)

      expect(result1955.fullRetirementAge).toBe(66.2)
      expect(result1960.fullRetirementAge).toBe(67)
    })
  })

  describe('calculateSpousalBenefit', () => {
    it('should calculate spousal benefit as 50% of higher earner', () => {
      const higherEarnerBenefit = 2000
      const spouseBenefit = 800

      const result = calculateSpousalBenefit(higherEarnerBenefit, spouseBenefit)

      // Spousal benefit should be 50% of higher earner's benefit
      expect(result.spousalBenefit).toBe(1000) // 50% of 2000
      expect(result.totalBenefit).toBe(1000) // Takes higher of own benefit or spousal
    })

    it('should use own benefit if higher than spousal benefit', () => {
      const higherEarnerBenefit = 2000
      const spouseBenefit = 1200 // Higher than 50% of spouse

      const result = calculateSpousalBenefit(higherEarnerBenefit, spouseBenefit)

      expect(result.spousalBenefit).toBe(1000) // 50% of 2000
      expect(result.totalBenefit).toBe(1200) // Uses own higher benefit
    })

    it('should handle zero spouse benefit', () => {
      const higherEarnerBenefit = 2000
      const spouseBenefit = 0

      const result = calculateSpousalBenefit(higherEarnerBenefit, spouseBenefit)

      expect(result.spousalBenefit).toBe(1000)
      expect(result.totalBenefit).toBe(1000)
    })
  })

  describe('calculateCOLAAdjustment', () => {
    it('should apply COLA adjustment correctly', () => {
      const baseBenefit = 2000
      const years = 5
      const colaRate = 0.025 // 2.5% annual COLA

      const result = calculateCOLAAdjustment(baseBenefit, years, colaRate)

      // Expected: 2000 * (1.025)^5 = 2262.82
      expect(result).toBeCloseTo(2262.82, 2)
    })

    it('should handle zero COLA rate', () => {
      const result = calculateCOLAAdjustment(2000, 5, 0)
      expect(result).toBe(2000)
    })

    it('should handle zero years', () => {
      const result = calculateCOLAAdjustment(2000, 0, 0.025)
      expect(result).toBe(2000)
    })

    it('should handle negative inputs gracefully', () => {
      expect(calculateCOLAAdjustment(-1000, 5, 0.025)).toBeLessThanOrEqual(0)
      expect(calculateCOLAAdjustment(2000, -1, 0.025)).toBe(2000)
    })
  })

  describe('calculateMedicarePremium', () => {
    it('should calculate standard Medicare Part B premium', () => {
      const income = 50000 // Below IRMAA threshold
      const result = calculateMedicarePremium(income)

      expect(result.partB).toBe(174.70) // 2024 standard premium
      expect(result.irmaaAdjustment).toBe(0)
      expect(result.totalPremium).toBe(174.70)
    })

    it('should apply IRMAA surcharge for high income', () => {
      const income = 200000 // Above IRMAA threshold
      const result = calculateMedicarePremium(income)

      expect(result.partB).toBe(174.70)
      expect(result.irmaaAdjustment).toBeGreaterThan(0)
      expect(result.totalPremium).toBeGreaterThan(174.70)
    })

    it('should handle very high income IRMAA tiers', () => {
      const income = 500000 // Highest IRMAA tier
      const result = calculateMedicarePremium(income)

      expect(result.irmaaAdjustment).toBeGreaterThan(0)
      expect(result.totalPremium).toBeGreaterThan(400) // Should be in highest tier
    })
  })

  describe('calculateDelayedRetirementCredits', () => {
    it('should calculate delayed retirement credits correctly', () => {
      const fullRetirementAge = 67
      const claimingAge = 70
      const baseBenefit = 2000

      const result = calculateDelayedRetirementCredits(fullRetirementAge, claimingAge, baseBenefit)

      // 3 years of delay * 8% per year = 24% increase
      expect(result.creditsPercentage).toBe(0.24)
      expect(result.additionalBenefit).toBe(480) // 24% of 2000
      expect(result.totalBenefit).toBe(2480)
    })

    it('should not apply credits before full retirement age', () => {
      const fullRetirementAge = 67
      const claimingAge = 65 // Before FRA
      const baseBenefit = 2000

      const result = calculateDelayedRetirementCredits(fullRetirementAge, claimingAge, baseBenefit)

      expect(result.creditsPercentage).toBe(0)
      expect(result.additionalBenefit).toBe(0)
      expect(result.totalBenefit).toBe(2000)
    })

    it('should cap credits at age 70', () => {
      const fullRetirementAge = 67
      const claimingAge = 72 // Beyond age 70
      const baseBenefit = 2000

      const result = calculateDelayedRetirementCredits(fullRetirementAge, claimingAge, baseBenefit)

      // Should cap at 3 years (age 70), not 5 years
      expect(result.creditsPercentage).toBe(0.24) // 3 years * 8%
      expect(result.totalBenefit).toBe(2480)
    })
  })

  describe('calculateOptimalClaimingAge', () => {
    it('should recommend optimal claiming strategy', () => {
      const params = {
        birthYear: 1960,
        lifeExpectancy: 85,
        averageIndexedMonthlyEarnings: 5000,
        currentAge: 62
      }

      const result = calculateOptimalClaimingAge(params)

      expect(result.recommendedAge).toBeGreaterThanOrEqual(62)
      expect(result.recommendedAge).toBeLessThanOrEqual(70)
      expect(result.totalLifetimeBenefit).toBeGreaterThan(0)
      expect(result.reasoning).toBeDefined()
    })

    it('should consider break-even analysis', () => {
      const params = {
        birthYear: 1960,
        lifeExpectancy: 90, // Long life expectancy
        averageIndexedMonthlyEarnings: 5000,
        currentAge: 62
      }

      const result = calculateOptimalClaimingAge(params)

      // With long life expectancy, should recommend delaying
      expect(result.recommendedAge).toBeGreaterThan(67)
      expect(result.breakEvenAge).toBeDefined()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid birth year', () => {
      const params: SocialSecurityCalculationParams = {
        birthYear: 1800, // Invalid
        retirementAge: 67,
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      expect(() => {
        calculateSocialSecurityBenefit(params)
      }).toThrow()
    })

    it('should handle retirement age before 62', () => {
      const params: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 60, // Too early
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const result = calculateSocialSecurityBenefit(params)
      expect(result.eligible).toBe(false)
    })

    it('should handle zero earnings', () => {
      const params: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 67,
        averageIndexedMonthlyEarnings: 0,
        earningsRecord: []
      }

      const result = calculateSocialSecurityBenefit(params)
      expect(result.monthlyBenefit).toBe(0)
    })

    it('should handle negative earnings gracefully', () => {
      const params: SocialSecurityCalculationParams = {
        birthYear: 1960,
        retirementAge: 67,
        averageIndexedMonthlyEarnings: -1000,
        earningsRecord: []
      }

      const result = calculateSocialSecurityBenefit(params)
      expect(result.monthlyBenefit).toBe(0)
    })
  })
})
