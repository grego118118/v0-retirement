import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Temporary admin seeding endpoint
// Protect with SEED_SECRET in environment
export async function POST(req: NextRequest) {
  try {
    const headerSecret = req.headers.get('x-seed-secret') || ''
    const body = await req.json().catch(() => null as any)
    const bodySecret = body?.secret || ''
    const secret = headerSecret || bodySecret

    const requiredSecret = process.env.SEED_SECRET
    if (!requiredSecret) {
      return NextResponse.json({ error: 'SEED_SECRET not configured in environment' }, { status: 500 })
    }
    if (!secret || secret !== requiredSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 })
    }

    const now = new Date()

    const posts = [
      {
        title: 'Social Security Fairness Act: What Massachusetts State Employees Need to Know',
        slug: 'social-security-fairness-act-what-massachusetts-state-employees-need-to-know',
        excerpt: 'Understand how the Social Security Fairness Act could impact WEP and GPO rules for Massachusetts public employees and retirees.',
        content: `Massachusetts public employees are often impacted by the Windfall Elimination Provision (WEP) and Government Pension Offset (GPO). This article explains current rules, proposed changes under the Social Security Fairness Act, and planning considerations.`,
        featuredImageUrl: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?q=80&w=1280&auto=format&fit=crop',
        seoTitle: 'Social Security Fairness Act for Massachusetts Public Employees',
        seoDescription: 'How WEP and GPO could change under the Social Security Fairness Act and what it means for Massachusetts state employees.',
        seoKeywords: ['Social Security', 'WEP', 'GPO', 'Massachusetts', 'MSRB'],
      },
      {
        title: 'Understanding Massachusetts Pension Options (A, B, C)',
        slug: 'understanding-massachusetts-pension-options',
        excerpt: 'A clear guide to Options A, B, and C under the Massachusetts Retirement System, including pros, cons, and survivor benefits.',
        content: `This guide explains the differences between Options A, B, and C, including benefit amounts, survivor protections, and key trade-offs so you can make an informed choice.`,
        featuredImageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1280&auto=format&fit=crop',
        seoTitle: 'Massachusetts Pension Options Explained (A, B, C)',
        seoDescription: 'Compare Options A, B, and C for Massachusetts state pensions, including reductions and survivor benefits.',
        seoKeywords: ['Pension Options', 'Option A', 'Option B', 'Option C', 'Massachusetts'],
      },
      {
        title: 'Retirement Planning for Massachusetts State Employees',
        slug: 'retirement-planning-for-massachusetts-state-employees',
        excerpt: 'Timeline and key milestones to prepare for retirement in the Massachusetts Retirement System.',
        content: `From service credit rules to COLA and healthcare, learn the milestones and decisions that matter most for a smooth retirement.`,
        featuredImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1280&auto=format&fit=crop',
        seoTitle: 'Retirement Planning Guide for Massachusetts Employees',
        seoDescription: 'A practical planning timeline for Massachusetts state employees approaching retirement.',
        seoKeywords: ['Retirement Planning', 'COLA', 'Service Credit', 'Massachusetts'],
      },
    ]

    const results = [] as any[]

    for (const p of posts) {
      const res = await prisma.blogPost.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          featuredImageUrl: p.featuredImageUrl,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          seoKeywords: p.seoKeywords,
          status: 'published',
          publishedAt: now,
          updatedAt: now,
        },
        create: {
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          featuredImageUrl: p.featuredImageUrl,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          seoKeywords: p.seoKeywords,
          status: 'published',
          isAiGenerated: false,
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      })
      results.push({ id: res.id, slug: res.slug })
    }

    return NextResponse.json({ success: true, seeded: results })
  } catch (e: any) {
    console.error('Seed error:', e)
    return NextResponse.json({ error: e?.message || 'Seed failed' }, { status: 500 })
  }
}

