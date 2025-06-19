import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { stripe, getSubscriptionPlan } from "@/lib/stripe/config"

export async function POST() {
  try {
    console.log("🔄 Subscription sync started")
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.error("❌ No session or user ID in subscription sync")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        subscriptionId: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
      }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log("👤 User found for sync:", {
      email: user.email,
      stripeCustomerId: user.stripeCustomerId,
      currentStatus: user.subscriptionStatus,
      currentPlan: user.subscriptionPlan
    })

    // If no Stripe customer ID, user is OAuth-only
    if (!user.stripeCustomerId) {
      console.log("ℹ️ User has no Stripe customer ID - OAuth only")
      return NextResponse.json({
        success: true,
        message: "User has OAuth-only access",
        subscriptionType: "oauth_premium", // Assuming grandfathered
        syncRequired: false
      })
    }

    // Check if Stripe is configured
    if (!stripe) {
      console.error("❌ Stripe not configured")
      return NextResponse.json({
        success: false,
        message: "Stripe not configured",
        error: "STRIPE_NOT_CONFIGURED"
      }, { status: 500 })
    }

    try {
      // Fetch customer data from Stripe
      console.log("🔍 Fetching customer from Stripe:", user.stripeCustomerId)
      const customer = await stripe.customers.retrieve(user.stripeCustomerId)
      
      if (customer.deleted) {
        console.log("⚠️ Stripe customer was deleted")
        // Clear Stripe data from user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeCustomerId: null,
            subscriptionId: null,
            subscriptionStatus: null,
            subscriptionPlan: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            trialEnd: null,
          }
        })
        
        return NextResponse.json({
          success: true,
          message: "Stripe customer deleted - reverted to OAuth access",
          subscriptionType: "oauth_premium",
          syncRequired: true
        })
      }

      // Fetch active subscriptions
      console.log("📋 Fetching subscriptions for customer")
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all',
        limit: 10
      })

      console.log(`📊 Found ${subscriptions.data.length} subscriptions`)

      // Find the most recent active subscription
      const activeSubscription = subscriptions.data.find(sub => 
        ['active', 'trialing'].includes(sub.status)
      )

      if (!activeSubscription) {
        console.log("❌ No active subscription found")
        // Update user to reflect no active subscription
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'canceled',
            subscriptionPlan: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            trialEnd: null,
          }
        })

        return NextResponse.json({
          success: true,
          message: "No active subscription found - updated to free tier",
          subscriptionType: "oauth_free",
          syncRequired: true
        })
      }

      // Extract subscription details
      const priceId = activeSubscription.items.data[0]?.price.id
      const planType = getSubscriptionPlan(priceId)
      
      // Type assertion for Stripe subscription properties
      const subscription = activeSubscription as any

      console.log("✅ Active subscription found:", {
        subscriptionId: activeSubscription.id,
        status: activeSubscription.status,
        priceId,
        planType,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
      })

      // Update user with current subscription data
      const updateData = {
        subscriptionId: activeSubscription.id,
        subscriptionStatus: activeSubscription.status,
        subscriptionPlan: planType,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })

      console.log("💾 User subscription data updated successfully")

      return NextResponse.json({
        success: true,
        message: "Subscription status synchronized successfully",
        subscriptionType: planType === 'monthly' ? 'stripe_monthly' : 
                         planType === 'annual' ? 'stripe_annual' : 'oauth_free',
        subscriptionData: {
          status: activeSubscription.status,
          plan: planType,
          currentPeriodEnd: updateData.currentPeriodEnd?.toISOString() || null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false
        },
        syncRequired: true
      })

    } catch (stripeError: any) {
      console.error("❌ Stripe API error during sync:", stripeError)
      
      // Handle specific Stripe errors
      if (stripeError.code === 'resource_missing') {
        // Customer doesn't exist in Stripe
        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeCustomerId: null,
            subscriptionId: null,
            subscriptionStatus: null,
            subscriptionPlan: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            trialEnd: null,
          }
        })

        return NextResponse.json({
          success: true,
          message: "Stripe customer not found - reverted to OAuth access",
          subscriptionType: "oauth_premium",
          syncRequired: true
        })
      }

      return NextResponse.json({
        success: false,
        message: "Failed to sync with Stripe",
        error: stripeError.message || "Unknown Stripe error"
      }, { status: 500 })
    }

  } catch (error) {
    console.error("❌ Error in subscription sync:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to sync subscription status",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
