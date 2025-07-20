/**
 * Advanced Fact-Checking System
 * Massachusetts Retirement System - Content Accuracy Validation
 */

import { FactCheckResult, FactCheckReport } from '@/types/ai-blog'

export class AdvancedFactChecker {
  /**
   * Massachusetts retirement system facts database
   */
  private static readonly MASSACHUSETTS_FACTS = {
    // Group Classifications
    group_classifications: {
      'group_1_min_age': { value: 60, source: 'MSRB Group 1 regulations' },
      'group_2_min_age': { value: 55, source: 'MSRB Group 2 regulations' },
      'group_3_min_age': { value: 'any_age_20_years', source: 'MSRB Group 3 regulations' },
      'group_4_min_age': { value: 50, source: 'MSRB Group 4 regulations' }
    },
    
    // Benefit Multipliers
    benefit_multipliers: {
      'group_1_age_60': { value: 2.0, source: 'MSRB benefit calculation formulas' },
      'group_1_age_65': { value: 2.5, source: 'MSRB benefit calculation formulas' },
      'group_2_age_55': { value: 2.0, source: 'MSRB benefit calculation formulas' },
      'group_2_age_60': { value: 2.5, source: 'MSRB benefit calculation formulas' },
      'group_3_multiplier': { value: 2.5, source: 'MSRB benefit calculation formulas' },
      'group_4_age_50': { value: 2.0, source: 'MSRB benefit calculation formulas' },
      'group_4_age_55': { value: 2.5, source: 'MSRB benefit calculation formulas' }
    },
    
    // COLA Information
    cola: {
      'rate': { value: 3.0, source: 'MSRB COLA guidelines' },
      'base_amount': { value: 13000, source: 'MSRB COLA guidelines' },
      'max_annual_increase': { value: 390, source: 'MSRB COLA guidelines' },
      'start_timing': { value: 'first_year_after_retirement', source: 'MSRB COLA guidelines' }
    },
    
    // General Rules
    general: {
      'max_benefit_percentage': { value: 80, source: 'MSRB benefit calculation rules' },
      'average_salary_years': { value: 3, source: 'MSRB average salary rules' },
      'vesting_years': { value: 10, source: 'MSRB vesting requirements' },
      'post_2012_proration': { value: true, source: 'MSRB post-April 2012 rules' }
    },
    
    // Social Security
    social_security: {
      'wep_applies': { value: true, source: 'Social Security Administration WEP rules' },
      'gpo_applies': { value: true, source: 'Social Security Administration GPO rules' }
    }
  }

  /**
   * Perform comprehensive fact-checking
   */
  static async performComprehensiveFactCheck(content: string, title: string): Promise<FactCheckReport> {
    const claims: FactCheckResult[] = []
    const flaggedContent: string[] = []
    const recommendedChanges: string[] = []

    // Check group classification facts
    const groupChecks = this.checkGroupClassifications(content)
    claims.push(...groupChecks.claims)
    flaggedContent.push(...groupChecks.flagged)
    recommendedChanges.push(...groupChecks.recommendations)

    // Check benefit multiplier facts
    const multiplierChecks = this.checkBenefitMultipliers(content)
    claims.push(...multiplierChecks.claims)
    flaggedContent.push(...multiplierChecks.flagged)
    recommendedChanges.push(...multiplierChecks.recommendations)

    // Check COLA facts
    const colaChecks = this.checkCOLAFacts(content)
    claims.push(...colaChecks.claims)
    flaggedContent.push(...colaChecks.flagged)
    recommendedChanges.push(...colaChecks.recommendations)

    // Check general retirement facts
    const generalChecks = this.checkGeneralFacts(content)
    claims.push(...generalChecks.claims)
    flaggedContent.push(...generalChecks.flagged)
    recommendedChanges.push(...generalChecks.recommendations)

    // Check for common misconceptions
    const misconceptionChecks = this.checkCommonMisconceptions(content)
    claims.push(...misconceptionChecks.claims)
    flaggedContent.push(...misconceptionChecks.flagged)
    recommendedChanges.push(...misconceptionChecks.recommendations)

    // Calculate overall accuracy
    const verifiedClaims = claims.filter(c => c.verification_status === 'verified').length
    const totalClaims = claims.length
    const overallAccuracy = totalClaims > 0 ? (verifiedClaims / totalClaims) * 100 : 85

    return {
      post_id: '', // Will be set by caller
      claims_checked: claims,
      overall_accuracy: overallAccuracy,
      flagged_content: [...new Set(flaggedContent)],
      recommended_changes: [...new Set(recommendedChanges)],
      checked_at: new Date().toISOString(),
      checker_id: 'advanced_fact_checker'
    }
  }

  /**
   * Check group classification facts
   */
  private static checkGroupClassifications(content: string) {
    const claims: FactCheckResult[] = []
    const flagged: string[] = []
    const recommendations: string[] = []

    // Group 1 minimum age
    if (/group 1.*minimum.*age.*60/i.test(content)) {
      claims.push({
        claim: 'Group 1 minimum retirement age is 60',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.group_classifications.group_1_min_age.source],
        confidence_score: 100
      })
    } else if (/group 1.*minimum.*age.*(?:55|65)/i.test(content)) {
      claims.push({
        claim: 'Group 1 minimum retirement age incorrectly stated',
        verification_status: 'false',
        sources: [this.MASSACHUSETTS_FACTS.group_classifications.group_1_min_age.source],
        confidence_score: 100,
        notes: 'Group 1 minimum retirement age is 60, not 55 or 65'
      })
      flagged.push('Incorrect Group 1 minimum retirement age')
      recommendations.push('Correct Group 1 minimum retirement age to 60')
    }

    // Group 4 minimum age
    if (/group 4.*minimum.*age.*50/i.test(content)) {
      claims.push({
        claim: 'Group 4 minimum retirement age is 50',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.group_classifications.group_4_min_age.source],
        confidence_score: 100
      })
    } else if (/group 4.*minimum.*age.*(?:55|60)/i.test(content)) {
      claims.push({
        claim: 'Group 4 minimum retirement age incorrectly stated',
        verification_status: 'false',
        sources: [this.MASSACHUSETTS_FACTS.group_classifications.group_4_min_age.source],
        confidence_score: 100,
        notes: 'Group 4 minimum retirement age is 50, not 55 or 60'
      })
      flagged.push('Incorrect Group 4 minimum retirement age')
      recommendations.push('Correct Group 4 minimum retirement age to 50')
    }

    return { claims, flagged, recommendations }
  }

  /**
   * Check benefit multiplier facts
   */
  private static checkBenefitMultipliers(content: string) {
    const claims: FactCheckResult[] = []
    const flagged: string[] = []
    const recommendations: string[] = []

    // Group 1 multipliers
    if (/group 1.*2\.0%.*age 60/i.test(content)) {
      claims.push({
        claim: 'Group 1 has 2.0% multiplier at age 60',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.benefit_multipliers.group_1_age_60.source],
        confidence_score: 100
      })
    }

    if (/group 1.*2\.5%.*age 65/i.test(content)) {
      claims.push({
        claim: 'Group 1 has 2.5% multiplier at age 65',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.benefit_multipliers.group_1_age_65.source],
        confidence_score: 100
      })
    }

    // Check for incorrect multipliers
    if (/group 1.*3\.0%/i.test(content)) {
      claims.push({
        claim: 'Group 1 multiplier incorrectly stated as 3.0%',
        verification_status: 'false',
        sources: [this.MASSACHUSETTS_FACTS.benefit_multipliers.group_1_age_65.source],
        confidence_score: 100,
        notes: 'Group 1 maximum multiplier is 2.5%, not 3.0%'
      })
      flagged.push('Incorrect Group 1 benefit multiplier')
      recommendations.push('Correct Group 1 maximum multiplier to 2.5%')
    }

    return { claims, flagged, recommendations }
  }

  /**
   * Check COLA facts
   */
  private static checkCOLAFacts(content: string) {
    const claims: FactCheckResult[] = []
    const flagged: string[] = []
    const recommendations: string[] = []

    // COLA rate
    if (/cola.*3%/i.test(content) || /3%.*cola/i.test(content)) {
      claims.push({
        claim: 'Massachusetts COLA rate is 3%',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.cola.rate.source],
        confidence_score: 100
      })
    } else if (/cola.*2%/i.test(content) || /2%.*cola/i.test(content)) {
      claims.push({
        claim: 'COLA rate incorrectly stated as 2%',
        verification_status: 'false',
        sources: [this.MASSACHUSETTS_FACTS.cola.rate.source],
        confidence_score: 100,
        notes: 'Massachusetts COLA rate is 3%, not 2%'
      })
      flagged.push('Incorrect COLA rate')
      recommendations.push('Correct COLA rate to 3%')
    }

    // COLA base amount
    if (/\$13,000.*cola/i.test(content) || /cola.*\$13,000/i.test(content)) {
      claims.push({
        claim: 'COLA applies to first $13,000 of annual benefit',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.cola.base_amount.source],
        confidence_score: 100
      })
    }

    // Maximum COLA increase
    if (/\$390.*cola/i.test(content) || /cola.*\$390/i.test(content)) {
      claims.push({
        claim: 'Maximum annual COLA increase is $390',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.cola.max_annual_increase.source],
        confidence_score: 100
      })
    }

    return { claims, flagged, recommendations }
  }

  /**
   * Check general retirement facts
   */
  private static checkGeneralFacts(content: string) {
    const claims: FactCheckResult[] = []
    const flagged: string[] = []
    const recommendations: string[] = []

    // Maximum benefit percentage
    if (/maximum.*80%/i.test(content) || /80%.*maximum/i.test(content)) {
      claims.push({
        claim: 'Maximum benefit is 80% of average salary',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.general.max_benefit_percentage.source],
        confidence_score: 100
      })
    } else if (/maximum.*90%/i.test(content) || /90%.*maximum/i.test(content)) {
      claims.push({
        claim: 'Maximum benefit incorrectly stated as 90%',
        verification_status: 'false',
        sources: [this.MASSACHUSETTS_FACTS.general.max_benefit_percentage.source],
        confidence_score: 100,
        notes: 'Maximum benefit is 80%, not 90%'
      })
      flagged.push('Incorrect maximum benefit percentage')
      recommendations.push('Correct maximum benefit to 80%')
    }

    // Average salary calculation
    if (/highest 3.*years/i.test(content) || /3.*consecutive.*years/i.test(content)) {
      claims.push({
        claim: 'Average salary based on highest 3 consecutive years',
        verification_status: 'verified',
        sources: [this.MASSACHUSETTS_FACTS.general.average_salary_years.source],
        confidence_score: 100
      })
    } else if (/highest 5.*years/i.test(content)) {
      claims.push({
        claim: 'Average salary incorrectly stated as highest 5 years',
        verification_status: 'false',
        sources: [this.MASSACHUSETTS_FACTS.general.average_salary_years.source],
        confidence_score: 100,
        notes: 'Average salary is based on highest 3 consecutive years, not 5'
      })
      flagged.push('Incorrect average salary calculation period')
      recommendations.push('Correct average salary calculation to highest 3 consecutive years')
    }

    return { claims, flagged, recommendations }
  }

  /**
   * Check for common misconceptions
   */
  private static checkCommonMisconceptions(content: string) {
    const claims: FactCheckResult[] = []
    const flagged: string[] = []
    const recommendations: string[] = []

    const misconceptions = [
      {
        pattern: /social security.*not.*eligible/i,
        claim: 'Massachusetts public employees not eligible for Social Security',
        status: 'false' as const,
        correction: 'Most Massachusetts public employees are eligible for Social Security',
        note: 'This is a common misconception - most MA public employees do pay into and receive Social Security'
      },
      {
        pattern: /pension.*guaranteed.*forever/i,
        claim: 'Pension benefits guaranteed forever without change',
        status: 'disputed' as const,
        correction: 'While generally stable, pension laws can change for future employees',
        note: 'Benefits for current retirees are typically protected, but laws can change for future employees'
      },
      {
        pattern: /retire.*any.*age.*group 1/i,
        claim: 'Group 1 employees can retire at any age',
        status: 'false' as const,
        correction: 'Group 1 employees have minimum retirement age of 60',
        note: 'Only Group 3 (State Police) can retire at any age with 20+ years of service'
      }
    ]

    misconceptions.forEach(misconception => {
      if (misconception.pattern.test(content)) {
        claims.push({
          claim: misconception.claim,
          verification_status: misconception.status,
          sources: ['Massachusetts retirement system regulations'],
          confidence_score: 95,
          notes: misconception.note
        })
        
        if (misconception.status === 'false' || misconception.status === 'disputed') {
          flagged.push(misconception.claim)
          recommendations.push(misconception.correction)
        }
      }
    })

    return { claims, flagged, recommendations }
  }

  /**
   * Generate fact-check summary report
   */
  static generateFactCheckSummary(report: FactCheckReport): string {
    const verifiedCount = report.claims_checked.filter(c => c.verification_status === 'verified').length
    const falseCount = report.claims_checked.filter(c => c.verification_status === 'false').length
    const disputedCount = report.claims_checked.filter(c => c.verification_status === 'disputed').length

    let summary = `Fact-Check Summary:\n`
    summary += `- ${verifiedCount} verified claims\n`
    summary += `- ${falseCount} false claims\n`
    summary += `- ${disputedCount} disputed claims\n`
    summary += `- Overall accuracy: ${Math.round(report.overall_accuracy)}%\n`

    if (report.flagged_content.length > 0) {
      summary += `\nFlagged Issues:\n`
      report.flagged_content.forEach(issue => {
        summary += `- ${issue}\n`
      })
    }

    if (report.recommended_changes.length > 0) {
      summary += `\nRecommended Changes:\n`
      report.recommended_changes.forEach(change => {
        summary += `- ${change}\n`
      })
    }

    return summary
  }
}
