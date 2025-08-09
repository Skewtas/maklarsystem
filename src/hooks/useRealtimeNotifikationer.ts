"use client"
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useRealtimeNotifikationer(userId?: string) {
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`notifier-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifikationer', filter: `user_id=eq.${userId}` },
        () => {
          // Invalidate client caches or refetch as needed
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])
}


