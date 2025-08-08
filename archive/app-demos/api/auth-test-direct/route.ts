import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('[Test Direct] Starting authentication test...')
    console.log('[Test Direct] Email:', email)
    console.log('[Test Direct] Environment:', {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      HAS_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV
    })

    // Create a new Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase configuration',
        details: { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })

    console.log('[Test Direct] Attempting sign in...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[Test Direct] Sign in error:', {
        message: error.message,
        name: error.name,
        status: error.status,
        code: error.code,
        __isAuthError: error.__isAuthError
      })
      
      // Check if it's the "Database error granting user" error
      if (error.message === 'Database error granting user') {
        console.error('[Test Direct] Database error detected. Checking user state...')
        
        // Try to get more information about the error
        const { data: sessionData } = await supabase.auth.getSession()
        console.log('[Test Direct] Current session:', sessionData)
      }
      
      return NextResponse.json({ 
        error: error.message,
        details: {
          name: error.name,
          status: error.status,
          code: error.code,
          isAuthError: error.__isAuthError
        }
      }, { status: 400 })
    }

    console.log('[Test Direct] Sign in successful:', {
      userId: data.user?.id,
      email: data.user?.email,
      hasSession: !!data.session,
      sessionExpiresAt: data.session?.expires_at
    })

    // Set cookies manually
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email
      },
      session: {
        access_token: data.session?.access_token ? 'present' : 'missing',
        expires_at: data.session?.expires_at
      }
    })

    // Set the auth cookies
    if (data.session) {
      response.cookies.set('sb-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
    }

    return response
  } catch (error) {
    console.error('[Test Direct] Unexpected error:', error)
    console.error('[Test Direct] Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to this endpoint with { email, password }',
    test: true 
  })
}