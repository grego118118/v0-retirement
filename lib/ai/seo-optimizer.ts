/**
 * SEO Optimization and Internal Linking System
 * Massachusetts Retirement System - Blog SEO Enhancement
 */

import { SEOOptimization } from '@/types/ai-blog'

export class SEOOptimizer {
  /**
   * Optimize content for SEO
   */
  static async optimizeContent(
    content: string,
    title: string,
    targetKeywords: string[] = []
  ): Promise<{
    optimized_content: string
    seo_optimization: SEOOptimization
    improvements_made: string[]
  }> {
    let optimizedContent = content
    const improvementsMade: string[] = []

    // Generate SEO metadata
    const seoOptimization = await this.generateSEOMetadata(content, title, targetKeywords)

    // Add internal links
    const linkingResult = this.addInternalLinks(optimizedContent)
    optimizedContent = linkingResult.content
    if (linkingResult.links_added > 0) {
      improvementsMade.push(`Added ${linkingResult.links_added} internal links`)
    }

    // Optimize headings for SEO
    const headingResult = this.optimizeHeadings(optimizedContent, targetKeywords)
    optimizedContent = headingResult.content
    if (headingResult.improvements > 0) {
      improvementsMade.push(`Optimized ${headingResult.improvements} headings for SEO`)
    }

    // Add schema markup suggestions
    const schemaMarkup = this.generateSchemaMarkup(title, content)
    if (schemaMarkup) {
      improvementsMade.push('Generated schema markup for better search visibility')
    }

    // Optimize for featured snippets
    const snippetResult = this.optimizeForFeaturedSnippets(optimizedContent)
    optimizedContent = snippetResult.content
    if (snippetResult.optimizations > 0) {
      improvementsMade.push(`Added ${snippetResult.optimizations} featured snippet optimizations`)
    }

    return {
      optimized_content: optimizedContent,
      seo_optimization: seoOptimization,
      improvements_made: improvementsMade
    }
  }

  /**
   * Generate comprehensive SEO metadata
   */
  private static async generateSEOMetadata(
    content: string,
    title: string,
    targetKeywords: string[]
  ): Promise<SEOOptimization> {
    // Extract existing keywords from content
    const extractedKeywords = this.extractKeywords(content)
    
    // Combine target and extracted keywords
    const allKeywords = [...new Set([...targetKeywords, ...extractedKeywords])]

    // Generate meta title (optimized for 60 characters)
    const metaTitle = this.generateMetaTitle(title, allKeywords)

    // Generate meta description (optimized for 160 characters)
    const metaDescription = this.generateMetaDescription(content, allKeywords)

    // Find internal linking opportunities
    const internalLinks = this.findInternalLinkOpportunities(content)

    // Find external linking opportunities
    const externalLinks = this.findExternalLinkOpportunities(content)

    // Calculate keyword density
    const keywordDensity = this.calculateKeywordDensity(content, allKeywords)

    // Generate readability improvements
    const readabilityImprovements = this.generateReadabilityImprovements(content)

    return {
      target_keywords: allKeywords.slice(0, 10), // Top 10 keywords
      meta_title: metaTitle,
      meta_description: metaDescription,
      internal_links: internalLinks,
      external_links: externalLinks,
      readability_improvements: readabilityImprovements,
      keyword_density: keywordDensity
    }
  }

  /**
   * Generate optimized meta title
   */
  private static generateMetaTitle(title: string, keywords: string[]): string {
    let metaTitle = title

    // Ensure primary keyword is in title
    const primaryKeyword = keywords.find(k => k.toLowerCase().includes('massachusetts'))
    if (primaryKeyword && !title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      metaTitle = `${title} | ${primaryKeyword}`
    }

    // Truncate if too long
    if (metaTitle.length > 60) {
      metaTitle = metaTitle.substring(0, 57) + '...'
    }

    return metaTitle
  }

  /**
   * Generate optimized meta description
   */
  private static generateMetaDescription(content: string, keywords: string[]): string {
    // Extract first paragraph or first 160 characters
    const firstParagraph = content.split('\n\n')[1] || content.substring(0, 300)
    let description = firstParagraph.replace(/[#*]/g, '').trim()

    // Ensure primary keywords are included
    const primaryKeywords = keywords.slice(0, 3)
    const missingKeywords = primaryKeywords.filter(k => 
      !description.toLowerCase().includes(k.toLowerCase())
    )

    if (missingKeywords.length > 0 && description.length < 120) {
      description += ` Learn about ${missingKeywords.join(', ')}.`
    }

    // Truncate to 160 characters
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }

    return description
  }

  /**
   * Add internal links to content
   */
  private static addInternalLinks(content: string): { content: string; links_added: number } {
    let modifiedContent = content
    let linksAdded = 0

    // Define internal link opportunities
    const linkOpportunities = [
      {
        keywords: ['pension calculator', 'calculate pension', 'estimate benefits'],
        url: '/calculator',
        anchor: 'Massachusetts Pension Calculator'
      },
      {
        keywords: ['group 1', 'group one', 'general employees'],
        url: '/groups/group-1',
        anchor: 'Group 1 retirement benefits'
      },
      {
        keywords: ['group 2', 'group two', 'probation officers'],
        url: '/groups/group-2',
        anchor: 'Group 2 retirement benefits'
      },
      {
        keywords: ['group 3', 'group three', 'state police'],
        url: '/groups/group-3',
        anchor: 'Group 3 retirement benefits'
      },
      {
        keywords: ['group 4', 'group four', 'public safety'],
        url: '/groups/group-4',
        anchor: 'Group 4 retirement benefits'
      },
      {
        keywords: ['cola', 'cost of living adjustment', 'cola calculator'],
        url: '/cola-calculator',
        anchor: 'COLA calculator'
      },
      {
        keywords: ['social security', 'social security benefits', 'wep', 'gpo'],
        url: '/social-security',
        anchor: 'Social Security coordination'
      },
      {
        keywords: ['retirement planning', 'financial planning', 'retirement guide'],
        url: '/guides',
        anchor: 'retirement planning guides'
      },
      {
        keywords: ['benefit options', 'pension options', 'option a', 'option b', 'option c'],
        url: '/benefits',
        anchor: 'pension benefit options'
      }
    ]

    // Add links for each opportunity (max 1 per keyword set)
    linkOpportunities.forEach(opportunity => {
      let linkAdded = false
      
      opportunity.keywords.forEach(keyword => {
        if (linkAdded) return
        
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        const match = modifiedContent.match(regex)
        
        if (match && !modifiedContent.includes(`[${match[0]}]`)) {
          // Replace first occurrence with link
          modifiedContent = modifiedContent.replace(
            regex,
            `[${match[0]}](${opportunity.url})`
          )
          linksAdded++
          linkAdded = true
        }
      })
    })

    return { content: modifiedContent, links_added: linksAdded }
  }

  /**
   * Optimize headings for SEO
   */
  private static optimizeHeadings(content: string, keywords: string[]): { content: string; improvements: number } {
    let modifiedContent = content
    let improvements = 0

    // Find all headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings = [...modifiedContent.matchAll(headingRegex)]

    headings.forEach(match => {
      const level = match[1]
      const headingText = match[2]
      const fullMatch = match[0]

      // Check if heading contains target keywords
      const hasKeyword = keywords.some(keyword => 
        headingText.toLowerCase().includes(keyword.toLowerCase())
      )

      // If no keyword and it's a major heading (H2 or H3), try to add one
      if (!hasKeyword && (level === '##' || level === '###')) {
        const relevantKeyword = keywords.find(k => 
          k.toLowerCase().includes('massachusetts') || 
          k.toLowerCase().includes('retirement') ||
          k.toLowerCase().includes('pension')
        )

        if (relevantKeyword && headingText.length < 50) {
          const optimizedHeading = `${level} ${headingText} for Massachusetts Employees`
          modifiedContent = modifiedContent.replace(fullMatch, optimizedHeading)
          improvements++
        }
      }
    })

    return { content: modifiedContent, improvements }
  }

  /**
   * Optimize content for featured snippets
   */
  private static optimizeForFeaturedSnippets(content: string): { content: string; optimizations: number } {
    let modifiedContent = content
    let optimizations = 0

    // Add FAQ-style sections for common questions
    const faqOpportunities = [
      {
        question: 'What is the minimum retirement age for Massachusetts public employees?',
        pattern: /minimum retirement age/i,
        answer: 'The minimum retirement age varies by group: Group 1 (age 60), Group 2 (age 55), Group 3 (any age with 20+ years), and Group 4 (age 50).'
      },
      {
        question: 'How is the Massachusetts COLA calculated?',
        pattern: /cola.*calculation|cost of living adjustment/i,
        answer: 'Massachusetts COLA is 3% annually applied to the first $13,000 of your annual pension benefit, with a maximum increase of $390 per year.'
      },
      {
        question: 'What is the maximum pension benefit in Massachusetts?',
        pattern: /maximum.*benefit|80%/i,
        answer: 'The maximum pension benefit is 80% of your average salary, calculated before any Option B or C reductions for survivor benefits.'
      }
    ]

    faqOpportunities.forEach(faq => {
      if (faq.pattern.test(content) && !content.includes(faq.question)) {
        // Add FAQ section if the topic is mentioned but not clearly answered
        const faqSection = `\n\n### ${faq.question}\n\n${faq.answer}\n`
        modifiedContent += faqSection
        optimizations++
      }
    })

    return { content: modifiedContent, optimizations }
  }

  /**
   * Find internal link opportunities
   */
  private static findInternalLinkOpportunities(content: string): SEOOptimization['internal_links'] {
    const opportunities: SEOOptimization['internal_links'] = []

    const linkMappings = [
      { pattern: /pension calculator|calculate.*pension/gi, url: '/calculator', anchor: 'pension calculator' },
      { pattern: /group 1|general employees/gi, url: '/groups/group-1', anchor: 'Group 1 benefits' },
      { pattern: /group 4|public safety/gi, url: '/groups/group-4', anchor: 'Group 4 benefits' },
      { pattern: /cola|cost of living/gi, url: '/cola-calculator', anchor: 'COLA calculator' },
      { pattern: /social security/gi, url: '/social-security', anchor: 'Social Security coordination' }
    ]

    linkMappings.forEach(mapping => {
      const matches = [...content.matchAll(mapping.pattern)]
      matches.forEach(match => {
        if (match.index !== undefined) {
          const context = content.substring(
            Math.max(0, match.index - 50),
            Math.min(content.length, match.index + match[0].length + 50)
          )
          
          opportunities.push({
            anchor_text: mapping.anchor,
            target_url: mapping.url,
            context: context.trim()
          })
        }
      })
    })

    return opportunities.slice(0, 10) // Limit to 10 opportunities
  }

  /**
   * Find external link opportunities
   */
  private static findExternalLinkOpportunities(content: string): SEOOptimization['external_links'] {
    const opportunities: SEOOptimization['external_links'] = []

    const externalMappings = [
      { 
        pattern: /massachusetts state retirement board|msrb/gi, 
        url: 'https://www.mass.gov/orgs/massachusetts-state-retirement-board',
        anchor: 'Massachusetts State Retirement Board',
        domain: 'mass.gov'
      },
      { 
        pattern: /social security administration|ssa/gi, 
        url: 'https://www.ssa.gov',
        anchor: 'Social Security Administration',
        domain: 'ssa.gov'
      },
      { 
        pattern: /teachers retirement|mtrs/gi, 
        url: 'https://www.mass.gov/orgs/massachusetts-teachers-retirement-system',
        anchor: 'Massachusetts Teachers Retirement System',
        domain: 'mass.gov'
      }
    ]

    externalMappings.forEach(mapping => {
      const matches = [...content.matchAll(mapping.pattern)]
      if (matches.length > 0) {
        opportunities.push({
          anchor_text: mapping.anchor,
          target_url: mapping.url,
          domain: mapping.domain
        })
      }
    })

    return opportunities
  }

  /**
   * Extract keywords from content
   */
  private static extractKeywords(content: string): string[] {
    const text = content.toLowerCase()
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    
    // Massachusetts retirement specific keywords
    const retirementKeywords = [
      'massachusetts pension', 'massachusetts retirement', 'public employee benefits',
      'group 1', 'group 2', 'group 3', 'group 4',
      'cola', 'cost of living adjustment', 'pension calculator',
      'retirement age', 'benefit calculation', 'social security',
      'pension options', 'survivor benefits', 'early retirement'
    ]

    const foundKeywords = retirementKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    )

    return foundKeywords
  }

  /**
   * Calculate keyword density
   */
  private static calculateKeywordDensity(content: string, keywords: string[]): Record<string, number> {
    const wordCount = content.split(/\s+/).length
    const density: Record<string, number> = {}

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi')
      const matches = content.match(regex) || []
      density[keyword] = (matches.length / wordCount) * 100
    })

    return density
  }

  /**
   * Generate readability improvements
   */
  private static generateReadabilityImprovements(content: string): string[] {
    const improvements: string[] = []
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = content.split(/\s+/).length / sentences.length

    if (avgSentenceLength > 20) {
      improvements.push('Consider breaking up long sentences for better readability')
    }

    if (!content.includes('##')) {
      improvements.push('Add subheadings to improve content structure')
    }

    if (!content.includes('- ') && !content.includes('* ')) {
      improvements.push('Consider adding bullet points or lists for better scanability')
    }

    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
    const avgParagraphLength = content.length / paragraphs.length

    if (avgParagraphLength > 500) {
      improvements.push('Break up long paragraphs for better readability')
    }

    return improvements
  }

  /**
   * Generate schema markup for blog posts
   */
  private static generateSchemaMarkup(title: string, content: string): object | null {
    try {
      const wordCount = content.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200) // Average reading speed

      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": content.substring(0, 160),
        "author": {
          "@type": "Organization",
          "name": "Massachusetts Pension Calculator"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Mass Pension",
          "url": "https://www.masspension.com"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://www.masspension.com/blog"
        },
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "wordCount": wordCount,
        "timeRequired": `PT${readingTime}M`,
        "about": {
          "@type": "Thing",
          "name": "Massachusetts Retirement Benefits"
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "Massachusetts Public Employees"
        }
      }
    } catch (error) {
      console.error('Error generating schema markup:', error)
      return null
    }
  }
}
