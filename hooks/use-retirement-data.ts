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
  plannedRetirementAge?: number
  retirementOption?: string
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

  // Fetch retirement profile from the correct API endpoint
  const fetchProfile = useCallback(async () => {
    if (!session?.user) return

    setLoading(true)
    try {
      // Use the working profile API that queries users_metadata table
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (response.ok) {
        // Convert the profile data to match the expected format
        const profileData = {
          dateOfBirth: null, // Will need to be set via profile update
          plannedRetirementAge: null, // Will calculate from retirement date
          retirementDate: data.retirementDate,
          fullName: data.fullName,
          // Add other fields as needed
        }

        // If we have a retirement date, calculate the planned retirement age
        if (data.retirementDate) {
          try {
            const retirementDate = new Date(data.retirementDate)
            const currentDate = new Date()
            const yearsToRetirement = retirementDate.getFullYear() - currentDate.getFullYear()
            const currentAge = 50 // Default assumption, should be calculated from dateOfBirth when available
            profileData.plannedRetirementAge = currentAge + yearsToRetirement
          } catch (error) {
            console.error("Error calculating retirement age:", error)
          }
        }

        setProfile(profileData)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to fetch retirement profile")
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

  // Auto-fetch data when session is available (combined to avoid race conditions)
  useEffect(() => {
    if (session?.user) {
      // Fetch both profile and calculations together to avoid timing issues
      Promise.all([
        fetchProfile(),
        fetchCalculations()
      ]).catch(error => {
        console.error('Error fetching dashboard data:', error)
      })
    }
  }, [session?.user?.id]) // Only depend on user ID to avoid unnecessary re-fetches

  // Save or update retirement profile
  const saveProfile = useCallback(async (profileData: RetirementProfile) => {
    if (!session?.user) {
      toast.error("You must be logged in to save your profile")
      return false
    }

    setLoading(true)
    try {
      const method = profile ? "PUT" : "POST"
      const response = await fetch("/api/retirement/profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()
      
      if (response.ok) {
        setProfile(data.profile)
        toast.success(profile ? "Profile updated" : "Profile created")
        return true
      } else {
        toast.error(data.error || "Failed to save profile")
        return false
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Failed to save profile")
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

  // Toggle favorite status
  const toggleFavorite = useCallback(async (id: string) => {
    const calculation = calculations.find(calc => calc.id === id)
    if (!calculation) return false

    return await updateCalculation(id, { isFavorite: !calculation.isFavorite })
  }, [calculations, updateCalculation])

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
    toggleFavorite,
  }
} 