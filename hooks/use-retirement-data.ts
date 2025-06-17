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
  retirementDate?: string
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
    if (!session?.user) return

    setLoading(true)
    try {
      const response = await fetch("/api/profile")

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      if (data) {
        // Convert the profile data to the expected format
        setProfile({
          dateOfBirth: data.dateOfBirth || "",
          membershipDate: data.membershipDate || "",
          retirementGroup: data.retirementGroup || "Group 1",
          benefitPercentage: data.benefitPercentage || 2.0,
          currentSalary: data.currentSalary || 0,
          averageHighest3Years: data.averageHighest3Years || 0,
          yearsOfService: data.yearsOfService || 0,
          plannedRetirementAge: data.plannedRetirementAge || 65,
          retirementOption: data.retirementOption || "A",
          retirementDate: data.retirementDate || ""
        })
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

  // Auto-fetch profile when session is available
  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session?.user, fetchProfile])

  // Auto-fetch calculations when session is available
  useEffect(() => {
    if (session?.user) {
      fetchCalculations()
    }
  }, [session?.user, fetchCalculations])

  // Save or update retirement profile
  const saveProfile = useCallback(async (profileData: RetirementProfile) => {
    if (!session?.user) {
      toast.error("You must be logged in to save your profile")
      return false
    }

    setLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      // Check if response is ok and content-type is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      if (data) {
        // Convert the response data to the expected profile format
        setProfile({
          dateOfBirth: data.dateOfBirth || "",
          membershipDate: data.membershipDate || "",
          retirementGroup: data.retirementGroup || "Group 1",
          benefitPercentage: data.benefitPercentage || 2.0,
          currentSalary: data.currentSalary || 0,
          averageHighest3Years: data.averageHighest3Years || 0,
          yearsOfService: data.yearsOfService || 0,
          plannedRetirementAge: data.plannedRetirementAge || 65,
          retirementOption: data.retirementOption || "A",
          retirementDate: data.retirementDate || ""
        })
        toast.success(profile ? "Profile updated" : "Profile created")
        return true
      } else {
        toast.error("Failed to save profile")
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