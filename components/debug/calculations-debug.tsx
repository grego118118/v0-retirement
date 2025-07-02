"use client"

import { useRetirementData } from "@/hooks/use-retirement-data"
import { useSession } from "next-auth/react"

export function CalculationsDebug() {
  const { data: session, status } = useSession()
  const { calculations, loading, error } = useRetirementData()

  // Force console logs to appear in server logs by making API calls
  const debugInfo = {
    sessionStatus: status,
    sessionUser: session?.user?.email,
    sessionUserId: session?.user?.id,
    sessionExists: !!session,
    userExists: !!session?.user,
    calculationsLength: calculations?.length || 0,
    calculationsLoading: loading,
    calculationsError: error,
    hasCalculations: calculations && calculations.length > 0,
    calculationsIsArray: Array.isArray(calculations),
    firstCalculation: calculations?.[0] ? {
      id: calculations[0].id,
      name: calculations[0].calculationName,
      monthlyBenefit: calculations[0].monthlyBenefit
    } : null
  }

  // Send debug info to server
  if (typeof window !== 'undefined') {
    fetch('/api/debug/frontend-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debugInfo)
    }).catch(() => {}) // Ignore errors
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Frontend Debug Info</h3>
      <div className="space-y-1">
        <div>Session: {status} ({session?.user?.email || 'No user'})</div>
        <div>User ID: {session?.user?.id || 'None'}</div>
        <div>Session Exists: {session ? 'Yes' : 'No'}</div>
        <div>User Exists: {session?.user ? 'Yes' : 'No'}</div>
        <div>Calculations: {calculations?.length || 0} items</div>
        <div>Is Array: {Array.isArray(calculations) ? 'Yes' : 'No'}</div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Error: {error || 'None'}</div>
        <div>Has Calculations: {calculations && calculations.length > 0 ? 'Yes' : 'No'}</div>
        {calculations?.[0] && (
          <div>First: {calculations[0].calculationName} (${calculations[0].monthlyBenefit}/mo)</div>
        )}
        <div className="text-xs text-gray-300 mt-2">
          API calls: {calculations ? 'Success' : 'Pending'}
        </div>
      </div>
    </div>
  )
}
