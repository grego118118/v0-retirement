/**
 * Random Content Generation API
 * Massachusetts Retirement System - Random Blog Generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { getRandomTopic } from '@/lib/ai/massachusetts-topics'

/**
 * POST /api/admin/blog/generate/random
 * Generate content for a random topic
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`
    
    if (!isAuthorizedCron && !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      category,
      complexity,
      group,
      ai_model = 'gemini-1.5-pro',
      word_count = 1000
    } = body

    // Get random topic based on filters
    const randomTopic = getRandomTopic({
      category,
      complexity,
      group
    })

    // Generate content using the random topic by calling the main generate endpoint
    const generateUrl = new URL('/api/admin/blog/generate', request.url)
    const generateRequest = new Request(generateUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || ''
      },
      body: JSON.stringify({
        topic: {
          title: randomTopic.title,
          description: randomTopic.description,
          keywords: randomTopic.keywords
        },
        category_id: randomTopic.category,
        ai_model,
        word_count,
        seo_keywords: randomTopic.keywords,
        auto_publish: false
      })
    })

    // Forward the request to the main generate endpoint
    const response = await fetch(generateRequest)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Content generation failed')
    }

    return NextResponse.json({
      ...result,
      random_topic: randomTopic
    })

  } catch (error) {
    console.error('Random content generation error:', error)
    return NextResponse.json(
      { 
        error: 'Random content generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
