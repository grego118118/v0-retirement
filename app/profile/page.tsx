"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile/profile-form"
import { PersonalInfoForm } from "@/components/profile/personal-info-form"
import { EmploymentInfoForm } from "@/components/profile/employment-info-form"
import { SavedCalculations } from "@/components/profile/saved-calculations"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { formatDate } from "@/lib/utils"
import {
  User,
  Settings,
  Target,
  Calculator,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  Clock
} from "lucide-react"

interface UserProfile {
  fullName?: string
  retirementDate?: string
  dateOfBirth?: string
  membershipDate?: string
  retirementGroup?: string
  currentSalary?: number
  retirementOption?: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { calculations, loading: calculationsLoading, fetchCalculations } = useRetirementData()
  
  const [userProfile, setUserProfile] = useState<UserProfile>({})
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
    }
  }, [status, router])

  // Fetch user profile data
  const fetchProfile = async () => {
    if (!session?.user?.id) return

    try {
      setProfileLoading(true)
      setProfileError(null)
      const response = await fetch('/api/profile')

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfileError('Failed to load profile data')
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session?.user?.id])

  // Handle URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['basic', 'personal', 'employment', 'calculations'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  // Loading state
  if (status === "loading" || profileLoading) {
    return <ProfileSkeleton />
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return null // Will redirect
  }

  const handleProfileUpdate = () => {
    fetchProfile()
  }

  const hasBasicProfile = userProfile.fullName || userProfile.retirementDate
  const hasPersonalInfo = userProfile.dateOfBirth || userProfile.membershipDate || userProfile.retirementOption
  const hasEmploymentInfo = userProfile.currentSalary || userProfile.retirementGroup

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Profile Settings
                </h1>
              </div>
              <p className="text-gray-600">
                Manage your personal information and retirement preferences
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {profileError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {profileError}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={fetchProfile}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Completion Status */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {hasBasicProfile ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${hasBasicProfile ? 'text-green-700' : 'text-gray-600'}`}>
                  Basic Info
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasPersonalInfo ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${hasPersonalInfo ? 'text-green-700' : 'text-gray-600'}`}>
                  Personal
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasEmploymentInfo ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${hasEmploymentInfo ? 'text-green-700' : 'text-gray-600'}`}>
                  Employment
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Profile Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic" className="px-4 py-2">Basic</TabsTrigger>
            <TabsTrigger value="personal" className="px-4 py-2">Personal</TabsTrigger>
            <TabsTrigger value="employment" className="px-4 py-2">Employment</TabsTrigger>
            <TabsTrigger value="calculations" className="px-4 py-2">Calculations</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <ProfileForm
              initialData={{
                fullName: userProfile.fullName || "",
                retirementDate: userProfile.retirementDate || ""
              }}
              onUpdate={handleProfileUpdate}
            />
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <PersonalInfoForm
              initialData={{
                dateOfBirth: userProfile.dateOfBirth,
                membershipDate: userProfile.membershipDate,
                retirementGroup: userProfile.retirementGroup as "1" | "2" | "3" | "4" | undefined,
                retirementOption: userProfile.retirementOption as "A" | "B" | "C" | undefined,
              }}
              onUpdate={(data) => {
                setUserProfile(prev => ({ ...prev, ...data }))
                handleProfileUpdate()
              }}
            />
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <EmploymentInfoForm
              initialData={userProfile}
              onUpdate={(data) => {
                setUserProfile(prev => ({ ...prev, ...data }))
                handleProfileUpdate()
              }}
            />
          </TabsContent>

          <TabsContent value="calculations" className="space-y-6">
            <SavedCalculations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-24" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
