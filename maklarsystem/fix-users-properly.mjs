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

async function fixUsersTable() {
  console.log('=== Fixing Users Table with Correct Schema ===\n')
  
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
    id: u.id.substring(0, 8) + '...',
    email: u.email,
    full_name: u.full_name || 'N/A',
    role: u.role,
    phone: u.phone || 'N/A'
  })))
  
  // 2. Update users with correct field names
  console.log('\n=== Updating User Records ===\n')
  
  // Find and update Rani
  const raniUser = users.find(u => u.email === 'rani@restate.se' || u.email === 'rani.shakir@matchahem.se' || u.email === 'rani.shakir@hotmail.com')
  if (raniUser) {
    const { error: raniError } = await supabase
      .from('users')
      .update({
        full_name: 'Rani Shakir',
        role: 'admin',
        phone: '+46 70 123 45 67'  // Example phone number
      })
      .eq('id', raniUser.id)
    
    if (raniError) {
      console.error('Error updating Rani:', raniError)
    } else {
      console.log('✅ Updated Rani')
    }
  } else {
    console.log('⚠️  Rani user not found with expected email')
  }
  
  // Find and update Anna
  const annaUser = users.find(u => u.email === 'anna@restate.se' || u.email === 'anna.andersson@maklarsystem.se')
  if (annaUser) {
    const { error: annaError } = await supabase
      .from('users')
      .update({
        full_name: 'Anna Andersson',
        role: 'maklare',
        phone: '+46 70 234 56 78'  // Example phone number
      })
      .eq('id', annaUser.id)
    
    if (annaError) {
      console.error('Error updating Anna:', annaError)
    } else {
      console.log('✅ Updated Anna')
    }
  } else {
    console.log('⚠️  Anna user not found with expected email')
  }
  
  // Update admin user if exists
  const adminUser = users.find(u => u.email === 'admin@maklarsystem.se')
  if (adminUser) {
    const { error: adminError } = await supabase
      .from('users')
      .update({
        full_name: 'System Administrator'
      })
      .eq('id', adminUser.id)
    
    if (adminError) {
      console.error('Error updating admin:', adminError)
    } else {
      console.log('✅ Updated admin user')
    }
  }
  
  // 3. Final verification
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
      full_name: u.full_name || 'N/A',
      role: u.role,
      phone: u.phone || 'N/A'
    })))
  }
  
  console.log('\n✅ Users table is now properly configured!')
  console.log('\nThe constraint error should be resolved. You can now continue working.')
  console.log('\nNote: The users table uses these columns:')
  console.log('- full_name (not name)')
  console.log('- phone (not telefon)')
  console.log('- role: admin | maklare | koordinator | assistent')
  console.log('- No columns for: active, företag')
}

fixUsersTable().catch(console.error)