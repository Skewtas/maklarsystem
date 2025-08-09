import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/database'

// This function creates a server-side Supabase client
// It should be used in API routes and server components
export async function createServerSupabaseClient() {
  return await createClient()
}