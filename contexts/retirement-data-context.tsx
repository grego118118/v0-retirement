"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useRetirementData } from '@/hooks/use-retirement-data'

// Create the context
const RetirementDataContext = createContext<ReturnType<typeof useRetirementData> | null>(null)

// Provider component
interface RetirementDataProviderProps {
  children: ReactNode
}

export function RetirementDataProvider({ children }: RetirementDataProviderProps) {
  const retirementData = useRetirementData()
  
  return (
    <RetirementDataContext.Provider value={retirementData}>
      {children}
    </RetirementDataContext.Provider>
  )
}

// Hook to use the context
export function useRetirementDataContext() {
  const context = useContext(RetirementDataContext)
  
  if (!context) {
    throw new Error('useRetirementDataContext must be used within a RetirementDataProvider')
  }
  
  return context
}
