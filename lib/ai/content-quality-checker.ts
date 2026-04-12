/**
 * Content Quality Assessment System
 * Massachusetts Retirement System - AI Content Validation
 */

import { ContentQualityMetrics, FactCheckResult, FactCheckReport } from '@/types/ai-blog'

export class ContentQualityChecker {
  /**
   * Assess overall content quality
   */
  static async assessContentQuality(content: string, title: string): Promise<ContentQualityMetrics> {
    const metrics: ContentQualityMetrics = {
      readability_score: this.calculateReadabilityScore(content),
      seo_score: this.calculateSEOScore(content, title),
      fact_accuracy_score: await this.assessFactAccuracy(content),
      engagement_potential: this.calculateEngagementPotential(content, title),
      massachusetts_relevance: this.calculateMassachusettsRelevance(content),
      overall_quality: 0,
      improvement_suggestions: []
    }

    // Calculate overall quality (weighted average)
    metrics.overall_quality = Math.round(
      (metrics.readability_score * 0.2) +
      (metrics.seo_score * 0.2) +
      (metrics.fact_accuracy_score * 0.3) +
      (metrics.engagement_potential * 0.15) +
      (metrics.massachusetts_relevance * 0.15)
    )

    // Generate improvement suggestions
    metrics.improvement_suggestions = this.generateImprovementSuggestions(metrics)

    return metrics
  }

  /**
   * Calculate readability score using Flesch Reading Ease approximation
   */
  private static calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/).filter(w => w.length > 0)
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0)

    if (sentences.length === 0 || words.length === 0) return 0

    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length

    // Simplified Flesch Reading Ease formula
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    
    // Convert to 0-100 scale where higher is better
    return Math.max(0, Math.min(100, Math.round(fleschScore)))
  }

  /**
   * Count syllables in a word (approximation)
   */
  private static countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    const vowels = word.match(/[aeiouy]+/g)
    let syllableCount = vowels ? vowels.length : 1
    
    // Adjust for silent e
    if (word.endsWith('e')) syllableCount--
    
    return Math.max(1, syllableCount)
  }

  /**
   * Calculate SEO score based on various factors
   */
  private static calculateSEOScore(content: string, title: string): number {
    let score = 0
    const contentLower = content.toLowerCase()
    const titleLower = title.toLowerCase()

    // Title optimization (20 points)
    if (title.length >= 30 && title.length <= 60) score += 10
    if (titleLower.includes('massachusetts')) score += 5
    if (titleLower.includes('retirement') || titleLower.includes('pension')) score += 5

    // Content length (20 points)
    const wordCount = content.split(/\s+/).length
    if (wordCount >= 800 && wordCount <= 2000) score += 20
    else if (wordCount >= 500) score += 10

    // Keyword density (20 points)
    const massachusettsCount = (contentLower.match(/massachusetts/g) || []).length
    const retirementCount = (contentLower.match(/retirement|pension/g) || []).length
    const keywordDensity = (massachusettsCount + retirementCount) / wordCount * 100

    if (keywordDensity >= 1 && keywordDensity <= 3) score += 20
    else if (keywordDensity >= 0.5 && keywordDensity <= 5) score += 10

    // Structure (20 points)
    if (content.includes('##')) score += 10 // Has subheadings
    if (content.includes('- ') || content.includes('* ')) score += 5 // Has lists
    if (content.includes('**') || content.includes('*')) score += 5 // Has emphasis

    // Internal linking opportunities (20 points)
    const linkOpportunities = [
      '/calculator', 'calculator', 'pension calculator',
      'group 1', 'group 2', 'group 3', 'group 4',
      'cola', 'social security', 'benefits'
    ]
    
    const foundOpportunities = linkOpportunities.filter(term => 
      contentLower.includes(term.toLowerCase())
    ).length

    score += Math.min(20, foundOpportunities * 3)

    return Math.min(100, score)
  }

  /**
   * Assess fact accuracy (simplified version)
   */
  private static async assessFactAccuracy(content: string): Promise<number> {
    let score = 70 // Base score assuming generally accurate AI content

    const contentLower = content.toLowerCase()

    // Check for Massachusetts-specific facts
    const factChecks = [
      {
        pattern: /group 1.*age 60/i,
        correct: true,
        weight: 5
      },
      {
        pattern: /group 4.*age 50/i,
        correct: true,
        weight: 5
      },
      {
        pattern: /cola.*3%/i,
        correct: true,
        weight: 5
      },
      {
        pattern: /cola.*\$13,000/i,
        correct: true,
        weight: 5
      },
      {
        pattern: /maximum.*80%/i,
        correct: true,
        weight: 5
      },
      {
        pattern: /highest 3.*years/i,
        correct: true,
        weight: 5
      }
    ]

    factChecks.forEach(check => {
      if (check.pattern.test(content)) {
        score += check.correct ? check.weight : -check.weight * 2
      }
    })

    // Penalty for potentially incorrect information
    const redFlags = [
      /group 1.*age 55/i, // Incorrect minimum age
      /cola.*2%/i, // Incorrect COLA rate
      /maximum.*90%/i, // Incorrect maximum benefit
      /highest 5.*years/i // Incorrect average salary period
    ]

    redFlags.forEach(flag => {
      if (flag.test(content)) {
        score -= 15
      }
    })

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate engagement potential
   */
  private static calculateEngagementPotential(content: string, title: string): number {
    let score = 0

    // Title engagement (25 points)
    const titleLower = title.toLowerCase()
    const engagingWords = ['complete', 'guide', 'maximize', 'strategy', 'ultimate', 'comprehensive']
    const foundEngagingWords = engagingWords.filter(word => titleLower.includes(word)).length
    score += Math.min(15, foundEngagingWords * 3)

    if (title.includes('?')) score += 5 // Question in title
    if (title.includes(':')) score += 5 // Descriptive subtitle

    // Content engagement (75 points)
    const contentLower = content.toLowerCase()

    // Actionable content (25 points)
    const actionWords = ['calculate', 'plan', 'consider', 'review', 'contact', 'apply', 'use']
    const foundActionWords = actionWords.filter(word => contentLower.includes(word)).length
    score += Math.min(25, foundActionWords * 3)

    // Examples and specificity (25 points)
    if (contentLower.includes('example')) score += 10
    if (contentLower.includes('$')) score += 10 // Dollar amounts
    if (contentLower.includes('%')) score += 5 // Percentages

    // Call-to-action (25 points)
    if (contentLower.includes('calculator')) score += 15
    if (contentLower.includes('contact')) score += 5
    if (contentLower.includes('learn more')) score += 5

    return Math.min(100, score)
  }

  /**
   * Calculate Massachusetts relevance score
   */
  private static calculateMassachusettsRelevance(content: string): number {
    let score = 0
    const contentLower = content.toLowerCase()

    // Massachusetts mentions (30 points)
    const massachusettsCount = (contentLower.match(/massachusetts/g) || []).length
    score += Math.min(30, massachusettsCount * 5)

    // System-specific terms (40 points)
    const systemTerms = [
      'msrb', 'massachusetts state retirement board',
      'mtrs', 'massachusetts teachers retirement',
      'group 1', 'group 2', 'group 3', 'group 4',
      'mass.gov'
    ]
    
    const foundTerms = systemTerms.filter(term => contentLower.includes(term)).length
    score += Math.min(40, foundTerms * 8)

    // Local context (30 points)
    const localTerms = [
      'public employee', 'state employee', 'municipal',
      'teacher', 'police', 'firefighter', 'state police'
    ]
    
    const foundLocalTerms = localTerms.filter(term => contentLower.includes(term)).length
    score += Math.min(30, foundLocalTerms * 5)

    return Math.min(100, score)
  }

  /**
   * Generate improvement suggestions based on metrics
   */
  private static generateImprovementSuggestions(metrics: ContentQualityMetrics): string[] {
    const suggestions: string[] = []

    if (metrics.readability_score < 60) {
      suggestions.push('Improve readability by using shorter sentences and simpler words')
    }

    if (metrics.seo_score < 70) {
      suggestions.push('Add more relevant keywords and improve content structure with headings')
    }

    if (metrics.fact_accuracy_score < 80) {
      suggestions.push('Review factual accuracy, especially Massachusetts-specific regulations')
    }

    if (metrics.engagement_potential < 60) {
      suggestions.push('Add more actionable advice and specific examples')
    }

    if (metrics.massachusetts_relevance < 70) {
      suggestions.push('Include more Massachusetts-specific context and terminology')
    }

    if (metrics.overall_quality < 70) {
      suggestions.push('Consider significant revision or regeneration of content')
    }

    return suggestions
  }

  /**
   * Perform fact-checking against known Massachusetts retirement facts
   */
  static async performFactCheck(content: string): Promise<FactCheckReport> {
    const claims: FactCheckResult[] = []

    // Define known facts to check
    const knownFacts = [
      {
        pattern: /group 1.*minimum.*age.*60/i,
        claim: 'Group 1 minimum retirement age is 60',
        status: 'verified' as const,
        sources: ['MSRB Group 1 regulations'],
        confidence: 100
      },
      {
        pattern: /group 4.*minimum.*age.*50/i,
        claim: 'Group 4 minimum retirement age is 50',
        status: 'verified' as const,
        sources: ['MSRB Group 4 regulations'],
        confidence: 100
      },
      {
        pattern: /cola.*3%.*\$13,000/i,
        claim: 'COLA is 3% applied to first $13,000 of annual benefit',
        status: 'verified' as const,
        sources: ['MSRB COLA guidelines'],
        confidence: 100
      },
      {
        pattern: /maximum.*benefit.*80%/i,
        claim: 'Maximum benefit is 80% of average salary',
        status: 'verified' as const,
        sources: ['MSRB benefit calculation rules'],
        confidence: 100
      }
    ]

    // Check each known fact
    knownFacts.forEach(fact => {
      if (fact.pattern.test(content)) {
        claims.push({
          claim: fact.claim,
          verification_status: fact.status,
          sources: fact.sources,
          confidence_score: fact.confidence
        })
      }
    })

    // Check for potential inaccuracies
    const inaccuracies = [
      {
        pattern: /group 1.*age 55/i,
        claim: 'Group 1 minimum retirement age stated as 55',
        status: 'false' as const,
        notes: 'Group 1 minimum retirement age is 60, not 55'
      },
      {
        pattern: /cola.*2%/i,
        claim: 'COLA rate stated as 2%',
        status: 'false' as const,
        notes: 'Massachusetts COLA rate is 3%, not 2%'
      }
    ]

    inaccuracies.forEach(inaccuracy => {
      if (inaccuracy.pattern.test(content)) {
        claims.push({
          claim: inaccuracy.claim,
          verification_status: inaccuracy.status,
          sources: ['MSRB official regulations'],
          confidence_score: 95,
          notes: inaccuracy.notes
        })
      }
    })

    const flaggedContent: string[] = []
    const recommendedChanges: string[] = []

    // Identify flagged content and recommendations
    claims.forEach(claim => {
      if (claim.verification_status === 'false' || claim.verification_status === 'disputed') {
        flaggedContent.push(claim.claim)
        if (claim.notes) {
          recommendedChanges.push(claim.notes)
        }
      }
    })

    const overallAccuracy = claims.length > 0 
      ? claims.reduce((sum, claim) => sum + claim.confidence_score, 0) / claims.length
      : 85 // Default score if no specific claims found

    return {
      post_id: '', // Will be set by caller
      claims_checked: claims,
      overall_accuracy: overallAccuracy,
      flagged_content: flaggedContent,
      recommended_changes: recommendedChanges,
      checked_at: new Date().toISOString(),
      checker_id: 'system'
    }
  }
}
