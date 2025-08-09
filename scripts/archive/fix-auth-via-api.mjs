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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixAuthViaAPI() {
  console.log('🔧 Fixing authentication via Supabase Auth API...\n')

  try {
    // Option 1: Try password reset flow
    console.log('📧 Sending password reset email to rani.shakir@hotmail.com...')
    
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
      'rani.shakir@hotmail.com',
      {
        redirectTo: 'http://localhost:3000/auth/callback?type=recovery'
      }
    )

    if (resetError) {
      console.error('❌ Password reset error:', resetError.message)
    } else {
      console.log('✅ Password reset email sent!')
      console.log('📬 Check the email for rani.shakir@hotmail.com')
      console.log('   The reset link will allow setting a new password')
    }

    // Option 2: Create a new test user that we can control
    console.log('\n👤 Creating a new test user as backup option...')
    
    const testEmail = `test.${Date.now()}@maklarsystem.se`
    const testPassword = 'Test123!'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'maklare'
        },
        emailRedirectTo: 'http://localhost:3000/auth/callback'
      }
    })

    if (signUpError) {
      console.error('❌ Signup error:', signUpError.message)
      
      // If signup fails due to permissions, try a simpler approach
      console.log('\n🔄 Trying alternative approach...')
      
      // Option 3: Try to update the password via a workaround
      console.log('💡 Alternative solution:')
      console.log('1. Go to Supabase Dashboard > Authentication > Users')
      console.log('2. Find rani.shakir@hotmail.com')
      console.log('3. Click "Send recovery email" or "Reset password"')
      console.log('4. Set password to: Test123!')
      
    } else if (signUpData.user) {
      console.log('✅ Test user created successfully!')
      console.log('\n📋 New test credentials:')
      console.log('   Email:', testEmail)
      console.log('   Password:', testPassword)
      console.log('\n✨ You can use these credentials to log in immediately!')
      
      // Try to log in with the new user
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      if (loginError) {
        console.error('⚠️  Login test failed:', loginError.message)
        if (loginError.message.includes('Email not confirmed')) {
          console.log('📧 Email confirmation required. Check the inbox.')
        }
      } else {
        console.log('✅ Login test successful!')
        await supabase.auth.signOut()
      }
    }

    // Option 4: Try OAuth provider as alternative
    console.log('\n🔐 Alternative login methods:')
    console.log('You can also configure OAuth providers in Supabase Dashboard:')
    console.log('- Google OAuth')
    console.log('- GitHub OAuth')
    console.log('- Microsoft OAuth')
    console.log('\nThis would bypass password issues entirely.')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the fix
fixAuthViaAPI()