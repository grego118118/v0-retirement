"use client"

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface ProfileData {
  fullName?: string
  dateOfBirth?: string
  membershipDate?: string
  retirementGroup?: string
  benefitPercentage?: number
  currentSalary?: number
  averageHighest3Years?: number
  yearsOfService?: number
  plannedRetirementAge?: number
  retirementDate?: string
  retirementOption?: string
  hasProfile?: boolean
}

interface ProfileContextType {
  profile: ProfileData | null
  loading: boolean
  updateProfile: (updates: Partial<ProfileData>) => Promise<boolean>
  refreshProfile: () => Promise<void>
  isProfileComplete: boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)

  // Check if profile is complete
  const isProfileComplete = Boolean(
    profile?.dateOfBirth &&
    profile?.membershipDate &&
    profile?.currentSalary &&
    profile?.retirementGroup
  )

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!session?.user) return

    setLoading(true)
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (response.ok) {
        console.log("📥 ProfileContext: Profile fetched:", data)

        // Convert database dates to strings for form compatibility
        if (data.dateOfBirth && typeof data.dateOfBirth === 'string' && data.dateOfBirth.includes('T')) {
          data.dateOfBirth = data.dateOfBirth.split('T')[0]
        }
        if (data.membershipDate && typeof data.membershipDate === 'string' && data.membershipDate.includes('T')) {
          data.membershipDate = data.membershipDate.split('T')[0]
        }
        if (data.retirementDate && typeof data.retirementDate === 'string' && data.retirementDate.includes('T')) {
          data.retirementDate = data.retirementDate.split('T')[0]
        }

        setProfile(data)
      } else {
        console.error("❌ ProfileContext: Failed to fetch profile:", data)
        setProfile(null)
      }
    } catch (error) {
      console.error("💥 ProfileContext: Fetch error:", error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [session])

  // Update profile data with real-time sync and immediate UI feedback
  const updateProfile = useCallback(async (updates: Partial<ProfileData>): Promise<boolean> => {
    if (!session?.user) {
      toast.error("You must be logged in to update your profile")
      return false
    }

    console.log("🔄 ProfileContext: Updating profile with:", updates)

    // Optimistically update the local state for immediate UI feedback
    setProfile(prev => {
      const newProfile = prev ? { ...prev, ...updates } : updates as ProfileData
      console.log("📊 ProfileContext: Optimistic update applied:", newProfile)
      
      // Trigger a re-render by creating a new object
      return { ...newProfile }
    })

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ ProfileContext: Server update successful", data)

        // Handle different response formats from the API
        let profileData = data
        if (data.profile) {
          // API returned { message: "...", profile: {...} }
          profileData = data.profile
        }

        // Convert database dates to strings for consistency
        if (profileData.dateOfBirth && typeof profileData.dateOfBirth === 'string' && profileData.dateOfBirth.includes('T')) {
          profileData.dateOfBirth = profileData.dateOfBirth.split('T')[0]
        }
        if (profileData.membershipDate && typeof profileData.membershipDate === 'string' && profileData.membershipDate.includes('T')) {
          profileData.membershipDate = profileData.membershipDate.split('T')[0]
        }
        if (profileData.retirementDate && typeof profileData.retirementDate === 'string' && profileData.retirementDate.includes('T')) {
          profileData.retirementDate = profileData.retirementDate.split('T')[0]
        }

        // Merge the server response with current profile state
        setProfile(prev => {
          const finalProfile = { ...prev, ...updates, ...profileData }
          console.log("📈 ProfileContext: Final profile state:", finalProfile)
          return finalProfile
        })

        return true
      } else {
        console.error("❌ ProfileContext: Server update failed:", data)
        // Revert optimistic update on failure
        await fetchProfile()
        toast.error(data.error || "Failed to update profile")
        return false
      }
    } catch (error) {
      console.error("💥 ProfileContext: Update error:", error)
      // Revert optimistic update on failure
      await fetchProfile()
      toast.error("Failed to update profile")
      return false
    }
  }, [session, fetchProfile])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    await fetchProfile()
  }, [fetchProfile])

  // Auto-fetch profile when session is available
  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    } else {
      setProfile(null)
    }
  }, [session?.user?.id, fetchProfile])

  const value: ProfileContextType = {
    profile,
    loading,
    updateProfile,
    refreshProfile,
    isProfileComplete
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
