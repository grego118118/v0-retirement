/**
 * Rank Loop Engine — daily cron
 *
 * Five stages: Work → Document → Ship → Index → Listen
 *
 * This cron runs the automated SEO feedback loop:
 * 1. LISTEN  – pull keyword opportunities from Google Search Console
 * 2. PICK    – choose top queries not already targeted by recent content
 * 3. GENERATE– write blog posts targeting those gaps using Gemini
 * 4. SHIP    – publish approved posts to the database
 * 5. INDEX   – submit new URLs to Google Indexing API
 */

export const maxDuration = 120
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { getKeywordOpportunities } from '@/lib/seo/google-search-console'
import { submitUrlForIndexing } from '@/lib/seo/google-indexing'

// ─── Auth ──────────────────────────────────────────────────────────────────────
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (isVercelCron || authHeader === `Bearer ${cronSecret}`) return true
  const session = await getServerSession(authOptions)
  return !!session?.user
}

// ─── Supabase ──────────────────────────────────────────────────────────────────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

// ─── Gemini ────────────────────────────────────────────────────────────────────
async function generatePostForKeyword(keyword: string, relatedKeywords: string[]) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prompt = `You are an expert Massachusetts retirement specialist writing for masspension.com.

A real Massachusetts public employee searched Google for: "${keyword}"
They landed on zero results that fully answered their question. Write the definitive answer.

RELATED SEARCHES to also cover naturally: ${relatedKeywords.slice(0, 4).join(', ')}
DATE CONTEXT: ${currentDate}
TARGET LENGTH: 1,200–1,800 words

FACTUAL CONSTRAINTS (do not deviate):
- COLA: 3% of first $13,000 pension = max $390/year
- Pension formula: Age Factor × Years of Service × 3-year average salary
- Max benefit: 80% of highest average salary
- Group 1: general employees, age 60+
- Group 2: certain hazardous, age 55+
- Group 3: state police, any age with 20+ years
- Group 4: public safety, age 50+
- Options: A (full benefit, no survivor), B (reduced, 2/3 survivor), C (reduced, full survivor)

OUTPUT FORMAT — Return ONLY valid JSON, no markdown code fences:
{
  "title": "Specific, helpful title answering the search query",
  "body": "<article>Full HTML: h2 sections, p tags, ul/li for lists, strong for key facts</article>",
  "excerpt": "150-char compelling summary for blog listing",
  "metaDescription": "160-char SEO meta description with primary keyword",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "targetKeyword": "${keyword}"
}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.55, maxOutputTokens: 8192, topP: 0.85 },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No content from Gemini')

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '')
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse Gemini response')

  return JSON.parse(jsonMatch[0])
}

// ─── Quality check ─────────────────────────────────────────────────────────────
function scoreContent(body: string, title: string): number {
  let score = 50
  const text = body.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).filter((w) => w.length > 0).length
  if (words >= 1200) score += 15
  else if (words >= 800) score += 8

  const h2s = (body.match(/<h2/gi) || []).length
  if (h2s >= 3) score += 10
  else if (h2s >= 2) score += 5

  const maTerms = ['massachusetts', 'msrb', 'perac', 'cola', 'pension', 'retirement']
  const hits = maTerms.filter((t) => text.toLowerCase().includes(t)).length
  score += Math.min(hits * 3, 15)

  if ((text.match(/\$[\d,]+/g) || []).length >= 2) score += 5
  if (title.length >= 30 && title.length <= 90) score += 5

  return Math.min(score, 100)
}

// ─── Slug ──────────────────────────────────────────────────────────────────────
function makeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 75) +
    '-' +
    Date.now().toString(36)
  )
}

// ─── Already-targeted check ────────────────────────────────────────────────────
async function getRecentKeywords(supabase: ReturnType<typeof createClient>): Promise<string[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('seo_keywords, title')
    .order('created_at', { ascending: false })
    .limit(30)

  if (!data) return []
  const keywords: string[] = []
  for (const post of data) {
    if (Array.isArray(post.seo_keywords)) keywords.push(...post.seo_keywords)
    if (post.title) keywords.push(...post.title.toLowerCase().split(/\s+/))
  }
  return keywords.map((k: string) => k.toLowerCase())
}

// ─── Image URL ─────────────────────────────────────────────────────────────────
function makeImageUrl(title: string): string {
  const prompt = `Professional blog header image for Massachusetts public employee retirement article: "${title}". Clean editorial photography, warm professional lighting, no text. 16:9 ratio.`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=675&seed=${Date.now()}&nologo=true`
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!await isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const siteUrl = process.env.GSC_SITE_URL
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.masspension.com'
  const results: any[] = []
  const errors: string[] = []

  // STAGE 1: LISTEN — fetch keyword opportunities from GSC
  let opportunities: Awaited<ReturnType<typeof getKeywordOpportunities>> = []
  if (siteUrl) {
    try {
      opportunities = await getKeywordOpportunities(siteUrl, 28)
    } catch (err) {
      errors.push(`GSC fetch failed: ${(err as Error).message}`)
    }
  } else {
    errors.push('GSC_SITE_URL not set — using fallback topic pool')
  }

  // STAGE 2: PICK — filter out already-targeted keywords
  let supabase: ReturnType<typeof getSupabase>
  try {
    supabase = getSupabase()
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Supabase not configured: ${(err as Error).message}` },
      { status: 500 }
    )
  }
  let recentKeywords: string[] = []
  try {
    recentKeywords = await getRecentKeywords(supabase)
  } catch {
    // Non-fatal — proceed without deduplication
  }

  const freshOpportunities = opportunities
    .filter((opp) => {
      const q = opp.query.toLowerCase()
      return !recentKeywords.some((kw) => q.includes(kw) || kw.includes(q))
    })
    .slice(0, 3) // generate up to 3 posts per run

  // Fallback topics when GSC isn't configured or has no new opportunities
  const fallbackKeywords =
    freshOpportunities.length > 0
      ? freshOpportunities.map((o) => ({ query: o.query, related: [] }))
      : [
          { query: 'massachusetts pension early retirement penalty', related: ['superannuation age', 'benefit reduction group 1'] },
          { query: 'how does cola work massachusetts pension', related: ['cost of living adjustment 3 percent', '$13000 base'] },
          { query: 'option c vs option b massachusetts pension', related: ['survivor benefit', 'joint and survivor annuity'] },
        ]

  // STAGE 3: GENERATE & STAGE 4: SHIP
  for (const { query, related } of fallbackKeywords.slice(0, 3)) {
    try {
      const content = await generatePostForKeyword(query, related || [])
      const qualityScore = scoreContent(content.body, content.title)
      const shouldPublish = qualityScore >= 68
      const slug = makeSlug(content.title)
      const imageUrl = makeImageUrl(content.title)
      const now = new Date().toISOString()

      const basePayload = {
        id: slug, title: content.title, slug,
        content: content.body, excerpt: content.excerpt,
        status: shouldPublish ? 'published' : 'draft',
      }

      let dbError: string | undefined

      // Try snake_case first (matches Supabase column names)
      const { error: err1 } = await supabase.from('blog_posts').insert({
        ...basePayload,
        is_ai_generated: true,
        ai_model: 'gemini-2.0-flash',
        fact_check_status: shouldPublish ? 'approved' : 'pending',
        seo_description: content.metaDescription,
        seo_keywords: content.keywords,
        featured_image_url: imageUrl,
        content_quality_score: qualityScore,
        published_at: shouldPublish ? now : null,
        created_at: now,
        updated_at: now,
      }).select().single()

      if (err1) {
        // Fallback: camelCase (Prisma-managed schema)
        const { error: err2 } = await supabase.from('blog_posts').insert({
          ...basePayload,
          isAiGenerated: true,
          aiModelUsed: 'gemini-2.0-flash',
          factCheckStatus: shouldPublish ? 'approved' : 'pending',
          seoDescription: content.metaDescription,
          seoKeywords: content.keywords,
          featuredImageUrl: imageUrl,
          contentQualityScore: qualityScore,
          publishedAt: shouldPublish ? now : null,
          createdAt: now,
          updatedAt: now,
        }).select().single()
        if (err2) dbError = err2.message
      }

      const postUrl = `${baseUrl}/blog/${slug}`

      // STAGE 5: INDEX — submit to Google Indexing API
      let indexResult: { notifyTime?: string; error?: string } = {}
      if (shouldPublish) {
        indexResult = await submitUrlForIndexing(postUrl)
      }

      results.push({
        keyword: query,
        title: content.title,
        slug,
        qualityScore,
        published: shouldPublish,
        url: postUrl,
        indexingSubmitted: shouldPublish && !indexResult.error,
        indexingNotifyTime: indexResult.notifyTime,
        dbError,
      })
    } catch (err) {
      errors.push(`Failed for "${query}": ${(err as Error).message}`)
    }
  }

  return NextResponse.json({
    success: true,
    ranAt: new Date().toISOString(),
    gscConfigured: !!siteUrl,
    opportunitiesFound: opportunities.length,
    freshOpportunitiesSelected: freshOpportunities.length,
    postsGenerated: results.length,
    results,
    errors,
  })
}

export const POST = GET
