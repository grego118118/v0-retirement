/**
 * Stripe Switch Plan API
 * Lets an authenticated monthly subscriber switch to the annual plan
 * (or vice versa). Uses Stripe proration so the user is charged/credited
 * for the difference. Powers the annual-upsell banner on the
 * /subscription/portal page.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe/service'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

interface SwitchPlanRequest {
  targetPlan: 'monthly' | 'annual'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetPlan } = (await request.json()) as SwitchPlanRequest
    if (targetPlan !== 'monthly' && targetPlan !== 'annual') {
      return NextResponse.json({ error: 'Invalid targetPlan' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user?.subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription to switch' },
        { status: 400 }
      )
    }

    if (user.subscriptionPlan === targetPlan) {
      return NextResponse.json(
        { error: `Already on the ${targetPlan} plan` },
        { status: 400 }
      )
    }

    const newPriceId =
      targetPlan === 'annual'
        ? SUBSCRIPTION_PLANS.annual.priceId
        : SUBSCRIPTION_PLANS.monthly.priceId

    const updated = await StripeService.updateSubscriptionPlan(
      user.subscriptionId,
      newPriceId
    )

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: targetPlan,
        subscriptionStatus: updated.status,
        currentPeriodEnd: updated.currentPeriodEnd,
        cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
      },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        plan: targetPlan,
        status: updated.status,
        currentPeriodEnd: updated.currentPeriodEnd,
      },
    })
  } catch (error: any) {
    console.error('Switch plan failed:', error)
    return NextResponse.json(
      { error: 'Failed to switch plan', details: error?.message },
      { status: 500 }
    )
  }
}
