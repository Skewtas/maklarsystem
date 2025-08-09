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

async function createTestUser() {
  console.log('👤 Creating test user for authentication testing...\n')

  const testEmail = 'test@maklarsystem.se'
  const testPassword = 'Test123!'

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find(u => u.email === testEmail)

    if (existingUser) {
      console.log('⚠️  User already exists, attempting to delete...')
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id)
      if (deleteError) {
        console.error('❌ Error deleting existing user:', deleteError)
        return
      }
      console.log('✅ Existing user deleted')
    }

    // Create new user
    console.log('🔄 Creating new user...')
    console.log('   Email:', testEmail)
    console.log('   Password:', testPassword)
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        role: 'maklare'
      }
    })

    if (createError) {
      console.error('❌ Error creating user:', createError)
      return
    }

    console.log('✅ User created successfully!')
    console.log('   ID:', newUser.user.id)
    console.log('   Email:', newUser.user.email)

    // Add user to public.users table
    console.log('\n🔄 Adding user to public.users table...')
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: testEmail,
        full_name: 'Test User',
        role: 'maklare'
      })

    if (insertError) {
      // Check if it's a duplicate key error
      if (insertError.code === '23505') {
        console.log('⚠️  User already exists in public.users table')
      } else {
        console.error('❌ Error adding to public.users:', insertError)
      }
    } else {
      console.log('✅ User added to public.users table')
    }

    // Test authentication
    console.log('\n🧪 Testing authentication...')
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      console.error('❌ Login test failed:', signInError.message)
    } else {
      console.log('✅ Login successful!')
      console.log('   Session created for:', signInData.user.email)
      
      // Sign out to clean up
      await supabase.auth.signOut()
    }

    console.log('\n✨ Test user created successfully!')
    console.log('📧 Email:', testEmail)
    console.log('🔐 Password:', testPassword)
    console.log('\nYou can now use these credentials to log in.')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createTestUser()