"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs"
// Import the simplified Database type
import type { Database } from "@/lib/database.types"

type SupabaseContext = {
  supabase: SupabaseClient<Database> | null
  isSupabaseReady: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)

  useEffect(() => {
    try {
      // Check if environment variables exist
      if (
        typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "undefined" ||
        typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "undefined"
      ) {
        console.warn("Supabase environment variables are missing. Some features will be disabled.")
        setIsSupabaseReady(true)
        return
      }

      const client = createClientComponentClient<Database>()
      setSupabase(client)

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange(() => {})

      setIsSupabaseReady(true)

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      setIsSupabaseReady(true)
    }
  }, [])

  return <Context.Provider value={{ supabase, isSupabaseReady }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
