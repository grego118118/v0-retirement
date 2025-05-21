"use client"

import { createContext, useContext, type ReactNode } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: any
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"
  const { toast } = useToast()

  const signInWithGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/profile" })
    } catch (error) {
      console.error("Failed to sign in with Google:", error)
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      })
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
        return
      }

      window.location.href = "/profile"
    } catch (error) {
      console.error("Failed to sign in with email:", error)
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Sign up failed",
          description: data.message || "Failed to create account",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Account created",
        description: "Your account has been created. You can now sign in.",
      })

      // Automatically sign in after successful signup
      await signInWithEmail(email, password)
    } catch (error) {
      console.error("Failed to sign up with email:", error)
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const signOutUser = async () => {
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Failed to sign out:", error)
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const value = {
    user: session?.user,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
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
