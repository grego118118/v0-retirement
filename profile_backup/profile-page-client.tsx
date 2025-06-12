"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RetirementCountdown } from "@/components/countdown/retirement-countdown"
import { ProfileForm } from "@/components/profile/profile-form"
import { SavedCalculations } from "@/components/profile/saved-calculations"
import { useAuth } from "@/components/auth/auth-context"
import { Loader2, User, Calculator } from "lucide-react"
import { SignIn } from "@/components/auth/sign-in"

interface UserMetadata {
  id: string
  full_name: string | null
  retirement_date: string | null
}

interface ProfilePageClientProps {
  initialUserData: UserMetadata | null
}

export function ProfilePageClient({ initialUserData }: ProfilePageClientProps) {
  const { user, isLoading } = useAuth()
  const [userData, setUserData] = useState<UserMetadata | null>(initialUserData)
  const [activeTab, setActiveTab] = useState("profile")
  const [retirementDate, setRetirementDate] = useState<Date | null>(
    userData?.retirement_date ? new Date(userData.retirement_date) : null,
  )

  useEffect(() => {
    if (userData?.retirement_date) {
      setRetirementDate(new Date(userData.retirement_date))
    }
  }, [userData])

  const handleProfileUpdate = () => {
    // Refresh the page to get the latest data
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Sign In Required</h1>
          <SignIn />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-muted-foreground mb-8">
        Manage your profile, view your retirement countdown, and access your saved calculations.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <RetirementCountdown retirementDate={retirementDate} />
        </div>

        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="calculations" className="flex items-center">
                <Calculator className="mr-2 h-4 w-4" />
                Saved Calculations
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <ProfileForm
                initialData={{
                  fullName: userData?.full_name || "",
                  retirementDate: userData?.retirement_date || "",
                }}
                onUpdate={handleProfileUpdate}
              />
            </TabsContent>
            <TabsContent value="calculations" className="mt-6">
              <SavedCalculations />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
