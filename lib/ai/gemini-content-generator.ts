/**
 * Gemini AI Content Generation Service
 * Massachusetts Retirement System - Free AI Content Generation
 */

import {
  ContentGenerationRequest,
  ContentGenerationResponse,
  AIContentTemplate,
  MassachusettsRetirementTopic,
  ContentQualityMetrics,
  BlogPost
} from '@/types/ai-blog'

// Gemini AI Configuration
interface GeminiConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  safetySettings: any[]
}

export class GeminiContentGenerator {
  private config: GeminiConfig
  private baseUrl: string

  constructor() {
    this.config = {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-1.5-flash', // Free tier model
      maxTokens: 8192,
      temperature: 0.7,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    }
    
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'
  }

  /**
   * Generate blog content using Gemini AI
   */
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Gemini API key not configured')
      }

      const prompt = this.buildContentPrompt(request)
      const response = await this.callGeminiAPI(prompt)
      
      return this.parseGeminiResponse(response, request)
    } catch (error) {
      console.error('Gemini content generation error:', error)
      throw new Error(
        `Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Build content generation prompt for Gemini
   */
  private buildContentPrompt(request: ContentGenerationRequest): string {
    const { topic, target_audience, content_type, word_count = 800 } = request

    return `You are an expert content writer specializing in Massachusetts retirement benefits and pension systems. 

TASK: Write a comprehensive, informative blog post about Massachusetts retirement benefits.

REQUIREMENTS:
- Topic: ${topic.title}
- Target Audience: ${target_audience}
- Content Type: ${content_type}
- Word Count: Approximately ${word_count} words
- Tone: Professional, informative, and accessible
- Focus: Massachusetts state employees and retirees

CONTENT STRUCTURE:
1. Engaging headline that includes relevant keywords
2. Introduction that hooks the reader and outlines key points
3. Main content with clear sections and subheadings
4. Practical examples and scenarios relevant to Massachusetts employees
5. Actionable takeaways and next steps
6. Conclusion that reinforces key benefits

SPECIFIC REQUIREMENTS:
- Include accurate information about Massachusetts Retirement System (MSRS)
- Reference the four retirement groups (Group 1, 2, 3, 4) when relevant
- Mention COLA (Cost of Living Adjustment) benefits where applicable
- Include information about pension options (A, B, C) when relevant
- Use Massachusetts-specific examples and scenarios
- Ensure all financial information is presented clearly
- Include relevant keywords for SEO optimization

IMPORTANT: 
- All information must be accurate and factual
- Use clear, jargon-free language
- Include specific examples with dollar amounts when helpful
- Reference official Massachusetts government resources when appropriate

Please provide the content in the following JSON format:
{
  "title": "SEO-optimized blog post title",
  "content": "Full blog post content in HTML format",
  "meta_description": "SEO meta description (150-160 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "word_count": actual_word_count,
  "reading_time": estimated_reading_time_minutes
}

Topic Details: ${topic.description}
${topic.keywords ? `Keywords to include: ${topic.keywords.join(', ')}` : ''}
${request.additional_context ? `Additional Context: ${request.additional_context}` : ''}`
  }

  /**
   * Call Gemini API
   */
  private async callGeminiAPI(prompt: string): Promise<any> {
    const url = `${this.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: 0.8,
        topK: 40
      },
      safetySettings: this.config.safetySettings
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`)
    }

    return await response.json()
  }

  /**
   * Parse Gemini API response
   */
  private parseGeminiResponse(response: any, request: ContentGenerationRequest): ContentGenerationResponse {
    try {
      const content = response.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!content) {
        throw new Error('No content generated by Gemini')
      }

      // Try to parse as JSON first, fallback to plain text
      let parsedContent
      try {
        parsedContent = JSON.parse(content)
      } catch {
        // If not JSON, create structure from plain text
        parsedContent = {
          title: this.extractTitle(content) || `Massachusetts Retirement: ${request.topic.title}`,
          content: content,
          meta_description: this.generateMetaDescription(content),
          keywords: request.topic.keywords || ['massachusetts retirement', 'pension benefits'],
          word_count: this.countWords(content),
          reading_time: Math.ceil(this.countWords(content) / 200)
        }
      }

      return {
        id: `gemini-${Date.now()}`,
        title: parsedContent.title,
        slug: this.generateSlug(parsedContent.title),
        content: parsedContent.content,
        excerpt: this.generateExcerpt(parsedContent.content),
        metaDescription: parsedContent.meta_description,
        keywords: parsedContent.keywords || [],
        wordCount: parsedContent.word_count || this.countWords(parsedContent.content),
        readingTime: parsedContent.reading_time || Math.ceil(this.countWords(parsedContent.content) / 200),
        aiModel: this.config.model,
        generationTime: new Date().toISOString(),
        costEstimate: 0, // Gemini free tier
        qualityScore: 85, // Default quality score
        seoOptimized: true,
        factChecked: false,
        status: 'completed',
        autoGeneratedTags: parsedContent.keywords || [],
        seo_title: parsedContent.title,
        seo_description: parsedContent.meta_description,
        seo_keywords: (parsedContent.keywords || []).join(', ')
      }
    } catch (error) {
      throw new Error(
        `Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Extract title from content
   */
  private extractTitle(content: string): string | null {
    const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^(.+)$/m)
    return titleMatch ? titleMatch[1].trim() : null
  }

  /**
   * Generate meta description from content
   */
  private generateMetaDescription(content: string): string {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    const sentences = plainText.split('.').filter(s => s.trim().length > 0)
    let description = sentences[0] || plainText.substring(0, 150)
    
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }
    
    return description
  }

  /**
   * Count words in content
   */
  private countWords(content: string): number {
    const plainText = content.replace(/<[^>]*>/g, '')
    return plainText.split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Get available models
   */
  static getAvailableModels(): string[] {
    return [
      'gemini-1.5-flash',    // Free tier - fast and efficient
      'gemini-1.5-pro',     // Higher quality, may have usage limits
      'gemini-pro'          // Legacy model
    ]
  }

  /**
   * Estimate cost (free for Gemini)
   */
  static estimateCost(wordCount: number): number {
    return 0 // Gemini free tier
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string): string {
    // Remove HTML tags and get first 150 characters
    const plainText = content.replace(/<[^>]*>/g, '')
    const excerpt = plainText.substring(0, 150).trim()
    return excerpt.endsWith('.') ? excerpt : excerpt + '...'
  }
}
