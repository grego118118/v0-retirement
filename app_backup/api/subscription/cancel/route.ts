import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { isPremiumUser, removePremiumUser } from "@/lib/subscription-utils"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userEmail = session.user.email
    
    // Check if user is currently premium
    if (!isPremiumUser(userEmail)) {
      return NextResponse.json({ 
        error: "No active subscription found" 
      }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Call your payment processor (Stripe, etc.) to cancel the subscription
    // 2. Update the subscription status in your database
    // 3. Set the cancellation date and end of billing period
    
    // For demo purposes, we'll simulate immediate cancellation
    console.log(`Canceling subscription for user: ${userEmail}`)
    
    // Remove from premium users using the shared function
    removePremiumUser(userEmail)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
      cancelationDate: new Date().toISOString(),
      // In production, this would be the actual end of billing period
      accessEndsAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST to cancel subscription" 
  }, { status: 405 })
} 