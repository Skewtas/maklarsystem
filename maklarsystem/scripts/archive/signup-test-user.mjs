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

// Create Supabase client (using anon key like the app does)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function signupTestUser() {
  console.log('🔐 Creating test user via normal signup flow...\n')

  const testEmail = 'test.user@maklarsystem.se'
  const testPassword = 'Test123!'

  try {
    // Sign up the user
    console.log('📝 Signing up user...')
    console.log('   Email:', testEmail)
    console.log('   Password:', testPassword)
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'maklare',
          phone: '0701234567'
        }
      }
    })

    if (error) {
      console.error('❌ Signup error:', error.message)
      console.error('   Error code:', error.code)
      console.error('   Status:', error.status)
      
      if (error.message.includes('already registered')) {
        console.log('\n💡 User already exists. Try logging in instead.')
      }
      return
    }

    console.log('✅ User created successfully!')
    console.log('   User ID:', data.user?.id)
    console.log('   Email:', data.user?.email)
    
    if (data.user?.email_confirmed_at) {
      console.log('   Email confirmed: Yes')
    } else {
      console.log('   Email confirmed: No (check email for confirmation link)')
    }

    // Try to sign in immediately
    console.log('\n🧪 Testing login...')
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      console.error('❌ Login test failed:', signInError.message)
      if (signInError.message.includes('Email not confirmed')) {
        console.log('⚠️  Email confirmation required. Check your email.')
      }
    } else {
      console.log('✅ Login successful!')
      console.log('   Session created')
      
      // Sign out
      await supabase.auth.signOut()
    }

    console.log('\n✨ Test user ready!')
    console.log('📧 Email:', testEmail)
    console.log('🔐 Password:', testPassword)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

signupTestUser()