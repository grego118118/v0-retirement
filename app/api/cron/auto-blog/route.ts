export const maxDuration = 60

/**
 * Weekly Auto-Blog Generator
 * Generates one high-quality Massachusetts retirement blog post per week
 * - Uses Gemini AI for long-form, factual content (1500+ words)
 * - Generates an AI image via Pollinations.ai
 * - Auto-publishes if quality checks pass
 *
 * Cron: Every Monday at 10 AM ET (14:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase client for direct database access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// ─── Topic Pool ────────────────────────────────────────────────────────────────
// Covers retirement trends, planning tips, and policy/legislative updates
const TOPICS = [
  // Retirement Trends & Demographics
  { title: 'The Massachusetts Mass Retirement Wave: What the Numbers Tell Us', keywords: ['mass retirement', 'baby boomers', 'workforce trends', 'public sector'], category: 'Retirement Trends' },
  { title: 'How Many Massachusetts State Employees Are Retiring Each Year?', keywords: ['retirement statistics', 'state workforce', 'demographics', 'public employment'], category: 'Retirement Trends' },
  { title: 'The Silver Tsunami: How Massachusetts Is Preparing for Record Retirements', keywords: ['silver tsunami', 'workforce planning', 'succession', 'public sector retirement'], category: 'Retirement Trends' },
  { title: 'Teacher Retirement Crisis in Massachusetts: Facts and Projections', keywords: ['teacher retirement', 'MTRS', 'education workforce', 'pension obligations'], category: 'Retirement Trends' },
  { title: 'Police and Firefighter Retirement Trends in Massachusetts', keywords: ['Group 4', 'public safety retirement', 'first responder pensions', 'early retirement'], category: 'Retirement Trends' },

  // Retirement Planning
  { title: 'Understanding Your Massachusetts Pension: A Complete Breakdown', keywords: ['pension calculation', 'retirement benefit', 'MSRB', 'creditable service'], category: 'Retirement Planning' },
  { title: 'COLA Benefits Explained: How Cost-of-Living Adjustments Work in Massachusetts', keywords: ['COLA', 'cost of living adjustment', '3 percent', '$13,000 base'], category: 'Retirement Planning' },
  { title: 'Pension Options A, B, and C: Which Is Right for Your Situation?', keywords: ['Option A', 'Option B', 'Option C', 'survivor benefits', 'pension options'], category: 'Retirement Planning' },
  { title: 'Maximizing Your Massachusetts State Pension: Strategies That Work', keywords: ['pension maximization', 'creditable service', 'buyback', 'highest three years'], category: 'Retirement Planning' },
  { title: 'Health Insurance After Retirement: GIC, Medicare, and Your Options', keywords: ['GIC', 'Medicare', 'health insurance', 'retiree benefits', 'Part B'], category: 'Retirement Planning' },
  { title: 'Early Retirement vs. Waiting: The Financial Math for Massachusetts Employees', keywords: ['early retirement', 'superannuation', 'benefit reduction', 'break-even analysis'], category: 'Retirement Planning' },
  { title: 'Understanding Retirement Group Classifications: Groups 1 Through 4', keywords: ['Group 1', 'Group 2', 'Group 3', 'Group 4', 'classification'], category: 'Retirement Planning' },
  { title: 'Creditable Service and Buyback Options: What Massachusetts Employees Should Know', keywords: ['creditable service', 'buyback', 'military service', 'prior service'], category: 'Retirement Planning' },
  { title: 'How to Calculate Your Massachusetts Pension Benefit Step by Step', keywords: ['pension formula', 'benefit calculation', 'age factor', 'salary average'], category: 'Retirement Planning' },

  // Policy & Legislative Updates
  { title: 'Social Security Fairness Act: What It Means for Massachusetts Retirees', keywords: ['Social Security Fairness Act', 'WEP', 'GPO', 'windfall elimination'], category: 'Policy Updates' },
  { title: 'WEP and GPO Repeal: How Massachusetts Pension Recipients Are Affected', keywords: ['WEP repeal', 'GPO repeal', 'Social Security', 'dual entitlement'], category: 'Policy Updates' },
  { title: 'Massachusetts Pension Reform: Where Things Stand Today', keywords: ['pension reform', 'legislation', 'PERAC', 'funding ratio'], category: 'Policy Updates' },
  { title: 'How Federal Policy Changes Could Impact Your Massachusetts Pension', keywords: ['federal policy', 'tax reform', 'pension taxation', 'retirement age'], category: 'Policy Updates' },
  { title: 'Massachusetts Pension Fund Performance: What Retirees Need to Know', keywords: ['PRIT fund', 'investment returns', 'funded ratio', 'pension solvency'], category: 'Policy Updates' },
  { title: 'State Budget and Your Pension: How Massachusetts Funds Retirement Obligations', keywords: ['state budget', 'pension funding', 'actuarial liability', 'contribution rates'], category: 'Policy Updates' },

  // Financial Planning Around Retirement
  { title: 'Tax Planning for Massachusetts Retirees: What Your Pension Means for Your Taxes', keywords: ['pension taxation', 'Massachusetts taxes', 'retirement income', 'tax planning'], category: 'Financial Planning' },
  { title: 'Social Security and Your Massachusetts Pension: Understanding the Interaction', keywords: ['Social Security', 'WEP', 'GPO', 'coordination of benefits'], category: 'Financial Planning' },
  { title: 'Retirement Savings Beyond Your Pension: 457(b) and 403(b) Plans for State Employees', keywords: ['457b', '403b', 'supplemental savings', 'deferred compensation'], category: 'Financial Planning' },
  { title: 'Inflation and Your Retirement: How to Protect Your Purchasing Power', keywords: ['inflation', 'purchasing power', 'COLA', 'retirement planning'], category: 'Financial Planning' },
]

// ─── Main Handler ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Pick a topic (avoid recent duplicates)
    const topic = await pickUnusedTopic()

    // 2. Generate long-form, factual content with Gemini
    const content = await generateWithGemini(topic)
    if (!content) {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }

    // 3. Generate an AI image for the post
    const imageUrl = generateImageUrl(content.title, topic.category)

    // 4. Run quality checks
    const qualityScore = assessQuality(content)
    const shouldPublish = qualityScore >= 70

    // 5. Save to database
    const slug = generateSlug(content.title)
    const now = new Date().toISOString()

    const { data, error } = await supabase.from('blog_posts').insert({
      id: slug,
      title: content.title,
      slug: slug,
      content: content.body,
      excerpt: content.excerpt,
      status: shouldPublish ? 'published' : 'draft',
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

    if (error) {
      console.error('Database error:', error)
      // Try with camelCase columns as fallback (Prisma schema uses camelCase)
      const { data: data2, error: error2 } = await supabase.from('blog_posts').insert({
        id: slug,
        title: content.title,
        slug: slug,
        content: content.body,
        excerpt: content.excerpt,
        status: shouldPublish ? 'published' : 'draft',
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

      if (error2) {
        console.error('Database error (retry):', error2)
        return NextResponse.json({ error: 'Failed to save post', details: error2.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Blog post ${shouldPublish ? 'published' : 'saved as draft'}`,
        post: { id: data2?.id, title: content.title, status: shouldPublish ? 'published' : 'draft', qualityScore, imageUrl }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Blog post ${shouldPublish ? 'published' : 'saved as draft'}`,
      post: { id: data?.id, title: content.title, status: shouldPublish ? 'published' : 'draft', qualityScore, imageUrl }
    })

  } catch (error) {
    console.error('Auto-blog error:', error)
    return NextResponse.json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ─── Topic Selection (avoid duplicates) ────────────────────────────────────────
async function pickUnusedTopic() {
  try {
    // Fetch recent post titles to avoid repetition
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('title')
      .order('created_at', { ascending: false })
      .limit(10)

    const recentTitles = (recentPosts || []).map((p: any) => p.title?.toLowerCase() || '')

    // Filter out topics whose keywords overlap heavily with recent posts
    const available = TOPICS.filter(topic => {
      return !recentTitles.some((title: string) =>
        topic.keywords.some(kw => title.includes(kw.toLowerCase()))
      )
    })

    // Pick from available topics, or fallback to full list
    const pool = available.length > 0 ? available : TOPICS
    return pool[Math.floor(Math.random() * pool.length)]
  } catch {
    // Fallback: just pick randomly
    return TOPICS[Math.floor(Math.random() * TOPICS.length)]
  }
}

// ─── Gemini Content Generation ─────────────────────────────────────────────────
async function generateWithGemini(topic: { title: string; keywords: string[]; category: string }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prompt = `You are an expert retirement policy analyst and financial writer specializing in the Massachusetts public pension system. Write a comprehensive, highly informative blog post for masspension.com.

TOPIC: ${topic.title}
CATEGORY: ${topic.category}
TARGET LENGTH: 1,500–2,000 words
DATE CONTEXT: ${currentDate}

CONTENT REQUIREMENTS:
1. FACTUAL ACCURACY is the top priority. Only include verifiable facts about:
   - Massachusetts Retirement System structure (MSRB, PERAC oversight)
   - The four retirement groups (Group 1: general employees, Group 2: certain hazardous roles, Group 3: state police, Group 4: public safety/firefighters)
   - COLA: 3% of first $13,000 of pension = max $390/year increase
   - Pension formula: Age Factor × Years of Service × Highest 3-Year Average Salary
   - Maximum benefit: 80% of highest average salary
   - Pension options: A (max benefit, no survivor), B (reduced, partial survivor), C (reduced, full survivor)

2. STRUCTURE the post with:
   - A compelling, specific headline (not generic)
   - An opening paragraph that states what the reader will learn and why it matters right now
   - 4-6 clearly labeled sections with H2 headings
   - Concrete examples with realistic dollar amounts (e.g., "A Group 1 employee retiring at age 65 with 30 years of service and a $75,000 average salary...")
   - A "Key Takeaways" section at the end with 3-5 bullet points
   - A brief conclusion pointing readers to the masspension.com calculator

3. TONE: Professional but accessible. Avoid jargon without explanation. Write for a Massachusetts state employee who is 5-15 years from retirement.

4. SEO: Naturally incorporate these keywords: ${topic.keywords.join(', ')}

5. SOURCING: Reference official sources where appropriate (mass.gov, MSRB publications, PERAC reports, SSA.gov). Do NOT fabricate specific statistics or cite specific report numbers you're unsure about — instead use phrases like "according to PERAC data" or "per MSRB guidelines."

6. FORMAT: Return ONLY valid JSON, no markdown code fences:
{
  "title": "The exact blog post title",
  "body": "<article>Full HTML content with <h2>, <p>, <ul>, <strong> tags. Use semantic HTML.</article>",
  "excerpt": "A compelling 150-character summary for the blog listing page",
  "metaDescription": "SEO meta description, 150-160 characters, includes primary keyword",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

IMPORTANT: The body must be well-structured HTML. Use <h2> for section headings, <p> for paragraphs, <ul>/<li> for the Key Takeaways, and <strong> for emphasis. Do not use markdown inside the HTML.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6, // Lower temp for more factual output
          maxOutputTokens: 8192,
          topP: 0.85,
        }
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
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '')
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse Gemini response as JSON')

  return JSON.parse(jsonMatch[0])
}

// ─── AI Image Generation ───────────────────────────────────────────────────────
function generateImageUrl(title: string, category: string): string {
  // Build a descriptive image prompt based on the blog post
  const categoryVisuals: Record<string, string> = {
    'Retirement Trends': 'professional data visualization showing retirement demographics, modern office with diverse workers, blue and gold color scheme',
    'Retirement Planning': 'serene retirement lifestyle, financial planning documents on desk, warm golden hour lighting, professional photography',
    'Policy Updates': 'Massachusetts State House dome, government building, official legislative setting, blue sky background',
    'Financial Planning': 'financial charts and calculator on a clean desk, retirement savings concept, warm professional lighting',
  }

  const visual = categoryVisuals[category] || 'professional retirement planning concept, warm and trustworthy'

  // Create a focused image prompt
  const imagePrompt = `Professional blog header image: ${visual}. Clean, modern, high-quality editorial photography style. No text overlay. 16:9 aspect ratio.`

  // Pollinations.ai generates AI images from URL — free, no API key needed
  const encoded = encodeURIComponent(imagePrompt)
  return `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=675&seed=${Date.now()}&nologo=true`
}

// ─── Quality Assessment ────────────────────────────────────────────────────────
function assessQuality(content: { title: string; body: string; excerpt: string; keywords?: string[] }): number {
  let score = 50 // base score

  const plainText = content.body.replace(/<[^>]*>/g, '')
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length

  // Length check (target 1500+)
  if (wordCount >= 1500) score += 15
  else if (wordCount >= 1000) score += 10
  else if (wordCount >= 600) score += 5

  // Structure check — has H2 headings
  const h2Count = (content.body.match(/<h2/gi) || []).length
  if (h2Count >= 4) score += 10
  else if (h2Count >= 2) score += 5

  // Massachusetts relevance
  const maTerms = ['massachusetts', 'msrb', 'perac', 'cola', 'group 1', 'group 2', 'group 3', 'group 4', 'mass.gov', 'pension']
  const lowerBody = plainText.toLowerCase()
  const maHits = maTerms.filter(term => lowerBody.includes(term)).length
  score += Math.min(maHits * 2, 15)

  // Has specific dollar amounts or percentages (indicates concrete examples)
  const dollarMatches = plainText.match(/\$[\d,]+/g) || []
  const percentMatches = plainText.match(/\d+%/g) || []
  if (dollarMatches.length >= 3) score += 5
  if (percentMatches.length >= 2) score += 5

  // Title quality
  if (content.title.length >= 30 && content.title.length <= 80) score += 5

  // Has excerpt
  if (content.excerpt && content.excerpt.length >= 50) score += 5

  return Math.min(score, 100)
}

// ─── Slug Generation ───────────────────────────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80) + '-' + Date.now().toString(36)
}

// Also support POST for manual triggers
export const POST = GET
