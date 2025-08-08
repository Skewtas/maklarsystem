#!/usr/bin/env node

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
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPassword() {
  console.log('🔐 Resetting password for rani.shakir@hotmail.com...\n')

  try {
    // First, get the user to confirm they exist
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      return
    }

    if (!users || users.users.length === 0) {
      console.error('❌ No users found')
      return
    }

    // Find Rani's user
    const user = users.users.find(u => u.email === 'rani.shakir@hotmail.com')
    
    if (!user) {
      console.error('❌ User rani.shakir@hotmail.com not found')
      console.log('\nAvailable users:')
      users.users.forEach(u => {
        console.log(`  - ${u.email} (${u.id})`)
      })
      return
    }
    console.log('✅ User found:')
    console.log('   ID:', user.id)
    console.log('   Email:', user.email)
    console.log('   Created:', new Date(user.created_at).toLocaleString())
    console.log('   Last sign in:', user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never')

    // Update the password
    console.log('\n🔄 Updating password to: Test123!')
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: 'Test123!',
        email_confirm: true
      }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      
      // Try alternative method - generate password reset link
      console.log('\n🔄 Trying alternative method - generating password reset link...')
      
      const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: 'rani.shakir@hotmail.com'
      })

      if (resetError) {
        console.error('❌ Error generating reset link:', resetError)
      } else if (resetData) {
        console.log('✅ Password reset link generated!')
        console.log('📧 Send this link to the user:')
        console.log(resetData.properties.action_link)
        console.log('\n⚠️  Note: This link expires in 1 hour')
      }
      
      return
    }

    console.log('✅ Password updated successfully!')

    // Test the new password
    console.log('\n🧪 Testing new credentials...')
    
    // Sign out first to ensure clean state
    await supabase.auth.signOut()
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'rani.shakir@hotmail.com',
      password: 'Test123!'
    })

    if (signInError) {
      console.error('❌ Login test failed:', signInError.message)
      console.error('   Error code:', signInError.code)
      console.error('   Status:', signInError.status)
    } else {
      console.log('✅ Login successful!')
      console.log('   Session created for:', signInData.user.email)
      
      // Sign out to clean up
      await supabase.auth.signOut()
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

resetPassword()