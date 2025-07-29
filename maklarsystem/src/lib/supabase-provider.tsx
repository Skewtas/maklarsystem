'use client'

import { createContext, useContext, useState } from 'react'
import type { User } from '@supabase/auth-helpers-nextjs'

interface SupabaseContext {
  supabase: any // Disabled
  user: User | null
  loading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ 
  children,
  session
}: { 
  children: React.ReactNode
  session: any
}) {
  // Since auth is disabled, just return static values
  const [user] = useState<User | null>(null)
  const [loading] = useState(false)

  // No Supabase client creation to avoid cookie errors
  const supabase = null

  return (
    <Context.Provider value={{ supabase, user, loading }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 