import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRaniAuth() {
  console.log('🔧 Fixing authentication for rani.shakir@hotmail.com...\n')

  try {
    // 1. Update the user's password using Admin API
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      'c6598ca2-a75c-4259-bc7a-8ed770cc55f0',
      {
        password: 'Test123!',
        email_confirm: true
      }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return
    }

    console.log('✅ Password updated successfully')
    
    // 2. Verify the user exists in public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'rani.shakir@hotmail.com')
      .single()

    if (userError || !userData) {
      console.log('⚠️  User not found in public.users, creating...')
      
      // Create user in public.users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: 'c6598ca2-a75c-4259-bc7a-8ed770cc55f0',
          email: 'rani.shakir@hotmail.com',
          full_name: 'Rani Shakir',
          role: 'maklare',
          phone: '0762586389'
        })

      if (insertError) {
        console.error('❌ Error creating user:', insertError)
      } else {
        console.log('✅ User created in public.users')
      }
    } else {
      console.log('✅ User exists in public.users')
      console.log('   Email:', userData.email)
      console.log('   Name:', userData.full_name)
      console.log('   Role:', userData.role)
    }

    // 3. Test authentication
    console.log('\n🔐 Testing authentication...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'rani.shakir@hotmail.com',
      password: 'Test123!'
    })

    if (signInError) {
      console.error('❌ Authentication test failed:', signInError)
    } else {
      console.log('✅ Authentication successful!')
      console.log('   User ID:', signInData.user.id)
      console.log('   Email:', signInData.user.email)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

fixRaniAuth()