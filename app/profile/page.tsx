import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { ProfilePageClient } from "./profile-page-client"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata: Metadata = generateSEOMetadata({
  title: "Your Profile | Massachusetts Pension Estimator",
  description: "Manage your profile, view your retirement countdown, and access your saved pension calculations.",
  path: "/profile",
  keywords: [
    "Massachusetts pension profile",
    "retirement countdown",
    "saved pension calculations",
    "MA state retirement profile",
  ],
})

export default async function ProfilePage() {
  const supabase = getSupabaseServerClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch user metadata
  const { data: userData } = await supabase.from("users_metadata").select("*").eq("id", session.user.id).single()

  return <ProfilePageClient initialUserData={userData || null} />
}
