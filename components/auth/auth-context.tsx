"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useSimpleAuth } from "./simple-auth-context"

type AuthContextType = {
  user: any
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const simpleAuth = useSimpleAuth()

  // Map the SimpleAuthContext values to match the old AuthContext interface
  const value = {
    user: simpleAuth.user,
    isLoading: simpleAuth.isLoading,
    signInWithGoogle: simpleAuth.signInWithGoogle,
    signInWithEmail: simpleAuth.signInWithEmail,
    signUpWithEmail: simpleAuth.signUpWithEmail,
    signOut: simpleAuth.signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
