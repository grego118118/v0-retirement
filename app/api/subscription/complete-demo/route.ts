import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { planType } = await request.json()
    
    if (!planType || !['monthly', 'annual'].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
          currentPeriodEnd: new Date(Date.now() + (planType === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
        }
      })
    } else {
      // Update existing user with premium subscription
      user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
          currentPeriodEnd: new Date(Date.now() + (planType === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
        }
      })
    }

    console.log(`Demo subscription activated for ${session.user.email}: ${planType} plan`)

    return NextResponse.json({
      success: true,
      message: 'Demo subscription activated successfully',
      user: {
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        currentPeriodEnd: user.currentPeriodEnd,
      }
    })

  } catch (error) {
    console.error('Error completing demo subscription:', error)
    return NextResponse.json(
      { error: 'Failed to complete demo subscription' },
      { status: 500 }
    )
  }
}
