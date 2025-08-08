import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  // Skapa en mock-session för utveckling
  const mockUser = {
    id: 'mock-user-123',
    email: 'test@maklare.se',
    user_metadata: {
      full_name: 'Test Mäklare',
      role: 'agent'
    }
  }
  
  // Skapa en redirect response
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  
  // Sätt en mock auth cookie
  response.cookies.set('mock-auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 dagar
  })
  
  return response
}