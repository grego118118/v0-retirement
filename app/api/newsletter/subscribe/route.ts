import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      )
    }

    // Check if email already exists in newsletter subscribers
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existingSubscriber) {
      return NextResponse.json(
        { message: "You're already subscribed to our newsletter!" },
        { status: 200 }
      )
    }

    // Add to database
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        subscribedAt: new Date(),
        isActive: true,
        source: "website"
      }
    })

    // Send welcome email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@masspension.com",
          to: email,
          subject: "Welcome to Mass Pension Updates!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb; text-align: center;">Welcome to Mass Pension!</h1>
              
              <p>Thank you for subscribing to our newsletter! You'll now receive:</p>
              
              <ul style="color: #374151; line-height: 1.6;">
                <li>📊 Monthly retirement planning tips</li>
                <li>📈 Massachusetts COLA and benefit updates</li>
                <li>🔧 New calculator features and improvements</li>
                <li>📚 Exclusive retirement planning resources</li>
              </ul>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Get Started:</h3>
                <p style="margin-bottom: 15px;">Try our free Massachusetts Pension Calculator to estimate your retirement benefits:</p>
                <a href="https://www.masspension.com/calculator" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Calculate My Pension
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                You can unsubscribe at any time by clicking the unsubscribe link in our emails.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 12px; text-align: center;">
                Mass Pension - Massachusetts Retirement Planning Made Simple<br>
                <a href="https://www.masspension.com" style="color: #2563eb;">www.masspension.com</a>
              </p>
            </div>
          `
        })
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
        // Don't fail the subscription if email fails
      }
    }

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter!" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Newsletter subscription endpoint" },
    { status: 200 }
  )
}
