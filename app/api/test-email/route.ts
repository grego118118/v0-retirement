import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
import { emailService } from "@/lib/email/email-service"

export async function POST(request: Request) {
  try {
    console.log("Test email request started")
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.error("No session or user email in test email")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { testType = "basic" } = await request.json()

    // Test email configuration
    if (!emailService.isConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Email service not configured",
        provider: emailService.getProviderName()
      }, { status: 500 })
    }

    let emailResult
    
    if (testType === "template") {
      // Test template email
      emailResult = await emailService.sendTemplateEmail(
        "welcome",
        session.user.email,
        {
          userName: session.user.name || "User",
          userEmail: session.user.email
        }
      )
    } else {
      // Test basic email
      emailResult = await emailService.sendEmail({
        to: session.user.email,
        subject: "Massachusetts Retirement System - Email Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Email Service Test</h2>
            <p>Hello ${session.user.name || "User"},</p>
            <p>This is a test email from the Massachusetts Retirement System application.</p>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>Provider: ${emailService.getProviderName()}</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>User: ${session.user.email}</li>
            </ul>
            <p>If you received this email, the email service is working correctly!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated test email from the Massachusetts Retirement System.
            </p>
          </div>
        `,
        text: `
Email Service Test

Hello ${session.user.name || "User"},

This is a test email from the Massachusetts Retirement System application.

Configuration Details:
- Provider: ${emailService.getProviderName()}
- Timestamp: ${new Date().toISOString()}
- User: ${session.user.email}

If you received this email, the email service is working correctly!
        `
      })
    }

    console.log("Email test result:", emailResult)

    return NextResponse.json({
      success: emailResult.success,
      provider: emailResult.provider,
      messageId: emailResult.messageId,
      error: emailResult.error,
      timestamp: emailResult.timestamp,
      testType,
      userEmail: session.user.email
    })

  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      provider: emailService.getProviderName()
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      emailConfigured: emailService.isConfigured(),
      provider: emailService.getProviderName(),
      userEmail: session.user.email,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Email config check error:", error)
    return NextResponse.json({
      emailConfigured: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
