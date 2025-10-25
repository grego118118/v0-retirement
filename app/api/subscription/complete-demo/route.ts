import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
import { addPremiumUser } from "@/lib/subscription-utils"
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

    // Add user to premium users set (for immediate in-memory access)
    addPremiumUser(session.user.email)

    // Also update the database for persistent storage
    try {
      await prisma.user.upsert({
        where: { email: session.user.email },
        update: {
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          cancelAtPeriodEnd: false,
        },
        create: {
          id: session.user.id || `demo-${Date.now()}`,
          email: session.user.email,
          name: session.user.name,
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          cancelAtPeriodEnd: false,
        }
      })

      console.log(`✅ Database updated: ${session.user.email} set to premium (${planType})`)
    } catch (dbError) {
      console.error('Database update failed, but in-memory store updated:', dbError)
      // Continue with success since in-memory store was updated
    }

    return NextResponse.json({
      success: true,
      message: "Premium access granted",
      userEmail: session.user.email,
      planType: planType
    })
    
  } catch (error) {
    console.error('Error completing demo subscription:', error)
    return NextResponse.json(
      { error: 'Failed to complete subscription' },
      { status: 500 }
    )
  }
} 