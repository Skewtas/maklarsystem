'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          setUser(null)
          return
        }

        // Get user profile from users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) throw error

        if (isMounted) {
          setUser(data)
        }
      } catch (err) {
        console.error('Error loading user profile:', err)
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        loadUser()
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isMäklare: user?.role === 'maklare',
    isAdmin: user?.role === 'admin',
    isKoordinator: user?.role === 'koordinator',
    isAssistent: user?.role === 'assistent',
  }
}