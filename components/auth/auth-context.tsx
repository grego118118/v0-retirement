"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error fetching session:", error)
        }

        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Failed to fetch session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Failed to set up auth state change listener:", error)
      setIsLoading(false)
      return () => {}
    }
  }, [supabase])

  const signInWithGoogle = async () => {
    try {
      // Use a more reliable redirect URL construction
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const redirectTo = `${origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account", // Force Google to show account selector
          },
          skipBrowserRedirect: false, // Ensure browser redirect happens
        },
      })

      if (error) {
        console.error("Error signing in with Google:", error)
        toast({
          title: "Sign in failed",
          description: "There was a problem signing in with Google. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    } catch (error) {
      console.error("Failed to sign in with Google:", error)
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error signing in with email:", error)
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }
    } catch (error) {
      console.error("Failed to sign in with email:", error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Error signing up with email:", error)
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation email to complete your sign up.",
      })
    } catch (error) {
      console.error("Failed to sign up with email:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
        throw error
      }
    } catch (error) {
      console.error("Failed to sign out:", error)
      throw error
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
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
