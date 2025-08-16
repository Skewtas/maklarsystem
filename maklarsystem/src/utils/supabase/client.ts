import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  return createBrowserClient<Database>(url!, anon!)
} 