import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !/^https?:\/\//.test(url)) {
  console.error('Invalid or missing URL env')
  process.exit(1)
}
if (!anon) {
  console.error('Missing anon key env')
  process.exit(1)
}

try {
  const supabase = createClient(url, anon)
  console.log('SupabaseClient constructed OK')
} catch (e) {
  console.error('Failed to construct SupabaseClient:', e?.message)
  process.exit(1)
}





