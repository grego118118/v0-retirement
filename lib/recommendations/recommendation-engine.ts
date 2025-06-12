/**
 * Recommendation Engine
 * Massachusetts Retirement System - Action Items and Recommendations
 * 
 * Intelligent algorithm to analyze user profiles and calculation results
 * to generate personalized action items and retirement planning guidance.
 */

import { RetirementProfile, RetirementCalculation, ActionItem } from '@prisma/client'
import { calculateCurrentAge, calculateYearsOfService } from '@/lib/standardized-pension-calculator'

// Types for recommendation system
export interface UserAnalysis {
  profile: RetirementProfile | null
  calculations: RetirementCalculation[]
  currentAge: number
  yearsOfService: number
  retirementReadiness: 'excellent' | 'on-track' | 'needs-attention' | 'critical'
  missingData: string[]
  opportunities: string[]
  risks: string[]
}

export interface RecommendationContext {
  userId: string
  analysis: UserAnalysis
  existingActionItems: ActionItem[]
  lastGeneratedAt?: Date
}

export interface ActionItemTemplate {
  title: string
  description: string
  category: 'profile' | 'calculation' | 'planning' | 'optimization' | 'education'
  priority: 'high' | 'medium' | 'low'
  actionType: 'navigate' | 'calculate' | 'review' | 'contact' | 'learn'
  actionUrl?: string
  actionData?: Record<string, any>
  triggerCondition: string
  targetGroup?: string
  targetAgeRange?: string
  targetServiceRange?: string
  expiresInDays?: number
  generationReason: string
}

export class RecommendationEngine {
  private static instance: RecommendationEngine
  private actionItemTemplates: ActionItemTemplate[]

  private constructor() {
    this.actionItemTemplates = this.initializeTemplates()
  }

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine()
    }
    return RecommendationEngine.instance
  }

  /**
   * Analyze user data and generate comprehensive user analysis
   */
  public analyzeUser(
    profile: RetirementProfile | null,
    calculations: RetirementCalculation[]
  ): UserAnalysis {
    const currentAge = profile ? calculateCurrentAge(profile.dateOfBirth) : 0
    const yearsOfService = profile ? calculateYearsOfService(profile.membershipDate) : 0
    
    const missingData = this.identifyMissingData(profile, calculations)
    const opportunities = this.identifyOpportunities(profile, calculations, currentAge, yearsOfService)
    const risks = this.identifyRisks(profile, calculations, currentAge, yearsOfService)
    const retirementReadiness = this.assessRetirementReadiness(profile, calculations, missingData, risks)

    return {
      profile,
      calculations,
      currentAge,
      yearsOfService,
      retirementReadiness,
      missingData,
      opportunities,
      risks,
    }
  }

  /**
   * Generate personalized action items based on user analysis
   */
  public generateRecommendations(context: RecommendationContext): ActionItemTemplate[] {
    const { analysis, existingActionItems } = context
    const recommendations: ActionItemTemplate[] = []

    // Get existing action item titles to avoid duplicates
    const existingTitles = new Set(
      existingActionItems
        .filter(item => item.status !== 'completed' && item.status !== 'dismissed')
        .map(item => item.title)
    )

    // Generate recommendations based on analysis
    for (const template of this.actionItemTemplates) {
      if (existingTitles.has(template.title)) {
        continue // Skip if already exists
      }

      if (this.shouldGenerateActionItem(template, analysis)) {
        recommendations.push({
          ...template,
          generationReason: this.getGenerationReason(template, analysis),
        })
      }
    }

    // Sort by priority and relevance
    return this.prioritizeRecommendations(recommendations, analysis)
  }

  /**
   * Assess overall retirement readiness
   */
  private assessRetirementReadiness(
    profile: RetirementProfile | null,
    calculations: RetirementCalculation[],
    missingData: string[],
    risks: string[]
  ): 'excellent' | 'on-track' | 'needs-attention' | 'critical' {
    let score = 0
    let maxScore = 0

    // Profile completeness (25 points)
    maxScore += 25
    if (profile) {
      score += 15 // Has profile
      if (missingData.length === 0) score += 10 // Complete profile
    }

    // Calculation activity (25 points)
    maxScore += 25
    if (calculations.length > 0) {
      score += 15 // Has calculations
      if (calculations.length >= 3) score += 5 // Multiple scenarios
      if (calculations.some(c => Date.now() - c.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000)) {
        score += 5 // Recent activity
      }
    }

    // Risk assessment (25 points)
    maxScore += 25
    const riskScore = Math.max(0, 25 - (risks.length * 5))
    score += riskScore

    // Age and service appropriateness (25 points)
    maxScore += 25
    if (profile) {
      const currentAge = calculateCurrentAge(profile.dateOfBirth)
      const yearsOfService = calculateYearsOfService(profile.membershipDate)
      
      if (currentAge >= 50) score += 10 // Approaching retirement age
      if (yearsOfService >= 10) score += 10 // Significant service
      if (calculations.some(c => c.retirementAge >= 62)) score += 5 // Realistic retirement planning
    }

    const percentage = (score / maxScore) * 100

    if (percentage >= 85) return 'excellent'
    if (percentage >= 70) return 'on-track'
    if (percentage >= 50) return 'needs-attention'
    return 'critical'
  }

  /**
   * Identify missing data that could improve calculations
   */
  private identifyMissingData(
    profile: RetirementProfile | null,
    calculations: RetirementCalculation[]
  ): string[] {
    const missing: string[] = []

    if (!profile) {
      missing.push('retirement_profile')
      return missing
    }

    if (!profile.averageHighest3Years) missing.push('average_salary')
    if (!profile.plannedRetirementAge) missing.push('planned_retirement_age')
    if (!profile.retirementOption) missing.push('retirement_option')
    if (calculations.length === 0) missing.push('calculations')
    if (calculations.length > 0 && !calculations.some(c => c.socialSecurityData)) {
      missing.push('social_security_data')
    }

    return missing
  }

  /**
   * Identify opportunities for optimization
   */
  private identifyOpportunities(
    profile: RetirementProfile | null,
    calculations: RetirementCalculation[],
    currentAge: number,
    yearsOfService: number
  ): string[] {
    const opportunities: string[] = []

    if (!profile) return opportunities

    // Service credit opportunities
    if (yearsOfService < 20 && currentAge < 55) {
      opportunities.push('increase_service_credit')
    }

    // Salary optimization
    if (profile.currentSalary && profile.averageHighest3Years) {
      if (profile.currentSalary > profile.averageHighest3Years * 1.1) {
        opportunities.push('salary_optimization')
      }
    }

    // Group classification review
    if (profile.retirementGroup === '1' && yearsOfService >= 20) {
      opportunities.push('group_classification_review')
    }

    // Early retirement eligibility
    if (yearsOfService >= 20 && currentAge >= 55) {
      opportunities.push('early_retirement_eligible')
    }

    // Maximum benefit potential
    const maxServiceYears = profile.retirementGroup === '3' ? 32 : 40
    if (yearsOfService < maxServiceYears && currentAge < 65) {
      opportunities.push('maximize_benefits')
    }

    return opportunities
  }

  /**
   * Identify potential risks or issues
   */
  private identifyRisks(
    profile: RetirementProfile | null,
    calculations: RetirementCalculation[],
    currentAge: number,
    yearsOfService: number
  ): string[] {
    const risks: string[] = []

    if (!profile) {
      risks.push('no_profile_data')
      return risks
    }

    // Age-related risks
    if (currentAge >= 60 && calculations.length === 0) {
      risks.push('approaching_retirement_no_planning')
    }

    // Service credit risks
    if (yearsOfService < 10 && currentAge >= 50) {
      risks.push('insufficient_service_credit')
    }

    // Benefit reduction risks
    if (calculations.some(c => c.benefitReduction && c.benefitReduction > 0.1)) {
      risks.push('early_retirement_penalty')
    }

    // Outdated calculations
    if (calculations.length > 0) {
      const latestCalculation = calculations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
      const daysSinceLastCalculation = (Date.now() - latestCalculation.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceLastCalculation > 90) {
        risks.push('outdated_calculations')
      }
    }

    // Low benefit amounts
    if (calculations.some(c => c.monthlyBenefit < 1000)) {
      risks.push('low_projected_benefits')
    }

    return risks
  }

  /**
   * Check if a specific action item should be generated
   */
  private shouldGenerateActionItem(template: ActionItemTemplate, analysis: UserAnalysis): boolean {
    const { profile, calculations, currentAge, yearsOfService, missingData, opportunities, risks } = analysis

    // Check trigger conditions
    switch (template.triggerCondition) {
      case 'no_profile':
        return !profile

      case 'incomplete_profile':
        return profile && missingData.length > 0

      case 'no_calculations':
        return calculations.length === 0

      case 'outdated_calculations':
        return risks.includes('outdated_calculations')

      case 'approaching_retirement':
        return currentAge >= 55 && yearsOfService >= 10

      case 'early_retirement_eligible':
        return opportunities.includes('early_retirement_eligible')

      case 'low_service_credit':
        return yearsOfService < 10 && currentAge < 60

      case 'benefit_optimization':
        return opportunities.includes('maximize_benefits')

      case 'group_classification':
        return opportunities.includes('group_classification_review')

      case 'social_security_missing':
        return missingData.includes('social_security_data')

      case 'retirement_readiness_critical':
        return analysis.retirementReadiness === 'critical'

      case 'retirement_readiness_needs_attention':
        return analysis.retirementReadiness === 'needs-attention'

      default:
        return false
    }
  }

  /**
   * Get generation reason for an action item
   */
  private getGenerationReason(template: ActionItemTemplate, analysis: UserAnalysis): string {
    const reasons = {
      no_profile: 'User has not created a retirement profile',
      incomplete_profile: `Missing data: ${analysis.missingData.join(', ')}`,
      no_calculations: 'User has not run any retirement calculations',
      outdated_calculations: 'Last calculation is over 90 days old',
      approaching_retirement: `User is ${analysis.currentAge} years old with ${analysis.yearsOfService} years of service`,
      early_retirement_eligible: 'User meets early retirement eligibility requirements',
      low_service_credit: `Only ${analysis.yearsOfService} years of service at age ${analysis.currentAge}`,
      benefit_optimization: 'Opportunities identified for benefit maximization',
      group_classification: 'Potential for group classification review',
      social_security_missing: 'Social Security data not included in calculations',
      retirement_readiness_critical: `Retirement readiness score: ${analysis.retirementReadiness}`,
      retirement_readiness_needs_attention: `Retirement readiness score: ${analysis.retirementReadiness}`,
    }

    return reasons[template.triggerCondition as keyof typeof reasons] || template.triggerCondition
  }

  /**
   * Prioritize recommendations based on user analysis
   */
  private prioritizeRecommendations(
    recommendations: ActionItemTemplate[],
    analysis: UserAnalysis
  ): ActionItemTemplate[] {
    return recommendations.sort((a, b) => {
      // Priority order: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      
      if (priorityDiff !== 0) return priorityDiff

      // Category order: profile > calculation > planning > optimization > education
      const categoryOrder = { profile: 5, calculation: 4, planning: 3, optimization: 2, education: 1 }
      const categoryDiff = categoryOrder[b.category] - categoryOrder[a.category]
      
      if (categoryDiff !== 0) return categoryDiff

      // Alphabetical by title as final tiebreaker
      return a.title.localeCompare(b.title)
    })
  }

  /**
   * Initialize action item templates
   */
  private initializeTemplates(): ActionItemTemplate[] {
    return [
      // Profile completion templates
      {
        title: 'Complete Your Retirement Profile',
        description: 'Add your employment details to get accurate benefit calculations and personalized recommendations.',
        category: 'profile',
        priority: 'high',
        actionType: 'navigate',
        actionUrl: '/profile',
        triggerCondition: 'no_profile',
        generationReason: 'User needs to create retirement profile',
      },
      {
        title: 'Update Missing Profile Information',
        description: 'Complete your profile with missing details to improve calculation accuracy.',
        category: 'profile',
        priority: 'high',
        actionType: 'navigate',
        actionUrl: '/profile',
        triggerCondition: 'incomplete_profile',
        generationReason: 'Profile has missing required information',
      },

      // Calculation templates
      {
        title: 'Run Your First Pension Calculation',
        description: 'Calculate your Massachusetts pension benefits to understand your retirement outlook.',
        category: 'calculation',
        priority: 'high',
        actionType: 'navigate',
        actionUrl: '/calculator',
        triggerCondition: 'no_calculations',
        generationReason: 'User has not performed any calculations',
      },
      {
        title: 'Update Your Retirement Calculations',
        description: 'Your last calculation is over 90 days old. Update your projections with current data.',
        category: 'calculation',
        priority: 'medium',
        actionType: 'navigate',
        actionUrl: '/calculator',
        triggerCondition: 'outdated_calculations',
        generationReason: 'Calculations are outdated',
      },
      {
        title: 'Add Social Security to Your Analysis',
        description: 'Include Social Security benefits for a complete retirement income picture.',
        category: 'calculation',
        priority: 'medium',
        actionType: 'navigate',
        actionUrl: '/wizard',
        triggerCondition: 'social_security_missing',
        generationReason: 'Social Security data missing from calculations',
      },

      // Planning templates
      {
        title: 'Review Early Retirement Options',
        description: 'You may be eligible for early retirement. Review your options and potential benefit impacts.',
        category: 'planning',
        priority: 'medium',
        actionType: 'navigate',
        actionUrl: '/calculator',
        actionData: { focusArea: 'early_retirement' },
        triggerCondition: 'early_retirement_eligible',
        targetAgeRange: '55-65',
        targetServiceRange: '20+',
        generationReason: 'User meets early retirement eligibility',
      },
      {
        title: 'Plan for Retirement Transition',
        description: 'You\'re approaching retirement age. Start planning your transition and benefit timing.',
        category: 'planning',
        priority: 'high',
        actionType: 'learn',
        actionUrl: '/resources/retirement-planning',
        triggerCondition: 'approaching_retirement',
        targetAgeRange: '55+',
        generationReason: 'User is approaching retirement age',
      },

      // Optimization templates
      {
        title: 'Maximize Your Service Credit',
        description: 'Explore opportunities to increase your years of service for higher benefits.',
        category: 'optimization',
        priority: 'medium',
        actionType: 'learn',
        actionUrl: '/resources/service-credit',
        triggerCondition: 'low_service_credit',
        targetAgeRange: '30-60',
        generationReason: 'Low service credit relative to age',
      },
      {
        title: 'Optimize Your Benefit Calculation',
        description: 'Review strategies to maximize your pension benefits before retirement.',
        category: 'optimization',
        priority: 'medium',
        actionType: 'calculate',
        actionUrl: '/calculator',
        actionData: { focusArea: 'optimization' },
        triggerCondition: 'benefit_optimization',
        generationReason: 'Benefit optimization opportunities identified',
      },
      {
        title: 'Review Your Group Classification',
        description: 'Your service history may qualify you for a different retirement group with better benefits.',
        category: 'optimization',
        priority: 'medium',
        actionType: 'contact',
        actionUrl: '/contact',
        actionData: { topic: 'group_classification' },
        triggerCondition: 'group_classification',
        generationReason: 'Potential group classification review needed',
      },

      // Education templates
      {
        title: 'Learn About Retirement Options',
        description: 'Understand your retirement benefit options (Option A, B, C) and survivor benefits.',
        category: 'education',
        priority: 'low',
        actionType: 'learn',
        actionUrl: '/resources/retirement-options',
        triggerCondition: 'retirement_readiness_needs_attention',
        generationReason: 'User needs education on retirement options',
      },
      {
        title: 'Urgent: Address Retirement Planning Gaps',
        description: 'Critical gaps identified in your retirement planning. Take immediate action to secure your future.',
        category: 'planning',
        priority: 'high',
        actionType: 'review',
        actionUrl: '/dashboard',
        triggerCondition: 'retirement_readiness_critical',
        generationReason: 'Critical retirement readiness score',
      },
    ]
  }
}

// Export singleton instance
export const recommendationEngine = RecommendationEngine.getInstance()

// Helper function to calculate years of service
function calculateYearsOfService(membershipDate: Date): number {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - membershipDate.getTime())
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  return Math.floor(diffYears * 10) / 10 // Round to 1 decimal place
}
