import { NextResponse } from "next/server"

// This route should not exist - NextAuth expects error handling to be done via a page route
// Let's redirect to the correct error page
export async function GET(request: Request) {
  const url = new URL(request.url)
  const errorParam = url.searchParams.get("error") || "unknown"

  return NextResponse.redirect(new URL(`/auth/error?error=${errorParam}`, url.origin))
}
