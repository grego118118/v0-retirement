/**
 * Admin Subscription Stats API
 * Massachusetts Retirement System - Paid subscriber overview
 *
 * GET /api/admin/subscriptions/stats
 * Admin-only: returns paying-customer counts, estimated revenue, and the
 * most recent subscribers, all derived from persisted subscription state.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config'

// Force dynamic rendering to prevent static generation issues with Prisma
export const dynamic = 'force-dynamic'

const ACTIVE_STATUSES = ['active', 'trialing']

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      signupsLast7Days,
      signupsLast30Days,
      activeMonthly,
      activeAnnual,
      trialing,
      canceling,
      canceled,
      pastDue,
      recentSubscribers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({
        where: { subscriptionStatus: 'active', subscriptionPlan: 'monthly' },
      }),
      prisma.user.count({
        where: { subscriptionStatus: 'active', subscriptionPlan: 'annual' },
      }),
      prisma.user.count({ where: { subscriptionStatus: 'trialing' } }),
      prisma.user.count({
        where: { subscriptionStatus: { in: ACTIVE_STATUSES }, cancelAtPeriodEnd: true },
      }),
      prisma.user.count({ where: { subscriptionStatus: 'canceled' } }),
      prisma.user.count({ where: { subscriptionStatus: 'past_due' } }),
      prisma.user.findMany({
        where: { subscriptionStatus: { in: [...ACTIVE_STATUSES, 'past_due'] } },
        orderBy: { updatedAt: 'desc' },
        take: 25,
        select: {
          email: true,
          name: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          stripeCustomerId: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          createdAt: true,
        },
      }),
    ])

    const paidActive = activeMonthly + activeAnnual
    const estimatedMrr =
      activeMonthly * SUBSCRIPTION_PLANS.monthly.price +
      activeAnnual * (SUBSCRIPTION_PLANS.annual.price / 12)

    return NextResponse.json({
      generatedAt: now.toISOString(),
      users: {
        total: totalUsers,
        signupsLast7Days,
        signupsLast30Days,
      },
      subscriptions: {
        paidActive,
        activeMonthly,
        activeAnnual,
        trialing,
        canceling,
        canceled,
        pastDue,
      },
      revenue: {
        estimatedMrr: Math.round(estimatedMrr * 100) / 100,
        estimatedArr: Math.round(estimatedMrr * 12 * 100) / 100,
        monthlyPrice: SUBSCRIPTION_PLANS.monthly.price,
        annualPrice: SUBSCRIPTION_PLANS.annual.price,
      },
      recentSubscribers: recentSubscribers.map((u: {
        email: string
        name: string | null
        subscriptionPlan: string | null
        subscriptionStatus: string | null
        stripeCustomerId: string | null
        currentPeriodEnd: Date | null
        cancelAtPeriodEnd: boolean
        createdAt: Date
      }) => ({
        email: u.email,
        name: u.name,
        plan: u.subscriptionPlan,
        status: u.subscriptionStatus,
        // Real Stripe customers have IDs starting with 'cus_'; anything else
        // is a dev/demo record and is flagged so it isn't mistaken for revenue.
        isRealStripeCustomer: !!u.stripeCustomerId?.startsWith('cus_'),
        currentPeriodEnd: u.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: u.cancelAtPeriodEnd,
        signedUpAt: u.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching subscription stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription stats' },
      { status: 500 }
    )
  }
}
