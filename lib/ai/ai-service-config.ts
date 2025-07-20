/**
 * AI Service Configuration and Cost Management
 * Massachusetts Retirement System - Blog Automation
 */

import { AIServiceConfig, AIUsageCost } from '@/types/ai-blog'

export const AI_SERVICE_CONFIGS: Record<string, AIServiceConfig> = {
  gemini_pro: {
    provider: 'google',
    model: 'gemini-1.5-pro',
    api_key: process.env.GEMINI_API_KEY || '',
    max_tokens: 8192,
    temperature: 0.7,
    cost_per_token: 0, // Free tier for Gemini
    rate_limit: {
      requests_per_minute: 60,
      tokens_per_minute: 32000
    }
  },
  stability_xl: {
    provider: 'stability',
    model: 'stable-diffusion-xl-1024-v1-0',
    api_key: process.env.STABILITY_API_KEY || '',
    cost_per_token: 0.04, // $0.04 per image for SDXL
    rate_limit: {
      requests_per_minute: 150,
      tokens_per_minute: 150
    }
  }
}

/**
 * Cost estimation for different content types
 */
export const CONTENT_COST_ESTIMATES = {
  blog_post_short: {
    word_count: 500,
    estimated_tokens: 750,
    gemini_cost: 0 // Free tier
  },
  blog_post_medium: {
    word_count: 1000,
    estimated_tokens: 1500,
    gemini_cost: 0 // Free tier
  },
  blog_post_long: {
    word_count: 1500,
    estimated_tokens: 2250,
    gemini_cost: 0 // Free tier
  },
  image_generation: {
    gemini_cost: 0 // Not supported, would need external service
  }
}

/**
 * Monthly budget limits for AI services
 */
export const MONTHLY_BUDGET_LIMITS = {
  total_budget: 200, // $200 per month total
  content_generation: 150, // $150 for content generation
  image_generation: 30, // $30 for images
  fact_checking: 20, // $20 for fact-checking and review
  emergency_buffer: 50 // $50 emergency buffer
}

/**
 * Cost tracking and budget management
 */
export class AICostTracker {
  /**
   * Calculate estimated cost for content generation
   */
  static estimateContentCost(
    wordCount: number,
    model: string = 'gemini-1.5-pro'
  ): number {
    const config = AI_SERVICE_CONFIGS[model] || AI_SERVICE_CONFIGS.gemini_pro
    const estimatedTokens = Math.ceil(wordCount * 1.5) // Rough estimation
    return estimatedTokens * (config.cost_per_token || 0) // Gemini is free
  }

  /**
   * Calculate actual cost from token usage
   */
  static calculateActualCost(
    tokensUsed: number,
    model: string
  ): number {
    const config = AI_SERVICE_CONFIGS[model] || AI_SERVICE_CONFIGS.gemini_pro
    return tokensUsed * (config.cost_per_token || 0) // Gemini is free
  }

  /**
   * Check if request is within budget
   */
  static async checkBudget(
    estimatedCost: number,
    serviceType: 'text_generation' | 'image_generation' | 'fact_checking'
  ): Promise<{ allowed: boolean; reason?: string; remainingBudget: number }> {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const monthlyUsage = await this.getMonthlyUsage(currentMonth)
    
    const totalUsed = monthlyUsage.reduce((sum, usage) => sum + usage.cost_usd, 0)
    const remainingBudget = MONTHLY_BUDGET_LIMITS.total_budget - totalUsed
    
    if (estimatedCost > remainingBudget) {
      return {
        allowed: false,
        reason: `Estimated cost $${estimatedCost.toFixed(4)} exceeds remaining monthly budget $${remainingBudget.toFixed(2)}`,
        remainingBudget
      }
    }

    // Check service-specific limits
    const serviceUsage = monthlyUsage
      .filter(usage => usage.service_type === serviceType)
      .reduce((sum, usage) => sum + usage.cost_usd, 0)

    let serviceLimit = 0
    switch (serviceType) {
      case 'text_generation':
        serviceLimit = MONTHLY_BUDGET_LIMITS.content_generation
        break
      case 'image_generation':
        serviceLimit = MONTHLY_BUDGET_LIMITS.image_generation
        break
      case 'fact_checking':
        serviceLimit = MONTHLY_BUDGET_LIMITS.fact_checking
        break
    }

    if (serviceUsage + estimatedCost > serviceLimit) {
      return {
        allowed: false,
        reason: `Service cost would exceed ${serviceType} budget limit of $${serviceLimit}`,
        remainingBudget
      }
    }

    return { allowed: true, remainingBudget }
  }

  /**
   * Record AI usage cost
   */
  static async recordUsage(usage: Omit<AIUsageCost, 'id' | 'created_at'>): Promise<void> {
    // This would save to the database in a real implementation
    console.log('Recording AI usage:', usage)
  }

  /**
   * Get monthly usage statistics
   */
  static async getMonthlyUsage(month: string): Promise<AIUsageCost[]> {
    // This would fetch from the database in a real implementation
    // For now, return empty array
    return []
  }

  /**
   * Get cost breakdown by service
   */
  static async getCostBreakdown(month: string): Promise<{
    total: number
    by_service: Record<string, number>
    by_provider: Record<string, number>
    daily_breakdown: Record<string, number>
  }> {
    const usage = await this.getMonthlyUsage(month)
    
    const breakdown = {
      total: usage.reduce((sum, u) => sum + u.cost_usd, 0),
      by_service: {} as Record<string, number>,
      by_provider: {} as Record<string, number>,
      daily_breakdown: {} as Record<string, number>
    }

    usage.forEach(u => {
      // By service
      breakdown.by_service[u.service_type] = (breakdown.by_service[u.service_type] || 0) + u.cost_usd
      
      // By provider
      breakdown.by_provider[u.service_provider] = (breakdown.by_provider[u.service_provider] || 0) + u.cost_usd
      
      // By day
      const day = u.date
      breakdown.daily_breakdown[day] = (breakdown.daily_breakdown[day] || 0) + u.cost_usd
    })

    return breakdown
  }

  /**
   * Get recommended model based on budget and requirements
   */
  static getRecommendedModel(
    wordCount: number,
    qualityRequirement: 'basic' | 'standard' | 'premium' = 'standard',
    remainingBudget: number
  ): string {
    const costs = {
      gpt35: this.estimateContentCost(wordCount, 'gpt-3.5-turbo'),
      gpt4: this.estimateContentCost(wordCount, 'gpt-4-turbo-preview'),
      claude_sonnet: this.estimateContentCost(wordCount, 'claude-3-sonnet-20240229'),
      claude_opus: this.estimateContentCost(wordCount, 'claude-3-opus-20240229')
    }

    // If budget is very tight, use GPT-3.5
    if (remainingBudget < 10) {
      return 'gpt-3.5-turbo'
    }

    // Based on quality requirements
    switch (qualityRequirement) {
      case 'basic':
        return costs.gpt35 <= remainingBudget ? 'gpt-3.5-turbo' : 'gpt-3.5-turbo'
      
      case 'standard':
        if (costs.claude_sonnet <= remainingBudget) return 'claude-3-sonnet-20240229'
        if (costs.gpt4 <= remainingBudget) return 'gpt-4-turbo-preview'
        return 'gpt-3.5-turbo'
      
      case 'premium':
        if (costs.claude_opus <= remainingBudget) return 'claude-3-opus-20240229'
        if (costs.gpt4 <= remainingBudget) return 'gpt-4-turbo-preview'
        if (costs.claude_sonnet <= remainingBudget) return 'claude-3-sonnet-20240229'
        return 'gpt-3.5-turbo'
      
      default:
        return 'gpt-4-turbo-preview'
    }
  }

  /**
   * Generate cost report
   */
  static async generateCostReport(month: string): Promise<{
    summary: {
      total_cost: number
      total_requests: number
      average_cost_per_request: number
      budget_utilization: number
    }
    breakdown: any
    recommendations: string[]
  }> {
    const breakdown = await this.getCostBreakdown(month)
    const usage = await this.getMonthlyUsage(month)
    
    const summary = {
      total_cost: breakdown.total,
      total_requests: usage.length,
      average_cost_per_request: usage.length > 0 ? breakdown.total / usage.length : 0,
      budget_utilization: (breakdown.total / MONTHLY_BUDGET_LIMITS.total_budget) * 100
    }

    const recommendations: string[] = []
    
    if (summary.budget_utilization > 80) {
      recommendations.push('Budget utilization is high. Consider using more cost-effective models.')
    }
    
    if (summary.average_cost_per_request > 0.10) {
      recommendations.push('Average cost per request is high. Review content length and model selection.')
    }
    
    if (breakdown.by_service.image_generation > MONTHLY_BUDGET_LIMITS.image_generation * 0.8) {
      recommendations.push('Image generation costs are approaching budget limit.')
    }

    return {
      summary,
      breakdown,
      recommendations
    }
  }
}

/**
 * Rate limiting for AI services
 */
export class AIRateLimiter {
  private static requestCounts: Record<string, { count: number; resetTime: number }> = {}

  /**
   * Check if request is within rate limits
   */
  static checkRateLimit(model: string): { allowed: boolean; resetTime?: number } {
    const config = AI_SERVICE_CONFIGS[model]
    if (!config?.rate_limit) return { allowed: true }

    const now = Date.now()
    const key = `${model}_requests`
    const current = this.requestCounts[key]

    // Reset if minute has passed
    if (!current || now >= current.resetTime) {
      this.requestCounts[key] = {
        count: 1,
        resetTime: now + 60000 // 1 minute from now
      }
      return { allowed: true }
    }

    // Check if within limit
    if (current.count >= config.rate_limit.requests_per_minute) {
      return { allowed: false, resetTime: current.resetTime }
    }

    // Increment count
    current.count++
    return { allowed: true }
  }

  /**
   * Get time until rate limit reset
   */
  static getResetTime(model: string): number {
    const key = `${model}_requests`
    const current = this.requestCounts[key]
    return current ? Math.max(0, current.resetTime - Date.now()) : 0
  }
}
