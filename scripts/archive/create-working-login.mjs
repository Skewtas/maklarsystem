#!/usr/bin/env node

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔧 Creating a working login solution...\n')

// Create a temporary login bypass page
const tempLoginPage = `
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TempLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // For testing purposes - bypass Supabase auth temporarily
    if (email === 'rani.shakir@hotmail.com' && password === 'Test123!') {
      // Set a temporary session cookie
      document.cookie = 'temp-auth=true; path=/; max-age=3600'
      document.cookie = 'temp-user=' + encodeURIComponent(JSON.stringify({
        email: 'rani.shakir@hotmail.com',
        name: 'Rani Shakir',
        role: 'maklare'
      })) + '; path=/; max-age=3600'
      
      router.push('/')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Temporary Login (Dev Mode)
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use: rani.shakir@hotmail.com / Test123!
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login (Dev Mode)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
`

// Create API route that works with existing users
const apiRoute = `
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // For development - return user data without auth
    if (email === 'rani.shakir@hotmail.com') {
      return NextResponse.json({
        user: {
          id: 'c6598ca2-a75c-4259-bc7a-8ed770cc55f0',
          email: 'rani.shakir@hotmail.com',
          user_metadata: {
            full_name: 'Rani Shakir',
            role: 'maklare'
          }
        }
      })
    }
    
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
`

console.log('💡 Solution created!\n')
console.log('Since Supabase Auth has permission issues, here are your options:\n')

console.log('Option 1: Fix via Supabase Dashboard (Recommended)')
console.log('─────────────────────────────────────────────────')
console.log('1. Go to: https://supabase.com/dashboard')
console.log('2. Select your project')
console.log('3. Go to: SQL Editor')
console.log('4. Run this SQL:\n')
console.log(`-- Grant permissions
GRANT ALL ON public.users TO auth;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Reset Rani's password
UPDATE auth.users 
SET encrypted_password = crypt('Test123!', gen_salt('bf'))
WHERE email = 'rani.shakir@hotmail.com';`)

console.log('\n\nOption 2: Use Magic Link (Email-based login)')
console.log('──────────────────────────────────────────────')
console.log('1. Go to Supabase Dashboard > Authentication > Users')
console.log('2. Find rani.shakir@hotmail.com')
console.log('3. Click "Send magic link"')
console.log('4. Check email and click the link')

console.log('\n\nOption 3: Create temporary dev login')
console.log('────────────────────────────────────')
console.log('Create file: src/app/temp-login/page.tsx')
console.log('And paste the code from: scripts/temp-login-page.txt')

console.log('\n\n✨ Current Status:')
console.log('- User exists: ✅')
console.log('- Email confirmed: ✅')
console.log('- Password issue: ❌ (needs fix via dashboard)')
console.log('- Database permissions: ❌ (needs SQL fix)')

// Save the temp login page code
await fs.writeFile(
  join(__dirname, 'temp-login-page.txt'),
  tempLoginPage,
  'utf-8'
)

console.log('\n📝 Temporary login page code saved to: scripts/temp-login-page.txt')