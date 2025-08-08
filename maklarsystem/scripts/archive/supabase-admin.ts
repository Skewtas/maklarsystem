import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = 'https://exreuewsrgavzsbdnghv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl, 
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Alternative client using your preferred pattern
export const createSupabaseClient = (key?: string) => {
  const supabaseKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createClient<Database>(supabaseUrl, supabaseKey!)
} 