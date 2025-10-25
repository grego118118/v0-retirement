import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { redirect } from 'next/navigation'
import { SavedCalculations } from '@/components/dashboard/saved-calculations'

export const metadata: Metadata = {
  title: 'Dashboard - Mass Pension',
  description: 'View your saved retirement calculations and manage your account',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/pricing?feature=dashboard&context=authentication_required')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user?.name || 'User'}
          </h1>
          <p className="text-gray-600">
            Manage your retirement calculations and account settings
          </p>
        </div>

        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Saved Calculations</h2>
            <SavedCalculations />
          </div>
        </div>
      </div>
    </div>
  )
}
