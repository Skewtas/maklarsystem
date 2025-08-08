import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function investigateAndFix() {
  console.log('=== Investigating Users Table ===\n')
  
  // 1. Check current users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at')
  
  if (usersError) {
    console.error('Error fetching users:', usersError)
    return
  }
  
  console.log('Current users:')
  console.table(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name || 'N/A',
    role: u.role || 'N/A',
    företag: u.företag || 'N/A',
    active: u.active !== undefined ? u.active : 'N/A'
  })))
  
  // 2. Safe column additions using raw SQL
  console.log('\n=== Adding Missing Columns (if needed) ===\n')
  
  const alterQueries = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS företag TEXT"
  ]
  
  for (const query of alterQueries) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        // Try direct approach if exec_sql doesn't exist
        console.log(`Note: Could not execute: ${query}`)
      } else {
        console.log(`✅ Executed: ${query}`)
      }
    } catch (e) {
      console.log(`Note: ${e.message}`)
    }
  }
  
  // 3. Update users with missing data
  console.log('\n=== Updating User Records ===\n')
  
  // Update Rani
  const { error: raniError } = await supabase
    .from('users')
    .update({
      name: 'Rani Shakir',
      role: 'admin',
      företag: 'Restate AB',
      active: true
    })
    .eq('email', 'rani@restate.se')
  
  if (raniError) {
    console.error('Error updating Rani:', raniError)
  } else {
    console.log('✅ Updated Rani')
  }
  
  // Update Anna
  const { error: annaError } = await supabase
    .from('users')
    .update({
      name: 'Anna Example',
      role: 'user',
      företag: 'Restate AB',
      active: true
    })
    .eq('email', 'anna@restate.se')
  
  if (annaError) {
    console.error('Error updating Anna:', annaError)
  } else {
    console.log('✅ Updated Anna')
  }
  
  // 4. Final verification
  console.log('\n=== Final Verification ===\n')
  
  const { data: finalUsers, error: finalError } = await supabase
    .from('users')
    .select('*')
    .order('created_at')
  
  if (finalError) {
    console.error('Error fetching final users:', finalError)
  } else {
    console.log('Updated users:')
    console.table(finalUsers.map(u => ({
      id: u.id.substring(0, 8) + '...',
      email: u.email,
      name: u.name || 'N/A',
      role: u.role || 'N/A',
      företag: u.företag || 'N/A',
      active: u.active !== undefined ? u.active : 'N/A'
    })))
  }
  
  console.log('\n✅ Investigation and update complete!')
  console.log('\nYou should now be able to continue working without constraint errors.')
}

investigateAndFix().catch(console.error)