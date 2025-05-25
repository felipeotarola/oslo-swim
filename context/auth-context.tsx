"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshSession = async () => {
    try {
      setIsLoading(true)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error refreshing session:", error)
        // Clear invalid session
        setSession(null)
        setUser(null)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error("Error in refreshSession:", error)
      setSession(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    refreshSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      // Handle different auth events
      switch (event) {
        case "SIGNED_IN":
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
          break
        case "SIGNED_OUT":
          setSession(null)
          setUser(null)
          setIsLoading(false)
          break
        case "TOKEN_REFRESHED":
          setSession(session)
          setUser(session?.user ?? null)
          break
        case "USER_UPDATED":
          setSession(session)
          setUser(session?.user ?? null)
          break
        default:
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
      }

      // Force router refresh on significant auth changes
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Don't automatically redirect - let the component handle it
      console.log("Sign up successful:", data.user?.email)
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Session will be set by the auth state change listener
      console.log("Sign in successful:", data.user?.email)
    } catch (error: any) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error(error.message)
      }

      // Clear state immediately
      setSession(null)
      setUser(null)

      console.log("Sign out successful")
    } catch (error: any) {
      console.error("Error signing out:", error)
      // Even if there's an error, clear the local state
      setSession(null)
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
