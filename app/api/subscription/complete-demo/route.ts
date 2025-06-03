import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
import { addPremiumUser } from "@/lib/subscription-utils"

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

    // Add user to premium users set
    addPremiumUser(session.user.email)
    
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