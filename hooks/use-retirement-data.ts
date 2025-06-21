"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface RetirementProfile {
  dateOfBirth: string
  membershipDate: string
  retirementGroup: string
  benefitPercentage: number
  currentSalary: number
  averageHighest3Years?: number
  yearsOfService?: number
  retirementOption?: string
  retirementDate?: string
  estimatedSocialSecurityBenefit?: number
}

interface RetirementCalculation {
  id?: string
  calculationName?: string
  retirementDate: string
  retirementAge: number
  yearsOfService: number
  averageSalary: number
  retirementGroup: string
  benefitPercentage: number
  retirementOption: string
  monthlyBenefit: number
  annualBenefit: number
  benefitReduction?: number
  survivorBenefit?: number
  notes?: string
  isFavorite?: boolean
  createdAt?: string
  updatedAt?: string
  // Social Security fields
  socialSecurityData?: {
    fullRetirementAge?: number
    earlyRetirementBenefit?: number
    fullRetirementBenefit?: number
    delayedRetirementBenefit?: number
    selectedClaimingAge?: number
    selectedMonthlyBenefit?: number
    combinedMonthlyIncome?: number
    replacementRatio?: number
  }
}

export function useRetirementData() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<RetirementProfile | null>(null)
  const [calculations, setCalculations] = useState<RetirementCalculation[]>([])

  // Fetch retirement profile
  const fetchProfile = useCallback(async () => {
    if (!session?.user) {
      console.log("fetchProfile: No session or user, skipping profile fetch")
      return
    }

    console.log("fetchProfile: Starting profile fetch for user:", session.user.id)
    setLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        }
      })

      console.log("fetchProfile: Response status:", response.status)

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error("fetchProfile: HTTP error response:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        })

        if (response.status === 401) {
          toast.error("Please sign in to access your profile")
          return
        } else if (response.status === 500) {
          toast.error("Server error loading profile. Please try again.")
          return
        }

        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("fetchProfile: Response is not JSON, content-type:", contentType)
        throw new Error("Response is not JSON")
      }

      const data = await response.json()
      console.log("fetchProfile: Received profile data:", data)

      if (data) {
        // Convert the profile data to the expected format
        const profileData = {
          dateOfBirth: data.dateOfBirth || "",
          membershipDate: data.membershipDate || "",
          retirementGroup: data.retirementGroup || "Group 1",
          benefitPercentage: data.benefitPercentage || 2.0,
          currentSalary: data.currentSalary || 0,
          averageHighest3Years: data.averageHighest3Years || 0,
          yearsOfService: data.yearsOfService || 0,
          retirementOption: data.retirementOption || "A",
          retirementDate: data.retirementDate || "",
          estimatedSocialSecurityBenefit: data.estimatedSocialSecurityBenefit || 0
        }

        console.log("fetchProfile: Setting profile data:", profileData)
        setProfile(profileData)
      } else {
        console.log("fetchProfile: No profile data returned, setting empty profile")
        setProfile(null)
      }
    } catch (error) {
      console.error("fetchProfile: Error fetching profile:", error)

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else if (error instanceof Error) {
        toast.error(`Failed to fetch profile: ${error.message}`)
      } else {
        toast.error("Failed to fetch retirement profile")
      }

      // Set profile to null on error to trigger fallback behavior
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [session])

  // Fetch calculations
  const fetchCalculations = useCallback(async (favorites?: boolean) => {
    if (!session?.user) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: "20",
        ...(favorites && { favorites: "true" }),
      })
      
      const response = await fetch(`/api/retirement/calculations?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setCalculations(data.calculations)
      }
    } catch (error) {
      console.error("Error fetching calculations:", error)
      toast.error("Failed to fetch calculations")
    } finally {
      setLoading(false)
    }
  }, [session])

  // Auto-fetch profile when session is available
  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session?.user?.id]) // Only depend on user ID, not the entire fetchProfile function

  // Auto-fetch calculations when session is available
  useEffect(() => {
    if (session?.user) {
      fetchCalculations()
    }
  }, [session?.user?.id]) // Only depend on user ID, not the entire fetchCalculations function

  // Save or update retirement profile
  const saveProfile = useCallback(async (profileData: RetirementProfile) => {
    if (!session?.user) {
      console.log("saveProfile: No session or user, cannot save profile")
      toast.error("You must be logged in to save your profile")
      return false
    }

    console.log("saveProfile: Starting profile save for user:", session.user.id)
    console.log("saveProfile: Profile data to save:", {
      ...profileData,
      // Don't log sensitive data in production
      dataKeys: Object.keys(profileData),
      hasDateOfBirth: !!profileData.dateOfBirth,
      hasMembershipDate: !!profileData.membershipDate,
      retirementGroup: profileData.retirementGroup
    })

    setLoading(true)
    try {
      const response = await fetch("/api/retirement/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(profileData),
      })

      console.log("saveProfile: Response status:", response.status)

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error("saveProfile: HTTP error response:", {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        })

        // Provide specific error messages based on status code
        if (response.status === 401) {
          toast.error("Please sign in to save your profile")
          return false
        } else if (response.status === 400) {
          const message = errorData.message || "Please check your input data and try again"
          toast.error(message)
          return false
        } else if (response.status === 409) {
          const message = errorData.message || "Profile already exists"
          toast.error(message)
          return false
        } else if (response.status === 500) {
          const message = errorData.message || "Server error. Please try again in a moment."
          toast.error(message)
          return false
        }

        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      if (data && data.profile) {
        // Convert the response data to the expected profile format
        const profileData = data.profile
        setProfile({
          dateOfBirth: profileData.dateOfBirth || "",
          membershipDate: profileData.membershipDate || "",
          retirementGroup: profileData.retirementGroup || "Group 1",
          benefitPercentage: profileData.benefitPercentage || 2.0,
          currentSalary: profileData.currentSalary || 0,
          averageHighest3Years: profileData.averageHighest3Years || 0,
          yearsOfService: profileData.yearsOfService || 0,
          retirementOption: profileData.retirementOption || "A",
          retirementDate: profileData.retirementDate || "",
          estimatedSocialSecurityBenefit: profileData.estimatedSocialSecurityBenefit || 0
        })
        toast.success(profile ? "Profile updated" : "Profile created")
        return true
      } else {
        toast.error("Failed to save profile")
        return false
      }
    } catch (error) {
      console.error("saveProfile: Error saving profile:", error)

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.")
      } else if (error instanceof Error) {
        // Don't show technical error messages to users
        if (error.message.includes('HTTP 500')) {
          toast.error("Server error. Please try again in a moment.")
        } else if (error.message.includes('HTTP 400')) {
          toast.error("Please check your input data and try again.")
        } else if (error.message.includes('Response is not JSON')) {
          toast.error("Server error. Please try again.")
        } else {
          toast.error("Failed to save profile. Please try again.")
        }
      } else {
        toast.error("Failed to save profile")
      }

      return false
    } finally {
      setLoading(false)
    }
  }, [session, profile])

  // Save new calculation
  const saveCalculation = useCallback(async (calculationData: RetirementCalculation) => {
    if (!session?.user) {
      toast.error("You must be logged in to save calculations")
      return false
    }

    setLoading(true)
    try {
      const response = await fetch("/api/retirement/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculationData),
      })

      const data = await response.json()
      
      if (response.ok) {
        setCalculations(prev => [data.calculation, ...prev])
        toast.success("Calculation saved")
        return true
      } else {
        toast.error(data.error || "Failed to save calculation")
        return false
      }
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast.error("Failed to save calculation")
      return false
    } finally {
      setLoading(false)
    }
  }, [session])

  // Update calculation (name, notes, favorite status)
  const updateCalculation = useCallback(async (
    id: string,
    updates: { calculationName?: string; notes?: string; isFavorite?: boolean }
  ) => {
    if (!session?.user) return false

    setLoading(true)
    try {
      const response = await fetch(`/api/retirement/calculations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      
      if (response.ok) {
        setCalculations(prev =>
          prev.map(calc => (calc.id === id ? data.calculation : calc))
        )
        toast.success("Calculation updated")
        return true
      } else {
        toast.error(data.error || "Failed to update calculation")
        return false
      }
    } catch (error) {
      console.error("Error updating calculation:", error)
      toast.error("Failed to update calculation")
      return false
    } finally {
      setLoading(false)
    }
  }, [session])

  // Delete calculation
  const deleteCalculation = useCallback(async (id: string) => {
    if (!session?.user) return false

    setLoading(true)
    try {
      const response = await fetch(`/api/retirement/calculations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCalculations(prev => prev.filter(calc => calc.id !== id))
        toast.success("Calculation deleted")
        return true
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete calculation")
        return false
      }
    } catch (error) {
      console.error("Error deleting calculation:", error)
      toast.error("Failed to delete calculation")
      return false
    } finally {
      setLoading(false)
    }
  }, [session])

  return {
    profile,
    calculations,
    loading,
    fetchProfile,
    saveProfile,
    fetchCalculations,
    saveCalculation,
    updateCalculation,
    deleteCalculation,
  }
} 