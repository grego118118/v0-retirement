import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // If there's an error, redirect to the error page
  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error)}`, request.url))
  }

  // If there's no code, redirect to the sign-in page
  if (!code) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  try {
    // Redirect to the NextAuth callback route to handle the code exchange
    return NextResponse.redirect(new URL(`/api/auth/callback/google?code=${encodeURIComponent(code)}`, request.url))
  } catch (error) {
    console.error("Error in auth callback:", error)
    return NextResponse.redirect(new URL("/auth/error?error=callback", request.url))
  }
}
