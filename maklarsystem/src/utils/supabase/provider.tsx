'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

interface SupabaseContext {
  supabase: SupabaseClient
  user: User | null
  loading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ 
  children,
  session
}: { 
  children: React.ReactNode
  session: Session | null
}) {
  const [user, setUser] = useState<User | null>(session?.user || null)
  const [loading, setLoading] = useState(!session)
  const router = useRouter()

  // Create Supabase client
  const supabase = createClient()

  useEffect(() => {
    // Check for mock auth
    const checkMockAuth = () => {
      if (typeof window !== 'undefined') {
        const hasMockAuth = document.cookie.includes('mock-auth=true')
        if (hasMockAuth && !user) {
          // Create a mock user object
          const mockUser = {
            id: 'mock-user-123',
            email: 'test@maklare.se',
            aud: 'authenticated',
            role: 'authenticated',
            email_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: { provider: 'mock', providers: ['mock'] },
            user_metadata: { full_name: 'Test Mäklare', role: 'agent' }
          } as User
          setUser(mockUser)
          setLoading(false)
          return true
        }
      }
      return false
    }

    // Check mock auth first
    if (checkMockAuth()) {
      return
    }

    // Set initial user from session
    setUser(session?.user || null)
    setLoading(false)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
        
        // Only navigate on actual sign out, not on session refresh/tab changes
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
        // Don't auto-redirect on SIGNED_IN to avoid interrupting user workflows
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, session, router])

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