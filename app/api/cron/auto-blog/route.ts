/**
 * Simple Auto-Blog Generator
 * Generates one Massachusetts retirement blog post per run using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase client for direct database access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://omiqpphkibfqddmwruuc.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Blog topics rotation
const TOPICS = [
  { title: 'Massachusetts COLA Benefits Explained', keywords: ['COLA', 'cost of living', 'pension adjustment'] },
  { title: 'Understanding Retirement Group Classifications', keywords: ['Group 1', 'Group 2', 'Group 3', 'Group 4'] },
  { title: 'Pension Options A, B, and C Comparison', keywords: ['Option A', 'Option B', 'Option C', 'survivor benefits'] },
  { title: 'Maximizing Your State Pension Benefits', keywords: ['pension maximization', 'retirement planning'] },
  { title: 'Social Security and Massachusetts Pensions', keywords: ['WEP', 'GPO', 'Social Security'] },
  { title: 'Early Retirement Options for State Employees', keywords: ['early retirement', 'superannuation'] },
  { title: 'Health Insurance in Retirement', keywords: ['GIC', 'Medicare', 'health benefits'] },
  { title: 'Creditable Service and Buyback Options', keywords: ['creditable service', 'buyback', 'military service'] },
]

export async function GET(request: NextRequest) {
  // Auth check - accept Vercel cron or Bearer token
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Pick a random topic
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
    
    // Generate content with Gemini
    const content = await generateWithGemini(topic)
    if (!content) {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }

    // Save to database
    const slug = generateSlug(content.title)
    const { data, error } = await supabase.from('blog_posts').insert({
      id: slug,
      title: content.title,
      slug: slug,
      content: content.body,
      excerpt: content.excerpt,
      status: 'draft', // Always draft for review
      isAiGenerated: true,
      aiModelUsed: 'gemini-1.5-flash',
      factCheckStatus: 'pending',
      seoDescription: content.excerpt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save post', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Blog post generated',
      post: { id: data.id, title: data.title, status: data.status }
    })

  } catch (error) {
    console.error('Auto-blog error:', error)
    return NextResponse.json({ 
      error: 'Generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

async function generateWithGemini(topic: { title: string; keywords: string[] }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const prompt = `Write a 600-word blog post for Massachusetts state employees about: ${topic.title}

Requirements:
- Professional, informative tone
- Include practical examples
- Reference Massachusetts Retirement System specifics
- Keywords to include: ${topic.keywords.join(', ')}

Respond in JSON format only, no markdown:
{"title": "Blog Title", "body": "<p>HTML content...</p>", "excerpt": "150 char summary"}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No content from Gemini')

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse Gemini response')
  
  return JSON.parse(jsonMatch[0])
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60) + '-' + Date.now().toString(36)
}

// Also support POST for manual triggers
export const POST = GET

